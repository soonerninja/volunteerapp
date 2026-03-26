"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Loader2 } from "lucide-react";

interface PricingCtaButtonProps {
  tier: "free" | "starter" | "growth";
  label: string;
  className: string;
  isLoggedIn: boolean;
}

export function PricingCtaButton({ tier, label, className, isLoggedIn }: PricingCtaButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Free tier: always go to signup or dashboard
  if (tier === "free") {
    return (
      <Link href={isLoggedIn ? "/dashboard" : "/signup"} className={className}>
        {label}
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    );
  }

  // Paid tier, not logged in: go to signup
  if (!isLoggedIn) {
    return (
      <Link href={`/signup?plan=${tier}`} className={className}>
        {label}
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    );
  }

  // Paid tier, logged in: trigger Stripe Checkout directly
  async function handleClick() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        setLoading(false);
        return;
      }
      if (data.url) window.location.href = data.url;
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div>
      <button onClick={handleClick} disabled={loading} className={`${className} disabled:opacity-60`}>
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : (
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        )}
        {label}
      </button>
      {error && <p className="mt-1 text-xs text-red-600 text-center">{error}</p>}
    </div>
  );
}
