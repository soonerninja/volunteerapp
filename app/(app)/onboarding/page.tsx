"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function OnboardingPage() {
  const [orgName, setOrgName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  function generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 60);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("You must be logged in.");
      setLoading(false);
      return;
    }

    // Create the organization (generate ID client-side to avoid needing SELECT policy)
    const orgId = crypto.randomUUID();
    const slug = generateSlug(orgName) + "-" + Date.now().toString(36);
    const { error: orgError } = await supabase
      .from("organizations")
      .insert({ id: orgId, name: orgName.trim(), slug });

    if (orgError) {
      setError(orgError.message);
      setLoading(false);
      return;
    }

    // Link the profile to the org
    const { error: profileError } = await supabase
      .from("profiles")
      .update({ org_id: orgId, role: "owner" })
      .eq("id", user.id);

    if (profileError) {
      setError(profileError.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            <svg
              className="h-6 w-6 text-blue-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome! Let&apos;s get started.
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            What&apos;s the name of your organization?
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <Input
            id="org_name"
            label="Organization name"
            type="text"
            placeholder="e.g., Riverdale Food Bank"
            value={orgName}
            onChange={(e) => setOrgName(e.target.value)}
            required
            autoFocus
          />

          <Button
            type="submit"
            loading={loading}
            disabled={!orgName.trim()}
            className="w-full"
          >
            Create Organization
          </Button>
        </form>
      </div>
    </div>
  );
}
