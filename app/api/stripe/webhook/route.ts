import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import {
  getTierForPriceId,
  updateOrgSubscription,
  findOrgByStripeCustomerId,
} from "@/lib/stripe-helpers";
import type Stripe from "stripe";

// Must use Node.js runtime — Edge runtime lacks the crypto needed for signature verification
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const body = Buffer.from(await req.arrayBuffer());
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("[Stripe webhook] Signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const orgId = session.metadata?.org_id;

        if (!orgId) {
          console.error("[Stripe webhook] checkout.session.completed: missing org_id in metadata");
          break;
        }

        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;

        // Retrieve the subscription to get the Price ID
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const priceId = subscription.items.data[0]?.price.id;
        const tier = priceId ? getTierForPriceId(priceId) : null;

        if (!tier) {
          console.error("[Stripe webhook] checkout.session.completed: unknown priceId", priceId);
          break;
        }

        await updateOrgSubscription(orgId, {
          tier,
          stripe_customer_id: customerId,
          stripe_subscription_id: subscriptionId,
        });

        console.log(`[Stripe webhook] Org ${orgId} upgraded to ${tier}`);
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        const org = await findOrgByStripeCustomerId(customerId);

        if (!org) {
          console.error("[Stripe webhook] customer.subscription.updated: org not found for customer", customerId);
          break;
        }

        const activeStatuses = ["active", "trialing"];
        if (activeStatuses.includes(subscription.status)) {
          const priceId = subscription.items.data[0]?.price.id;
          const tier = priceId ? getTierForPriceId(priceId) : null;

          if (!tier) {
            console.error("[Stripe webhook] customer.subscription.updated: unknown priceId", priceId);
            break;
          }

          await updateOrgSubscription(org.id, {
            tier,
            stripe_subscription_id: subscription.id,
          });
          console.log(`[Stripe webhook] Org ${org.id} subscription updated to ${tier}`);
        } else {
          // non-active status (canceled, unpaid, past_due, etc.) — downgrade
          await updateOrgSubscription(org.id, {
            tier: "free",
            stripe_subscription_id: null,
          });
          console.log(`[Stripe webhook] Org ${org.id} downgraded to free (status: ${subscription.status})`);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        const org = await findOrgByStripeCustomerId(customerId);

        if (!org) {
          console.error("[Stripe webhook] customer.subscription.deleted: org not found for customer", customerId);
          break;
        }

        // Keep stripe_customer_id so future checkouts reuse the same Stripe customer
        await updateOrgSubscription(org.id, {
          tier: "free",
          stripe_subscription_id: null,
        });
        console.log(`[Stripe webhook] Org ${org.id} downgraded to free (subscription deleted)`);
        break;
      }

      default:
        // Ignore unhandled event types
        break;
    }
  } catch (err) {
    console.error(`[Stripe webhook] Error processing event ${event.type}:`, err);
    // Return 200 anyway to prevent Stripe from retrying (log the error separately)
    return NextResponse.json({ received: true, warning: "Processing error — check logs" });
  }

  return NextResponse.json({ received: true });
}
