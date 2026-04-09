import { createClient } from "@supabase/supabase-js";

// Service-role Supabase client — bypasses RLS, server-only.
// Never expose to the client; use only in API routes and server actions.
export function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}
