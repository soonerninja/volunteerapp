import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { getTierForPriceId, updateOrgSubscription } from "@/lib/stripe-helpers";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const sessionId = req.nextUrl.searchParams.get("session_id");

  if (!sessionId) {
    return NextResponse.redirect(`${siteUrl}/settings/billing?canceled=1`);
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["subscription"],
    });

    if (session.payment_status !== "paid") {
      return NextResponse.redirect(`${siteUrl}/settings/billing?canceled=1`);
    }

    const orgId = session.metadata?.org_id;
    if (!orgId) {
      console.error("[checkout-success] Missing org_id in session metadata", sessionId);
      return NextResponse.redirect(`${siteUrl}/settings/billing?success=1`);
    }

    const subscription = session.subscription as import("stripe").Stripe.Subscription;
    const priceId = subscription?.items?.data[0]?.price?.id;
    const tier = priceId ? getTierForPriceId(priceId) : null;

    if (!tier) {
      console.error("[checkout-success] Unknown priceId", priceId);
      return NextResponse.redirect(`${siteUrl}/settings/billing?success=1`);
    }

    await updateOrgSubscription(orgId, {
      tier,
      stripe_customer_id: session.customer as string,
      stripe_subscription_id: subscription?.id ?? null,
      stripe_cancel_at_period_end: subscription?.cancel_at_period_end ?? false,
      stripe_current_period_end: subscription?.cancel_at
        ? new Date(subscription.cancel_at * 1000).toISOString()
        : null,
    });

    console.log(`[checkout-success] Org ${orgId} upgraded to ${tier}`);
  } catch (err) {
    console.error("[checkout-success] Error:", err);
  }

  return NextResponse.redirect(`${siteUrl}/settings/billing?success=1`);
}
