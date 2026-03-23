"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function SignupPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    // If email confirmation is disabled, go straight to onboarding
    // Otherwise show a confirmation message
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
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-bold text-blue-600">
          GoodTally
        </Link>
        <p className="text-sm text-gray-500">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-blue-600 hover:text-blue-700"
          >
            Sign in
          </Link>
        </p>
      </header>

      {/* Form */}
      <div className="flex flex-1 items-center justify-center px-4 pb-16">
        <div className="w-full max-w-sm">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900">
              Create your account
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              Free forever for small teams. Get started in seconds.
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div
                  role="alert"
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
              />

              <Input
                id="password"
                label="Password"
                type="password"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                required
              />

              <Button type="submit" loading={loading} className="w-full">
                Create Account
              </Button>
            </form>
          </div>

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
        </div>
      </div>
    </div>
  );
}
