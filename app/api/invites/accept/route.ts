import { NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

/**
 * Creates an account from a team invite and auto-joins the org.
 *
 * Flow:
 *  1. Verify there is a pending invite for the supplied email.
 *  2. Create the auth user via the admin API with email_confirm = true
 *     (clicking the invite link is sufficient proof of ownership — we
 *     don't require a second verification email).
 *  3. Update the profile row (created by the handle_new_user trigger)
 *     with the invite's org_id + role.
 *  4. Mark the invite as accepted.
 *
 * The client then signs in with the fresh credentials and lands on /dashboard.
 *
 * Body: { email: string, password: string, fullName: string }
 */
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.toLowerCase().trim() : "";
  const password = typeof body?.password === "string" ? body.password : "";
  const fullName = typeof body?.fullName === "string" ? body.fullName.trim() : "";

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
  }
  if (fullName.length < 2) {
    return NextResponse.json({ error: "Please enter your full name" }, { status: 400 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    return NextResponse.json({ error: "Server not configured" }, { status: 500 });
  }
  const svc = createSupabaseClient(url, serviceKey, { auth: { persistSession: false } });

  // 1. Find a pending invite for this email.
  const { data: invite, error: inviteErr } = await svc
    .from("team_invites")
    .select("id, org_id, role")
    .eq("status", "pending")
    .ilike("email", email)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (inviteErr) {
    return NextResponse.json({ error: inviteErr.message }, { status: 500 });
  }
  if (!invite) {
    return NextResponse.json(
      { error: "No pending invite found for this email. Ask your admin to resend it." },
      { status: 404 }
    );
  }

  // 2. Create the auth user with email already confirmed.
  const { data: created, error: createErr } = await svc.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });

  if (createErr || !created?.user) {
    const msg = createErr?.message ?? "Failed to create account";
    // If the user already exists, surface a friendlier error.
    if (msg.toLowerCase().includes("already") || msg.toLowerCase().includes("registered")) {
      return NextResponse.json(
        { error: "An account with this email already exists. Please sign in instead." },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  const userId = created.user.id;

  // 3. Update the profile (auto-created by the handle_new_user trigger) with
  //    the invite's org_id + role. If the trigger hasn't populated the row
  //    yet (race), upsert it ourselves.
  const { error: updateErr } = await svc
    .from("profiles")
    .update({
      org_id: invite.org_id,
      role: invite.role,
      full_name: fullName,
      email,
    })
    .eq("id", userId);

  if (updateErr) {
    // Best-effort fallback: upsert.
    await svc.from("profiles").upsert({
      id: userId,
      org_id: invite.org_id,
      role: invite.role,
      full_name: fullName,
      email,
    });
  }

  // 4. Mark the invite as accepted.
  await svc
    .from("team_invites")
    .update({ status: "accepted" })
    .eq("id", invite.id);

  return NextResponse.json({ ok: true });
}
