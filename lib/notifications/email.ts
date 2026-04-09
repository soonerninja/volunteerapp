import { Resend } from "resend";
import { SupabaseClient } from "@supabase/supabase-js";

// ─── Resend client ────────────────────────────────────────────────────────────

let _resend: Resend | null = null;
function getResend(): Resend {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY);
  return _resend;
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AdminProfile {
  email: string;
  full_name: string | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Fetch all owner/admin profiles for an org (using service-role client). */
export async function getOrgAdmins(
  supabase: SupabaseClient,
  orgId: string
): Promise<AdminProfile[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select("email, full_name")
    .eq("org_id", orgId)
    .in("role", ["owner", "admin"]);

  if (error) {
    console.error("[getOrgAdmins] Failed to fetch admins:", error.message);
    return [];
  }
  return data ?? [];
}

/** Send a single email. Logs errors without throwing (safe for fire-and-forget). */
export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  const from = process.env.RESEND_FROM_EMAIL ?? "noreply@goodtally.app";
  try {
    const { error } = await getResend().emails.send({ from, to, subject, html });
    if (error) console.error("[sendEmail] Resend error:", error);
  } catch (err) {
    console.error("[sendEmail] Unexpected error:", err);
  }
}

/** Send the same email to multiple recipients. Uses Promise.allSettled. */
export async function sendEmailToAll(
  recipients: AdminProfile[],
  subject: string,
  html: string
): Promise<number> {
  const results = await Promise.allSettled(
    recipients.map((r) => sendEmail({ to: r.email, subject, html }))
  );
  return results.filter((r) => r.status === "fulfilled").length;
}

// ─── Email templates ──────────────────────────────────────────────────────────

function baseHtml(title: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.08);">
        <tr>
          <td style="background:#2563eb;padding:24px 32px;">
            <span style="color:#fff;font-size:20px;font-weight:700;letter-spacing:-0.3px;">GoodTally</span>
          </td>
        </tr>
        <tr><td style="padding:32px;">${body}</td></tr>
        <tr>
          <td style="padding:16px 32px;background:#f9fafb;border-top:1px solid #e5e7eb;">
            <p style="margin:0;font-size:12px;color:#6b7280;">You're receiving this because you're an admin of your GoodTally organization.</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export function eventSavedHtml({
  action,
  eventTitle,
  eventDate,
  eventLocation,
  orgName,
}: {
  action: "created" | "updated";
  eventTitle: string;
  eventDate: string;
  eventLocation: string | null;
  orgName: string;
}): string {
  const verb = action === "created" ? "created" : "updated";
  const heading = action === "created" ? "New event created" : "Event updated";
  const body = `
    <h2 style="margin:0 0 8px;font-size:20px;font-weight:700;color:#111827;">${heading}</h2>
    <p style="margin:0 0 24px;color:#6b7280;font-size:14px;">${orgName}</p>
    <table cellpadding="0" cellspacing="0" style="width:100%;border:1px solid #e5e7eb;border-radius:6px;overflow:hidden;">
      <tr><td style="padding:12px 16px;background:#f9fafb;font-size:13px;font-weight:600;color:#374151;border-bottom:1px solid #e5e7eb;">Event</td><td style="padding:12px 16px;font-size:14px;color:#111827;border-bottom:1px solid #e5e7eb;">${eventTitle}</td></tr>
      <tr><td style="padding:12px 16px;background:#f9fafb;font-size:13px;font-weight:600;color:#374151;border-bottom:1px solid #e5e7eb;">Date</td><td style="padding:12px 16px;font-size:14px;color:#111827;border-bottom:1px solid #e5e7eb;">${eventDate}</td></tr>
      <tr><td style="padding:12px 16px;background:#f9fafb;font-size:13px;font-weight:600;color:#374151;">Location</td><td style="padding:12px 16px;font-size:14px;color:#111827;">${eventLocation ?? "Not specified"}</td></tr>
    </table>
    <p style="margin:24px 0 0;font-size:14px;color:#6b7280;">This event was ${verb} in your GoodTally organization.</p>`;
  return baseHtml(heading, body);
}

