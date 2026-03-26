import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe";
import { getPriceIdForTier } from "@/lib/stripe-helpers";
import type Stripe from "stripe";

export async function POST(req: NextRequest) {
  const supabase = await createClient();

  // Authenticate
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Parse body
  let tier: "starter" | "growth";
  try {
    const body = await req.json();
    if (body.tier !== "starter" && body.tier !== "growth") {
      return NextResponse.json({ error: "Invalid tier" }, { status: 400 });
    }
    tier = body.tier;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  // Get user's org
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

  // Get org's existing Stripe customer ID
  const { data: org } = await supabase
    .from("organizations")
    .select("stripe_customer_id, tier")
    .eq("id", profile.org_id)
    .single();

  const priceId = getPriceIdForTier(tier);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const baseParams = {
    mode: "subscription" as const,
    line_items: [{ price: priceId, quantity: 1 }],
    discounts: [{ coupon: process.env.STRIPE_COUPON_EARLY_ADOPTER! }],
    success_url: `${siteUrl}/settings/billing?success=1`,
    cancel_url: `${siteUrl}/settings/billing?canceled=1`,
    metadata: { org_id: profile.org_id },
    subscription_data: {
      metadata: { org_id: profile.org_id },
    },
  };

  // Reuse existing Stripe customer if available, otherwise prefill email
  const sessionParams: Stripe.Checkout.SessionCreateParams = org?.stripe_customer_id
    ? { ...baseParams, customer: org.stripe_customer_id }
    : { ...baseParams, customer_email: user.email };

  const session = await stripe.checkout.sessions.create(sessionParams);

  return NextResponse.json({ url: session.url });
}
