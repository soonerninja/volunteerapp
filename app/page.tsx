import type { Metadata } from "next";
import Link from "next/link";
import { Users, Calendar, UsersRound, Clock, FileDown, Shield } from "lucide-react";

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
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Nav */}
      <header className="border-b border-gray-100 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <span className="text-lg font-bold text-blue-600">GoodTally</span>
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

      {/* Hero */}
      <section className="mx-auto max-w-5xl px-4 pt-20 pb-16 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          Volunteer management
          <br />
          <span className="text-blue-600">that stays out of the way</span>
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-gray-600">
          Track volunteers, hours, events, and committees — all in one simple
          tool built for small nonprofits. No training required.
        </p>
        <div className="mt-8 flex items-center justify-center gap-4">
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
        <p className="mt-4 text-xs text-gray-400">
          Free forever for up to 10 volunteers. No credit card required.
        </p>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-5xl px-4 pb-20">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
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
      </section>

      {/* CTA */}
      <section className="border-t border-gray-100 bg-gray-50">
        <div className="mx-auto max-w-5xl px-4 py-16 text-center">
          <h2 className="text-2xl font-bold text-gray-900">
            Ready to get organized?
          </h2>
          <p className="mt-2 text-gray-600">
            Set up your nonprofit in under two minutes.
          </p>
          <div className="mt-6">
            <Link
              href="/signup"
              className="inline-flex rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
            >
              Create Your Free Account
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-6 text-xs text-gray-400">
          <div className="flex items-center justify-between">
            <span>GoodTally&trade;</span>
            <div className="flex gap-4">
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
