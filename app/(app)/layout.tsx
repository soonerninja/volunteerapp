// Force all (app) routes to be server-rendered at request time.
// This prevents static prerender failures when Supabase env vars are absent at build.
export const dynamic = "force-dynamic";

import AppLayoutClient from "./app-layout-client";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <AppLayoutClient>{children}</AppLayoutClient>;
}
