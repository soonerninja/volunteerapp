import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, {
              ...options,
              sameSite: 'lax',   // 'lax' is safe and compatible; 'strict' breaks OAuth flows
              secure: process.env.NODE_ENV === 'production',
            })
          );
          // Cookies are set with HttpOnly by default via @supabase/ssr.
          // For SameSite/Secure attributes, configure them in the cookie options above
          // by passing { sameSite: 'strict', secure: true } to cookiesToSet options.
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Note: Supabase provides built-in rate limiting for auth endpoints.
  // Configure limits in: Supabase Dashboard → Auth → Rate Limits
  // - Email signups: 30/hour
  // - Login attempts: configurable per IP

  // Public routes that don't require auth
  const publicRoutes = ["/login", "/signup", "/forgot-password", "/auth/callback"];
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));
  const marketingRoutes = ["/", "/pricing", "/terms", "/privacy", "/contact"];
  const isMarketingRoute = marketingRoutes.some((route) => pathname === route || pathname.startsWith(route + "/"));

  // If not authenticated and trying to access app routes, redirect to login
  if (!user && !isPublicRoute && !isMarketingRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // If authenticated and trying to access auth routes, redirect to dashboard
  if (user && isPublicRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
