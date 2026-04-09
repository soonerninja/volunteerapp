"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Check } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const VALUE_BULLETS = [
  "Free forever for up to 10 volunteers",
  "No credit card required to start",
  "Set up your organization in under 2 minutes",
  "Your data is encrypted, owned by you, exportable anytime",
  "Paid plans start at just $20/year — not $200/month",
];

function SignupForm() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  // Pre-fill (and lock) the email when the user arrives via an invite link.
  const inviteEmail = searchParams.get("invite")?.toLowerCase().trim() ?? "";
  const isInvite = Boolean(inviteEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inviteEmail));

  useEffect(() => {
    if (isInvite) setEmail(inviteEmail);
  }, [isInvite, inviteEmail]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const trimmedName = fullName.trim();
    if (trimmedName.length < 2) {
      setError("Please enter your full name (at least 2 characters).");
      return;
    }
    if (trimmedName.includes("@")) {
      setError("Name cannot contain an @ symbol. Please enter your real name.");
      return;
    }

    setLoading(true);

    // Invite flow: create the account server-side with email_confirm=true
    // so the user doesn't need to re-verify (the invite email already
    // proved ownership). Then sign in with the fresh credentials.
    if (isInvite) {
      const res = await fetch("/api/invites/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail, password, fullName: trimmedName }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error || "Failed to accept invite.");
        setLoading(false);
        return;
      }
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: inviteEmail,
        password,
      });
      if (signInError) {
        setError(signInError.message);
        setLoading(false);
        return;
      }
      router.push("/dashboard");
      router.refresh();
      return;
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: trimmedName,
        },
        emailRedirectTo: `${siteUrl}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session) {
      router.push("/onboarding");
      router.refresh();
    } else {
      setSuccess(true);
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-blue-50 to-white px-4">
        <div className="w-full max-w-sm text-center">
          <div className="mb-4 inline-block rounded-full bg-green-50 p-3">
            <svg
              className="mx-auto h-6 w-6 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76"
              />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-900">
            Check your email
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            We sent a confirmation link to <strong>{email}</strong>. Click the
            link to activate your account.
          </p>
          <Link
            href="/login"
            className="mt-6 inline-block text-sm text-blue-600 hover:text-blue-700"
          >
            Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      {/* Left panel — value proposition */}
      <div className="relative flex flex-col justify-between bg-blue-900 px-8 py-10 lg:px-12">
        {/* Subtle radial glow */}
        <div
          className="pointer-events-none absolute right-0 top-0 h-96 w-96 -translate-y-1/4 translate-x-1/4 rounded-full bg-blue-600/20 blur-3xl"
          aria-hidden="true"
        />

        {/* Logo */}
        <div className="relative z-10">
          <Logo inverted />
        </div>

        {/* Headline + bullets */}
        <div className="relative z-10 py-12">
          <h2 className="text-3xl font-bold leading-tight text-white sm:text-4xl">
            Your volunteers deserve{" "}
            <em className="not-italic text-blue-400">
              better than a spreadsheet.
            </em>
          </h2>
          <p className="mt-4 text-base leading-relaxed text-gray-400">
            Join nonprofits using GoodTally to track volunteers, log hours, and
            run events — without the complexity or cost of enterprise software.
          </p>

          <ul className="mt-8 space-y-3">
            {VALUE_BULLETS.map((bullet) => (
              <li key={bullet} className="flex items-start gap-3 text-sm text-gray-300">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-600">
                  <Check className="h-3 w-3 text-white" aria-hidden="true" />
                </span>
                {bullet}
              </li>
            ))}
          </ul>
        </div>

        {/* Bottom tagline */}
        <p className="relative z-10 text-xs text-blue-300">
          GoodTally &mdash; Volunteer management for good.
        </p>
      </div>

      {/* Right panel — form */}
      <div className="flex flex-col justify-center bg-white px-8 py-10 lg:px-12">
        <div className="mx-auto w-full max-w-sm">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">
              {isInvite ? "Accept your invite" : "Create your account"}
            </h1>
            <p className="mt-1.5 text-sm text-gray-500">
              {isInvite
                ? "Finish setting up your account to join your team."
                : "Free forever for small teams."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div
                role="alert"
                aria-live="polite"
                className="rounded-lg bg-red-50 p-3 text-sm text-red-700"
              >
                {error}
              </div>
            )}

            <Input
              id="full_name"
              label="Full name"
              type="text"
              placeholder="Jane Smith"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              autoFocus
            />

            <Input
              id="email"
              label="Email"
              type="email"
              placeholder="you@nonprofit.org"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              readOnly={isInvite}
              disabled={isInvite}
            />

            <Input
              id="password"
              label={isInvite ? "Create a password" : "Password"}
              type="password"
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              required
            />

            <Button type="submit" loading={loading} className="w-full">
              {isInvite ? "Accept Invite & Continue" : "Create Free Account"}
            </Button>
          </form>

          <p className="mt-4 text-center text-xs text-gray-400">
            By signing up you agree to our{" "}
            <Link href="/terms" className="text-blue-600 hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-blue-600 hover:underline">
              Privacy Policy
            </Link>
            .
          </p>

          <p className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-blue-600 hover:text-blue-700"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
          <div
            className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"
            role="status"
            aria-label="Loading"
          />
        </div>
      }
    >
      <SignupForm />
    </Suspense>
  );
}
