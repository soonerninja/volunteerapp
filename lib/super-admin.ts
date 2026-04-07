/**
 * Super-admin gate. The allowlist is a comma-separated list of user IDs
 * in the SUPER_ADMIN_USER_IDS env var. No UI for managing this — editing
 * the env var is intentional friction, because this role can read
 * everyone's data.
 */
export function getSuperAdminIds(): Set<string> {
  const raw = process.env.SUPER_ADMIN_USER_IDS || "";
  return new Set(
    raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
  );
}

export function isSuperAdmin(userId: string | null | undefined): boolean {
  if (!userId) return false;
  return getSuperAdminIds().has(userId);
}
