"use client";

import { usePlan } from "@/hooks/use-plan";
import { usePermissions } from "@/hooks/use-permissions";
import { PLAN_LIMITS, TIER_ORDER, formatLimit, isHigherTier } from "@/lib/plan-limits";
import type { OrganizationTier } from "@/types/database";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import {
  Check,
  X,
  Crown,
  Users,
  Calendar,
  UsersRound,
  Shield,
  FileDown,
  ScrollText,
  Paintbrush,
  Headphones,
  ArrowRight,
  Sparkles,
} from "lucide-react";

const TIER_CARD_STYLES: Record<OrganizationTier, { accent: string; badge: string; btn: string }> = {
  free: {
    accent: "border-gray-300",
    badge: "bg-gray-100 text-gray-700",
    btn: "bg-gray-900 text-white hover:bg-gray-800",
  },
  starter: {
    accent: "border-blue-500",
    badge: "bg-blue-100 text-blue-700",
    btn: "bg-blue-600 text-white hover:bg-blue-700",
  },
  growth: {
    accent: "border-purple-500",
    badge: "bg-purple-100 text-purple-700",
    btn: "bg-purple-600 text-white hover:bg-purple-700",
  },
};

const RESOURCE_ITEMS = [
  { key: "volunteers" as const, label: "Volunteers", limitKey: "maxVolunteers" as const, icon: Users },
  { key: "activeEvents" as const, label: "Active Events", limitKey: "maxActiveEvents" as const, icon: Calendar },
  { key: "committees" as const, label: "Committees", limitKey: "maxCommittees" as const, icon: UsersRound },
  { key: "users" as const, label: "Users", limitKey: "maxUsers" as const, icon: Shield },
];

const FEATURE_ITEMS = [
  { key: "auditLog" as const, label: "Audit Log", icon: ScrollText },
  { key: "exports" as const, label: "CSV Export & Reports", icon: FileDown },
  { key: "customBranding" as const, label: "Custom Branding", icon: Paintbrush },
  { key: "prioritySupport" as const, label: "Priority Support", icon: Headphones },
];

