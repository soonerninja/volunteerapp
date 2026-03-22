"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate } from "@/utils/format";
import type { Volunteer, Skill, SkillCategory } from "@/types/database";
import {
  Users,
  Plus,
  Search,
  X,
  ChevronDown,
  Edit2,
  Trash2,
  Phone,
  Mail,
  Award,
  Lightbulb,
  Wrench,
  AlertTriangle,
} from "lucide-react";

type VolunteerSkillAssignment = {
  skill_id: string;
  earned_date: string | null;
  expires_date: string | null;
  notes: string | null;
  skill: Skill;
};

type VolunteerWithSkills = Volunteer & {
  skillAssignments: VolunteerSkillAssignment[];
};

const STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "on_leave", label: "On Leave" },
];

const STATUS_COLORS: Record<string, string> = {
  active: "bg-green-100 text-green-700",
  inactive: "bg-gray-100 text-gray-700",
  on_leave: "bg-amber-100 text-amber-700",
};

const CATEGORY_BADGE: Record<
  SkillCategory,
  { color: string; icon: typeof Wrench }
> = {
  skill: { color: "bg-blue-50 text-blue-600", icon: Wrench },
  certification: { color: "bg-purple-50 text-purple-600", icon: Award },
  interest: { color: "bg-green-50 text-green-600", icon: Lightbulb },
};

const CATEGORY_LABELS: Record<SkillCategory, string> = {
  skill: "Skills",
  certification: "Certifications",
  interest: "Interests",
};

const CATEGORIES: SkillCategory[] = ["skill", "certification", "interest"];

