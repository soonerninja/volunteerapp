import { createClient } from "@supabase/supabase-js";
import type { OrganizationTier } from "@/types/database";

// Map tier → Stripe Price ID
export function getPriceIdForTier(tier: "starter" | "growth"): string {
  if (tier === "starter") return process.env.STRIPE_PRICE_ID_STARTER!;
  return process.env.STRIPE_PRICE_ID_GROWTH!;
}

// Map Stripe Price ID → internal tier (for webhook handler)
export function getTierForPriceId(priceId: string): OrganizationTier | null {
  if (priceId === process.env.STRIPE_PRICE_ID_STARTER) return "starter";
  if (priceId === process.env.STRIPE_PRICE_ID_GROWTH) return "growth";
  return null;
}

// Service-role Supabase client — bypasses RLS, server-only
function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

// Update org tier + Stripe IDs using service role
export async function updateOrgSubscription(
  orgId: string,
  updates: {
    tier: OrganizationTier;
    stripe_customer_id?: string;
    stripe_subscription_id?: string | null;
    stripe_cancel_at_period_end?: boolean;
    stripe_current_period_end?: string | null;
  }
) {
  const supabase = createServiceClient();
  const { error } = await supabase
    .from("organizations")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", orgId);

  if (error) {
    throw new Error(`Failed to update org ${orgId}: ${error.message}`);
  }
}

// Find org by Stripe customer ID (used in subscription lifecycle webhooks)
export async function findOrgByStripeCustomerId(customerId: string) {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("organizations")
    .select("id, tier, stripe_subscription_id")
    .eq("stripe_customer_id", customerId)
    .single();

  return data ?? null;
}
