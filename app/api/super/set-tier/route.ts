import { NextResponse } from "next/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { isSuperAdmin } from "@/lib/super-admin";

const ALLOWED = new Set(["free", "starter", "growth"]);

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !isSuperAdmin(user.id)) {
    return NextResponse.json({ error: "Not authorized" }, { status: 404 });
  }

  const { orgId, tier } = await req.json().catch(() => ({}));
  if (!orgId || !ALLOWED.has(tier)) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    return NextResponse.json({ error: "Service role not configured" }, { status: 500 });
  }
  const svc = createServiceClient(url, key, { auth: { persistSession: false } });

  const { error } = await svc
    .from("organizations")
    .update({ tier })
    .eq("id", orgId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
