import Link from "next/link";
import { Check, X, Clock, Sparkles } from "lucide-react";

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
    <main className="min-h-screen bg-white">
      {/* Header */}
      <section className="bg-gradient-to-b from-blue-50 to-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 py-16 text-center">
          <div className="inline-flex items-center gap-2 bg-white border border-blue-200 text-blue-700 text-sm font-medium px-3 py-1 rounded-full mb-4">
            <Sparkles className="h-4 w-4" /> Honest comparison
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 tracking-tight">
            Most volunteer management software costs <span className="text-rose-600">$100–$500/month</span>.
            <br />
            GoodTally starts at <span className="text-emerald-600">$49/year</span>.
          </h1>
          <p className="mt-5 text-lg text-gray-600 max-w-2xl mx-auto">
            A side-by-side look at GoodTally, SignUpGenius, Volgistics, VolunteerHub, and enterprise tools.
            We'll tell you what we're great at — and what we're still building.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <Link href="/signup" className="inline-flex items-center bg-blue-600 text-white font-semibold px-6 py-3 rounded-md hover:bg-blue-700">
              Try GoodTally free
            </Link>
            <Link href="/pricing" className="inline-flex items-center text-blue-700 font-medium px-6 py-3 hover:underline">
              See pricing →
            </Link>
          </div>
        </div>
      </section>

      {/* Comparison table */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Feature comparison</h2>
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-700">
              <tr>
                <th scope="col" className="px-4 py-3 font-semibold w-56">Feature</th>
                {COMPETITORS.map((c, i) => (
                  <th
                    key={c}
                    scope="col"
                    className={`px-4 py-3 font-semibold ${i === 0 ? "bg-blue-50 text-blue-900" : ""}`}
                  >
                    {c}
                    {i === 0 && <div className="text-xs font-normal text-blue-700">That's us 👋</div>}
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
        <p className="text-xs text-gray-500 mt-3">
          Competitor pricing and features referenced as of early 2026 from their public pricing pages.
          If anything's out of date, <a href="mailto:hello@goodtally.app" className="underline">let us know</a> and we'll fix it.
        </p>
      </section>

      {/* Who it's for */}
      <section className="max-w-3xl mx-auto px-6 pb-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-3">Who GoodTally is for</h2>
        <p className="text-gray-700 leading-relaxed">
          GoodTally is built for <strong>small nonprofits with 5–100 volunteers</strong> — PTOs,
          animal rescues, food banks, youth sports leagues, church ministries, community service
          groups. If you've been wrestling with spreadsheets or paying $500/month for software
          built for the Red Cross, you're exactly who we built this for.
        </p>
        <p className="text-gray-700 leading-relaxed mt-4">
          If you have 500+ volunteers, need Salesforce integration, or require HIPAA compliance,
          an enterprise tool like VolunteerHub or Bloomerang may be a better fit. We'd rather tell
          you that up-front than sell you something you'll outgrow.
        </p>
      </section>

      {/* Bottom CTA */}
      <section className="bg-gray-50 border-t border-gray-200">
        <div className="max-w-3xl mx-auto px-6 py-14 text-center">
          <h2 className="text-3xl font-bold text-gray-900">Ready to get organized?</h2>
          <p className="mt-3 text-gray-600">Free forever for up to 10 volunteers. No credit card required.</p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <Link href="/signup" className="bg-blue-600 text-white font-semibold px-6 py-3 rounded-md hover:bg-blue-700">
              Start free
            </Link>
            <Link href="/pricing" className="text-blue-700 font-medium px-6 py-3 hover:underline">
              View plans
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
