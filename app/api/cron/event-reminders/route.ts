import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import {
  getOrgAdmins,
  sendEmailToAll,
  eventReminderHtml,
} from "@/lib/notifications/email";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  // Verify cron secret
  const auth = req.headers.get("authorization") ?? "";
  const secret = process.env.CRON_SECRET ?? "";
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const service = createServiceClient();

  // Build tomorrow's UTC date window
  const now = new Date();
  const tomorrowStart = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0)
  );
  const dayAfterStart = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 2, 0, 0, 0)
  );

  // Fetch all upcoming events starting tomorrow
  const { data: events, error: eventsError } = await service
    .from("events")
    .select("id, org_id, title, start_date, location")
    .eq("status", "upcoming")
    .gte("start_date", tomorrowStart.toISOString())
    .lt("start_date", dayAfterStart.toISOString());

  if (eventsError) {
    console.error("[event-reminders] Failed to fetch events:", eventsError.message);
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
  }

  if (!events || events.length === 0) {
    return NextResponse.json({ orgsNotified: 0, emailsSent: 0 });
  }

  // Group events by org_id
  const byOrg = new Map<string, typeof events>();
  for (const event of events) {
    const list = byOrg.get(event.org_id) ?? [];
    list.push(event);
    byOrg.set(event.org_id, list);
  }

  let orgsNotified = 0;
  let emailsSent = 0;

  for (const [orgId, orgEvents] of byOrg) {
    const [{ data: org }, admins] = await Promise.all([
      service.from("organizations").select("name").eq("id", orgId).single(),
      getOrgAdmins(service, orgId),
    ]);

    if (!admins.length) continue;

    const formattedEvents = orgEvents.map((e) => ({
      title: e.title,
      start_date: new Date(e.start_date).toLocaleString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        timeZoneName: "short",
      }),
      location: e.location ?? null,
    }));

    const orgName = org?.name ?? "Your organization";
    const count = orgEvents.length;
    const subject = `Reminder: ${count} event${count !== 1 ? "s" : ""} tomorrow — ${orgName}`;

    const html = eventReminderHtml({ events: formattedEvents, orgName });
    const sent = await sendEmailToAll(admins, subject, html);

    emailsSent += sent;
    orgsNotified++;
  }

  return NextResponse.json({ orgsNotified, emailsSent });
}
