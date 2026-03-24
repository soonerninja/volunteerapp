import type { Metadata } from "next";
import Link from "next/link";
import { Users, Calendar, UsersRound, Clock, FileDown, Shield } from "lucide-react";
import { LogoLink } from "@/components/ui/logo";

export const metadata: Metadata = {
  title: "GoodTally - Volunteer Management for Nonprofits",
  description:
    "Simple, affordable volunteer management for small nonprofits. Track volunteers, hours, events, and committees — all in one tool. Free forever for up to 10 volunteers.",
  keywords: [
    "volunteer management",
    "nonprofit software",
    "volunteer tracking",
    "volunteer hours",
    "event management",
    "committee management",
    "small nonprofit tools",
  ],
};

const features = [
  {
    icon: Users,
    title: "Volunteer Profiles",
    description:
      "Track contact info, skills, roles, and status for every volunteer in one place.",
  },
  {
    icon: Calendar,
    title: "Event Management",
    description:
      "Create events, assign volunteers, and log hours — no spreadsheets needed.",
  },
  {
    icon: UsersRound,
    title: "Committees",
    description:
      "Organize working groups with members, chairs, and priorities to keep things moving.",
  },
  {
    icon: Clock,
    title: "Hours Tracking",
    description:
      "Log volunteer hours per event and see totals across the year at a glance.",
  },
  {
    icon: FileDown,
    title: "CSV Exports",
    description:
      "Export your volunteer and event data anytime for reports, grants, or board meetings.",
  },
  {
    icon: Shield,
    title: "Team Permissions",
    description:
      "Invite staff with admin, editor, or viewer roles so everyone has the right access.",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "GoodTally",
            applicationCategory: "BusinessApplication",
            operatingSystem: "Web",
            description:
              "Simple, affordable volunteer management for small nonprofits. Track volunteers, hours, events, and committees.",
            url: "https://goodtally.app",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "USD",
              description: "Free plan available",
            },
            publisher: {
              "@type": "Organization",
              name: "GoodTally",
              url: "https://goodtally.app",
              email: "support@goodtally.app",
            },
          }),
        }}
      />
      {/* Nav */}
      <header className="border-b border-gray-100 bg-white/90 backdrop-blur-sm sticky top-0 z-50">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <LogoLink />
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </header>

      {/* Hero — split layout */}
      <section className="mx-auto max-w-6xl px-4 py-16 lg:py-20">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">
          {/* Left: copy */}
          <div>
            {/* Eyebrow badge */}
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3.5 py-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
              <span className="text-xs font-semibold uppercase tracking-wide text-blue-700">
                Built for small nonprofits
              </span>
            </div>

            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl leading-tight">
              Volunteer management{" "}
              <span className="text-blue-600">that stays out of the way</span>
            </h1>

            <p className="mt-5 text-lg leading-relaxed text-gray-600 max-w-lg">
              Track volunteers, hours, events, and committees — all in one simple
              tool built for small nonprofits. No training required.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="/signup"
                className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
              >
                Get Started Free
              </Link>
              <Link
                href="/pricing"
                className="rounded-lg border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 transition-colors"
              >
                View Pricing
              </Link>
            </div>

            <p className="mt-3 text-xs text-gray-400">
              Free forever for up to 10 volunteers &middot; No credit card required
            </p>

            {/* Price callout */}
            <div className="mt-6 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3.5 max-w-md">
              <span className="text-xl" aria-hidden="true">💡</span>
              <p className="text-sm leading-relaxed text-amber-900">
                Most volunteer software costs{" "}
                <strong className="font-semibold">$100–$500/month.</strong>{" "}
                GoodTally starts at{" "}
                <strong className="font-semibold">$49/year</strong> — that&apos;s not a typo.
              </p>
            </div>
          </div>

          {/* Right: app mockup */}
          <div className="hidden lg:flex justify-center">
            <div className="w-full max-w-md rounded-2xl border border-gray-200 shadow-2xl overflow-hidden">
              {/* Browser chrome */}
              <div className="flex items-center gap-1.5 bg-gray-100 px-4 py-3 border-b border-gray-200">
                <span className="h-3 w-3 rounded-full bg-red-400" />
                <span className="h-3 w-3 rounded-full bg-yellow-400" />
                <span className="h-3 w-3 rounded-full bg-green-400" />
                <span className="ml-3 flex-1 rounded bg-white px-3 py-1 text-xs text-gray-400 font-mono">
                  goodtally.app/dashboard
                </span>
              </div>

              {/* App header */}
              <div className="flex items-center justify-between bg-gray-900 px-4 py-3">
                <span className="text-sm font-bold text-white">GoodTally</span>
                <span className="rounded-full bg-blue-600 px-2.5 py-0.5 text-xs font-semibold text-white">
                  AFSP Norman Walk
                </span>
              </div>

              {/* App body */}
              <div className="flex bg-white">
                {/* Sidebar */}
                <div className="w-28 shrink-0 border-r border-gray-100 bg-gray-50 py-3">
                  {["Volunteers", "Events", "Committees", "Hours", "Reports"].map(
                    (item, i) => (
                      <div
                        key={item}
                        className={`flex items-center gap-2 px-3 py-2 text-xs ${
                          i === 0
                            ? "bg-blue-50 font-semibold text-blue-700"
                            : "text-gray-400"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${i === 0 ? "bg-blue-500" : "bg-gray-300"}`}
                        />
                        {item}
                      </div>
                    )
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-800">Volunteers</span>
                    <span className="rounded bg-blue-600 px-2 py-0.5 text-[10px] font-semibold text-white">
                      + Add
                    </span>
                  </div>

                  {[
                    { initials: "SM", name: "Sarah M.", role: "Walk Captain", hrs: "24h", status: "Active", color: "bg-blue-600" },
                    { initials: "JK", name: "James K.", role: "Fundraising", hrs: "18h", status: "Active", color: "bg-indigo-600" },
                    { initials: "AR", name: "Amy R.", role: "Marketing", hrs: "9h", status: "New", color: "bg-slate-500" },
                  ].map((v) => (
                    <div key={v.name} className="flex items-center gap-2 border-b border-gray-50 py-1.5">
                      <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[9px] font-bold text-white ${v.color}`}>
                        {v.initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[11px] font-medium text-gray-800 truncate">{v.name}</div>
                        <div className="text-[9px] text-gray-400">{v.role}</div>
                      </div>
                      <span className="text-[11px] font-semibold text-blue-600 font-mono">{v.hrs}</span>
                      <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-semibold ${v.status === "Active" ? "bg-blue-50 text-blue-700" : "bg-amber-50 text-amber-700"}`}>
                        {v.status}
                      </span>
                    </div>
                  ))}

                  {/* Mini stats */}
                  <div className="mt-3 grid grid-cols-3 gap-1.5">
                    {[
                      { num: "47", label: "Volunteers" },
                      { num: "312h", label: "Hours" },
                      { num: "6", label: "Events" },
                    ].map((s) => (
                      <div key={s.label} className="rounded-lg border border-gray-100 bg-gray-50 py-2 text-center">
                        <div className="text-sm font-semibold text-blue-600 font-mono">{s.num}</div>
                        <div className="text-[9px] text-gray-400 mt-0.5">{s.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-gray-100 bg-gray-50 py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="mb-10 text-center text-2xl font-bold text-gray-900">
            Everything you need, nothing you don&apos;t
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div
                key={f.title}
                className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                  <f.icon className="h-5 w-5 text-blue-600" aria-hidden="true" />
                </div>
                <h3 className="font-semibold text-gray-900">{f.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-gray-500">
                  {f.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-blue-600">
        <div className="mx-auto max-w-5xl px-4 py-16 text-center">
          <h2 className="text-2xl font-bold text-white">
            Ready to get organized?
          </h2>
          <p className="mt-2 text-blue-100">
            Set up your nonprofit in under two minutes. Free to start.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/signup"
              className="inline-flex rounded-lg bg-white px-6 py-3 text-sm font-semibold text-blue-600 shadow-sm hover:bg-blue-50 transition-colors"
            >
              Create Your Free Account
            </Link>
            <Link
              href="/pricing"
              className="inline-flex rounded-lg border border-blue-400 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-500 transition-colors"
            >
              See Pricing
            </Link>
          </div>
          <p className="mt-4 text-xs text-blue-200">
            Free forever for up to 10 volunteers &middot; Paid plans from $49/yr
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-6 text-xs text-gray-400">
          <div className="flex items-center justify-between">
            <span>GoodTally&trade;</span>
            <div className="flex gap-4">
              <Link href="/contact" className="hover:text-gray-600">
                Contact
              </Link>
              <Link href="/pricing" className="hover:text-gray-600">
                Pricing
              </Link>
              <Link href="/terms" className="hover:text-gray-600">
                Terms of Service
              </Link>
              <Link href="/privacy" className="hover:text-gray-600">
                Privacy Policy
              </Link>
              <Link href="/login" className="hover:text-gray-600">
                Sign In
              </Link>
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
