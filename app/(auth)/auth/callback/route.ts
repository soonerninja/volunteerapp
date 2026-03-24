import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** Validate that a redirect path is a safe, relative internal path. */
function sanitizeRedirectPath(path: string): string {
  if (
    !path.startsWith("/") ||
    path.startsWith("//") ||
    path.includes("://") ||
    path.includes("\\")
  ) {
    return "/dashboard";
  }
  return path;
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const errorCode = searchParams.get("error_code");
  const next = sanitizeRedirectPath(searchParams.get("next") ?? "/dashboard");

  // Supabase sends ?error_code=otp_expired (and similar) when a magic link
  // or password-reset token is invalid or has expired.
  if (errorCode) {
    const friendly =
      errorCode === "otp_expired"
        ? "That link has expired. Please request a new one."
        : "The link is invalid or has already been used.";
    return NextResponse.redirect(
      `${origin}/login?notice=${encodeURIComponent(friendly)}`
    );
  }

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("org_id")
          .eq("id", user.id)
          .single();

        if (!profile?.org_id) {
          return NextResponse.redirect(`${origin}/onboarding`);
        }
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Fallback: something unexpected happened
  return NextResponse.redirect(
    `${origin}/login?notice=${encodeURIComponent("Something went wrong. Please try again.")}`
  );
}