export default function BillingPage() {
  const plan = usePlan();
  const { canManageBilling } = usePermissions();

  if (plan.loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" role="status" aria-label="Loading billing" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Plan & Billing</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your subscription and view usage.
          </p>
        </div>
        <Link
          href="/pricing"
          className="text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          View full pricing page
        </Link>
      </div>

      {/* Current Plan Card */}
      <Card className="relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500" />
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pt-2">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
              <Crown className="h-5 w-5 text-blue-600" aria-hidden="true" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-gray-900">
                  {plan.limits.name} Plan
                </h2>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${TIER_CARD_STYLES[plan.tier].badge}`}>
                  Current
                </span>
              </div>
              <p className="text-sm text-gray-500">
                {plan.limits.price === 0 ? "Free forever" : `$${plan.limits.price}/year`}
              </p>
            </div>
          </div>
          {plan.tier !== "growth" && canManageBilling && (
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
            >
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              Upgrade Plan
            </Link>
          )}
        </div>
      </Card>

      {/* Usage */}
      <Card>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Current Usage
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {RESOURCE_ITEMS.map(({ key, label, limitKey, icon: Icon }) => {
            const count = plan.counts[key];
            const max = plan.limits[limitKey];
            const pct = max === Infinity ? 0 : Math.min((count / max) * 100, 100);
            const atLimit = max !== Infinity && count >= max;
            const nearLimit = max !== Infinity && count >= max * 0.8;

            return (
              <div
                key={key}
                className={`rounded-lg border p-4 ${
                  atLimit
                    ? "border-red-200 bg-red-50"
                    : nearLimit
                      ? "border-amber-200 bg-amber-50"
                      : "border-gray-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon
                      className={`h-4 w-4 ${
                        atLimit
                          ? "text-red-500"
                          : nearLimit
                            ? "text-amber-500"
                            : "text-gray-400"
                      }`}
                      aria-hidden="true"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      {label}
                    </span>
                  </div>
                  <span
                    className={`text-sm font-semibold ${
                      atLimit
                        ? "text-red-700"
                        : nearLimit
                          ? "text-amber-700"
                          : "text-gray-900"
                    }`}
                  >
                    {count} / {formatLimit(max)}
                  </span>
                </div>
                {max !== Infinity && (
                  <div className="mt-2 h-2 rounded-full bg-gray-200">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        atLimit
                          ? "bg-red-500"
                          : nearLimit
                            ? "bg-amber-500"
                            : "bg-blue-500"
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                )}
                {atLimit && (
                  <p className="mt-1.5 text-xs text-red-600">
                    You&apos;ve reached the limit for your plan.{" "}
                    <Link
                      href="/pricing"
                      className="font-medium underline hover:text-red-800"
                    >
                      Upgrade
                    </Link>
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Feature Access */}
      <Card>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Feature Access
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {FEATURE_ITEMS.map(({ key, label, icon: Icon }) => {
            const enabled = plan.hasFeature(key);
            return (
              <div
                key={key}
                className={`flex items-center gap-3 rounded-lg border p-3 ${
                  enabled ? "border-green-200 bg-green-50" : "border-gray-200 bg-gray-50"
                }`}
              >
                {enabled ? (
                  <Check className="h-4 w-4 text-green-500" aria-hidden="true" />
                ) : (
                  <X className="h-4 w-4 text-gray-400" aria-hidden="true" />
                )}
                <Icon
                  className={`h-4 w-4 ${enabled ? "text-green-600" : "text-gray-400"}`}
                  aria-hidden="true"
                />
                <span
                  className={`text-sm font-medium ${
                    enabled ? "text-green-800" : "text-gray-500"
                  }`}
                >
                  {label}
                </span>
                {!enabled && (
                  <span className="ml-auto text-xs text-gray-400">
                    Requires upgrade
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Plan Comparison */}
      {plan.tier !== "growth" && (
        <Card>
          <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-center">
            <p className="text-sm font-medium text-blue-800">
              Early adopter pricing: <span className="font-bold">50% off your first year</span> on any paid plan
            </p>
          </div>
          <h2 className="mb-6 text-lg font-semibold text-gray-900">
            Available Plans
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {TIER_ORDER.map((tier) => {
              const config = PLAN_LIMITS[tier];
              const style = TIER_CARD_STYLES[tier];
              const isCurrent = tier === plan.tier;
              const isUpgrade = isHigherTier(plan.tier, tier);

              return (
                <div
                  key={tier}
                  className={`relative rounded-xl border-2 p-6 ${
                    isCurrent ? style.accent + " bg-gray-50" : "border-gray-200"
                  }`}
                >
                  {isCurrent && (
                    <span className="absolute -top-3 left-4 rounded-full bg-blue-600 px-3 py-0.5 text-xs font-semibold text-white">
                      Current Plan
                    </span>
                  )}

                  <div className="mb-4">
                    <h3 className="text-lg font-bold text-gray-900">
                      {config.name}
                    </h3>
                    <p className="mt-1">
                      {config.price === 0 ? (
                        <span className="text-2xl font-bold text-gray-900">Free</span>
                      ) : (
                        <>
                          <span className="text-2xl font-bold text-gray-900">
                            ${config.price}
                          </span>
                          <span className="text-sm text-gray-500">/year</span>
                        </>
                      )}
                    </p>
                    <p className="mt-2 text-xs text-gray-500 leading-relaxed">
                      {config.description}
                    </p>
                  </div>

                  <div className="space-y-2 mb-4">
                    <PlanFeatureRow label="Volunteers" value={formatLimit(config.maxVolunteers)} />
                    <PlanFeatureRow label="Active Events" value={formatLimit(config.maxActiveEvents)} />
                    <PlanFeatureRow label="Committees" value={formatLimit(config.maxCommittees)} />
                    <PlanFeatureRow label="Users" value={formatLimit(config.maxUsers)} />
                    <PlanFeatureCheck label="CSV Export" enabled={config.exports} />
                    <PlanFeatureCheck label="Audit Log" enabled={config.auditLog} />
                    <PlanFeatureCheck label="Custom Branding" enabled={config.customBranding} />
                    <PlanFeatureCheck label="Priority Support" enabled={config.prioritySupport} />
                  </div>

                  {isUpgrade ? (
                    <Link
                      href="/pricing"
                      className={`block w-full rounded-lg px-4 py-2.5 text-center text-sm font-semibold transition-colors ${style.btn}`}
                    >
                      Upgrade to {config.name}
                    </Link>
                  ) : isCurrent ? (
                    <div className="rounded-lg border border-gray-300 bg-gray-100 px-4 py-2.5 text-center text-sm font-medium text-gray-500">
                      Current Plan
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}

function PlanFeatureRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-gray-600">{label}</span>
      <span className="font-medium text-gray-900">{value}</span>
    </div>
  );
}

function PlanFeatureCheck({ label, enabled }: { label: string; enabled: boolean }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      {enabled ? (
        <Check className="h-3.5 w-3.5 text-green-500" aria-hidden="true" />
      ) : (
        <X className="h-3.5 w-3.5 text-gray-300" aria-hidden="true" />
      )}
      <span className={enabled ? "text-gray-700" : "text-gray-400"}>
        {label}
      </span>
    </div>
  );
}
