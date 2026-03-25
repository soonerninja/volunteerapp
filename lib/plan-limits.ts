import type { OrganizationTier } from "@/types/database";

export interface PlanConfig {
  name: string;
  description: string;
  price: number; // annual price in dollars, 0 for free
  priceLabel: string;
  maxVolunteers: number;
  maxActiveEvents: number;
  maxUsers: number;
  maxCommittees: number;
  exports: boolean;
  auditLog: boolean;
  customBranding: boolean;
  prioritySupport: boolean;
}

export const PLAN_LIMITS: Record<OrganizationTier, PlanConfig> = {
  free: {
    name: "Free",
    description: "Get started with the basics. Perfect for small groups just getting organized.",
    price: 0,
    priceLabel: "Free forever",
    maxVolunteers: 10,
    maxActiveEvents: 1,
    maxUsers: 1,
    maxCommittees: 2,
    exports: false,
    auditLog: false,
    customBranding: false,
    prioritySupport: false,
  },
  starter: {
    name: "Starter",
    description: "Everything growing nonprofits need. Up to 50 volunteers, 10 active events, audit log, and CSV exports.",
    price: 99,
    priceLabel: "$99/year",
    maxVolunteers: 50,
    maxActiveEvents: 10,
    maxUsers: 2,
    maxCommittees: 10,
    exports: true,
    auditLog: true,
    customBranding: false,
    prioritySupport: false,
  },
  growth: {
    name: "Growth",
    description: "Full power for established organizations. Everything in Starter plus unlimited volunteers, events, committees, custom branding, and priority support.",
    price: 199,
    priceLabel: "$199/year",
    maxVolunteers: Infinity,
    maxActiveEvents: Infinity,
    maxUsers: 10,
    maxCommittees: Infinity,
    exports: true,
    auditLog: true,
    customBranding: true,
    prioritySupport: true,
  },
};

export const TIER_ORDER: OrganizationTier[] = ["free", "starter", "growth"];

export function getTierIndex(tier: OrganizationTier): number {
  return TIER_ORDER.indexOf(tier);
}

export function isHigherTier(current: OrganizationTier, target: OrganizationTier): boolean {
  return getTierIndex(target) > getTierIndex(current);
}

export function formatLimit(value: number): string {
  return value === Infinity ? "Unlimited" : value.toString();
}

export function getMinimumTierFor(feature: keyof PlanConfig): OrganizationTier {
  for (const tier of TIER_ORDER) {
    const val = PLAN_LIMITS[tier][feature];
    if (typeof val === "boolean" && val) return tier;
    if (typeof val === "number" && val === Infinity) return tier;
  }
  return "growth";
}
