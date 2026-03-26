"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useOrg } from "@/hooks/use-org";
import { PLAN_LIMITS, formatLimit } from "@/lib/plan-limits";
import type { OrganizationTier } from "@/types/database";
import type { PlanConfig } from "@/lib/plan-limits";

interface ResourceCounts {
  volunteers: number;
  activeEvents: number;
  users: number;
  committees: number;
}

interface PlanState {
  tier: OrganizationTier;
  limits: PlanConfig;
  counts: ResourceCounts;
  loading: boolean;

  /** Check if adding one more of a resource is allowed */
  canAdd: (resource: "volunteers" | "activeEvents" | "users" | "committees") => boolean;

  /** Get "12/15" style usage string */
  usageLabel: (resource: "volunteers" | "activeEvents" | "users" | "committees") => string;

  /** Whether org is on a paid plan */
  isPaid: boolean;

  /** Whether a specific feature is available */
  hasFeature: (feature: "exports" | "auditLog" | "customBranding" | "prioritySupport") => boolean;

  /** Whether the subscription is set to cancel at period end */
  cancelAtPeriodEnd: boolean;

  /** ISO timestamp of when the current billing period ends */
  currentPeriodEnd: string | null;

  /** Refresh counts from DB */
  refreshCounts: () => Promise<void>;
}

const LIMIT_MAP = {
  volunteers: "maxVolunteers",
  activeEvents: "maxActiveEvents",
  users: "maxUsers",
  committees: "maxCommittees",
} as const;

export function usePlan(): PlanState {
  const { supabase, orgId } = useOrg();
  const [tier, setTier] = useState<OrganizationTier>("free");
  const [cancelAtPeriodEnd, setCancelAtPeriodEnd] = useState(false);
  const [currentPeriodEnd, setCurrentPeriodEnd] = useState<string | null>(null);
  const [counts, setCounts] = useState<ResourceCounts>({
    volunteers: 0,
    activeEvents: 0,
    users: 0,
    committees: 0,
  });
  const [loading, setLoading] = useState(true);

  const limits = PLAN_LIMITS[tier];

  const fetchTierAndCounts = useCallback(async () => {
    if (!orgId) return;
    setLoading(true);

    const [orgRes, volRes, eventRes, userRes, committeeRes] = await Promise.all([
      supabase.from("organizations").select("tier, stripe_cancel_at_period_end, stripe_current_period_end").eq("id", orgId).single(),
      supabase.from("volunteers").select("id", { count: "exact", head: true }).eq("org_id", orgId),
      supabase.from("events").select("id", { count: "exact", head: true }).eq("org_id", orgId).in("status", ["upcoming", "active"]),
      supabase.from("profiles").select("id", { count: "exact", head: true }).eq("org_id", orgId),
      supabase.from("committees").select("id", { count: "exact", head: true }).eq("org_id", orgId),
    ]);

    if (orgRes.data?.tier) {
      setTier(orgRes.data.tier as OrganizationTier);
      setCancelAtPeriodEnd(orgRes.data.stripe_cancel_at_period_end ?? false);
      setCurrentPeriodEnd(orgRes.data.stripe_current_period_end ?? null);
    }

    setCounts({
      volunteers: volRes.count ?? 0,
      activeEvents: eventRes.count ?? 0,
      users: userRes.count ?? 0,
      committees: committeeRes.count ?? 0,
    });

    setLoading(false);
  }, [orgId, supabase]);

  useEffect(() => {
    fetchTierAndCounts();
  }, [fetchTierAndCounts]);

  const canAdd = useCallback(
    (resource: "volunteers" | "activeEvents" | "users" | "committees") => {
      const limitKey = LIMIT_MAP[resource];
      const max = limits[limitKey];
      return counts[resource] < max;
    },
    [counts, limits]
  );

  const usageLabel = useCallback(
    (resource: "volunteers" | "activeEvents" | "users" | "committees") => {
      const limitKey = LIMIT_MAP[resource];
      const max = limits[limitKey];
      return `${counts[resource]}/${formatLimit(max)}`;
    },
    [counts, limits]
  );

  const isPaid = tier !== "free";

  const hasFeature = useCallback(
    (feature: "exports" | "auditLog" | "customBranding" | "prioritySupport") => {
      return limits[feature];
    },
    [limits]
  );

  return useMemo(
    () => ({
      tier,
      limits,
      counts,
      loading,
      canAdd,
      usageLabel,
      isPaid,
      hasFeature,
      cancelAtPeriodEnd,
      currentPeriodEnd,
      refreshCounts: fetchTierAndCounts,
    }),
    [tier, limits, counts, loading, canAdd, usageLabel, isPaid, hasFeature, cancelAtPeriodEnd, currentPeriodEnd, fetchTierAndCounts]
  );
}
