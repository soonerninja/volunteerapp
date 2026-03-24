import Link from "next/link";

interface LogoProps {
  /** Show white text + lighter tints — use on dark backgrounds */
  inverted?: boolean;
  className?: string;
}

/**
 * GoodTally logo: tally-bar icon + "GoodTally" wordmark.
 * Use inverted=true on dark/coloured backgrounds.
 */
export function Logo({ inverted = false, className = "" }: LogoProps) {
  const barColor = inverted ? "#ffffff" : "#334155";  // slate-700 on light, white on dark
  const checkColor = inverted ? "#93c5fd" : "#2563eb"; // blue-300 vs blue-600
  const goodColor = inverted ? "#f1f5f9" : "#1e293b";  // slate-100 vs slate-900
  const tallyColor = inverted ? "#93c5fd" : "#2563eb";

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      {/* Icon */}
      <svg
        width="32"
        height="28"
        viewBox="0 0 32 28"
        fill="none"
        aria-hidden="true"
      >
        {/* Three tally bars */}
        <rect x="1"  y="2" width="5" height="22" rx="2.5" fill={barColor} />
        <rect x="9"  y="2" width="5" height="22" rx="2.5" fill={barColor} />
        <rect x="17" y="2" width="5" height="22" rx="2.5" fill={barColor} />
        {/* Single clean checkmark: lower-left → bottom-V → upper-right */}
        <path
          d="M2 16 L9 24 L28 4"
          stroke={checkColor}
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>

      {/* Wordmark */}
      <span className="text-[1.15rem] font-bold leading-none tracking-tight">
        <span style={{ color: goodColor }}>Good</span>
        <span style={{ color: tallyColor }}>Tally</span>
      </span>
    </div>
  );
}

/** Logo wrapped in a home-page link */
export function LogoLink({
  inverted,
  className,
}: {
  inverted?: boolean;
  className?: string;
}) {
  return (
    <Link href="/" aria-label="GoodTally home">
      <Logo inverted={inverted} className={className} />
    </Link>
  );
}
