/**
 * Minimal Resend wrapper using fetch (no SDK dependency).
 * All outbound transactional email flows through this helper so we keep
 * one place for the from-address, unsubscribe footer, and error handling.
 */

const RESEND_ENDPOINT = "https://api.resend.com/emails";

export const EMAIL_FROM = "GoodTally <noreply@goodtally.app>";
export const EMAIL_REPLY_TO = "hello@goodtally.app";

export type EmailCategory =
  | "team_invite"
  | "team_invite_accepted"
  | "event_reminder"
  | "weekly_digest"
  | "feature_status"
  | "event_saved"
  | "volunteer_assigned";

export interface SendEmailArgs {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  category: EmailCategory;
  userId?: string | null;
  /**
   * Optional: the recipient's email address, used only to build a
   * one-click unsubscribe link when the recipient isn't yet a user
   * (e.g. team invite emails). Ignored if `userId` is provided.
   */
  recipientEmail?: string | null;
}

export interface SendEmailResult {
  ok: boolean;
  id?: string;
  error?: string;
  skipped?: boolean;
}

/**
 * Render the standard footer (unsubscribe link + physical-ish address
 * for CAN-SPAM). Unsubscribe is per-category so a user can drop the
 * weekly digest without losing invite or billing emails.
 */
export function renderFooter(
  category: EmailCategory,
  userId?: string | null,
  recipientEmail?: string | null
): { html: string; text: string } {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://goodtally.app";
  // Prefer userId when we have it; fall back to the raw email for
  // recipients who aren't yet GoodTally users (e.g. invitees).
  const params = new URLSearchParams();
  params.set("c", category);
  if (userId) {
    params.set("u", userId);
  } else if (recipientEmail) {
    params.set("e", recipientEmail);
  }
  const unsubUrl = `${siteUrl}/unsubscribe?${params.toString()}`;

  const html = `
    <hr style="border:none;border-top:1px solid #e5e7eb;margin:32px 0 16px;" />
    <p style="font-size:12px;color:#6b7280;line-height:1.5;margin:0;">
      You're receiving this because you use GoodTally.
      <a href="${unsubUrl}" style="color:#6b7280;text-decoration:underline;">Unsubscribe from ${category.replace(/_/g, " ")}</a>.
      <br />GoodTally &middot; volunteer management for small nonprofits
    </p>
  `.trim();

  const text = `\n\n---\nYou're receiving this because you use GoodTally. Unsubscribe: ${unsubUrl}\nGoodTally — volunteer management for small nonprofits`;

  return { html, text };
}

/**
 * Send a single email via Resend. Returns {ok:false,skipped:true} if no
 * API key is configured (so dev works without email) instead of throwing.
 */
export async function sendEmail(args: SendEmailArgs): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    // Dev / preview without a key: log and skip, don't break flows.
    console.warn(`[email] RESEND_API_KEY missing; skipped ${args.category} to ${Array.isArray(args.to) ? args.to.join(",") : args.to}`);
    return { ok: false, skipped: true, error: "RESEND_API_KEY not configured" };
  }

  // If we don't have a userId, fall back to the recipient's email
  // address so the unsubscribe link still works. Only honoured when
  // `to` is a single address — bulk sends shouldn't embed one email.
  const fallbackEmail =
    args.recipientEmail ??
    (typeof args.to === "string" ? args.to : null);
  const footer = renderFooter(args.category, args.userId, fallbackEmail);
  const html = `${args.html}\n${footer.html}`;
  const text = (args.text ?? stripHtml(args.html)) + footer.text;

  try {
    const res = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: EMAIL_FROM,
        reply_to: EMAIL_REPLY_TO,
        to: Array.isArray(args.to) ? args.to : [args.to],
        subject: args.subject,
        html,
        text,
        headers: {
          "X-Entity-Category": args.category,
        },
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      console.error(`[email] Resend error ${res.status}: ${body}`);
      return { ok: false, error: `Resend ${res.status}: ${body}` };
    }

    const json = (await res.json()) as { id?: string };
    return { ok: true, id: json.id };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[email] send failed:", message);
    return { ok: false, error: message };
  }
}

function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
