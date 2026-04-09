import { NextRequest, NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { sendEmail } from "@/lib/email/send";
import { volunteerAssignedEmail } from "@/lib/email/templates";

export const runtime = "nodejs";

/**
 * Notifies admins when a volunteer is added to an event.
 *
 * Body: { eventId: string, volunteerId: string }
 */
export async function POST(req: NextRequest) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const eventId: string = body?.eventId ?? "";
  const volunteerId: string = body?.volunteerId ?? "";
  if (!eventId || !volunteerId) {
    return NextResponse.json({ error: "Missing eventId or volunteerId" }, { status: 400 });
  }

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

  const [eventRes, volunteerRes] = await Promise.all([
    service.from("events").select("id, org_id, title, start_date").eq("id", eventId).maybeSingle(),
    service.from("volunteers").select("first_name, last_name").eq("id", volunteerId).maybeSingle(),
  ]);

  if (eventRes.error || !eventRes.data) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }
  if (volunteerRes.error || !volunteerRes.data) {
    return NextResponse.json({ error: "Volunteer not found" }, { status: 404 });
  }
  const event = eventRes.data;
  const volunteer = volunteerRes.data;

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

  const volunteerName = `${volunteer.first_name ?? ""} ${volunteer.last_name ?? ""}`.trim() || "A volunteer";
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
  const { subject, html } = volunteerAssignedEmail({
    volunteerName,
    eventTitle: event.title,
    eventDate,
    orgName: org?.name ?? "Your organization",
    appUrl: siteUrl,
  });

  const results = await Promise.allSettled(
    recipients.map((r) =>
      sendEmail({
        to: r.email as string,
        subject,
        html,
        category: "volunteer_assigned",
      })
    )
  );
  const sent = results.filter((r) => r.status === "fulfilled" && r.value.ok).length;
  return NextResponse.json({ sent });
}
