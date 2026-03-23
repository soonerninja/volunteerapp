import type { Metadata } from "next";
import { ToastProvider } from "@/components/ui/toast";
import "./globals.css";

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
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
