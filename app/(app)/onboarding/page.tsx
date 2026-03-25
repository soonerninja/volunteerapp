"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Users } from "lucide-react";

type PendingInvite = {
  id: string;
  org_id: string;
  email: string;
  role: string;
  org_name?: string;
};

export default function OnboardingPage() {
  const [orgName, setOrgName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingInvites, setCheckingInvites] = useState(true);
  const [pendingInvite, setPendingInvite] = useState<PendingInvite | null>(null);
  const router = useRouter();
  const supabase = createClient();

  // Check for pending invites on mount
  useEffect(() => {
    async function checkInvites() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user?.email) {
        setCheckingInvites(false);
        return;
      }

      const { data: invites, error: inviteErr } = await supabase
        .from("team_invites")
        .select("id, org_id, email, role")
        .eq("status", "pending")
        .ilike("email", user.email);

      if (!inviteErr && invites && invites.length > 0) {
        const invite = invites[0];
        // Fetch org name for display
        const { data: org } = await supabase
          .from("organizations")
          .select("name")
          .eq("id", invite.org_id)
          .single();

        setPendingInvite({
          ...invite,
          org_name: org?.name || "an organization",
        });
      }
      setCheckingInvites(false);
    }
    checkInvites();
  }, [supabase]);

  function generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 60);
  }

  async function acceptInvite() {
    if (!pendingInvite) return;
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

    // Join the org with the invited role
    const { error: profileError } = await supabase
      .from("profiles")
      .update({ org_id: pendingInvite.org_id, role: pendingInvite.role })
      .eq("id", user.id);

    if (profileError) {
      setError(profileError.message);
      setLoading(false);
      return;
    }

    // Mark invite as accepted
    await supabase
      .from("team_invites")
      .update({ status: "accepted" })
      .eq("id", pendingInvite.id);

    router.push("/dashboard");
    router.refresh();
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

  if (checkingInvites) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" role="status" aria-label="Loading" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            {pendingInvite ? (
              <Users className="h-6 w-6 text-blue-600" aria-hidden="true" />
            ) : (
              <svg
                className="h-6 w-6 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            )}
          </div>

          {pendingInvite ? (
            <>
              <h1 className="text-2xl font-bold text-gray-900">
                You&apos;ve been invited!
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                You&apos;ve been invited to join{" "}
                <span className="font-semibold text-gray-900">
                  {pendingInvite.org_name}
                </span>{" "}
                as a{pendingInvite.role === "admin" ? "n" : ""}{" "}
                <span className="font-medium capitalize">
                  {pendingInvite.role}
                </span>
                .
              </p>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome! Let&apos;s get started.
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                What&apos;s the name of your organization?
              </p>
            </>
          )}
        </div>

        {error && (
          <div role="alert" aria-live="polite" className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {pendingInvite ? (
          <div className="space-y-4">
            <Card>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                  <Users className="h-5 w-5 text-blue-600" aria-hidden="true" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {pendingInvite.org_name}
                  </p>
                  <p className="text-sm text-gray-500">
                    Role: <span className="capitalize">{pendingInvite.role}</span>
                  </p>
                </div>
              </div>
            </Card>

            <Button
              onClick={acceptInvite}
              loading={loading}
              className="w-full"
            >
              Accept Invite & Join
            </Button>

            <div className="text-center">
              <button
                onClick={() => setPendingInvite(null)}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Or create your own organization
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
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
        )}
      </div>
    </div>
  );
}
