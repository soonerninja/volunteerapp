import { NextRequest, NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { sendEmail } from "@/lib/email/send";
import { eventSavedEmail } from "@/lib/email/templates";

export const runtime = "nodejs";

/**
 * Notifies admins when an event is created or updated. Fire-and-forget
 * from the client, but awaited here so Resend actually receives the
 * request before the serverless function terminates.
 *
 * Body: { eventId: string, action: "created" | "updated" }
 */
export async function POST(req: NextRequest) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const eventId: string = body?.eventId ?? "";
  const action: "created" | "updated" = body?.action === "created" ? "created" : "updated";
  if (!eventId) return NextResponse.json({ error: "Missing eventId" }, { status: 400 });

  const { data: callerProfile } = await supabase
    .from("profiles")
    .select("org_id")
    .eq("id", user.id)
    .maybeSingle();
  if (!callerProfile?.org_id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!serviceKey || !supabaseUrl) {
    return NextResponse.json({ error: "Server not configured" }, { status: 500 });
  }
  const service = createSupabaseClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });

  const { data: event, error: eventErr } = await service
    .from("events")
    .select("id, org_id, title, start_date, location")
    .eq("id", eventId)
    .maybeSingle();
  if (eventErr || !event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }
  if (event.org_id !== callerProfile.org_id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const [{ data: org }, { data: admins }] = await Promise.all([
    service.from("organizations").select("name").eq("id", event.org_id).maybeSingle(),
    service
      .from("profiles")
      .select("email, full_name")
      .eq("org_id", event.org_id)
      .in("role", ["owner", "admin"]),
  ]);

  const recipients = (admins ?? []).filter((a) => !!a.email);
  if (recipients.length === 0) {
    return NextResponse.json({ sent: 0 });
  }

  const eventDate = new Date(event.start_date).toLocaleString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  });

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://goodtally.app";
  const { subject, html } = eventSavedEmail({
    action,
    eventTitle: event.title,
    eventDate,
    eventLocation: event.location ?? null,
    orgName: org?.name ?? "Your organization",
    appUrl: siteUrl,
  });

  const results = await Promise.allSettled(
    recipients.map((r) =>
      sendEmail({
        to: r.email as string,
        subject,
        html,
        category: "event_saved",
      })
    )
  );
  const sent = results.filter((r) => r.status === "fulfilled" && r.value.ok).length;
  return NextResponse.json({ sent });
}
