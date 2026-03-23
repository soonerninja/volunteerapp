"use client";

import { useAuth } from "@/hooks/use-auth";
import type { UserRole } from "@/types/database";

/**
 * Role hierarchy: owner > admin > editor > viewer
 * Returns permission helpers based on the current user's role.
 */

const ROLE_RANK: Record<UserRole, number> = {
  owner: 4,
  admin: 3,
  editor: 2,
  viewer: 1,
};

export function usePermissions() {
  const { profile } = useAuth();
  const role = profile?.role ?? "viewer";
  const rank = ROLE_RANK[role] ?? 0;

  return {
    role,

    /** Can create, edit, delete volunteers/events/committees */
    canEdit: rank >= ROLE_RANK.editor,

    /** Can manage team members, invites, org settings */
    canManageTeam: rank >= ROLE_RANK.admin,

    /** Can access billing and plan settings */
    canManageBilling: rank >= ROLE_RANK.owner,

    /** Can manage skills/roles definitions */
    canManageConfig: rank >= ROLE_RANK.admin,

    /** Can delete records */
    canDelete: rank >= ROLE_RANK.editor,

    /** Has full control (owner only) */
    isOwner: role === "owner",

    /** Check if user has at least the given role */
    hasRole: (minRole: UserRole) => rank >= ROLE_RANK[minRole],
  };
}
