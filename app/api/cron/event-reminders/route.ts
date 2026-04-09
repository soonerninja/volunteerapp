import { NextResponse } from "next/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { verifyCronAuth } from "@/lib/cron-auth";
import { sendEmail } from "@/lib/email/send";
import { eventReminderEmail } from "@/lib/email/templates";

export const dynamic = "force-dynamic";

/**
 * Daily cron: emails the org's primary admin for every upcoming event
 * that starts in the next 24 hours. On Vercel Hobby we're limited to
 * one run per day, so we sweep a full 24-hour window (now+12h → now+36h)
 * centered on ~24h out. Each event matches exactly one daily run, so
 * admins get a single reminder ~24 hours before the event.
 *
 * Schedule: daily at 13:00 UTC (8 AM CT).
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

  const now = Date.now();
  const windowStart = new Date(now + 12 * 3600 * 1000).toISOString();
  const windowEnd = new Date(now + 36 * 3600 * 1000).toISOString();

  const { data: events, error } = await svc
    .from("events")
    .select("id, org_id, title, start_date, location, status")
    .in("status", ["upcoming", "active"])
    .gte("start_date", windowStart)
    .lte("start_date", windowEnd);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  let sent = 0;
  const skipped: string[] = [];
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://goodtally.app";

  for (const ev of events ?? []) {
    // Find primary admin for this org.
    const { data: admin } = await svc
      .from("profiles")
      .select("id, email, full_name")
      .eq("org_id", ev.org_id)
      .in("role", ["owner", "admin"])
      .order("role", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (!admin?.email) {
      skipped.push(ev.id);
      continue;
    }

    // Honor unsubscribes for this category.
    const { data: unsub } = await svc
      .from("email_unsubscribes")
      .select("id")
      .eq("user_id", admin.id)
      .eq("category", "event_reminder")
      .maybeSingle();
    if (unsub) {
      skipped.push(ev.id);
      continue;
    }

    // Signup count
    const { count: signupCount } = await svc
      .from("event_volunteers")
      .select("id", { count: "exact", head: true })
      .eq("event_id", ev.id);

    const { subject, html } = eventReminderEmail({
      adminName: admin.full_name || admin.email.split("@")[0],
      eventTitle: ev.title,
      startDate: new Date(ev.start_date).toLocaleString("en-US", { dateStyle: "full", timeStyle: "short" }),
      location: ev.location,
      signupCount: signupCount ?? 0,
      appUrl: siteUrl,
    });

    const res = await sendEmail({
      to: admin.email,
      subject,
      html,
      category: "event_reminder",
      userId: admin.id,
    });
    if (res.ok || res.skipped) sent++;
  }

  return NextResponse.json({ ok: true, considered: events?.length ?? 0, sent, skipped: skipped.length });
}
