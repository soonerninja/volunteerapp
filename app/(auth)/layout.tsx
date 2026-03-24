// Force all (auth) routes to render at request time so Supabase client
// env vars are available and SSG prerender failures are avoided.
export const dynamic = "force-dynamic";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
