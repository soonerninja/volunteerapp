import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import {
  getOrgAdmins,
  sendEmailToAll,
  eventSavedHtml,
} from "@/lib/notifications/email";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  // 1. Auth check
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Parse body
  const body = await req.json().catch(() => null);
  const eventId: string = body?.eventId ?? "";
  const action: "created" | "updated" = body?.action === "created" ? "created" : "updated";

  if (!eventId) {
    return NextResponse.json({ error: "Missing eventId" }, { status: 400 });
  }

  // 3. Fetch caller's org
  const { data: callerProfile } = await supabase
    .from("profiles")
    .select("org_id")
    .eq("id", user.id)
    .single();

  if (!callerProfile?.org_id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // 4. Fetch event via service role
  const service = createServiceClient();
  const { data: event, error: eventError } = await service
    .from("events")
    .select("id, org_id, title, start_date, location")
    .eq("id", eventId)
    .single();

  if (eventError || !event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  // 5. Verify org ownership
  if (event.org_id !== callerProfile.org_id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // 6. Fetch org name + admins
  const [{ data: org }, admins] = await Promise.all([
    service.from("organizations").select("name").eq("id", event.org_id).single(),
    getOrgAdmins(service, event.org_id),
  ]);

  if (!admins.length) {
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

  const subject =
    action === "created"
      ? `Event created: ${event.title}`
      : `Event updated: ${event.title}`;

  const html = eventSavedHtml({
    action,
    eventTitle: event.title,
    eventDate,
    eventLocation: event.location ?? null,
    orgName: org?.name ?? "Your organization",
  });

  const sent = await sendEmailToAll(admins, subject, html);
  return NextResponse.json({ sent });
}
