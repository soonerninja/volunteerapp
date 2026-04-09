import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import {
  getOrgAdmins,
  sendEmailToAll,
  volunteerAssignedHtml,
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
  const volunteerId: string = body?.volunteerId ?? "";

  if (!eventId || !volunteerId) {
    return NextResponse.json({ error: "Missing eventId or volunteerId" }, { status: 400 });
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

  // 4. Fetch event and volunteer in parallel via service role
  const service = createServiceClient();
  const [{ data: event, error: eventError }, { data: volunteer, error: volunteerError }] =
    await Promise.all([
      service.from("events").select("id, org_id, title, start_date").eq("id", eventId).single(),
      service.from("volunteers").select("first_name, last_name").eq("id", volunteerId).single(),
    ]);

  if (eventError || !event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }
  if (volunteerError || !volunteer) {
    return NextResponse.json({ error: "Volunteer not found" }, { status: 404 });
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

  const volunteerName = `${volunteer.first_name} ${volunteer.last_name}`;
  const eventDate = new Date(event.start_date).toLocaleString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  });

  const html = volunteerAssignedHtml({
    volunteerName,
    eventTitle: event.title,
    eventDate,
    orgName: org?.name ?? "Your organization",
  });

  const sent = await sendEmailToAll(
    admins,
    `${volunteerName} added to ${event.title}`,
    html
  );
  return NextResponse.json({ sent });
}
