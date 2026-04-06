import Link from "next/link";
import { Check, X, Clock } from "lucide-react";
import { MarketingShell } from "@/components/layout/marketing-shell";

export const metadata = {
  title: "GoodTally vs. SignUpGenius, Volgistics, VolunteerHub — Volunteer Management Software Comparison",
  description:
    "Compare GoodTally with SignUpGenius, Volgistics, VolunteerHub, and enterprise tools. Most volunteer management software costs $100–$500/month. GoodTally starts at $49/year.",
  alternates: { canonical: "https://goodtally.app/compare" },
  openGraph: {
    title: "GoodTally vs. SignUpGenius, Volgistics, VolunteerHub",
    description:
      "Honest, side-by-side comparison of the top volunteer management tools for small nonprofits.",
    url: "https://goodtally.app/compare",
    type: "website",
  },
};

type Cell = "yes" | "no" | "partial" | "soon" | string;

interface Row {
  label: string;
  cells: Cell[];
}

const COMPETITORS = ["GoodTally", "SignUpGenius", "Volgistics", "VolunteerHub", "Enterprise tools"] as const;

const ROWS: Row[] = [
  { label: "Starting price", cells: ["$0 free · $99/yr Starter", "$11.99/mo", "$19/mo (up to 25 vols)", "Contact sales", "$3,000+/yr"] },
  { label: "Annual cost at ~50 volunteers", cells: ["$99/yr", "~$144/yr", "~$468/yr", "$1,200+/yr", "$3,000+/yr"] },
  { label: "Volunteer profiles with contact info", cells: ["yes", "partial", "yes", "yes", "yes"] },
  { label: "Hours tracking", cells: ["yes", "no", "yes", "yes", "yes"] },
  { label: "Event management", cells: ["yes", "yes", "yes", "yes", "yes"] },
  { label: "Committees / groups", cells: ["yes", "no", "yes", "yes", "yes"] },
  { label: "CSV exports & reporting", cells: ["yes", "partial", "yes", "yes", "yes"] },
  { label: "Multiple admin users with roles", cells: ["yes (up to 10)", "partial", "yes", "yes", "yes"] },
  { label: "Audit log", cells: ["yes", "no", "partial", "yes", "yes"] },
  { label: "Setup time", cells: ["Under 5 minutes", "~15 minutes", "Hours of setup", "Days + training", "Weeks + training"] },
  { label: "Mobile-friendly", cells: ["yes", "yes", "partial", "yes", "yes"] },
  { label: "Automated email to volunteers", cells: ["soon", "yes", "yes", "yes", "yes"] },
  { label: "Volunteer self-service signup", cells: ["soon", "yes", "yes", "yes", "yes"] },
  { label: "Calendar integrations", cells: ["soon", "yes", "yes", "yes", "yes"] },
  { label: "Aggressive upsells / ads", cells: ["Never", "Yes (SignUpGenius Pro)", "No", "No", "No"] },
];

function CellIcon({ value }: { value: Cell }) {
  if (value === "yes") return <Check className="inline h-5 w-5 text-emerald-600" aria-label="Yes" />;
  if (value === "no") return <X className="inline h-5 w-5 text-rose-500" aria-label="No" />;
  if (value === "partial") return <span className="text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded">Partial</span>;
  if (value === "soon") return (
    <span className="inline-flex items-center gap-1 text-xs text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
      <Clock className="h-3 w-3" /> Coming soon
    </span>
  );
  return <span className="text-sm text-gray-700">{value}</span>;
}

export default function ComparePage() {
  return (
    <MarketingShell>
      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 py-16 lg:py-20 text-center">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3.5 py-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
          <span className="text-xs font-semibold uppercase tracking-wide text-blue-700">
            Honest comparison
          </span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 leading-tight">
          Most volunteer software costs <span className="text-rose-600">$100–$500/month</span>.
          <br />
          GoodTally starts at <span className="text-blue-600">$49/year</span>.
        </h1>

        <p className="mt-5 text-lg leading-relaxed text-gray-600 max-w-2xl mx-auto">
          A side-by-side look at GoodTally, SignUpGenius, Volgistics, VolunteerHub,
          and enterprise tools. We&apos;ll tell you what we&apos;re great at — and
          what we&apos;re still building.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
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

        {/* Price callout */}
        <div className="mt-8 mx-auto flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3.5 max-w-md text-left">
          <span className="text-xl" aria-hidden="true">💡</span>
          <p className="text-sm leading-relaxed text-amber-900">
            Most volunteer software costs{" "}
            <strong className="font-semibold">$100–$500/month.</strong>{" "}
            GoodTally starts at{" "}
            <strong className="font-semibold">$49/year</strong> — that&apos;s not a typo.
          </p>
        </div>
      </section>

      {/* Comparison table */}
      <section className="border-t border-gray-100 bg-gray-50 py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="mb-10 text-center text-2xl font-bold text-gray-900">
            Feature comparison
          </h2>
          <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-700">
                <tr>
                  <th scope="col" className="px-4 py-3 font-semibold w-56">Feature</th>
                  {COMPETITORS.map((c, i) => (
                    <th
                      key={c}
                      scope="col"
                      className={`px-4 py-3 font-semibold ${i === 0 ? "bg-blue-50/60 text-blue-900" : ""}`}
                    >
                      {c}
                      {i === 0 && <div className="text-xs font-normal text-blue-700">That&apos;s us 👋</div>}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {ROWS.map((row) => (
                  <tr key={row.label}>
                    <th scope="row" className="px-4 py-3 text-gray-900 font-medium">{row.label}</th>
                    {row.cells.map((cell, i) => (
                      <td key={i} className={`px-4 py-3 ${i === 0 ? "bg-blue-50/60" : ""}`}>
                        <CellIcon value={cell} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-500 mt-3 text-center">
            Competitor pricing and features referenced as of early 2026 from their public pricing pages.
            If anything&apos;s out of date, <a href="mailto:hello@goodtally.app" className="underline">let us know</a> and we&apos;ll fix it.
          </p>
        </div>
      </section>

      {/* Who it's for */}
      <section className="max-w-3xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-10 text-center">
          Who GoodTally is for
        </h2>
        <p className="text-gray-700 leading-relaxed">
          GoodTally is built for <strong>small nonprofits with 5–100 volunteers</strong> — PTOs,
          animal rescues, food banks, youth sports leagues, church ministries, community service
          groups. If you&apos;ve been wrestling with spreadsheets or paying $500/month for software
          built for the Red Cross, you&apos;re exactly who we built this for.
        </p>
        <p className="text-gray-700 leading-relaxed mt-4">
          If you have 500+ volunteers, need Salesforce integration, or require HIPAA compliance,
          an enterprise tool like VolunteerHub or Bloomerang may be a better fit. We&apos;d rather tell
          you that up-front than sell you something you&apos;ll outgrow.
        </p>
      </section>
    </MarketingShell>
  );
}
