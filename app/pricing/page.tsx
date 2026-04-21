import type { Metadata } from "next";
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
  Mail,
  Clock,
  ArrowRight,
} from "lucide-react";
import { LogoLink } from "@/components/ui/logo";
import { PricingCtaButton } from "@/components/ui/pricing-cta-button";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Pricing – GoodTally",
  description:
    "Simple, transparent pricing for volunteer management. Start free, upgrade as you grow. Plans for nonprofits of every size.",
  alternates: {
    canonical: "https://goodtally.app/pricing",
  },
};

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
  { key: "maxUsers", label: "Users", icon: Shield },
  { key: "auditLog", label: "Audit log", icon: ScrollText },
  { key: "exports", label: "CSV export & reports", icon: FileDown },
  { key: "customBranding", label: "Custom branding", icon: Paintbrush },
  { key: "prioritySupport", label: "Priority support", icon: Headphones },
] as const;

export default async function PricingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const isLoggedIn = !!user;
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <LogoLink />
          <div className="flex items-center gap-4">
            <Link href="/compare" className="hidden sm:inline text-sm font-medium text-gray-600 hover:text-gray-900">
              Compare
            </Link>
            <Link href="/blog" className="hidden sm:inline text-sm font-medium text-gray-600 hover:text-gray-900">
              Blog
            </Link>
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
              Get Started Free
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

        {/* Early Adopter Banner */}
        <div className="mx-auto mb-10 max-w-2xl rounded-xl border border-blue-200 bg-blue-50 px-6 py-5 text-center">
          <h2 className="text-lg font-bold text-blue-900">
            Early Adopter Special &mdash; 50% Off Your First Year
          </h2>
          <p className="mt-1 text-sm text-blue-700">
            Be one of the first to join GoodTally and lock in 50% off your first year. Offer ends when we exit early access.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {TIER_ORDER.map((tier) => {
            const plan = PLAN_LIMITS[tier];
            const style = TIER_STYLES[tier];
            const isPopular = tier === "starter";
            const isGrowth = tier === "growth";

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
                {isGrowth && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="rounded-full bg-purple-600 px-4 py-1 text-xs font-semibold text-white shadow-sm">
                      Best Value
                    </span>
                  </div>
                )}

                {/* Plan name & price */}
                <div className="mb-6">
                  <div className="flex items-center gap-2">
                    <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${style.badge}`}>
                      {plan.name}
                    </span>
                    {plan.price > 0 && (
                      <span className="inline-block rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-700">
                        Early Adopter
                      </span>
                    )}
                  </div>
                  <div className="mt-4">
                    {plan.price === 0 ? (
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-bold text-gray-900">$0</span>
                        <span className="text-sm text-gray-500">forever</span>
                      </div>
                    ) : (
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-bold text-gray-900">
                          ${Math.floor(plan.price / 2)}
                        </span>
                        <span className="text-sm text-gray-500">/yr</span>
                        <span className="ml-1 text-lg text-gray-400 line-through">
                          ${plan.price}
                        </span>
                      </div>
                    )}
                  </div>
                  <p className="mt-3 text-sm text-gray-500 leading-relaxed">
                    {plan.description}
                  </p>
                </div>

                {/* CTA */}
                <PricingCtaButton
                  tier={tier}
                  label={plan.price === 0 ? "Get Started Free" : `Start with ${plan.name}`}
                  className={`flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold transition-colors ${style.btn}`}
                  isLoggedIn={isLoggedIn}
                />

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
                  {isGrowth && (
                    <div className="mt-4 border-t border-purple-100 pt-4">
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-purple-600">
                        Coming Soon
                      </p>
                      {[
                        "Volunteer self-service login portal",
                        "Automated email notifications",
                      ].map((item) => (
                        <div key={item} className="flex items-center gap-3 text-purple-600 mt-2">
                          <Clock className="h-4 w-4 shrink-0" aria-hidden="true" />
                          <span className="text-sm">{item}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Enterprise Card */}
          <div className="relative rounded-2xl border border-slate-500 ring-2 ring-slate-100 bg-slate-700 p-8 shadow-sm transition-shadow hover:shadow-md">
            {/* Plan name & price */}
            <div className="mb-6">
              <div className="flex items-center gap-2">
                <span className="inline-block rounded-full px-3 py-1 text-xs font-semibold bg-slate-500 text-slate-100">
                  Enterprise
                </span>
              </div>
              <div className="mt-4">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-white">Custom</span>
                </div>
              </div>
              <p className="mt-3 text-sm text-slate-300 leading-relaxed">
                Need more than 10 users, multiple chapters, or a custom build? Let&apos;s talk.
              </p>
            </div>

            {/* CTA */}
            <a
              href="mailto:enterprise@goodtally.app"
              className="flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold transition-colors bg-white text-slate-800 hover:bg-slate-100"
            >
              <Mail className="h-4 w-4" aria-hidden="true" />
              Contact Us
            </a>

            {/* Features */}
            <div className="mt-8 space-y-3">
              {[
                "Everything in Growth",
                "Unlimited users",
                "Multiple chapters",
                "Custom integrations",
                "Dedicated onboarding",
                "SLA & invoicing",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 text-slate-200">
                  <Check className="h-4 w-4 shrink-0 text-blue-300" aria-hidden="true" />
                  <span className="text-sm">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Comparison Table */}
        <div className="mx-auto mt-20 max-w-5xl">
          <h2 className="mb-8 text-center text-2xl font-bold text-gray-900">
            Compare plans side by side
          </h2>

          <div className="overflow-hidden rounded-xl border border-gray-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th scope="col" className="px-6 py-4 text-left font-semibold text-gray-900">
                    Feature
                  </th>
                  {TIER_ORDER.map((tier) => (
                    <th
                      key={tier}
                      scope="col"
                      className={`px-6 py-4 text-center font-semibold ${
                        tier === "starter" ? "text-blue-700" : "text-gray-900"
                      }`}
                    >
                      {PLAN_LIMITS[tier].name}
                    </th>
                  ))}
                  <th scope="col" className="px-6 py-4 text-center font-semibold text-slate-700">
                    Enterprise
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {FEATURES.map(({ key, label, icon: Icon }) => (
                  <tr key={key} className="hover:bg-gray-50">
                    <th scope="row" className="px-6 py-3.5 text-left font-normal">
                      <div className="flex items-center gap-2 text-gray-700">
                        <Icon className="h-4 w-4 text-gray-400" aria-hidden="true" />
                        {label}
                      </div>
                    </th>
                    {TIER_ORDER.map((tier) => {
                      const value = PLAN_LIMITS[tier][key as keyof typeof PLAN_LIMITS.free];
                      const isBoolean = typeof value === "boolean";

                      return (
                        <td key={tier} className="px-6 py-3.5 text-center">
                          {isBoolean ? (
                            value ? (
                              <Check className="mx-auto h-4 w-4 text-green-500" aria-label="Included" />
                            ) : (
                              <X className="mx-auto h-4 w-4 text-gray-300" aria-label="Not included" />
                            )
                          ) : (
                            <span className="font-medium text-gray-900">
                              {formatLimit(value as number)}
                            </span>
                          )}
                        </td>
                      );
                    })}
                    <td className="px-6 py-3.5 text-center">
                      <span className="text-sm font-medium text-slate-500">Custom</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ */}
        <div className="mx-auto mt-20 max-w-2xl">
          <h2 className="mb-8 text-center text-2xl font-bold text-gray-900">
            Common questions
          </h2>
          <div className="space-y-2">
            {[
              {
                q: "What happens to my data if I cancel?",
                a: "Your data is yours. If you cancel, you have 30 days to export everything via CSV before we remove it from our systems. We'll never hold your volunteer data hostage.",
              },
              {
                q: "Can I upgrade or downgrade mid-year?",
                a: "You can upgrade at any time and the new plan takes effect immediately. Downgrades take effect at the end of your current annual billing cycle — you keep your current features until then.",
              },
              {
                q: "Do you offer nonprofit discounts?",
                a: "At $49–$99/year we're already priced specifically for nonprofits. If your organization has a genuine financial hardship, reach out at support@goodtally.app and we'll work something out.",
              },
              {
                q: "Can my volunteers use GoodTally too?",
                a: "Currently GoodTally is a management tool used by staff and admins to track volunteers — volunteers don't need accounts. Volunteer self-service login portals are coming soon to the Growth plan.",
              },
              {
                q: "How is billing handled?",
                a: "All paid plans are billed annually via Stripe. You'll receive a receipt by email. We do not store your full credit card number. All fees are non-refundable per our Terms of Service.",
              },
            ].map(({ q, a }) => (
              <details
                key={q}
                className="group rounded-xl border border-gray-200 bg-white open:shadow-sm"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-sm font-semibold text-gray-900 hover:bg-gray-50 rounded-xl group-open:rounded-b-none group-open:border-b group-open:border-gray-100 select-none">
                  {q}
                  <span className="shrink-0 text-gray-400 transition-transform group-open:rotate-45 text-lg leading-none">
                    +
                  </span>
                </summary>
                <p className="px-5 pb-4 pt-3 text-sm leading-relaxed text-gray-600">
                  {a}
                </p>
              </details>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <p className="text-gray-500">
            Questions? Reach out at{" "}
            <a
              href="mailto:support@goodtally.app"
              className="font-medium text-gray-700 hover:text-blue-600 transition-colors"
            >
              support@goodtally.app
            </a>
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

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-white mt-8">
        <div className="mx-auto max-w-6xl px-4 py-6 text-xs text-gray-400">
          <div className="flex items-center justify-between">
            <span>GoodTally&trade;</span>
            <div className="flex flex-wrap gap-4">
              <Link href="/compare" className="hover:text-gray-600">Compare</Link>
              <Link href="/blog" className="hover:text-gray-600">Blog</Link>
              <Link href="/contact" className="hover:text-gray-600">Contact</Link>
              <Link href="/terms" className="hover:text-gray-600">Terms of Service</Link>
              <Link href="/privacy" className="hover:text-gray-600">Privacy Policy</Link>
              <Link href="/login" className="hover:text-gray-600">Sign In</Link>
            </div>
          </div>
          <p className="mt-3 text-center text-gray-300">
            &copy; {new Date().getFullYear()} GoodTally. All rights reserved. GoodTally is a trademark of its respective owners.
          </p>
        </div>
      </footer>
    </div>
  );
}
