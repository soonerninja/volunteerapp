import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSuperAdmin } from "@/lib/super-admin";

/**
 * Lightweight "who am I" endpoint for the feedback board. Returns whether
 * the caller is on the super-admin allowlist so the client can render the
 * admin controls. Never exposes the allowlist itself.
 */
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return NextResponse.json({
    authenticated: !!user,
    isSuperAdmin: isSuperAdmin(user?.id ?? null),
  });
}
