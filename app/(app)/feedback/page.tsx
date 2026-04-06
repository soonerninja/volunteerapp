"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowUp, Pin, Plus, Loader2 } from "lucide-react";

const STATUS_LABEL: Record<string, string> = {
  under_review: "Under review",
  planned: "Planned",
  in_progress: "In progress",
  shipped: "Shipped",
  declined: "Declined",
};

const STATUS_COLOR: Record<string, string> = {
  under_review: "bg-gray-100 text-gray-700",
  planned: "bg-blue-100 text-blue-700",
  in_progress: "bg-amber-100 text-amber-700",
  shipped: "bg-emerald-100 text-emerald-700",
  declined: "bg-rose-100 text-rose-700",
};

interface Request {
  id: string;
  title: string;
  description: string | null;
  status: string;
  pinned: boolean;
  vote_count: number;
  created_at: string;
}

export default function FeedbackPage() {
  const supabase = useMemo(() => createClient(), []);
  const [userId, setUserId] = useState<string | null>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [requests, setRequests] = useState<Request[]>([]);
  const [votedIds, setVotedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [filter, setFilter] = useState<string>("all");

  const load = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    setUserId(user?.id ?? null);

    // Check if the current user is a super-admin via a ping endpoint.
    // Simpler: rely on client-side flag surfaced by a lightweight API.
    if (user) {
      try {
        const res = await fetch("/api/feedback/me");
        if (res.ok) {
          const { isSuperAdmin: ssa } = await res.json();
          setIsSuperAdmin(!!ssa);
        }
      } catch {
        // non-fatal
      }
    }

    const { data: reqs } = await supabase
      .from("feature_requests_with_votes")
      .select("*")
      .order("pinned", { ascending: false })
      .order("vote_count", { ascending: false })
      .order("created_at", { ascending: false });
    setRequests((reqs as Request[]) ?? []);

    if (user) {
      const { data: votes } = await supabase
        .from("feature_request_votes")
        .select("request_id")
        .eq("user_id", user.id);
      setVotedIds(new Set((votes ?? []).map((v) => v.request_id)));
    }

    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    load();
  }, [load]);

  const toggleVote = async (id: string) => {
    if (!userId) return;
    const alreadyVoted = votedIds.has(id);
    // Optimistic
    setVotedIds((prev) => {
      const next = new Set(prev);
      if (alreadyVoted) next.delete(id); else next.add(id);
      return next;
    });
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, vote_count: r.vote_count + (alreadyVoted ? -1 : 1) } : r))
    );

    if (alreadyVoted) {
      await supabase.from("feature_request_votes").delete().eq("request_id", id).eq("user_id", userId);
    } else {
      await supabase.from("feature_request_votes").insert({ request_id: id, user_id: userId });
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    setSubmitError("");
    if (title.trim().length < 3) {
      setSubmitError("Title must be at least 3 characters.");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("feature_requests").insert({
      title: title.trim(),
      description: description.trim() || null,
      created_by: userId,
    });
    if (error) {
      setSubmitError(error.message);
      setSubmitting(false);
      return;
    }
    setTitle("");
    setDescription("");
    setSubmitting(false);
    load();
  };

  const changeStatus = async (id: string, status: string) => {
    const res = await fetch("/api/feedback/status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    if (res.ok) load();
  };

  const togglePin = async (id: string, pinned: boolean) => {
    const res = await fetch("/api/feedback/status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, pinned: !pinned }),
    });
    if (res.ok) load();
  };

  const filtered = requests.filter((r) => filter === "all" || r.status === filter);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Feedback & feature requests</h1>
        <p className="mt-1 text-sm text-gray-500">
          Vote on what we build next, or submit your own idea. This is how we decide the roadmap.
        </p>
      </div>

      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Plus className="h-5 w-5 text-blue-600" /> Submit a request
        </h2>
        <form onSubmit={submit} className="space-y-3">
          <Input
            placeholder="Short, descriptive title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={140}
          />
          <textarea
            placeholder="Optional: more detail about why this matters and how you'd use it."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            maxLength={4000}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          {submitError && <p className="text-sm text-rose-600">{submitError}</p>}
          <Button type="submit" disabled={submitting || !title.trim()}>
            {submitting ? "Submitting…" : "Submit request"}
          </Button>
        </form>
      </Card>

      <div className="flex flex-wrap gap-2">
        {["all", "under_review", "planned", "in_progress", "shipped"].map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`text-xs px-3 py-1.5 rounded-full border ${
              filter === f ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
            }`}
          >
            {f === "all" ? "All" : STATUS_LABEL[f]}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((r) => {
            const voted = votedIds.has(r.id);
            return (
              <Card key={r.id}>
                <div className="flex items-start gap-4">
                  <button
                    type="button"
                    onClick={() => toggleVote(r.id)}
                    disabled={!userId}
                    className={`flex flex-col items-center justify-center w-14 rounded-md border py-2 transition-colors ${
                      voted ? "border-blue-600 bg-blue-50 text-blue-700" : "border-gray-300 bg-white text-gray-600 hover:border-blue-400"
                    }`}
                    aria-label={voted ? "Remove vote" : "Upvote"}
                  >
                    <ArrowUp className="h-4 w-4" />
                    <span className="text-sm font-semibold">{r.vote_count}</span>
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      {r.pinned && <Pin className="h-4 w-4 text-amber-500" aria-label="Pinned" />}
                      <h3 className="text-base font-semibold text-gray-900">{r.title}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLOR[r.status]}`}>
                        {STATUS_LABEL[r.status]}
                      </span>
                    </div>
                    {r.description && <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">{r.description}</p>}
                    {isSuperAdmin && (
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <select
                          value={r.status}
                          onChange={(e) => changeStatus(r.id, e.target.value)}
                          className="text-xs rounded border-gray-300"
                        >
                          {Object.entries(STATUS_LABEL).map(([k, v]) => (
                            <option key={k} value={k}>{v}</option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => togglePin(r.id, r.pinned)}
                          className="text-xs text-gray-600 hover:text-amber-600"
                        >
                          {r.pinned ? "Unpin" : "Pin"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
          {filtered.length === 0 && (
            <Card>
              <p className="text-sm text-gray-500 text-center">No requests match this filter yet.</p>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
