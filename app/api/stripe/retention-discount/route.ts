import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe";

export async function POST() {
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

  if (!profile?.org_id || profile.role !== "owner") {
    return NextResponse.json({ error: "Only owners can manage billing" }, { status: 403 });
  }

  const { data: org } = await supabase
    .from("organizations")
    .select("stripe_subscription_id")
    .eq("id", profile.org_id)
    .single();

  if (!org?.stripe_subscription_id) {
    return NextResponse.json({ error: "No active subscription found" }, { status: 400 });
  }

  // Apply the retention coupon (25% off once) to the subscription via discount
  await stripe.subscriptions.update(org.stripe_subscription_id, {
    discounts: [{ coupon: process.env.STRIPE_COUPON_RETENTION! }],
  });

  return NextResponse.json({ success: true });
}
