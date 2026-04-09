import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { sendEmail } from "@/lib/email/send";
import { teamInviteEmail } from "@/lib/email/templates";

export const runtime = "nodejs";

/**
 * Creates a team invite and emails the invitee.
 *
 * The insert goes through the service-role client so we bypass the
 * historical `auth.users` RLS bug on `team_invites` (see migration
 * 00009_fix_team_invites_rls.sql). The caller is still verified via
 * the cookie-authed client — we never trust the client's org/role claim.
 *
 * Body: { email: string, role: string }
 */
export async function POST(req: Request) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.toLowerCase().trim() : "";
  const role = typeof body?.role === "string" ? body.role : "editor";
  if (!email) return NextResponse.json({ error: "email required" }, { status: 400 });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "invalid email" }, { status: 400 });
  }
  if (!["owner", "admin", "editor", "viewer"].includes(role)) {
    return NextResponse.json({ error: "invalid role" }, { status: 400 });
  }

  // Verify the caller's org + role via RLS-bound client.
  const { data: callerProfile } = await supabase
    .from("profiles")
    .select("id, org_id, role, full_name, email")
    .eq("id", user.id)
    .maybeSingle();

  if (!callerProfile?.org_id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (callerProfile.role !== "owner" && callerProfile.role !== "admin") {
    return NextResponse.json({ error: "Only owners or admins can invite" }, { status: 403 });
  }

  // Service-role client for the insert (and org name lookup). Bypasses RLS.
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!serviceKey || !supabaseUrl) {
    return NextResponse.json({ error: "Server not configured" }, { status: 500 });
  }
  const service = createSupabaseClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });

  // Look up org name for the email body.
  const { data: org } = await service
    .from("organizations")
    .select("name")
    .eq("id", callerProfile.org_id)
    .maybeSingle();

  // Check for an existing pending invite. If one exists, we resend the
  // email using the stored role (covers the "Resend invite" button path).
  const { data: existing } = await service
    .from("team_invites")
    .select("id, role")
    .eq("org_id", callerProfile.org_id)
    .eq("email", email)
    .eq("status", "pending")
    .maybeSingle();

  let inviteId: string | null = existing?.id ?? null;
  let effectiveRole: string = existing?.role ?? role;

  if (!inviteId) {
    const { data: inserted, error: insertErr } = await service
      .from("team_invites")
      .insert({
        org_id: callerProfile.org_id,
        email,
        role,
        invited_by: callerProfile.id,
      })
      .select("id")
      .single();

    if (insertErr || !inserted) {
      const msg = insertErr?.message ?? "failed to create invite";
      if (msg.toLowerCase().includes("duplicate")) {
        return NextResponse.json({ error: "Already invited" }, { status: 409 });
      }
      return NextResponse.json({ error: msg }, { status: 500 });
    }
    inviteId = inserted.id;
    effectiveRole = role;
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://goodtally.app";
  const acceptUrl = `${siteUrl}/signup?invite=${encodeURIComponent(email)}`;
  const inviterName = callerProfile.full_name || callerProfile.email || "A GoodTally admin";

  const { subject, html } = teamInviteEmail({
    inviterName,
    orgName: org?.name ?? "your organization",
    role: effectiveRole,
    acceptUrl,
  });

  const result = await sendEmail({
    to: email,
    subject,
    html,
    category: "team_invite",
  });

  if (!result.ok && !result.skipped) {
    // Insert succeeded, email failed. Report partial success so the UI can
    // show a useful message without losing the invite row.
    return NextResponse.json(
      { ok: true, inviteId, emailError: result.error ?? "send failed" },
      { status: 207 }
    );
  }

  return NextResponse.json({ ok: true, inviteId, skipped: result.skipped ?? false });
}
