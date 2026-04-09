import Link from "next/link";
import Image from "next/image";

interface LogoProps {
  /** Show white text + lighter tints — use on dark backgrounds */
  inverted?: boolean;
  className?: string;
}

/**
 * GoodTally logo: branded PNG wordmark from /public/logo.png.
 * On dark backgrounds (inverted), we apply a CSS invert so the dark
 * wordmark flips to light without needing a second asset.
 * Image intrinsic size is 3218 × 636 (≈5.06:1).
 */
export function Logo({ inverted = false, className = "" }: LogoProps) {
  return (
    <div className={`inline-flex items-center ${className}`}>
      <Image
        src="/logo.png"
        alt="GoodTally"
        width={162}
        height={32}
        priority
        className={inverted ? "invert brightness-0" : ""}
      />
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
