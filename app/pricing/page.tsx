import Link from "next/link";
import { PLAN_LIMITS, TIER_ORDER, formatLimit } from "@/lib/plan-limits";
import type { OrganizationTier } from "@/types/database";
import {
  Check,
  X,
  Users,
  Calendar,
  UsersRound,
  Shield,
  FileDown,
  ScrollText,
  Paintbrush,
  Headphones,
  ArrowRight,
} from "lucide-react";

const TIER_STYLES: Record<OrganizationTier, { ring: string; badge: string; btn: string; bg: string }> = {
  free: {
    ring: "border-gray-200",
    badge: "bg-gray-100 text-gray-700",
    btn: "bg-gray-900 text-white hover:bg-gray-800",
    bg: "bg-white",
  },
  starter: {
    ring: "border-blue-500 ring-2 ring-blue-100",
    badge: "bg-blue-100 text-blue-700",
    btn: "bg-blue-600 text-white hover:bg-blue-700",
    bg: "bg-white",
  },
  growth: {
    ring: "border-purple-500 ring-2 ring-purple-100",
    badge: "bg-purple-100 text-purple-700",
    btn: "bg-purple-600 text-white hover:bg-purple-700",
    bg: "bg-white",
  },
};

const FEATURES = [
  { key: "maxVolunteers", label: "Volunteers", icon: Users },
  { key: "maxActiveEvents", label: "Active events", icon: Calendar },
  { key: "maxCommittees", label: "Committees", icon: UsersRound },
  { key: "maxAdmins", label: "Admin users", icon: Shield },
  { key: "exports", label: "CSV export & reports", icon: FileDown },
  { key: "auditLog", label: "Audit log", icon: ScrollText },
  { key: "customBranding", label: "Custom branding", icon: Paintbrush },
  { key: "prioritySupport", label: "Priority support", icon: Headphones },
] as const;

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link href="/" className="text-lg font-bold text-blue-600">
            GoodTally
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-16">
        {/* Title */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Simple, transparent pricing
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Start free, upgrade as you grow. No hidden fees, no surprises.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-3">
          {TIER_ORDER.map((tier) => {
            const plan = PLAN_LIMITS[tier];
            const style = TIER_STYLES[tier];
            const isPopular = tier === "starter";

            return (
              <div
                key={tier}
                className={`relative rounded-2xl border ${style.ring} ${style.bg} p-8 shadow-sm transition-shadow hover:shadow-md`}
              >
                {isPopular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="rounded-full bg-blue-600 px-4 py-1 text-xs font-semibold text-white shadow-sm">
                      Most Popular
                    </span>
                  </div>
                )}

                {/* Plan name & price */}
                <div className="mb-6">
                  <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${style.badge}`}>
                    {plan.name}
                  </span>
                  <div className="mt-4">
                    {plan.price === 0 ? (
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-bold text-gray-900">$0</span>
                        <span className="text-sm text-gray-500">forever</span>
                      </div>
                    ) : (
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-bold text-gray-900">
                          ${plan.price}
                        </span>
                        <span className="text-sm text-gray-500">/year</span>
                      </div>
                    )}
                  </div>
                  <p className="mt-3 text-sm text-gray-500 leading-relaxed">
                    {plan.description}
                  </p>
                </div>

                {/* CTA */}
                <Link
                  href="/signup"
                  className={`flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold transition-colors ${style.btn}`}
                >
                  {plan.price === 0 ? "Get Started Free" : `Start with ${plan.name}`}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>

                {/* Features */}
                <div className="mt-8 space-y-3">
                  {FEATURES.map(({ key, label, icon: Icon }) => {
                    const value = plan[key as keyof typeof plan];
                    const isBoolean = typeof value === "boolean";
                    const enabled = isBoolean ? value : true;
                    const displayValue = isBoolean
                      ? null
                      : formatLimit(value as number);

                    return (
                      <div
                        key={key}
                        className={`flex items-center gap-3 ${
                          enabled ? "text-gray-700" : "text-gray-400"
                        }`}
                      >
                        {enabled ? (
                          <Check
                            className="h-4 w-4 shrink-0 text-green-500"
                            aria-hidden="true"
                          />
                        ) : (
                          <X
                            className="h-4 w-4 shrink-0 text-gray-300"
                            aria-hidden="true"
                          />
                        )}
                        <span className="text-sm">
                          {displayValue && (
                            <span className="font-semibold">{displayValue} </span>
                          )}
                          {label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Comparison Table */}
        <div className="mx-auto mt-20 max-w-4xl">
          <h2 className="mb-8 text-center text-2xl font-bold text-gray-900">
            Compare plans side by side
          </h2>

          <div className="overflow-hidden rounded-xl border border-gray-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-4 text-left font-semibold text-gray-900">
                    Feature
                  </th>
                  {TIER_ORDER.map((tier) => (
                    <th
                      key={tier}
                      className={`px-6 py-4 text-center font-semibold ${
                        tier === "starter" ? "text-blue-700" : "text-gray-900"
                      }`}
                    >
                      {PLAN_LIMITS[tier].name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {FEATURES.map(({ key, label, icon: Icon }) => (
                  <tr key={key} className="hover:bg-gray-50">
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-2 text-gray-700">
                        <Icon className="h-4 w-4 text-gray-400" aria-hidden="true" />
                        {label}
                      </div>
                    </td>
                    {TIER_ORDER.map((tier) => {
                      const value = PLAN_LIMITS[tier][key as keyof typeof PLAN_LIMITS.free];
                      const isBoolean = typeof value === "boolean";

                      return (
                        <td key={tier} className="px-6 py-3.5 text-center">
                          {isBoolean ? (
                            value ? (
                              <Check className="mx-auto h-4 w-4 text-green-500" />
                            ) : (
                              <X className="mx-auto h-4 w-4 text-gray-300" />
                            )
                          ) : (
                            <span className="font-medium text-gray-900">
                              {formatLimit(value as number)}
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ / Bottom CTA */}
        <div className="mt-16 text-center">
          <p className="text-gray-500">
            Questions? Reach out at{" "}
            <span className="font-medium text-gray-700">
              support@goodtally.com
            </span>
          </p>
          <Link
            href="/signup"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
          >
            Get Started Free
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </main>
    </div>
  );
}
