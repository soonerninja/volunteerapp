"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate } from "@/utils/format";
import type { Volunteer, Skill } from "@/types/database";
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
} from "lucide-react";

type VolunteerWithSkills = Volunteer & { skills: Skill[] };

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
    skill_ids: [] as string[],
  });

  const fetchVolunteers = useCallback(async () => {
    if (!orgId) return;
    setLoading(true);

    const { data: vols } = await supabase
      .from("volunteers")
      .select("*")
      .eq("org_id", orgId)
      .order("last_name", { ascending: true });

    const { data: volSkills } = await supabase
      .from("volunteer_skills")
      .select("volunteer_id, skill_id, skills(id, name, org_id, created_at)")
      .in(
        "volunteer_id",
        (vols || []).map((v) => v.id)
      );

    const volunteersWithSkills: VolunteerWithSkills[] = (vols || []).map(
      (v) => ({
        ...v,
        skills: (volSkills || [])
          .filter((vs) => vs.volunteer_id === v.id)
          .map((vs) => vs.skills as unknown as Skill)
          .filter(Boolean),
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
      skill_ids: [],
    });
    setEditingVolunteer(null);
    setShowForm(false);
    setError("");
  };

  const openEdit = (vol: VolunteerWithSkills) => {
    setEditingVolunteer(vol);
    setForm({
      first_name: vol.first_name,
      last_name: vol.last_name,
      email: vol.email || "",
      phone: vol.phone || "",
      status: vol.status,
      notes: vol.notes || "",
      joined_date: vol.joined_date || "",
      skill_ids: vol.skills.map((s) => s.id),
    });
    setShowForm(true);
    setError("");
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

      // Update skills
      await supabase
        .from("volunteer_skills")
        .delete()
        .eq("volunteer_id", editingVolunteer.id);

      if (form.skill_ids.length > 0) {
        await supabase.from("volunteer_skills").insert(
          form.skill_ids.map((sid) => ({
            volunteer_id: editingVolunteer.id,
            skill_id: sid,
          }))
        );
      }

      // Audit log
      await supabase.from("audit_log").insert({
        org_id: orgId,
        user_id: profile.id,
        action: "volunteer.updated",
        entity_type: "volunteer",
        entity_id: editingVolunteer.id,
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

      if (form.skill_ids.length > 0) {
        await supabase.from("volunteer_skills").insert(
          form.skill_ids.map((sid) => ({
            volunteer_id: newVol.id,
            skill_id: sid,
          }))
        );
      }

      await supabase.from("audit_log").insert({
        org_id: orgId,
        user_id: profile.id,
        action: "volunteer.created",
        entity_type: "volunteer",
        entity_id: newVol.id,
        metadata: { name: `${form.first_name} ${form.last_name}` },
      });
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

  const toggleSkill = (skillId: string) => {
    setForm((prev) => ({
      ...prev,
      skill_ids: prev.skill_ids.includes(skillId)
        ? prev.skill_ids.filter((id) => id !== skillId)
        : [...prev.skill_ids, skillId],
    }));
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Volunteers</h1>
          <p className="text-sm text-gray-500">
            {volunteers.length} total volunteer{volunteers.length !== 1 && "s"}
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
              {skills.length > 0 && (
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Skills
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill) => (
                      <button
                        key={skill.id}
                        type="button"
                        onClick={() => toggleSkill(skill.id)}
                        className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                          form.skill_ids.includes(skill.id)
                            ? "bg-blue-100 text-blue-700"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        {skill.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
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
              ? 'Add your first volunteer to get started.'
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
          {filtered.map((vol) => (
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
                  {vol.skills.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {vol.skills.map((skill) => (
                        <span
                          key={skill.id}
                          className="rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-600"
                        >
                          {skill.name}
                        </span>
                      ))}
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
          ))}
        </div>
      )}
    </div>
  );
}
