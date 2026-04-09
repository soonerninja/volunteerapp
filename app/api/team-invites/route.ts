import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { sendEmail, teamInviteHtml } from "@/lib/notifications/email";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  // 1. Auth check
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Verify caller is owner or admin
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("org_id, role, full_name")
    .eq("id", user.id)
    .single();

  if (profileError || !profile?.org_id) {
    return NextResponse.json({ error: "Profile not found" }, { status: 403 });
  }

  if (!["owner", "admin"].includes(profile.role)) {
    return NextResponse.json(
      { error: "Only owners and admins can invite team members." },
      { status: 403 }
    );
  }

  // 3. Parse body
  const body = await req.json().catch(() => null);
  const email: string = body?.email?.trim().toLowerCase() ?? "";
  const role: string = body?.role ?? "editor";

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
  }

  const validRoles = ["admin", "editor", "viewer"];
  if (!validRoles.includes(role)) {
    return NextResponse.json({ error: "Invalid role." }, { status: 400 });
  }

  // 4. Insert via service role (bypasses FK auth.users constraint)
  const service = createServiceClient();

  const { error: insertError } = await service.from("team_invites").insert({
    org_id: profile.org_id,
    email,
    role,
    invited_by: user.id,
  });

  if (insertError) {
    const isDuplicate =
      insertError.message.includes("duplicate") ||
      insertError.code === "23505";
    return NextResponse.json(
      { error: isDuplicate ? "This email has already been invited." : insertError.message },
      { status: isDuplicate ? 409 : 500 }
    );
  }

  // 5. Write audit log
  await service.from("audit_log").insert({
    org_id: profile.org_id,
    user_id: user.id,
    action: "team.invited",
    entity_type: "team_invite",
    entity_id: null,
    metadata: { email, role },
  });

  // 6. Fetch org name for the email
  const { data: org } = await service
    .from("organizations")
    .select("name")
    .eq("id", profile.org_id)
    .single();

  const orgName = org?.name ?? "your organization";
  const inviteUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/onboarding`;

  // 7. Send invite email (fire-and-forget)
  sendEmail({
    to: email,
    subject: `You've been invited to join ${orgName} on GoodTally`,
    html: teamInviteHtml({ orgName, role, inviteUrl }),
  });

  return NextResponse.json({ success: true });
}
