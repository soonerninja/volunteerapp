import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { ToastProvider } from "@/components/ui/toast";
import "./globals.css";

// Note on fonts: we deliberately use the system-UI font stack (defined in
// globals.css via the Tailwind 4 `@theme` block) rather than loading a web
// font. System fonts hit the screen instantly with zero network cost and
// render crisp on every device — the best possible LCP/CLS for a content
// site. If a custom brand font is ever required, swap this for next/font.

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#2563eb",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://goodtally.app"),
  title: {
    default: "GoodTally — Volunteer Management for Nonprofits",
    template: "%s — GoodTally",
  },
  description:
    "Simple, affordable volunteer management for small nonprofits. Track volunteers, hours, events, and committees — all in one tool.",
  applicationName: "GoodTally",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "GoodTally — Volunteer Management for Nonprofits",
    description:
      "Simple, affordable volunteer management for small nonprofits. Track volunteers, hours, events, and committees — all in one tool.",
    type: "website",
    siteName: "GoodTally",
    locale: "en_US",
    url: "https://goodtally.app",
    // og-image is auto-wired from app/opengraph-image.tsx
  },
  twitter: {
    card: "summary_large_image",
    title: "GoodTally — Volunteer Management for Nonprofits",
    description:
      "Simple, affordable volunteer management for small nonprofits. Track volunteers, hours, events, and committees.",
    // Image is auto-wired from app/opengraph-image.tsx
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

// Derive the Supabase origin from the public env var so we can preconnect
// to the correct project without hardcoding the hostname in source.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseOrigin = (() => {
  if (!supabaseUrl) return null;
  try {
    return new URL(supabaseUrl).origin;
  } catch {
    return null;
  }
})();

// Organization schema — emitted once on every page for site-wide
// entity recognition in Google's Knowledge Graph.
const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "GoodTally",
  url: "https://goodtally.app",
  logo: "https://goodtally.app/icon",
  description:
    "Simple, affordable volunteer management software for small nonprofits.",
  email: "support@goodtally.app",
  contactPoint: {
    "@type": "ContactPoint",
    email: "support@goodtally.app",
    contactType: "customer support",
    availableLanguage: ["English"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Preconnect to Supabase for faster auth/data requests.
            Origin is derived at build time from NEXT_PUBLIC_SUPABASE_URL. */}
        {supabaseOrigin && (
          <>
            <link rel="preconnect" href={supabaseOrigin} />
            <link rel="dns-prefetch" href={supabaseOrigin} />
          </>
        )}
        {/* Organization structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
      </head>
      <body className="font-sans antialiased">
        {/* Skip to main content — for keyboard/screen reader users */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-blue-600 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
        >
          Skip to main content
        </a>
        <ToastProvider>{children}</ToastProvider>
        {/* Vercel Web Analytics + Speed Insights — page-view tracking
            and Core Web Vitals reporting (LCP, FID/INP, CLS). */}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
