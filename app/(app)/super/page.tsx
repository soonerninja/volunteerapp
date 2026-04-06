import { createClient as createServiceClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSuperAdmin } from "@/lib/super-admin";
import { PLAN_LIMITS } from "@/lib/plan-limits";
import { Card } from "@/components/ui/card";
import { TierControl } from "./tier-control";
import type { OrganizationTier } from "@/types/database";

export const metadata = {
  title: "Super Admin — GoodTally",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

interface OrgRow {
  id: string;
  name: string;
  tier: OrganizationTier;
  created_at: string;
  contact_email: string | null;
  volunteer_count: number;
  event_count: number;
  hours_total: number;
  admin_email: string | null;
  last_sign_in_at: string | null;
}

export default async function SuperAdminPage() {
  // Gate #1: logged in
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Gate #2: on the super-admin allowlist
  if (!isSuperAdmin(user.id)) {
    // Don't leak the route's existence — 404.
    const { notFound } = await import("next/navigation");
    notFound();
  }

  // Use service-role client to read across all orgs, bypassing RLS.
  const serviceUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceUrl || !serviceKey) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900">Super Admin</h1>
          <span className="rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-rose-700">
            Super Admin
          </span>
        </div>
        <Card>
          <p className="text-rose-600">SUPABASE_SERVICE_ROLE_KEY not configured.</p>
        </Card>
      </div>
    );
  }
  const svc = createServiceClient(serviceUrl, serviceKey, { auth: { persistSession: false } });

  const [
    { data: orgs = [] },
    { data: volunteers = [] },
    { data: events = [] },
    { data: eventVols = [] },
    { data: profiles = [] },
  ] = await Promise.all([
    svc.from("organizations").select("id, name, tier, created_at, contact_email"),
    svc.from("volunteers").select("id, org_id"),
    svc.from("events").select("id, org_id"),
    svc.from("event_volunteers").select("hours_logged, event_id"),
    svc.from("profiles").select("id, org_id, email, role"),
  ]);

  // Map events -> org_id for hours aggregation
  const eventOrg = new Map<string, string>();
  for (const e of events ?? []) eventOrg.set(e.id, e.org_id);

  const volCount = new Map<string, number>();
  for (const v of volunteers ?? []) volCount.set(v.org_id, (volCount.get(v.org_id) || 0) + 1);

  const evCount = new Map<string, number>();
  for (const e of events ?? []) evCount.set(e.org_id, (evCount.get(e.org_id) || 0) + 1);

  const hoursByOrg = new Map<string, number>();
  for (const ev of eventVols ?? []) {
    const orgId = eventOrg.get(ev.event_id);
    if (orgId) hoursByOrg.set(orgId, (hoursByOrg.get(orgId) || 0) + (ev.hours_logged || 0));
  }

  // Primary admin per org: first profile with role=owner, else role=admin.
  const ownerByOrg = new Map<string, { id: string; email: string }>();
  for (const p of profiles ?? []) {
    if (!p.org_id) continue;
    if (p.role === "owner" && !ownerByOrg.has(p.org_id)) ownerByOrg.set(p.org_id, { id: p.id, email: p.email });
  }
  for (const p of profiles ?? []) {
    if (!p.org_id) continue;
    if (!ownerByOrg.has(p.org_id) && (p.role === "admin" || p.role === "owner")) {
      ownerByOrg.set(p.org_id, { id: p.id, email: p.email });
    }
  }

  // Pull last_sign_in_at from auth.users for the known admin user IDs.
  const adminIds = [...ownerByOrg.values()].map((o) => o.id);
  const lastSignIn = new Map<string, string | null>();
  if (adminIds.length) {
    // listUsers pages by 1000; enough for launch-scale.
    const { data: userList } = await svc.auth.admin.listUsers({ page: 1, perPage: 1000 });
    for (const u of userList?.users ?? []) {
      lastSignIn.set(u.id, u.last_sign_in_at ?? null);
    }
  }

  const rows: OrgRow[] = (orgs ?? []).map((o) => {
    const owner = ownerByOrg.get(o.id);
    return {
      id: o.id,
      name: o.name,
      tier: o.tier,
      created_at: o.created_at,
      contact_email: o.contact_email,
      volunteer_count: volCount.get(o.id) || 0,
      event_count: evCount.get(o.id) || 0,
      hours_total: Math.round(hoursByOrg.get(o.id) || 0),
      admin_email: owner?.email || null,
      last_sign_in_at: owner ? lastSignIn.get(owner.id) || null : null,
    };
  });
  rows.sort((a, b) => b.created_at.localeCompare(a.created_at));

  const now = Date.now();
  const DAY = 86400000;
  const totals = {
    all: rows.length,
    free: rows.filter((r) => r.tier === "free").length,
    starter: rows.filter((r) => r.tier === "starter").length,
    growth: rows.filter((r) => r.tier === "growth").length,
    new7d: rows.filter((r) => now - new Date(r.created_at).getTime() < 7 * DAY).length,
    new30d: rows.filter((r) => now - new Date(r.created_at).getTime() < 30 * DAY).length,
    active30d: rows.filter((r) => r.last_sign_in_at && now - new Date(r.last_sign_in_at).getTime() < 30 * DAY).length,
    paid: rows.filter((r) => r.tier !== "free").length,
  };

  const conversionRate = totals.all > 0 ? ((totals.paid / totals.all) * 100).toFixed(1) : "0.0";

  const stats: Array<{ label: string; value: string | number }> = [
    { label: "Total orgs", value: totals.all },
    { label: "Paid orgs", value: `${totals.paid} (${conversionRate}%)` },
    { label: "New (7d)", value: totals.new7d },
    { label: "New (30d)", value: totals.new30d },
    { label: "Active (30d)", value: totals.active30d },
    { label: "Free", value: totals.free },
    { label: "Starter", value: totals.starter },
    { label: "Growth", value: totals.growth },
  ];

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900">Super Admin</h1>
          <span className="rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-rose-700">
            Super Admin
          </span>
        </div>
        <p className="mt-1 text-sm text-gray-500">Internal view — not visible to customers.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label} padding="sm">
            <div className="text-xs uppercase tracking-wide text-gray-500">{s.label}</div>
            <div className="mt-1 text-2xl font-bold text-gray-900">{s.value}</div>
          </Card>
        ))}
      </div>

      <Card className="overflow-x-auto p-0">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-600">
            <tr>
              <Th>Organization</Th>
              <Th>Admin</Th>
              <Th>Plan</Th>
              <Th>Created</Th>
              <Th>Last login</Th>
              <Th className="text-right">Vols</Th>
              <Th className="text-right">Events</Th>
              <Th className="text-right">Hours</Th>
              <Th>Usage</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map((r) => {
              const limits = PLAN_LIMITS[r.tier];
              const cap = limits.maxVolunteers === Infinity ? 1000 : limits.maxVolunteers;
              const rawPct = (r.volunteer_count / cap) * 100;
              const usagePct = Math.min(100, Math.round(rawPct));
              const overLimit = limits.maxVolunteers !== Infinity && r.volunteer_count > limits.maxVolunteers;
              const barColor = overLimit
                ? "bg-rose-500"
                : usagePct >= 80
                ? "bg-amber-500"
                : "bg-blue-500";
              const lastLogin = r.last_sign_in_at ? new Date(r.last_sign_in_at) : null;
              const staleLogin = !lastLogin || now - lastLogin.getTime() > 30 * DAY;
              return (
                <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                  <Td>
                    <div className="font-medium text-gray-900">{r.name}</div>
                    <div className="text-xs text-gray-500">{r.id.slice(0, 8)}</div>
                  </Td>
                  <Td>{r.admin_email ?? r.contact_email ?? <span className="text-gray-400">—</span>}</Td>
                  <Td>
                    <div className="flex items-center gap-2">
                      <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${tierBadge(r.tier)}`}>
                        {r.tier}
                      </span>
                      <TierControl orgId={r.id} currentTier={r.tier} />
                    </div>
                  </Td>
                  <Td className="text-gray-600">{formatDate(r.created_at)}</Td>
                  <Td className={staleLogin ? "text-rose-600" : "text-gray-600"}>
                    {lastLogin ? formatDate(lastLogin.toISOString()) : "never"}
                  </Td>
                  <Td className="text-right">{r.volunteer_count}</Td>
                  <Td className="text-right">{r.event_count}</Td>
                  <Td className="text-right">{r.hours_total}</Td>
                  <Td>
                    <div className="w-28 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${barColor}`}
                        style={{ width: `${usagePct}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {r.volunteer_count}/{limits.maxVolunteers === Infinity ? "∞" : limits.maxVolunteers} vols
                    </div>
                  </Td>
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr>
                <td colSpan={9} className="text-center text-gray-500 py-10">No organizations yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

function Th({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <th className={`px-4 py-3 text-left ${className}`}>{children}</th>;
}

function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-3 ${className}`}>{children}</td>;
}

function tierBadge(tier: OrganizationTier): string {
  if (tier === "growth") return "bg-purple-100 text-purple-700";
  if (tier === "starter") return "bg-blue-100 text-blue-700";
  return "bg-gray-100 text-gray-700";
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}
