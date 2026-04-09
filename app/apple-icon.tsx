import { ImageResponse } from "next/og";

/**
 * Apple touch icon — generated dynamically at build time.
 * Next.js serves this as /apple-icon at 180×180, Content-Type image/png.
 * iOS home-screen icons need an opaque background (no transparency).
 */
export const runtime = "edge";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#ffffff",
          borderRadius: 36,
        }}
      >
        <svg width="140" height="120" viewBox="0 0 32 28" fill="none">
          <rect x="1" y="2" width="5" height="22" rx="2.5" fill="#1e293b" />
          <rect x="9" y="2" width="5" height="22" rx="2.5" fill="#1e293b" />
          <rect x="17" y="2" width="5" height="22" rx="2.5" fill="#1e293b" />
          <path
            d="M2 16 L9 24 L28 4"
            stroke="#2563eb"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>
      </div>
    ),
    { ...size }
  );
}
