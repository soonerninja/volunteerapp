import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email/send";
import { teamInviteEmail } from "@/lib/email/templates";

/**
 * Fires the team-invite email. Called by the settings page right after the
 * team_invites row is inserted. We re-validate in the server route using
 * the authed cookie client so we don't trust the caller's claims about
 * org/role/inviter.
 */
export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.toLowerCase().trim() : "";
  if (!email) return NextResponse.json({ error: "email required" }, { status: 400 });

  // Look up the invite row the client just created. RLS ensures we only
  // see invites in our own org.
  const { data: invite, error: inviteErr } = await supabase
    .from("team_invites")
    .select("id, email, role, org_id, status")
    .eq("email", email)
    .eq("status", "pending")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (inviteErr || !invite) {
    return NextResponse.json({ error: inviteErr?.message ?? "invite not found" }, { status: 404 });
  }

  const [{ data: org }, { data: inviter }] = await Promise.all([
    supabase.from("organizations").select("name").eq("id", invite.org_id).maybeSingle(),
    supabase.from("profiles").select("full_name, email").eq("id", user.id).maybeSingle(),
  ]);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://goodtally.app";
  const acceptUrl = `${siteUrl}/signup?invite=${encodeURIComponent(email)}`;
  const inviterName = inviter?.full_name || inviter?.email || "A GoodTally admin";

  const { subject, html } = teamInviteEmail({
    inviterName,
    orgName: org?.name ?? "your organization",
    role: invite.role,
    acceptUrl,
  });

  const result = await sendEmail({
    to: email,
    subject,
    html,
    category: "team_invite",
  });

  if (!result.ok && !result.skipped) {
    return NextResponse.json({ error: result.error ?? "send failed" }, { status: 500 });
  }
  return NextResponse.json({ ok: true, skipped: result.skipped ?? false });
}
