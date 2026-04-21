/**
 * Shared auth for cron endpoints. The caller (Vercel Cron, Supabase
 * Scheduled Function, external cron) must pass a bearer token matching
 * CRON_SECRET. Returns true on match.
 */
export function verifyCronAuth(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const auth = req.headers.get("authorization") || "";
  return auth === `Bearer ${secret}`;
}