export default function VolunteersPage() {
  const { profile } = useAuth();
  const supabase = createClient();
  const orgId = profile?.org_id;

  const [volunteers, setVolunteers] = useState<VolunteerWithSkills[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingVolunteer, setEditingVolunteer] =
    useState<VolunteerWithSkills | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Form state
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    status: "active" as string,
    notes: "",
    joined_date: new Date().toISOString().split("T")[0],
    // Skill assignments: skill_id -> { selected, earned_date, expires_date }
    skillSelections: {} as Record<
      string,
      { selected: boolean; earned_date: string; expires_date: string }
    >,
  });

  const fetchVolunteers = useCallback(async () => {
    if (!orgId) return;
    setLoading(true);

    const { data: vols } = await supabase
      .from("volunteers")
      .select("*")
      .eq("org_id", orgId)
      .order("last_name", { ascending: true });

    const volIds = (vols || []).map((v) => v.id);
    let volSkills: VolunteerSkillAssignment[] = [];
    if (volIds.length > 0) {
      const { data } = await supabase
        .from("volunteer_skills")
        .select(
          "volunteer_id, skill_id, earned_date, expires_date, notes, skills(id, name, org_id, category, created_at)"
        )
        .in("volunteer_id", volIds);

      volSkills = (data || []).map((vs) => ({
        ...vs,
        skill: vs.skills as unknown as Skill,
      })) as unknown as (VolunteerSkillAssignment & {
        volunteer_id: string;
      })[];
    }

    const volunteersWithSkills: VolunteerWithSkills[] = (vols || []).map(
      (v) => ({
        ...v,
        skillAssignments: (
          volSkills as unknown as (VolunteerSkillAssignment & {
            volunteer_id: string;
          })[]
        )
          .filter((vs) => vs.volunteer_id === v.id)
          .map((vs) => ({
            skill_id: vs.skill_id,
            earned_date: vs.earned_date,
            expires_date: vs.expires_date,
            notes: vs.notes,
            skill: vs.skill,
          })),
      })
    );

    setVolunteers(volunteersWithSkills);
    setLoading(false);
  }, [orgId, supabase]);

  const fetchSkills = useCallback(async () => {
    if (!orgId) return;
    const { data } = await supabase
      .from("skills")
      .select("*")
      .eq("org_id", orgId)
      .order("name");
    setSkills(data || []);
  }, [orgId, supabase]);

  useEffect(() => {
    fetchVolunteers();
    fetchSkills();
  }, [fetchVolunteers, fetchSkills]);

  const resetForm = () => {
    setForm({
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      status: "active",
      notes: "",
      joined_date: new Date().toISOString().split("T")[0],
      skillSelections: {},
    });
    setEditingVolunteer(null);
    setShowForm(false);
    setError("");
  };

  const openEdit = (vol: VolunteerWithSkills) => {
    setEditingVolunteer(vol);
    const skillSelections: Record<
      string,
      { selected: boolean; earned_date: string; expires_date: string }
    > = {};
    vol.skillAssignments.forEach((sa) => {
      skillSelections[sa.skill_id] = {
        selected: true,
        earned_date: sa.earned_date || "",
        expires_date: sa.expires_date || "",
      };
    });
    setForm({
      first_name: vol.first_name,
      last_name: vol.last_name,
      email: vol.email || "",
      phone: vol.phone || "",
      status: vol.status,
      notes: vol.notes || "",
      joined_date: vol.joined_date || "",
      skillSelections,
    });
    setShowForm(true);
    setError("");
  };

  const toggleSkill = (skillId: string) => {
    setForm((prev) => {
      const current = prev.skillSelections[skillId];
      return {
        ...prev,
        skillSelections: {
          ...prev.skillSelections,
          [skillId]: current?.selected
            ? { selected: false, earned_date: "", expires_date: "" }
            : {
                selected: true,
                earned_date: current?.earned_date || "",
                expires_date: current?.expires_date || "",
              },
        },
      };
    });
  };

  const updateSkillDate = (
    skillId: string,
    field: "earned_date" | "expires_date",
    value: string
  ) => {
    setForm((prev) => ({
      ...prev,
      skillSelections: {
        ...prev.skillSelections,
        [skillId]: {
          ...prev.skillSelections[skillId],
          [field]: value,
        },
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgId || !profile) return;
    setSaving(true);
    setError("");

    const volunteerData = {
      org_id: orgId,
      first_name: form.first_name.trim(),
      last_name: form.last_name.trim(),
      email: form.email.trim() || null,
      phone: form.phone.trim() || null,
      status: form.status,
      notes: form.notes.trim() || null,
      joined_date: form.joined_date || null,
    };

    let volunteerId: string;

    if (editingVolunteer) {
      const { error: updateErr } = await supabase
        .from("volunteers")
        .update(volunteerData)
        .eq("id", editingVolunteer.id);

      if (updateErr) {
        setError(updateErr.message);
        setSaving(false);
        return;
      }
      volunteerId = editingVolunteer.id;

      // Remove old skills
      await supabase
        .from("volunteer_skills")
        .delete()
        .eq("volunteer_id", volunteerId);

      await supabase.from("audit_log").insert({
        org_id: orgId,
        user_id: profile.id,
        action: "volunteer.updated",
        entity_type: "volunteer",
        entity_id: volunteerId,
        metadata: { name: `${form.first_name} ${form.last_name}` },
      });
    } else {
      const { data: newVol, error: insertErr } = await supabase
        .from("volunteers")
        .insert(volunteerData)
        .select()
        .single();

      if (insertErr || !newVol) {
        setError(insertErr?.message || "Failed to create volunteer");
        setSaving(false);
        return;
      }
      volunteerId = newVol.id;

      await supabase.from("audit_log").insert({
        org_id: orgId,
        user_id: profile.id,
        action: "volunteer.created",
        entity_type: "volunteer",
        entity_id: volunteerId,
        metadata: { name: `${form.first_name} ${form.last_name}` },
      });
    }

    // Insert selected skills with dates
    const selectedSkills = Object.entries(form.skillSelections)
      .filter(([, val]) => val.selected)
      .map(([skillId, val]) => ({
        volunteer_id: volunteerId,
        skill_id: skillId,
        earned_date: val.earned_date || null,
        expires_date: val.expires_date || null,
      }));

    if (selectedSkills.length > 0) {
      await supabase.from("volunteer_skills").insert(selectedSkills);
    }

    setSaving(false);
    resetForm();
    fetchVolunteers();
  };

  const handleDelete = async (vol: Volunteer) => {
    if (!confirm(`Delete ${vol.first_name} ${vol.last_name}?`)) return;
    if (!orgId || !profile) return;

    await supabase.from("volunteers").delete().eq("id", vol.id);
    await supabase.from("audit_log").insert({
      org_id: orgId,
      user_id: profile.id,
      action: "volunteer.deleted",
      entity_type: "volunteer",
      entity_id: vol.id,
      metadata: { name: `${vol.first_name} ${vol.last_name}` },
    });
    fetchVolunteers();
  };

  // Filter volunteers
  const filtered = volunteers.filter((v) => {
    const matchesSearch =
      !search ||
      `${v.first_name} ${v.last_name} ${v.email || ""}`
        .toLowerCase()
        .includes(search.toLowerCase());
    const matchesStatus = !statusFilter || v.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Check if a certification is expiring within 30 days
  const isExpiringSoon = (expiresDate: string | null): boolean => {
    if (!expiresDate) return false;
    const expires = new Date(expiresDate);
    const now = new Date();
    const thirtyDays = 30 * 24 * 60 * 60 * 1000;
    return expires.getTime() - now.getTime() < thirtyDays && expires >= now;
  };

  const isExpired = (expiresDate: string | null): boolean => {
    if (!expiresDate) return false;
    return new Date(expiresDate) < new Date();
  };

  // Group skills by category for the form
  const skillsByCategory = CATEGORIES.reduce(
    (acc, cat) => {
      acc[cat] = skills.filter((s) => s.category === cat);
      return acc;
    },
    {} as Record<SkillCategory, Skill[]>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Volunteers</h1>
          <p className="text-sm text-gray-500">
            {volunteers.length} total volunteer
            {volunteers.length !== 1 && "s"}
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Volunteer
        </Button>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="block w-full appearance-none rounded-lg border border-gray-300 bg-white px-3 py-2 pr-8 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingVolunteer ? "Edit Volunteer" : "Add Volunteer"}
              </h2>
              <button
                onClick={resetForm}
                className="rounded-lg p-1 hover:bg-gray-100"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {error && (
              <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="First Name *"
                  id="first_name"
                  value={form.first_name}
                  onChange={(e) =>
                    setForm({ ...form, first_name: e.target.value })
                  }
                  required
                />
                <Input
                  label="Last Name *"
                  id="last_name"
                  value={form.last_name}
                  onChange={(e) =>
                    setForm({ ...form, last_name: e.target.value })
                  }
                  required
                />
              </div>
              <Input
                label="Email"
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
              <Input
                label="Phone"
                id="phone"
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Status
                </label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="on_leave">On Leave</option>
                </select>
              </div>
              <Input
                label="Join Date"
                id="joined_date"
                type="date"
                value={form.joined_date}
                onChange={(e) =>
                  setForm({ ...form, joined_date: e.target.value })
                }
              />

              {/* Categorized skill selection */}
              {CATEGORIES.map((cat) => {
                const catSkills = skillsByCategory[cat];
                if (catSkills.length === 0) return null;
                const config = CATEGORY_BADGE[cat];
                const Icon = config.icon;

                return (
                  <div key={cat}>
                    <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-gray-700">
                      <Icon className="h-3.5 w-3.5" />
                      {CATEGORY_LABELS[cat]}
                    </label>
                    <div className="space-y-2">
                      {catSkills.map((skill) => {
                        const sel = form.skillSelections[skill.id];
                        const isSelected = sel?.selected;
                        const isCert = cat === "certification";

                        return (
                          <div key={skill.id}>
                            <button
                              type="button"
                              onClick={() => toggleSkill(skill.id)}
                              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                                isSelected
                                  ? config.color
                                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                              }`}
                            >
                              {skill.name}
                            </button>
                            {/* Show date fields for selected certifications */}
                            {isSelected && isCert && (
                              <div className="mt-1.5 ml-2 flex gap-2">
                                <div className="flex-1">
                                  <label className="mb-0.5 block text-xs text-gray-500">
                                    Earned
                                  </label>
                                  <input
                                    type="date"
                                    value={sel?.earned_date || ""}
                                    onChange={(e) =>
                                      updateSkillDate(
                                        skill.id,
                                        "earned_date",
                                        e.target.value
                                      )
                                    }
                                    className="w-full rounded border border-gray-200 px-2 py-1 text-xs"
                                  />
                                </div>
                                <div className="flex-1">
                                  <label className="mb-0.5 block text-xs text-gray-500">
                                    Expires
                                  </label>
                                  <input
                                    type="date"
                                    value={sel?.expires_date || ""}
                                    onChange={(e) =>
                                      updateSkillDate(
                                        skill.id,
                                        "expires_date",
                                        e.target.value
                                      )
                                    }
                                    className="w-full rounded border border-gray-200 px-2 py-1 text-xs"
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              <div>
                <label
                  htmlFor="notes"
                  className="mb-1.5 block text-sm font-medium text-gray-700"
                >
                  Notes
                </label>
                <textarea
                  id="notes"
                  rows={3}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="secondary" onClick={resetForm}>
                  Cancel
                </Button>
                <Button type="submit" loading={saving}>
                  {editingVolunteer ? "Save Changes" : "Add Volunteer"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Volunteer List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title={
            volunteers.length === 0
              ? "No volunteers yet"
              : "No volunteers match your filters"
          }
          description={
            volunteers.length === 0
              ? "Add your first volunteer to get started."
              : "Try adjusting your search or filter criteria."
          }
          action={
            volunteers.length === 0 ? (
              <Button size="sm" onClick={() => setShowForm(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Volunteer
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((vol) => {
            // Group this volunteer's skills by category
            const volSkillsByCategory = CATEGORIES.reduce(
              (acc, cat) => {
                acc[cat] = vol.skillAssignments.filter(
                  (sa) => sa.skill?.category === cat
                );
                return acc;
              },
              {} as Record<SkillCategory, VolunteerSkillAssignment[]>
            );

            return (
              <Card key={vol.id} padding="sm">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-gray-900">
                        {vol.first_name} {vol.last_name}
                      </h3>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[vol.status]}`}
                      >
                        {vol.status === "on_leave"
                          ? "On Leave"
                          : vol.status.charAt(0).toUpperCase() +
                            vol.status.slice(1)}
                      </span>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
                      {vol.email && (
                        <span className="flex items-center gap-1">
                          <Mail className="h-3.5 w-3.5" />
                          {vol.email}
                        </span>
                      )}
                      {vol.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="h-3.5 w-3.5" />
                          {vol.phone}
                        </span>
                      )}
                      {vol.joined_date && (
                        <span>Joined {formatDate(vol.joined_date)}</span>
                      )}
                    </div>

                    {/* Categorized skill badges */}
                    {vol.skillAssignments.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {CATEGORIES.map((cat) => {
                          const assignments = volSkillsByCategory[cat];
                          if (assignments.length === 0) return null;
                          const badgeConfig = CATEGORY_BADGE[cat];

                          return (
                            <div
                              key={cat}
                              className="flex flex-wrap items-center gap-1"
                            >
                              {assignments.map((sa) => {
                                const expired = isExpired(sa.expires_date);
                                const expiring = isExpiringSoon(
                                  sa.expires_date
                                );
                                let badgeClass = badgeConfig.color;
                                if (expired)
                                  badgeClass =
                                    "bg-red-50 text-red-600 line-through";
                                else if (expiring)
                                  badgeClass = "bg-amber-50 text-amber-700";

                                return (
                                  <span
                                    key={sa.skill_id}
                                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs ${badgeClass}`}
                                    title={
                                      cat === "certification"
                                        ? [
                                            sa.earned_date &&
                                              `Earned: ${formatDate(sa.earned_date)}`,
                                            sa.expires_date &&
                                              `Expires: ${formatDate(sa.expires_date)}`,
                                            expired && "EXPIRED",
                                            expiring && "Expiring soon",
                                          ]
                                            .filter(Boolean)
                                            .join(" | ") || undefined
                                        : undefined
                                    }
                                  >
                                    {(expired || expiring) && (
                                      <AlertTriangle className="h-3 w-3" />
                                    )}
                                    {sa.skill?.name}
                                  </span>
                                );
                              })}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => openEdit(vol)}
                      className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                      title="Edit"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(vol)}
                      className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
