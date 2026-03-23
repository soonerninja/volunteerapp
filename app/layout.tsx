import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VolunteerHub - Volunteer Management for Nonprofits",
  description:
    "Simple, affordable volunteer management for small nonprofits. Track volunteers, hours, events, and committees.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
