"use client";

import Link from "next/link";
import { Lock, ArrowRight } from "lucide-react";
import type { OrganizationTier } from "@/types/database";
import { PLAN_LIMITS } from "@/lib/plan-limits";

interface UpgradePromptProps {
  /** The minimum tier needed to unlock this feature */
  requiredTier: OrganizationTier;
  /** What the user is trying to do, e.g. "export reports" */
  feature: string;
  /** Compact inline version vs full card */
  variant?: "inline" | "card" | "banner";
}

export function UpgradePrompt({
  requiredTier,
  feature,
  variant = "card",
}: UpgradePromptProps) {
  const plan = PLAN_LIMITS[requiredTier];

  if (variant === "inline") {
    return (
      <span className="inline-flex items-center gap-1.5 text-sm text-gray-500">
        <Lock className="h-3.5 w-3.5" aria-hidden="true" />
        <span>
          Upgrade to{" "}
          <Link
            href="/settings/billing"
            className="font-medium text-blue-600 hover:text-blue-800"
          >
            {plan.name}
          </Link>{" "}
          to {feature}
        </span>
      </span>
    );
  }

  if (variant === "banner") {
    return (
      <div className="flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
        <div className="flex items-center gap-2">
          <Lock className="h-4 w-4 text-amber-600" aria-hidden="true" />
          <p className="text-sm text-amber-800">
            Upgrade to <span className="font-semibold">{plan.name}</span> to{" "}
            {feature}.
          </p>
        </div>
        <Link
          href="/settings/billing"
          className="inline-flex items-center gap-1 rounded-md bg-amber-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-700 transition-colors"
        >
          Upgrade
          <ArrowRight className="h-3 w-3" aria-hidden="true" />
        </Link>
      </div>
    );
  }

  // card variant
  return (
    <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white p-6 text-center">
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
        <Lock className="h-5 w-5 text-blue-600" aria-hidden="true" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900">
        Upgrade to {plan.name}
      </h3>
      <p className="mt-1 text-sm text-gray-500">{plan.description}</p>
      <p className="mt-2 text-sm text-gray-600">
        Unlock the ability to {feature}.
      </p>
      <Link
        href="/settings/billing"
        className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
      >
        View Plans
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </div>
  );
}

interface PlanLimitBadgeProps {
  /** e.g. "12/15 volunteers" */
  usage: string;
  /** Whether at or over limit */
  atLimit: boolean;
}

export function PlanLimitBadge({ usage, atLimit }: PlanLimitBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
        atLimit
          ? "bg-red-100 text-red-700"
          : "bg-gray-100 text-gray-600"
      }`}
    >
      {usage}
    </span>
  );
}
