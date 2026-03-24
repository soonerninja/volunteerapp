import Link from "next/link";

interface LogoProps {
  /** Show white text + lighter tints — use on dark backgrounds */
  inverted?: boolean;
  className?: string;
}

/**
 * GoodTally logo: tally-bar icon + "Good Tally" wordmark.
 * Use inverted=true on dark/coloured backgrounds.
 */
export function Logo({ inverted = false, className = "" }: LogoProps) {
  const barColor = inverted ? "#ffffff" : "#1e293b";
  const checkColor = inverted ? "#93c5fd" : "#2563eb"; // blue-300 vs blue-600
  const goodColor = inverted ? "#f1f5f9" : "#1e293b";  // slate-100 vs slate-900
  const tallyColor = inverted ? "#93c5fd" : "#2563eb";

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      {/* Icon */}
      <svg
        width="30"
        height="26"
        viewBox="0 0 30 26"
        fill="none"
        aria-hidden="true"
      >
        {/* Three tally bars */}
        <rect x="1" y="2" width="4.5" height="20" rx="2.25" fill={barColor} />
        <rect x="8.5" y="2" width="4.5" height="20" rx="2.25" fill={barColor} />
        <rect x="16" y="2" width="4.5" height="20" rx="2.25" fill={barColor} />
        {/* Checkmark sweep */}
        <path
          d="M3 18 C9 23.5 16 23 22 16"
          stroke={checkColor}
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M18.5 19.5 L22 16 L27 7"
          stroke={checkColor}
          strokeWidth="3"
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
