import { NextResponse } from "next/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { isSuperAdmin } from "@/lib/super-admin";
import { sendEmail } from "@/lib/email/send";
import { featureStatusEmail } from "@/lib/email/templates";

/**
 * POST /api/feedback/status
 * Body: { id: string, status: "under_review" | "planned" | "in_progress" | "shipped" | "declined", pinned?: boolean }
 * Super-admin only. Writes via the service role (bypasses RLS for
 * feature_requests which has no user-facing UPDATE policy) and emails
 * voters when the status moves to planned or shipped.
 */
const VALID_STATUSES = ["under_review", "planned", "in_progress", "shipped", "declined"] as const;
type Status = typeof VALID_STATUSES[number];

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !isSuperAdmin(user.id)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const id = body?.id;
  const status = body?.status as Status | undefined;
  const pinned = typeof body?.pinned === "boolean" ? body.pinned : undefined;

  if (typeof id !== "string" || (status && !VALID_STATUSES.includes(status))) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return NextResponse.json({ error: "not configured" }, { status: 500 });
  const svc = createServiceClient(url, serviceKey, { auth: { persistSession: false } });

  const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (status) update.status = status;
  if (pinned !== undefined) update.pinned = pinned;

  const { data: updated, error } = await svc
    .from("feature_requests")
    .update(update)
    .eq("id", id)
    .select("id, title, status")
    .maybeSingle();

  if (error || !updated) return NextResponse.json({ error: error?.message ?? "not found" }, { status: 500 });

  // Notify voters when the status moves to planned or shipped.
  if (status === "planned" || status === "shipped") {
    const { data: voters } = await svc
      .from("feature_request_votes")
      .select("user_id")
      .eq("request_id", id);
    const userIds = (voters ?? []).map((v) => v.user_id);
    if (userIds.length) {
      const { data: users } = await svc.auth.admin.listUsers({ page: 1, perPage: 1000 });
      const emailById = new Map<string, string>();
      for (const u of users?.users ?? []) {
        if (u.email) emailById.set(u.id, u.email);
      }
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://goodtally.app";
      const { subject, html } = featureStatusEmail({ title: updated.title, status, appUrl: siteUrl });
      // Check unsubscribes in one query.
      const { data: unsubs } = await svc
        .from("email_unsubscribes")
        .select("user_id")
        .in("user_id", userIds)
        .eq("category", "feature_status");
      const unsubSet = new Set((unsubs ?? []).map((u) => u.user_id));
      for (const uid of userIds) {
        if (unsubSet.has(uid)) continue;
        const email = emailById.get(uid);
        if (!email) continue;
        await sendEmail({ to: email, subject, html, category: "feature_status", userId: uid });
      }
    }
  }

  return NextResponse.json({ ok: true, request: updated });
}
