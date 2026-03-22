"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate } from "@/utils/format";
import type { Volunteer, Skill, Role } from "@/types/database";
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
  Shield,
} from "lucide-react";

type VolunteerWithDetails = Volunteer & {
  skillIds: string[];
  roleIds: string[];
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

export default function VolunteersPage() {
  const { profile } = useAuth();
  const supabase = createClient();
  const orgId = profile?.org_id;

  const [volunteers, setVolunteers] = useState<VolunteerWithDetails[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingVolunteer, setEditingVolunteer] =
    useState<VolunteerWithDetails | null>(null);
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
    selectedSkills: {} as Record<string, boolean>,
    selectedRoles: {} as Record<string, boolean>,
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
    let volSkills: { volunteer_id: string; skill_id: string }[] = [];
    let volRoles: { volunteer_id: string; role_id: string }[] = [];

    if (volIds.length > 0) {
      const [skillsRes, rolesRes] = await Promise.all([
        supabase
          .from("volunteer_skills")
          .select("volunteer_id, skill_id")
          .in("volunteer_id", volIds),
        supabase
          .from("volunteer_roles")
          .select("volunteer_id, role_id")
          .in("volunteer_id", volIds),
      ]);
      volSkills = skillsRes.data || [];
      volRoles = rolesRes.data || [];
    }

    const volunteersWithDetails: VolunteerWithDetails[] = (vols || []).map(
      (v) => ({
        ...v,
        skillIds: volSkills
          .filter((vs) => vs.volunteer_id === v.id)
          .map((vs) => vs.skill_id),
        roleIds: volRoles
          .filter((vr) => vr.volunteer_id === v.id)
          .map((vr) => vr.role_id),
      })
    );

    setVolunteers(volunteersWithDetails);
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

  const fetchRoles = useCallback(async () => {
    if (!orgId) return;
    const { data } = await supabase
      .from("roles")
      .select("*")
      .eq("org_id", orgId)
      .order("name");
    setRoles(data || []);
  }, [orgId, supabase]);

  useEffect(() => {
    fetchVolunteers();
    fetchSkills();
    fetchRoles();
  }, [fetchVolunteers, fetchSkills, fetchRoles]);

  const resetForm = () => {
    setForm({
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      status: "active",
      notes: "",
      joined_date: new Date().toISOString().split("T")[0],
      selectedSkills: {},
      selectedRoles: {},
    });
    setEditingVolunteer(null);
    setShowForm(false);
    setError("");
  };

  const openEdit = (vol: VolunteerWithDetails) => {
    setEditingVolunteer(vol);
    const selectedSkills: Record<string, boolean> = {};
    vol.skillIds.forEach((id) => {
      selectedSkills[id] = true;
    });
    const selectedRoles: Record<string, boolean> = {};
    vol.roleIds.forEach((id) => {
      selectedRoles[id] = true;
    });
    setForm({
      first_name: vol.first_name,
      last_name: vol.last_name,
      email: vol.email || "",
      phone: vol.phone || "",
      status: vol.status,
      notes: vol.notes || "",
      joined_date: vol.joined_date || "",
      selectedSkills,
      selectedRoles,
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

      // Remove old skills and roles
      await Promise.all([
        supabase
          .from("volunteer_skills")
          .delete()
          .eq("volunteer_id", volunteerId),
        supabase
          .from("volunteer_roles")
          .delete()
          .eq("volunteer_id", volunteerId),
      ]);

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

    // Insert selected skills
    const selectedSkillIds = Object.entries(form.selectedSkills)
      .filter(([, selected]) => selected)
      .map(([skillId]) => ({
        volunteer_id: volunteerId,
        skill_id: skillId,
      }));

    // Insert selected roles
    const selectedRoleIds = Object.entries(form.selectedRoles)
      .filter(([, selected]) => selected)
      .map(([roleId]) => ({
        volunteer_id: volunteerId,
        role_id: roleId,
      }));

    await Promise.all([
      selectedSkillIds.length > 0
        ? supabase.from("volunteer_skills").insert(selectedSkillIds)
        : Promise.resolve(),
      selectedRoleIds.length > 0
        ? supabase.from("volunteer_roles").insert(selectedRoleIds)
        : Promise.resolve(),
    ]);

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

  // Map skill/role IDs to names for display
  const skillMap = new Map(skills.map((s) => [s.id, s.name]));
  const roleMap = new Map(roles.map((r) => [r.id, r.name]));

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

              {/* Skills - simple checkboxes like the original */}
              {skills.length > 0 && (
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Skills & Programs
                  </label>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                    {skills.map((skill) => (
                      <label
                        key={skill.id}
                        className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={!!form.selectedSkills[skill.id]}
                          onChange={() =>
                            setForm((prev) => ({
                              ...prev,
                              selectedSkills: {
                                ...prev.selectedSkills,
                                [skill.id]: !prev.selectedSkills[skill.id],
                              },
                            }))
                          }
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        {skill.name}
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Roles */}
              {roles.length > 0 && (
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Roles
                  </label>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                    {roles.map((role) => (
                      <label
                        key={role.id}
                        className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={!!form.selectedRoles[role.id]}
                          onChange={() =>
                            setForm((prev) => ({
                              ...prev,
                              selectedRoles: {
                                ...prev.selectedRoles,
                                [role.id]: !prev.selectedRoles[role.id],
                              },
                            }))
                          }
                          className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        />
                        {role.name}
                      </label>
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
            const volSkillNames = vol.skillIds
              .map((id) => skillMap.get(id))
              .filter(Boolean);
            const volRoleNames = vol.roleIds
              .map((id) => roleMap.get(id))
              .filter(Boolean);

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

                    {/* Roles */}
                    {volRoleNames.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {volRoleNames.map((name) => (
                          <span
                            key={name}
                            className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2 py-0.5 text-xs text-purple-700"
                          >
                            <Shield className="h-3 w-3" />
                            {name}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Skills */}
                    {volSkillNames.length > 0 && (
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        {volSkillNames.map((name) => (
                          <span
                            key={name}
                            className="rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-600"
                          >
                            {name}
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
            );
          })}
        </div>
      )}
    </div>
  );
}
