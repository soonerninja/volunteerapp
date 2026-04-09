import { ImageResponse } from "next/og";

/**
 * Dynamic Open Graph image generated at build time via `next/og`.
 * Next.js serves this from /opengraph-image at the correct Content-Type
 * (image/png) so social crawlers (Twitter, Facebook, LinkedIn) render it
 * correctly — a plain SVG does not work for OG previews.
 */
export const runtime = "edge";
export const alt = "GoodTally — Volunteer management for nonprofits";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)",
          padding: "80px",
          fontFamily: "system-ui, -apple-system, sans-serif",
          position: "relative",
        }}
      >
        {/* Left accent bar */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: 12,
            height: "100%",
            background: "#2563eb",
          }}
        />

        {/* Logo row */}
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          {/* Tally-bar icon */}
          <svg width="120" height="96" viewBox="0 0 120 96" fill="none">
            <rect x="8" y="8" width="18" height="80" rx="9" fill="#334155" />
            <rect x="34" y="8" width="18" height="80" rx="9" fill="#334155" />
            <rect x="60" y="8" width="18" height="80" rx="9" fill="#334155" />
            <path
              d="M10 58 L32 84 L110 6"
              stroke="#2563eb"
              strokeWidth="14"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </svg>
          <div style={{ display: "flex", fontSize: 96, fontWeight: 800, letterSpacing: "-0.02em" }}>
            <span style={{ color: "#1e293b" }}>Good</span>
            <span style={{ color: "#2563eb" }}>Tally</span>
          </div>
        </div>

        {/* Headline */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            style={{
              fontSize: 56,
              fontWeight: 700,
              color: "#0f172a",
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
            }}
          >
            Volunteer management that stays out of the way.
          </div>
          <div style={{ fontSize: 32, color: "#64748b", lineHeight: 1.3 }}>
            Track volunteers, hours, events &amp; committees — built for small nonprofits.
          </div>
        </div>

        {/* Price badge */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              background: "#fef3c7",
              color: "#92400e",
              padding: "16px 28px",
              borderRadius: 999,
              fontSize: 28,
              fontWeight: 600,
            }}
          >
            Free forever for up to 10 volunteers · Paid from $49/yr
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
