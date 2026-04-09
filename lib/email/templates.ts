/**
 * HTML email templates. Intentionally inline-styled, table-free, minimal
 * markup. No component framework — we want these to render in every
 * client without surprises.
 */

const BRAND = "#2563eb"; // blue-600

function layout(innerHtml: string): string {
  return `
<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#111827;line-height:1.6;">
  <div style="font-size:20px;font-weight:700;color:${BRAND};margin-bottom:24px;">GoodTally</div>
  ${innerHtml}
</div>`.trim();
}

export function teamInviteEmail(args: {
  inviterName: string;
  orgName: string;
  role: string;
  acceptUrl: string;
}): { subject: string; html: string } {
  const roleBlurb: Record<string, string> = {
    owner: "Full access including billing.",
    admin: "Full access, can manage billing and invite others.",
    editor: "Can add and edit volunteers, events, and hours.",
    viewer: "Read-only access to view data and run reports.",
  };
  const blurb = roleBlurb[args.role] ?? roleBlurb.editor;

  const subject = `${args.inviterName} invited you to ${args.orgName} on GoodTally`;
  const html = layout(`
    <h1 style="font-size:22px;margin:0 0 16px;">You've been invited to ${escape(args.orgName)}</h1>
    <p><strong>${escape(args.inviterName)}</strong> added you to <strong>${escape(args.orgName)}</strong> on GoodTally as a <strong>${escape(args.role)}</strong>.</p>
    <p style="color:#6b7280;font-size:14px;">${escape(blurb)}</p>
    <p style="margin:28px 0;">
      <a href="${args.acceptUrl}" style="display:inline-block;background:${BRAND};color:#fff;padding:12px 22px;border-radius:6px;text-decoration:none;font-weight:600;">Accept invite</a>
    </p>
    <p style="color:#6b7280;font-size:13px;">New to GoodTally? It's a simple, affordable tool for small nonprofits to track volunteers, hours, events, and committees. When you sign up with this email address, you'll automatically join ${escape(args.orgName)}.</p>
    <p style="color:#6b7280;font-size:13px;">If the button doesn't work, paste this link into your browser: <br /><a href="${args.acceptUrl}" style="color:${BRAND};word-break:break-all;">${args.acceptUrl}</a></p>
  `);
  return { subject, html };
}

export function teamInviteAcceptedEmail(args: {
  newUserEmail: string;
  orgName: string;
  appUrl: string;
}): { subject: string; html: string } {
  const subject = `${args.newUserEmail} joined ${args.orgName}`;
  const html = layout(`
    <h1 style="font-size:22px;margin:0 0 16px;">A new teammate just joined</h1>
    <p><strong>${escape(args.newUserEmail)}</strong> accepted your invite and is now part of <strong>${escape(args.orgName)}</strong>.</p>
    <p style="margin:24px 0;">
      <a href="${args.appUrl}/settings" style="display:inline-block;background:${BRAND};color:#fff;padding:12px 22px;border-radius:6px;text-decoration:none;font-weight:600;">Manage team</a>
    </p>
  `);
  return { subject, html };
}

export function eventReminderEmail(args: {
  adminName: string;
  eventTitle: string;
  startDate: string;
  location: string | null;
  signupCount: number;
  appUrl: string;
}): { subject: string; html: string } {
  const subject = `Reminder: ${args.eventTitle} is tomorrow`;
  const html = layout(`
    <h1 style="font-size:22px;margin:0 0 16px;">Your event is tomorrow</h1>
    <p>Hi ${escape(args.adminName)}, just a heads-up — <strong>${escape(args.eventTitle)}</strong> starts in about 24 hours.</p>
    <ul style="background:#f9fafb;border-radius:8px;padding:16px 20px;list-style:none;">
      <li><strong>When:</strong> ${escape(args.startDate)}</li>
      ${args.location ? `<li><strong>Where:</strong> ${escape(args.location)}</li>` : ""}
      <li><strong>Signups:</strong> ${args.signupCount} volunteer${args.signupCount === 1 ? "" : "s"}</li>
    </ul>
    <p style="margin:24px 0;">
      <a href="${args.appUrl}/events" style="display:inline-block;background:${BRAND};color:#fff;padding:12px 22px;border-radius:6px;text-decoration:none;font-weight:600;">Open event</a>
    </p>
  `);
  return { subject, html };
}

export function weeklyDigestEmail(args: {
  orgName: string;
  volunteersAdded: number;
  hoursLogged: number;
  eventsCreated: number;
  eventsCompleted: number;
  appUrl: string;
}): { subject: string; html: string } {
  const subject = `Your GoodTally week: ${args.volunteersAdded} new, ${args.hoursLogged} hours`;
  const row = (label: string, value: number | string) =>
    `<div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid #e5e7eb;"><span style="color:#6b7280;">${label}</span><strong>${value}</strong></div>`;
  const html = layout(`
    <h1 style="font-size:22px;margin:0 0 4px;">Your week at ${escape(args.orgName)}</h1>
    <p style="color:#6b7280;margin:0 0 20px;">Here's what happened over the last 7 days.</p>
    <div style="background:#f9fafb;border-radius:8px;padding:8px 20px;">
      ${row("Volunteers added", args.volunteersAdded)}
      ${row("Hours logged", args.hoursLogged)}
      ${row("Events created", args.eventsCreated)}
      ${row("Events completed", args.eventsCompleted)}
    </div>
    <p style="margin:24px 0;">
      <a href="${args.appUrl}/dashboard" style="display:inline-block;background:${BRAND};color:#fff;padding:12px 22px;border-radius:6px;text-decoration:none;font-weight:600;">Open dashboard</a>
    </p>
    <p style="color:#6b7280;font-size:13px;">Reply to this email to let us know what you'd like to see in future updates.</p>
  `);
  return { subject, html };
}

export function featureStatusEmail(args: {
  title: string;
  status: string;
  appUrl: string;
}): { subject: string; html: string } {
  const subject = `Update on a feature you voted for: ${args.title}`;
  const html = layout(`
    <h1 style="font-size:22px;margin:0 0 16px;">Thanks for voting — here's an update</h1>
    <p>A feature you upvoted on GoodTally is now marked <strong>${escape(args.status)}</strong>:</p>
    <blockquote style="border-left:3px solid ${BRAND};padding:8px 16px;color:#111827;margin:16px 0;background:#f9fafb;border-radius:4px;">${escape(args.title)}</blockquote>
    <p style="margin:24px 0;">
      <a href="${args.appUrl}/feedback" style="display:inline-block;background:${BRAND};color:#fff;padding:12px 22px;border-radius:6px;text-decoration:none;font-weight:600;">View feedback board</a>
    </p>
  `);
  return { subject, html };
}

function escape(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
