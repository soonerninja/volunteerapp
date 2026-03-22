"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { VolunteerSearchSelect } from "@/components/ui/volunteer-search-select";
import type { Committee, Volunteer } from "@/types/database";
import {
  UsersRound,
  Plus,
  X,
  Edit2,
  Trash2,
  Users,
} from "lucide-react";

type CommitteeWithCount = Committee & { member_count: number };
type CommitteeMember = {
  volunteer_id: string;
  role: string;
  joined_at: string;
  volunteers: { id: string; first_name: string; last_name: string };
};

export default function CommitteesPage() {
  const { profile } = useAuth();
  const supabase = createClient();
  const orgId = profile?.org_id;

  const [committees, setCommittees] = useState<CommitteeWithCount[]>([]);
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCommittee, setEditingCommittee] = useState<Committee | null>(
    null
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Members panel
  const [selectedCommittee, setSelectedCommittee] =
    useState<CommitteeWithCount | null>(null);
  const [members, setMembers] = useState<CommitteeMember[]>([]);

  const [form, setForm] = useState({ name: "", description: "" });

  const fetchCommittees = useCallback(async () => {
    if (!orgId) return;
    setLoading(true);
    const { data } = await supabase
      .from("committees")
      .select("*, volunteer_committees(count)")
      .eq("org_id", orgId)
      .order("name");

    const committeesWithCount: CommitteeWithCount[] = (data || []).map((c) => ({
      ...c,
      member_count: Array.isArray(c.volunteer_committees)
        ? c.volunteer_committees[0]?.count ?? 0
        : 0,
    }));
    setCommittees(committeesWithCount);
    setLoading(false);
  }, [orgId, supabase]);

  const fetchVolunteers = useCallback(async () => {
    if (!orgId) return;
    const { data } = await supabase
      .from("volunteers")
      .select("*")
      .eq("org_id", orgId)
      .eq("status", "active")
      .order("last_name");
    setVolunteers(data || []);
  }, [orgId, supabase]);

  useEffect(() => {
    fetchCommittees();
    fetchVolunteers();
  }, [fetchCommittees, fetchVolunteers]);

  const resetForm = () => {
    setForm({ name: "", description: "" });
    setEditingCommittee(null);
    setShowForm(false);
    setError("");
  };

  const openEdit = (c: Committee) => {
    setEditingCommittee(c);
    setForm({ name: c.name, description: c.description || "" });
    setShowForm(true);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgId || !profile) return;
    setSaving(true);
    setError("");

    const committeeData = {
      org_id: orgId,
      name: form.name.trim(),
      description: form.description.trim() || null,
    };

    if (editingCommittee) {
      const { error: updateErr } = await supabase
        .from("committees")
        .update(committeeData)
        .eq("id", editingCommittee.id);

      if (updateErr) {
        setError(updateErr.message);
        setSaving(false);
        return;
      }

      await supabase.from("audit_log").insert({
        org_id: orgId,
        user_id: profile.id,
        action: "committee.updated",
        entity_type: "committee",
        entity_id: editingCommittee.id,
        metadata: { name: form.name },
      });
    } else {
      const { data: newCommittee, error: insertErr } = await supabase
        .from("committees")
        .insert(committeeData)
        .select()
        .single();

      if (insertErr || !newCommittee) {
        setError(insertErr?.message || "Failed to create committee");
        setSaving(false);
        return;
      }

      await supabase.from("audit_log").insert({
        org_id: orgId,
        user_id: profile.id,
        action: "committee.created",
        entity_type: "committee",
        entity_id: newCommittee.id,
        metadata: { name: form.name },
      });
    }

    setSaving(false);
    resetForm();
    fetchCommittees();
  };

  const handleDelete = async (c: Committee) => {
    if (!confirm(`Delete "${c.name}" committee?`)) return;
    if (!orgId || !profile) return;

    await supabase.from("committees").delete().eq("id", c.id);
    await supabase.from("audit_log").insert({
      org_id: orgId,
      user_id: profile.id,
      action: "committee.deleted",
      entity_type: "committee",
      entity_id: c.id,
      metadata: { name: c.name },
    });
    if (selectedCommittee?.id === c.id) setSelectedCommittee(null);
    fetchCommittees();
  };

  // --- Members Management ---
  const openMembersPanel = async (c: CommitteeWithCount) => {
    setSelectedCommittee(c);
    const { data } = await supabase
      .from("volunteer_committees")
      .select(
        "volunteer_id, role, joined_at, volunteers(id, first_name, last_name)"
      )
      .eq("committee_id", c.id);
    setMembers((data as unknown as CommitteeMember[]) || []);
  };

  const assignMember = async (vol: Volunteer) => {
    if (!selectedCommittee) return;

    const { error: assignErr } = await supabase
      .from("volunteer_committees")
      .insert({
        volunteer_id: vol.id,
        committee_id: selectedCommittee.id,
      });

    if (assignErr) {
      setError(assignErr.message);
      return;
    }

    openMembersPanel(selectedCommittee);
    fetchCommittees();
  };

  const removeMember = async (volunteerId: string) => {
    if (!selectedCommittee) return;
    await supabase
      .from("volunteer_committees")
      .delete()
      .eq("volunteer_id", volunteerId)
      .eq("committee_id", selectedCommittee.id);
    openMembersPanel(selectedCommittee);
    fetchCommittees();
  };

  const assignedMemberIds = members.map((m) => m.volunteer_id);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Committees</h1>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Committee
        </Button>
      </div>

      {/* Create/Edit Form Modal - simple form, ok as modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-md">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingCommittee ? "Edit Committee" : "Create Committee"}
              </h2>
              <button
                onClick={resetForm}
                className="rounded-lg p-1 hover:bg-gray-100"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {error && !selectedCommittee && (
              <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Committee Name *"
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
              <div>
                <label
                  htmlFor="description"
                  className="mb-1.5 block text-sm font-medium text-gray-700"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  rows={3}
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="secondary" onClick={resetForm}>
                  Cancel
                </Button>
                <Button type="submit" loading={saving}>
                  {editingCommittee ? "Save Changes" : "Create Committee"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Members Panel - keep as modal since it's a quick management task */}
      {selectedCommittee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {selectedCommittee.name}
                </h2>
                <p className="text-sm text-gray-500">
                  {selectedCommittee.description || "Manage committee members"}
                </p>
              </div>
              <button
                onClick={() => setSelectedCommittee(null)}
                className="rounded-lg p-1 hover:bg-gray-100"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {error && selectedCommittee && (
              <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* Searchable volunteer selector */}
            <div className="mb-4">
              <p className="mb-1.5 text-xs font-medium text-gray-500">
                Add Member
              </p>
              <VolunteerSearchSelect
                volunteers={volunteers}
                excludeIds={assignedMemberIds}
                onSelect={assignMember}
                placeholder="Search volunteers to add..."
              />
            </div>

            {/* Members list */}
            {members.length === 0 ? (
              <EmptyState
                icon={Users}
                title="No members yet"
                description="Search and add volunteers to this committee."
              />
            ) : (
              <div className="space-y-2">
                {members.map((m) => (
                  <div
                    key={m.volunteer_id}
                    className="flex items-center justify-between rounded-lg border border-gray-100 p-3"
                  >
                    <div className="flex items-center gap-3">
                      <p className="font-medium text-gray-900">
                        {m.volunteers.first_name} {m.volunteers.last_name}
                      </p>
                      <input
                        type="text"
                        value={m.role || "Member"}
                        onChange={async (e) => {
                          const newRole = e.target.value;
                          setMembers((prev) =>
                            prev.map((mem) =>
                              mem.volunteer_id === m.volunteer_id
                                ? { ...mem, role: newRole }
                                : mem
                            )
                          );
                        }}
                        onBlur={async (e) => {
                          if (!selectedCommittee) return;
                          await supabase
                            .from("volunteer_committees")
                            .update({ role: e.target.value || "Member" })
                            .eq("volunteer_id", m.volunteer_id)
                            .eq("committee_id", selectedCommittee.id);
                        }}
                        className="w-28 rounded border border-gray-200 px-2 py-1 text-xs text-gray-600 focus:border-blue-500 focus:outline-none"
                        placeholder="Role"
                      />
                    </div>
                    <button
                      onClick={() => removeMember(m.volunteer_id)}
                      className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-600"
                      title="Remove"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Committee List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        </div>
      ) : committees.length === 0 ? (
        <EmptyState
          icon={UsersRound}
          title="No committees yet"
          description="Create committees to organize your volunteers into working groups."
          action={
            <Button size="sm" onClick={() => setShowForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Committee
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {committees.map((c) => (
            <Card
              key={c.id}
              className="cursor-pointer transition-shadow hover:shadow-md"
              onClick={() => openMembersPanel(c)}
            >
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <h3 className="font-medium text-gray-900">{c.name}</h3>
                  {c.description && (
                    <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                      {c.description}
                    </p>
                  )}
                  <div className="mt-3 flex items-center gap-1 text-sm text-gray-500">
                    <Users className="h-4 w-4" />
                    <span>
                      {c.member_count} member{c.member_count !== 1 && "s"}
                    </span>
                  </div>
                </div>
                <div
                  className="flex gap-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => openEdit(c)}
                    className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                    title="Edit"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(c)}
                    className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
