import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe";
import { updateOrgSubscription } from "@/lib/stripe-helpers";

export async function POST(_req: NextRequest) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("org_id, role")
    .eq("id", user.id)
    .single();

  if (!profile?.org_id) {
    return NextResponse.json({ error: "No organization found" }, { status: 400 });
  }

  if (profile.role !== "owner") {
    return NextResponse.json({ error: "Only owners can manage billing" }, { status: 403 });
  }

  const { data: org } = await supabase
    .from("organizations")
    .select("stripe_subscription_id, tier")
    .eq("id", profile.org_id)
    .single();

  if (!org?.stripe_subscription_id) {
    return NextResponse.json({ error: "No active subscription found" }, { status: 400 });
  }

  if (org.tier === "growth") {
    return NextResponse.json({ error: "Already on Growth plan" }, { status: 400 });
  }

  const growthPriceId = process.env.STRIPE_PRICE_ID_GROWTH!;
  const subscription = await stripe.subscriptions.retrieve(org.stripe_subscription_id);
  const itemId = subscription.items.data[0]?.id;

  if (!itemId) {
    return NextResponse.json({ error: "Could not find subscription item" }, { status: 500 });
  }

  await stripe.subscriptions.update(org.stripe_subscription_id, {
    items: [{ id: itemId, price: growthPriceId }],
    proration_behavior: "create_prorations",
  });

  await updateOrgSubscription(profile.org_id, {
    tier: "growth",
    stripe_cancel_at_period_end: false,
    stripe_current_period_end: null,
  });

  return NextResponse.json({ success: true });
}
