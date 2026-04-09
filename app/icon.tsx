import { ImageResponse } from "next/og";

/**
 * Favicon — generated dynamically at build time.
 * Next.js serves this as /icon at 32×32, Content-Type image/png.
 * Uses the GoodTally tally-bar mark only (no wordmark).
 */
export const runtime = "edge";
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
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
        }}
      >
        <svg width="28" height="28" viewBox="0 0 32 28" fill="none">
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
