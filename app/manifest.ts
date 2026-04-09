import type { MetadataRoute } from "next";

/**
 * Web app manifest — served at /manifest.webmanifest.
 * Enables "Add to Home Screen" on mobile and PWA-ish behavior.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "GoodTally — Volunteer Management for Nonprofits",
    short_name: "GoodTally",
    description:
      "Simple, affordable volunteer management for small nonprofits. Track volunteers, hours, events, and committees.",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#2563eb",
    icons: [
      {
        src: "/icon",
        sizes: "32x32",
        type: "image/png",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
