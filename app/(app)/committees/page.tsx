"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useFocusTrap } from "@/hooks/use-focus-trap";
import { useOrg } from "@/hooks/use-org";
import { usePermissions } from "@/hooks/use-permissions";
import { usePlan } from "@/hooks/use-plan";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { ListSkeleton } from "@/components/ui/list-skeleton";
import { PlanLimitBadge, UpgradePrompt } from "@/components/ui/upgrade-prompt";
import { VolunteerSearchSelect } from "@/components/ui/volunteer-search-select";
import type { Committee, Volunteer, CommitteePriority } from "@/types/database";
import {
  UsersRound,
  Plus,
  X,
  Edit2,
  Trash2,
  Users,
  Check,
  Square,
  CheckSquare,
} from "lucide-react";

type CommitteeMember = {
  volunteer_id: string;
  role: string;
  joined_at: string;
  volunteers: { id: string; first_name: string; last_name: string };
};

type CommitteeWithDetails = Committee & {
  member_count: number;
  members: CommitteeMember[];
  priorities: CommitteePriority[];
};

// Avatar color palette
const AVATAR_COLORS = [
  "bg-blue-500",
  "bg-green-500",
  "bg-purple-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-teal-500",
  "bg-indigo-500",
  "bg-orange-500",
];

function getAvatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function getInitials(firstName: string, lastName: string) {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

function getDueDateLabel(dateStr: string | null): {
  label: string;
  className: string;
} {
  if (!dateStr) return { label: "", className: "" };
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dateStr + "T00:00:00");
  const diffDays = Math.ceil(
    (due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffDays < 0) {
    return { label: "Overdue", className: "text-red-600 font-medium" };
  }
  if (diffDays <= 7) {
    return {
      label: due.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      className: "text-amber-600 font-medium",
    };
  }
  return {
    label: due.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    className: "text-gray-400",
  };
}

export default function CommitteesPage() {
  const { supabase, orgId, profile } = useOrg();
  const { canEdit, canDelete: canDeletePerm } = usePermissions();
  const { canAdd, usageLabel, refreshCounts } = usePlan();

  const [committees, setCommittees] = useState<CommitteeWithDetails[]>([]);
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCommittee, setEditingCommittee] = useState<Committee | null>(
    null
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [deletingCommittee, setDeletingCommittee] = useState<Committee | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const firstInputRef = useRef<HTMLInputElement>(null);

  // Members panel
  const [selectedCommittee, setSelectedCommittee] =
    useState<CommitteeWithDetails | null>(null);
  const [members, setMembers] = useState<CommitteeMember[]>([]);

  // Priority add form
  const [addingPriorityFor, setAddingPriorityFor] = useState<string | null>(
    null
  );
  const [newPriorityText, setNewPriorityText] = useState("");
  const [newPriorityDate, setNewPriorityDate] = useState("");
  const priorityInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({ name: "", description: "" });

  // Focus trap refs for modals
  const createFormTriggerRef = useRef<HTMLButtonElement>(null);
  const formDialogRef = useFocusTrap<HTMLDivElement>(showForm, createFormTriggerRef);
  const membersDialogRef = useFocusTrap<HTMLDivElement>(!!selectedCommittee);

  const fetchCommittees = useCallback(async () => {
    if (!orgId) return;
    setLoading(true);

    // Fetch committees with member count
    const { data: committeeData } = await supabase
      .from("committees")
      .select("*, volunteer_committees(count)")
      .eq("org_id", orgId)
      .order("name");

    const committeeIds = (committeeData || []).map((c) => c.id);

    // Fetch members for all committees (chair first, then members)
    const { data: memberData } = await supabase
      .from("volunteer_committees")
      .select(
        "volunteer_id, committee_id, role, joined_at, volunteers(id, first_name, last_name)"
      )
      .in("committee_id", committeeIds.length > 0 ? committeeIds : ["none"]);

    // Fetch priorities for all committees
    const { data: priorityData } = await supabase
      .from("committee_priorities")
      .select("*")
      .in("committee_id", committeeIds.length > 0 ? committeeIds : ["none"])
      .order("completed")
      .order("due_date", { ascending: true, nullsFirst: false });

    const membersByCommittee = new Map<string, CommitteeMember[]>();
    for (const m of (memberData as unknown as (CommitteeMember & {
      committee_id: string;
    })[]) || []) {
      const existing = membersByCommittee.get(m.committee_id) || [];
      existing.push(m);
      membersByCommittee.set(m.committee_id, existing);
    }

    const prioritiesByCommittee = new Map<string, CommitteePriority[]>();
    for (const p of (priorityData as CommitteePriority[]) || []) {
      const existing = prioritiesByCommittee.get(p.committee_id) || [];
      existing.push(p);
      prioritiesByCommittee.set(p.committee_id, existing);
    }

    const committeesWithDetails: CommitteeWithDetails[] = (
      committeeData || []
    ).map((c) => {
      const rawMembers = membersByCommittee.get(c.id) || [];
      // Sort: chairs first
      const sortedMembers = [...rawMembers].sort((a, b) => {
        if (a.role === "Chair" && b.role !== "Chair") return -1;
        if (a.role !== "Chair" && b.role === "Chair") return 1;
        return 0;
      });

      return {
        ...c,
        member_count: Array.isArray(c.volunteer_committees)
          ? c.volunteer_committees[0]?.count ?? 0
          : 0,
        members: sortedMembers,
        priorities: prioritiesByCommittee.get(c.id) || [],
      };
    });

    setCommittees(committeesWithDetails);
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

  useEffect(() => {
    if (showForm) {
      setTimeout(() => firstInputRef.current?.focus(), 50);
    }
  }, [showForm]);

  useEffect(() => {
    if (addingPriorityFor) {
      setTimeout(() => priorityInputRef.current?.focus(), 50);
    }
  }, [addingPriorityFor]);

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
    if (!form.name.trim()) {
      setError("Committee name is required.");
      return;
    }

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
    refreshCounts();
  };

  const handleDelete = (c: Committee) => {
    setDeletingCommittee(c);
  };

  const confirmDelete = async () => {
    if (!deletingCommittee || !orgId || !profile) return;
    setDeleteLoading(true);

    const { error: delErr } = await supabase
      .from("committees")
      .delete()
      .eq("id", deletingCommittee.id);

    if (delErr) {
      setError(`Failed to delete committee: ${delErr.message}`);
      setDeleteLoading(false);
      setDeletingCommittee(null);
      return;
    }

    await supabase.from("audit_log").insert({
      org_id: orgId,
      user_id: profile.id,
      action: "committee.deleted",
      entity_type: "committee",
      entity_id: deletingCommittee.id,
      metadata: { name: deletingCommittee.name },
    });
    if (selectedCommittee?.id === deletingCommittee.id) setSelectedCommittee(null);
    setDeleteLoading(false);
    setDeletingCommittee(null);
    fetchCommittees();
    refreshCounts();
  };

  // --- Members Management ---
  const openMembersPanel = async (c: CommitteeWithDetails) => {
    setSelectedCommittee(c);
    setError("");
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
    const { error: delErr } = await supabase
      .from("volunteer_committees")
      .delete()
      .eq("volunteer_id", volunteerId)
      .eq("committee_id", selectedCommittee.id);

    if (delErr) {
      setError(`Failed to remove member: ${delErr.message}`);
      return;
    }

    openMembersPanel(selectedCommittee);
    fetchCommittees();
  };

  const updateMemberRole = async (volunteerId: string, role: string) => {
    if (!selectedCommittee) return;
    const { error: updateErr } = await supabase
      .from("volunteer_committees")
      .update({ role: role || "Member" })
      .eq("volunteer_id", volunteerId)
      .eq("committee_id", selectedCommittee.id);

    if (updateErr) {
      setError(`Failed to update role: ${updateErr.message}`);
    }
  };

  // --- Priority Management ---
  const addPriority = async (committeeId: string) => {
    if (!orgId || !newPriorityText.trim()) return;

    const { error: insertErr } = await supabase
      .from("committee_priorities")
      .insert({
        committee_id: committeeId,
        org_id: orgId,
        text: newPriorityText.trim(),
        due_date: newPriorityDate || null,
      });

    if (insertErr) {
      setError(insertErr.message);
      return;
    }

    setNewPriorityText("");
    setNewPriorityDate("");
    setAddingPriorityFor(null);
    fetchCommittees();
  };

  const togglePriority = async (priority: CommitteePriority) => {
    // Optimistic update — flip completed immediately
    setCommittees(prev =>
      prev.map(c => ({
        ...c,
        priorities: c.priorities.map(p =>
          p.id === priority.id ? { ...p, completed: !p.completed } : p
        ),
      }))
    );

    const { error: updateErr } = await supabase
      .from("committee_priorities")
      .update({ completed: !priority.completed })
      .eq("id", priority.id);

    if (updateErr) {
      // Revert on failure
      setCommittees(prev =>
        prev.map(c => ({
          ...c,
          priorities: c.priorities.map(p =>
            p.id === priority.id ? { ...p, completed: priority.completed } : p
          ),
        }))
      );
      setError(updateErr.message);
      return;
    }

    fetchCommittees();
  };

  const deletePriority = async (priorityId: string) => {
    const { error: delErr } = await supabase
      .from("committee_priorities")
      .delete()
      .eq("id", priorityId);

    if (delErr) {
      setError(delErr.message);
      return;
    }
    fetchCommittees();
  };

  const assignedMemberIds = members.map((m) => m.volunteer_id);

  // Summary stats
  const totalMembers = committees.reduce((sum, c) => sum + c.member_count, 0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">Committees</h1>
            <PlanLimitBadge
              usage={usageLabel("committees")}
              atLimit={!canAdd("committees")}
            />
          </div>
          {!loading && committees.length > 0 && (
            <p className="mt-1 text-sm text-gray-500">
              {committees.length} committee{committees.length !== 1 ? "s" : ""}{" "}
              &middot; {totalMembers} volunteer
              {totalMembers !== 1 ? "s" : ""} assigned
            </p>
          )}
        </div>
        {canEdit && (
          <div className="flex items-center gap-3">
            {!canAdd("committees") && (
              <UpgradePrompt
                requiredTier="starter"
                feature="create more committees"
                variant="inline"
              />
            )}
            <Button
              ref={createFormTriggerRef}
              onClick={() => setShowForm(true)}
              disabled={!canAdd("committees")}
            >
              <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
              Create Committee
            </Button>
          </div>
        )}
      </div>

      {/* Page-level error */}
      {error && !showForm && !selectedCommittee && (
        <div
          role="alert"
          aria-live="polite"
          className="rounded-lg bg-red-50 p-3 text-sm text-red-600"
        >
          {error}
        </div>
      )}

      {/* Create/Edit Form Modal */}
      {showForm && (
        <div
          ref={formDialogRef}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="committee-form-title"
          onKeyDown={(e) => {
            if (e.key === "Escape") resetForm();
          }}
        >
          <Card className="w-full max-w-md">
            <div className="mb-4 flex items-center justify-between">
              <h2
                id="committee-form-title"
                className="text-lg font-semibold text-gray-900"
              >
                {editingCommittee ? "Edit Committee" : "Create Committee"}
              </h2>
              <button
                onClick={resetForm}
                className="rounded-lg p-1 hover:bg-gray-100"
                aria-label="Close form"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {error && !selectedCommittee && (
              <div
                role="alert"
                aria-live="polite"
                className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600"
              >
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                ref={firstInputRef}
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

      {/* Members Panel Modal */}
      {selectedCommittee && (
        <div
          ref={membersDialogRef}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="members-panel-title"
          onKeyDown={(e) => {
            if (e.key === "Escape") setSelectedCommittee(null);
          }}
        >
          <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2
                  id="members-panel-title"
                  className="text-lg font-semibold text-gray-900"
                >
                  {selectedCommittee.name}
                </h2>
                <p className="text-sm text-gray-500">
                  {selectedCommittee.description ||
                    "Manage committee members"}
                </p>
              </div>
              <button
                onClick={() => setSelectedCommittee(null)}
                className="rounded-lg p-1 hover:bg-gray-100"
                aria-label="Close members panel"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {error && selectedCommittee && (
              <div
                role="alert"
                aria-live="polite"
                className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600"
              >
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
                      <label
                        className="sr-only"
                        htmlFor={`role-${m.volunteer_id}`}
                      >
                        Role for {m.volunteers.first_name}{" "}
                        {m.volunteers.last_name}
                      </label>
                      <input
                        id={`role-${m.volunteer_id}`}
                        type="text"
                        value={m.role || "Member"}
                        onChange={(e) => {
                          const newRole = e.target.value;
                          setMembers((prev) =>
                            prev.map((mem) =>
                              mem.volunteer_id === m.volunteer_id
                                ? { ...mem, role: newRole }
                                : mem
                            )
                          );
                        }}
                        onBlur={(e) =>
                          updateMemberRole(m.volunteer_id, e.target.value)
                        }
                        className="w-28 rounded border border-gray-200 px-2 py-1 text-xs text-gray-600 focus:border-blue-500 focus:outline-none"
                        placeholder="Role"
                      />
                    </div>
                    <button
                      onClick={() => removeMember(m.volunteer_id)}
                      className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-600"
                      aria-label={`Remove ${m.volunteers.first_name} ${m.volunteers.last_name}`}
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
        <ListSkeleton rows={4} label="Loading committees" />
      ) : committees.length === 0 ? (
        <EmptyState
          icon={UsersRound}
          title="No committees yet"
          description="Create committees to organize your volunteers into working groups."
          action={
            canEdit ? (
              <Button size="sm" onClick={() => setShowForm(true)}>
                <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
                Create Committee
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="space-y-4">
          {committees.map((c) => (
            <Card key={c.id} padding="sm" className="overflow-hidden">
              {/* Top Section: Header */}
              <div className="p-4 pb-0 sm:p-5 sm:pb-0">
                <div className="flex items-start justify-between gap-4">
                  {/* Left: Name, badge, description */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2.5">
                      <h3
                        className="cursor-pointer font-semibold text-gray-900 hover:text-blue-600"
                        onClick={() => openMembersPanel(c)}
                      >
                        {c.name}
                      </h3>
                      <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                        {c.member_count} member
                        {c.member_count !== 1 ? "s" : ""}
                      </span>
                    </div>
                    {c.description && (
                      <p className="mt-1 text-sm text-gray-500 line-clamp-1">
                        {c.description}
                      </p>
                    )}
                  </div>

                  {/* Right: Avatars + Actions */}
                  <div className="flex items-center gap-3">
                    {/* Member avatars */}
                    {c.members.length > 0 && (
                      <div
                        className="hidden sm:flex items-center -space-x-1.5 cursor-pointer"
                        onClick={() => openMembersPanel(c)}
                        title="View members"
                      >
                        {c.members.slice(0, 3).map((m) => {
                          const name = `${m.volunteers.first_name} ${m.volunteers.last_name}`;
                          return (
                            <div
                              key={m.volunteer_id}
                              className={`flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-semibold text-white ring-2 ring-white ${getAvatarColor(name)}`}
                              title={`${name}${m.role === "Chair" ? " (Chair)" : ""}`}
                            >
                              {getInitials(
                                m.volunteers.first_name,
                                m.volunteers.last_name
                              )}
                            </div>
                          );
                        })}
                        {c.members.length > 3 && (
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-200 text-[10px] font-semibold text-gray-600 ring-2 ring-white">
                            +{c.members.length - 3}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Edit / Delete buttons */}
                    {canEdit && (
                      <div className="flex gap-0.5">
                        <button
                          onClick={() => openEdit(c)}
                          className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                          aria-label={`Edit ${c.name}`}
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        {canDeletePerm && (
                          <button
                            onClick={() => handleDelete(c)}
                            className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
                            aria-label={`Delete ${c.name}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Bottom Section: Priorities */}
              <div className="mt-3 border-t border-gray-100 px-4 py-3 sm:px-5">
                {c.priorities.length === 0 && !canEdit ? (
                  <p className="text-sm text-gray-400 italic">
                    No priorities set
                  </p>
                ) : (
                  <div className="space-y-1.5">
                    {c.priorities.slice(0, 3).map((p) => {
                      const dueInfo = getDueDateLabel(p.due_date);
                      return (
                        <div
                          key={p.id}
                          className="group flex items-center gap-3"
                        >
                          {/* Checkbox */}
                          {canEdit ? (
                            <button
                              onClick={() => togglePriority(p)}
                              className="flex-shrink-0 text-gray-400 hover:text-blue-600"
                              aria-label={
                                p.completed
                                  ? `Mark "${p.text}" incomplete`
                                  : `Mark "${p.text}" complete`
                              }
                            >
                              {p.completed ? (
                                <CheckSquare className="h-4 w-4 text-green-500" />
                              ) : (
                                <Square className="h-4 w-4" />
                              )}
                            </button>
                          ) : (
                            <span className="flex-shrink-0">
                              {p.completed ? (
                                <CheckSquare className="h-4 w-4 text-green-500" />
                              ) : (
                                <Square className="h-4 w-4 text-gray-300" />
                              )}
                            </span>
                          )}

                          {/* Task text */}
                          <span
                            className={`flex-1 text-sm ${
                              p.completed
                                ? "text-gray-400 line-through"
                                : "text-gray-700"
                            }`}
                          >
                            {p.text}
                          </span>

                          {/* Due date */}
                          {dueInfo.label && (
                            <span
                              className={`flex-shrink-0 text-xs ${
                                p.completed ? "text-gray-300" : dueInfo.className
                              }`}
                            >
                              {dueInfo.label}
                            </span>
                          )}

                          {/* Delete priority (on hover) */}
                          {canEdit && (
                            <button
                              onClick={() => deletePriority(p.id)}
                              className="flex-shrink-0 opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 transition-opacity"
                              aria-label={`Delete priority "${p.text}"`}
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      );
                    })}

                    {c.priorities.length > 3 && (
                      <p className="text-xs text-gray-400 pl-7">
                        +{c.priorities.length - 3} more
                      </p>
                    )}
                  </div>
                )}

                {/* Add priority inline form */}
                {canEdit && addingPriorityFor === c.id ? (
                  <div className="mt-2 flex items-center gap-2">
                    <input
                      ref={priorityInputRef}
                      type="text"
                      value={newPriorityText}
                      onChange={(e) => setNewPriorityText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addPriority(c.id);
                        }
                        if (e.key === "Escape") {
                          setAddingPriorityFor(null);
                          setNewPriorityText("");
                          setNewPriorityDate("");
                        }
                      }}
                      placeholder="Priority text..."
                      className="flex-1 rounded border border-gray-200 px-2.5 py-1.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <input
                      type="date"
                      value={newPriorityDate}
                      onChange={(e) => setNewPriorityDate(e.target.value)}
                      className="rounded border border-gray-200 px-2 py-1.5 text-sm text-gray-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <button
                      onClick={() => addPriority(c.id)}
                      disabled={!newPriorityText.trim()}
                      className="rounded-lg bg-blue-600 p-1.5 text-white hover:bg-blue-700 disabled:opacity-50"
                      aria-label="Save priority"
                    >
                      <Check className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        setAddingPriorityFor(null);
                        setNewPriorityText("");
                        setNewPriorityDate("");
                      }}
                      className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100"
                      aria-label="Cancel"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  canEdit && (
                    <button
                      onClick={() => {
                        setAddingPriorityFor(c.id);
                        setNewPriorityText("");
                        setNewPriorityDate("");
                      }}
                      className="mt-2 flex items-center gap-1 text-xs text-gray-400 hover:text-blue-600"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add priority
                    </button>
                  )
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deletingCommittee && (
        <ConfirmDeleteDialog
          name={deletingCommittee.name}
          entityType="committee"
          onConfirm={confirmDelete}
          onCancel={() => setDeletingCommittee(null)}
          loading={deleteLoading}
        />
      )}
    </div>
  );
}
