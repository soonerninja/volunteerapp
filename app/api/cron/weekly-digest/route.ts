import { NextResponse } from "next/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { verifyCronAuth } from "@/lib/cron-auth";
import { sendEmail } from "@/lib/email/send";
import { weeklyDigestEmail } from "@/lib/email/templates";

export const dynamic = "force-dynamic";

/**
 * Weekly digest. Intended to run Monday 7:00 AM Central — configure the
 * cron in UTC at 12:00 UTC (CST) / 13:00 UTC (CDT). v1 sends a single
 * batch; per-org timezones will come later.
 *
 * For each org, sends one email to every owner/admin with a summary of
 * the last 7 days.
 */
export async function GET(req: Request) {
  if (!verifyCronAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    return NextResponse.json({ error: "service role not configured" }, { status: 500 });
  }
  const svc = createServiceClient(url, serviceKey, { auth: { persistSession: false } });

  const since = new Date(Date.now() - 7 * 86400 * 1000).toISOString();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://goodtally.app";

  const { data: orgs } = await svc.from("organizations").select("id, name");
  if (!orgs) return NextResponse.json({ ok: true, sent: 0 });

  let sent = 0;

  for (const org of orgs) {
    const [
      { count: volunteersAdded = 0 },
      { data: eventsRows = [] },
      { data: eventsCreatedRows = [] },
      { data: hoursRows = [] },
    ] = await Promise.all([
      svc
        .from("volunteers")
        .select("id", { count: "exact", head: true })
        .eq("org_id", org.id)
        .gte("created_at", since),
      svc
        .from("events")
        .select("id, status, updated_at")
        .eq("org_id", org.id)
        .eq("status", "completed")
        .gte("updated_at", since),
      svc
        .from("events")
        .select("id, created_at")
        .eq("org_id", org.id)
        .gte("created_at", since),
      svc
        .from("event_volunteers")
        .select("hours_logged, event_id, events!inner(org_id)")
        .eq("events.org_id", org.id)
        .gte("created_at", since),
    ]);

    const hoursLogged = Math.round(
      (hoursRows as { hours_logged: number | null }[] | null ?? []).reduce((sum, r) => sum + (r.hours_logged || 0), 0)
    );

    const eventsCompleted = eventsRows?.length ?? 0;
    const eventsCreated = eventsCreatedRows?.length ?? 0;

    // Only send if there was ANY activity (quiet weeks don't get an email).
    if ((volunteersAdded ?? 0) + hoursLogged + eventsCreated + eventsCompleted === 0) continue;

    const { data: admins } = await svc
      .from("profiles")
      .select("id, email")
      .eq("org_id", org.id)
      .in("role", ["owner", "admin"]);

    for (const admin of admins ?? []) {
      if (!admin.email) continue;
      const { data: unsub } = await svc
        .from("email_unsubscribes")
        .select("id")
        .eq("user_id", admin.id)
        .eq("category", "weekly_digest")
        .maybeSingle();
      if (unsub) continue;

      const { subject, html } = weeklyDigestEmail({
        orgName: org.name,
        volunteersAdded: volunteersAdded ?? 0,
        hoursLogged,
        eventsCreated,
        eventsCompleted,
        appUrl: siteUrl,
      });
      const res = await sendEmail({ to: admin.email, subject, html, category: "weekly_digest", userId: admin.id });
      if (res.ok || res.skipped) sent++;
    }
  }

  return NextResponse.json({ ok: true, orgs: orgs.length, sent });
}
