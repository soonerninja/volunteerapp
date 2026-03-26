import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe";
import { updateOrgSubscription } from "@/lib/stripe-helpers";
import type Stripe from "stripe";

export const runtime = "nodejs";

// Stripe Customer Portal return handler — syncs subscription state back to DB
export async function GET(_req: NextRequest) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("org_id")
        .eq("id", user.id)
        .single();

      if (profile?.org_id) {
        const { data: org } = await supabase
          .from("organizations")
          .select("stripe_subscription_id, tier")
          .eq("id", profile.org_id)
          .single();

        if (org?.stripe_subscription_id) {
          const subscription = await stripe.subscriptions.retrieve(org.stripe_subscription_id);
          const sub = subscription as Stripe.Subscription & { current_period_end?: number };

          await updateOrgSubscription(profile.org_id, {
            tier: org.tier,
            stripe_cancel_at_period_end: subscription.cancel_at_period_end ?? false,
            stripe_current_period_end: sub.current_period_end
              ? new Date(sub.current_period_end * 1000).toISOString()
              : null,
          });
        }
      }
    }
  } catch (err) {
    console.error("[portal-return] Error syncing subscription state:", err);
  }

  return NextResponse.redirect(`${siteUrl}/settings/billing`);
}