export function volunteerAssignedHtml({
  volunteerName,
  eventTitle,
  eventDate,
  orgName,
}: {
  volunteerName: string;
  eventTitle: string;
  eventDate: string;
  orgName: string;
}): string {
  const heading = "Volunteer added to event";
  const body = `
    <h2 style="margin:0 0 8px;font-size:20px;font-weight:700;color:#111827;">${heading}</h2>
    <p style="margin:0 0 24px;color:#6b7280;font-size:14px;">${orgName}</p>
    <table cellpadding="0" cellspacing="0" style="width:100%;border:1px solid #e5e7eb;border-radius:6px;overflow:hidden;">
      <tr><td style="padding:12px 16px;background:#f9fafb;font-size:13px;font-weight:600;color:#374151;border-bottom:1px solid #e5e7eb;">Volunteer</td><td style="padding:12px 16px;font-size:14px;color:#111827;border-bottom:1px solid #e5e7eb;">${volunteerName}</td></tr>
      <tr><td style="padding:12px 16px;background:#f9fafb;font-size:13px;font-weight:600;color:#374151;border-bottom:1px solid #e5e7eb;">Event</td><td style="padding:12px 16px;font-size:14px;color:#111827;border-bottom:1px solid #e5e7eb;">${eventTitle}</td></tr>
      <tr><td style="padding:12px 16px;background:#f9fafb;font-size:13px;font-weight:600;color:#374151;">Date</td><td style="padding:12px 16px;font-size:14px;color:#111827;">${eventDate}</td></tr>
    </table>`;
  return baseHtml(heading, body);
}

export function teamInviteHtml({
  orgName,
  role,
  inviteUrl,
}: {
  orgName: string;
  role: string;
  inviteUrl: string;
}): string {
  const heading = `You've been invited to join ${orgName}`;
  const body = `
    <h2 style="margin:0 0 8px;font-size:20px;font-weight:700;color:#111827;">You're invited!</h2>
    <p style="margin:0 0 24px;font-size:15px;color:#374151;">You've been invited to join <strong>${orgName}</strong> on GoodTally as a <strong>${role}</strong>.</p>
    <a href="${inviteUrl}" style="display:inline-block;background:#2563eb;color:#fff;text-decoration:none;padding:12px 24px;border-radius:6px;font-size:15px;font-weight:600;">Accept Invitation</a>
    <p style="margin:24px 0 0;font-size:13px;color:#6b7280;">If you don't have a GoodTally account yet, you'll be prompted to create one with this email address.</p>`;
  return baseHtml(heading, body);
}

export function eventReminderHtml({
  events,
  orgName,
}: {
  events: Array<{ title: string; start_date: string; location: string | null }>;
  orgName: string;
}): string {
  const heading = "You have events tomorrow";
  const rows = events
    .map(
      (e) => `
    <tr>
      <td style="padding:12px 16px;font-size:14px;font-weight:600;color:#111827;border-bottom:1px solid #e5e7eb;">${e.title}</td>
      <td style="padding:12px 16px;font-size:14px;color:#374151;border-bottom:1px solid #e5e7eb;">${e.start_date}</td>
      <td style="padding:12px 16px;font-size:14px;color:#6b7280;border-bottom:1px solid #e5e7eb;">${e.location ?? "—"}</td>
    </tr>`
    )
    .join("");
  const body = `
    <h2 style="margin:0 0 8px;font-size:20px;font-weight:700;color:#111827;">${heading}</h2>
    <p style="margin:0 0 24px;color:#6b7280;font-size:14px;">${orgName} · ${events.length} event${events.length !== 1 ? "s" : ""} scheduled for tomorrow</p>
    <table cellpadding="0" cellspacing="0" style="width:100%;border:1px solid #e5e7eb;border-radius:6px;overflow:hidden;">
      <thead>
        <tr style="background:#f9fafb;">
          <th style="padding:10px 16px;text-align:left;font-size:12px;font-weight:600;color:#6b7280;border-bottom:1px solid #e5e7eb;">EVENT</th>
          <th style="padding:10px 16px;text-align:left;font-size:12px;font-weight:600;color:#6b7280;border-bottom:1px solid #e5e7eb;">TIME</th>
          <th style="padding:10px 16px;text-align:left;font-size:12px;font-weight:600;color:#6b7280;border-bottom:1px solid #e5e7eb;">LOCATION</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>`;
  return baseHtml(heading, body);
}
