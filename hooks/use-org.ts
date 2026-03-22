"use client";

import { useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/use-auth";

/**
 * Common hook that provides supabase client, orgId, and profile
 * for any org-scoped page. Eliminates the repeated 3-line pattern.
 */
export function useOrg() {
  const { profile, user, refreshProfile } = useAuth();
  const supabase = useMemo(() => createClient(), []);
  const orgId = profile?.org_id ?? null;

  return { supabase, orgId, profile, user, refreshProfile };
}
