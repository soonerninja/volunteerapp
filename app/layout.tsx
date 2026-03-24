import type { Metadata, Viewport } from "next";
import { ToastProvider } from "@/components/ui/toast";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#2563eb",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://goodtally.app"),
  title: "GoodTally - Volunteer Management for Nonprofits",
  description:
    "Simple, affordable volunteer management for small nonprofits. Track volunteers, hours, events, and committees.",
  openGraph: {
    title: "GoodTally - Volunteer Management for Nonprofits",
    description:
      "Simple, affordable volunteer management for small nonprofits. Track volunteers, hours, events, and committees.",
    type: "website",
    siteName: "GoodTally",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "GoodTally - Volunteer Management for Nonprofits",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/og-image.png"],
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
        {/* Preconnect to Supabase for faster auth/data requests */}
        <link rel="preconnect" href="https://hgyguulrtwjfqlpomboz.supabase.co" />
        <link rel="dns-prefetch" href="https://hgyguulrtwjfqlpomboz.supabase.co" />
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
      </body>
    </html>
  );
}
