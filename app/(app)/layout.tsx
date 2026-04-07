// Force all (app) routes to be server-rendered at request time.
// This prevents static prerender failures when Supabase env vars are absent at build.
export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import AppLayoutClient from "./app-layout-client";

// Prevent search engines from indexing any authenticated app route.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <AppLayoutClient>{children}</AppLayoutClient>;
}
