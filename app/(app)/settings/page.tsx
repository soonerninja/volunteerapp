"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useOrg } from "@/hooks/use-org";
import { usePermissions } from "@/hooks/use-permissions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog";
import { seedSampleData } from "@/lib/seed-data";
import type { Organization, Profile, Skill, Role, TeamInvite } from "@/types/database";
import {
  Building2,
  Users,
  Tag,
  Shield,
  Plus,
  X,
  Save,
  Mail,
  Clock,
  Trash2,
  Database,
  AlertTriangle,
  MapPin,
} from "lucide-react";
import { useGuidedTour } from "@/hooks/use-guided-tour";

const ROLE_LABELS: Record<string, string> = {
  owner: "Owner",
  admin: "Admin",
  editor: "Editor",
  viewer: "Viewer",
};

const ROLE_COLORS: Record<string, string> = {
  owner: "bg-blue-50 text-blue-700",
  admin: "bg-purple-50 text-purple-700",
  editor: "bg-green-50 text-green-700",
  viewer: "bg-gray-100 text-gray-700",
};

const INVITABLE_ROLES = [
  { value: "admin", label: "Admin" },
  { value: "editor", label: "Editor" },
  { value: "viewer", label: "Viewer" },
];

const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA",
  "HI","ID","IL","IN","IA","KS","KY","LA","ME","MD",
  "MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC",
  "SD","TN","TX","UT","VT","VA","WA","WV","WI","WY","DC",
];

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

const COMMON_TIMEZONES = [
  // US timezones
  { value: "America/New_York", label: "Eastern Time (US & Canada)" },
  { value: "America/Indiana/Indianapolis", label: "Indiana (East)" },
  { value: "America/Detroit", label: "Eastern Time - Michigan" },
  { value: "America/Chicago", label: "Central Time (US & Canada)" },
  { value: "America/Indiana/Knox", label: "Indiana (Northwest)" },
  { value: "America/Menominee", label: "Central Time - Michigan (Upper Peninsula)" },
  { value: "America/Denver", label: "Mountain Time (US & Canada)" },
  { value: "America/Boise", label: "Mountain Time - Idaho" },
  { value: "America/Phoenix", label: "Arizona (no DST)" },
  { value: "America/Los_Angeles", label: "Pacific Time (US & Canada)" },
  { value: "America/Anchorage", label: "Alaska" },
  { value: "America/Juneau", label: "Alaska - Juneau" },
  { value: "Pacific/Honolulu", label: "Hawaii" },
  // Canada
  { value: "America/Halifax", label: "Atlantic Time (Canada)" },
  { value: "America/St_Johns", label: "Newfoundland" },
  { value: "America/Toronto", label: "Eastern Time - Toronto" },
  { value: "America/Winnipeg", label: "Central Time - Winnipeg" },
  { value: "America/Edmonton", label: "Mountain Time - Edmonton" },
  { value: "America/Vancouver", label: "Pacific Time - Vancouver" },
  // Latin America
  { value: "America/Mexico_City", label: "Mexico City" },
  { value: "America/Bogota", label: "Bogota, Lima, Quito" },
  { value: "America/Caracas", label: "Caracas" },
  { value: "America/Santiago", label: "Santiago" },
  { value: "America/Sao_Paulo", label: "Brasilia" },
  { value: "America/Argentina/Buenos_Aires", label: "Buenos Aires" },
  // Europe
  { value: "Europe/London", label: "London, Edinburgh, Dublin" },
  { value: "Europe/Lisbon", label: "Lisbon" },
  { value: "Europe/Paris", label: "Paris, Madrid, Brussels" },
  { value: "Europe/Berlin", label: "Berlin, Amsterdam, Vienna" },
  { value: "Europe/Rome", label: "Rome, Prague, Warsaw" },
  { value: "Europe/Athens", label: "Athens, Bucharest" },
  { value: "Europe/Helsinki", label: "Helsinki, Kyiv, Riga" },
  { value: "Europe/Istanbul", label: "Istanbul" },
  { value: "Europe/Moscow", label: "Moscow, St. Petersburg" },
  // Africa
  { value: "Africa/Cairo", label: "Cairo" },
  { value: "Africa/Johannesburg", label: "Johannesburg, Harare" },
  { value: "Africa/Lagos", label: "West Central Africa" },
  { value: "Africa/Nairobi", label: "Nairobi" },
  // Asia
  { value: "Asia/Dubai", label: "Abu Dhabi, Muscat" },
  { value: "Asia/Karachi", label: "Karachi, Islamabad" },
  { value: "Asia/Kolkata", label: "Mumbai, Kolkata, New Delhi" },
  { value: "Asia/Dhaka", label: "Dhaka" },
  { value: "Asia/Bangkok", label: "Bangkok, Hanoi, Jakarta" },
  { value: "Asia/Singapore", label: "Singapore, Kuala Lumpur" },
  { value: "Asia/Shanghai", label: "Beijing, Shanghai, Hong Kong" },
  { value: "Asia/Tokyo", label: "Tokyo, Osaka, Sapporo" },
  { value: "Asia/Seoul", label: "Seoul" },
  // Pacific
  { value: "Australia/Perth", label: "Perth" },
  { value: "Australia/Adelaide", label: "Adelaide" },
  { value: "Australia/Sydney", label: "Sydney, Melbourne, Brisbane" },
  { value: "Pacific/Auckland", label: "Auckland, Wellington" },
  { value: "Pacific/Fiji", label: "Fiji" },
  { value: "Pacific/Guam", label: "Guam, Port Moresby" },
];

export default function SettingsPage() {
  const { supabase, orgId, profile, refreshProfile } = useOrg();
  const { canManageTeam, canManageConfig, canEdit } = usePermissions();
  const { restartTour } = useGuidedTour();

  const [activeTab, setActiveTab] = useState<
    "organization" | "team" | "skills" | "roles"
  >("organization");

  // Org settings
  const [org, setOrg] = useState<Organization | null>(null);
  const [orgName, setOrgName] = useState("");
  const [orgDescription, setOrgDescription] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [timezone, setTimezone] = useState("");
  const [fiscalYearStart, setFiscalYearStart] = useState(1);
  const [savingOrg, setSavingOrg] = useState(false);
  const [orgMsg, setOrgMsg] = useState("");

  // Delete org
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmName, setDeleteConfirmName] = useState("");
  const [deleting, setDeleting] = useState(false);

  // Team
  const [teamMembers, setTeamMembers] = useState<Profile[]>([]);
  const [loadingTeam, setLoadingTeam] = useState(true);

  // Invites
  const [invites, setInvites] = useState<TeamInvite[]>([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("editor");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState("");
  const [inviteSuccess, setInviteSuccess] = useState("");
  const [inviteTableExists, setInviteTableExists] = useState(true);
  const inviteEmailRef = useRef<HTMLInputElement>(null);

  // Skills
  const [skills, setSkills] = useState<Skill[]>([]);
  const [newSkillName, setNewSkillName] = useState("");
  const [loadingSkills, setLoadingSkills] = useState(true);
  const [skillError, setSkillError] = useState("");
  const [deletingSkill, setDeletingSkill] = useState<Skill | null>(null);
  const [deleteSkillLoading, setDeleteSkillLoading] = useState(false);

  // Roles
  const [roles, setRoles] = useState<Role[]>([]);
  const [newRoleName, setNewRoleName] = useState("");
  const [loadingRoles, setLoadingRoles] = useState(true);
  const [roleError, setRoleError] = useState("");
  const [deletingRole, setDeletingRole] = useState<Role | null>(null);
  const [deleteRoleLoading, setDeleteRoleLoading] = useState(false);

  // Seed data
  const [seeding, setSeeding] = useState(false);
  const [seedMsg, setSeedMsg] = useState("");

  const fetchOrg = useCallback(async () => {
    if (!orgId) return;
    const { data } = await supabase
      .from("organizations")
      .select("*")
      .eq("id", orgId)
      .single();
    if (data) {
      setOrg(data);
      setOrgName(data.name);
      setOrgDescription(data.description || "");
      setContactEmail(data.contact_email || "");
      setPhone(data.phone || "");
      setCity(data.city || "");
      setState(data.state || "");
      setTimezone(
        data.timezone ||
          Intl.DateTimeFormat().resolvedOptions().timeZone ||
          "America/Chicago"
      );
      setFiscalYearStart(data.fiscal_year_start || 1);
    }
  }, [orgId, supabase]);

  const fetchTeam = useCallback(async () => {
    if (!orgId) return;
    setLoadingTeam(true);
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("org_id", orgId)
      .order("created_at");
    setTeamMembers(data || []);
    setLoadingTeam(false);
  }, [orgId, supabase]);

  const fetchInvites = useCallback(async () => {
    if (!orgId) return;
    const { data, error } = await supabase
      .from("team_invites")
      .select("*")
      .eq("org_id", orgId)
      .eq("status", "pending")
      .order("created_at", { ascending: false });
    if (
      error?.message?.includes("schema cache") ||
      error?.message?.includes("does not exist")
    ) {
      setInviteTableExists(false);
      return;
    }
    setInviteTableExists(true);
    setInvites(data || []);
  }, [orgId, supabase]);

  const fetchSkills = useCallback(async () => {
    if (!orgId) return;
    setLoadingSkills(true);
    const { data } = await supabase
      .from("skills")
      .select("*")
      .eq("org_id", orgId)
      .order("name");
    setSkills(data || []);
    setLoadingSkills(false);
  }, [orgId, supabase]);

  const fetchRoles = useCallback(async () => {
    if (!orgId) return;
    setLoadingRoles(true);
    const { data } = await supabase
      .from("roles")
      .select("*")
      .eq("org_id", orgId)
      .order("name");
    setRoles(data || []);
    setLoadingRoles(false);
  }, [orgId, supabase]);

  useEffect(() => {
    fetchOrg();
    fetchTeam();
    fetchInvites();
    fetchSkills();
    fetchRoles();
  }, [fetchOrg, fetchTeam, fetchInvites, fetchSkills, fetchRoles]);

  // --- Org ---
  const saveOrg = async () => {
    if (!orgId || !profile || !orgName.trim()) return;
    setSavingOrg(true);
    setOrgMsg("");

    const nameChanged = orgName.trim() !== org?.name;
    let slug = org?.slug || "";

    if (nameChanged) {
      const baseSlug = orgName
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      slug = `${baseSlug}-${Math.random().toString(36).slice(2, 10)}`;
    }

    const updates: Record<string, unknown> = {
      name: orgName.trim(),
      slug,
      description: orgDescription.trim() || null,
      contact_email: contactEmail.trim() || null,
      phone: phone.trim() || null,
      city: city.trim() || null,
      state: state || null,
      timezone: timezone || null,
      fiscal_year_start: fiscalYearStart,
    };

    const { error } = await supabase
      .from("organizations")
      .update(updates)
      .eq("id", orgId);

    if (error) {
      setOrgMsg(error.message);
    } else {
      setOrgMsg("Settings saved successfully.");
      setOrg((prev) =>
        prev ? { ...prev, ...updates, slug } as Organization : prev
      );
      await supabase.from("audit_log").insert({
        org_id: orgId,
        user_id: profile.id,
        action: "org.updated",
        entity_type: "organization",
        entity_id: orgId,
        metadata: { name: orgName.trim() },
      });
      refreshProfile();
    }
    setSavingOrg(false);
  };

  // --- Delete Org ---
  const handleDeleteOrg = async () => {
    if (!orgId || !profile || deleteConfirmName !== org?.name) return;
    setDeleting(true);

    const { error } = await supabase
      .from("organizations")
      .delete()
      .eq("id", orgId);

    if (error) {
      setOrgMsg(`Failed to delete: ${error.message}`);
      setDeleting(false);
      setShowDeleteModal(false);
      return;
    }

    // Sign out after deletion
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  // --- Invites ---
  const sendInvite = async () => {
    if (!orgId || !profile) return;
    const email = inviteEmail.trim().toLowerCase();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setInviteError("Please enter a valid email address.");
      return;
    }

    if (teamMembers.some((m) => m.email?.toLowerCase() === email)) {
      setInviteError("This person is already a team member.");
      return;
    }

    if (invites.some((i) => i.email.toLowerCase() === email)) {
      setInviteError("This email has already been invited.");
      return;
    }

    setInviteLoading(true);
    setInviteError("");
    setInviteSuccess("");

    const { error } = await supabase.from("team_invites").insert({
      org_id: orgId,
      email,
      role: inviteRole,
      invited_by: profile.id,
    });

    if (error) {
      setInviteError(
        error.message.includes("duplicate")
          ? "This email has already been invited."
          : error.message
      );
      setInviteLoading(false);
      return;
    }

    await supabase.from("audit_log").insert({
      org_id: orgId,
      user_id: profile.id,
      action: "team.invited",
      entity_type: "team_invite",
      entity_id: null,
      metadata: { email, role: inviteRole },
    });

    setInviteEmail("");
    setInviteRole("editor");
    setInviteSuccess(
      `Invite sent to ${email}. They'll join your org when they sign up.`
    );
    setInviteLoading(false);
    fetchInvites();
    setTimeout(() => setInviteSuccess(""), 5000);
    inviteEmailRef.current?.focus();
  };

  const revokeInvite = async (invite: TeamInvite) => {
    if (!orgId || !profile) return;
    const { error } = await supabase
      .from("team_invites")
      .delete()
      .eq("id", invite.id);

    if (error) {
      setInviteError(error.message);
      return;
    }

    await supabase.from("audit_log").insert({
      org_id: orgId,
      user_id: profile.id,
      action: "team.invite_revoked",
      entity_type: "team_invite",
      entity_id: invite.id,
      metadata: { email: invite.email },
    });

    fetchInvites();
  };

  // --- Skills ---
  const addSkill = async () => {
    if (!orgId || !newSkillName.trim()) return;
    setSkillError("");
    const { error } = await supabase
      .from("skills")
      .insert({ org_id: orgId, name: newSkillName.trim() });

    if (error) {
      setSkillError(
        error.message.includes("duplicate")
          ? "This skill already exists."
          : error.message
      );
      return;
    }
    setNewSkillName("");
    fetchSkills();
  };

  const deleteSkill = (skill: Skill) => {
    setDeletingSkill(skill);
  };

  const confirmDeleteSkill = async () => {
    if (!deletingSkill) return;
    setDeleteSkillLoading(true);
    const { error } = await supabase
      .from("skills")
      .delete()
      .eq("id", deletingSkill.id);
    setDeleteSkillLoading(false);
    setDeletingSkill(null);
    if (error) {
      setSkillError(`Failed to delete: ${error.message}`);
      return;
    }
    fetchSkills();
  };

  // --- Roles ---
  const addRole = async () => {
    if (!orgId || !newRoleName.trim()) return;
    setRoleError("");
    const { error } = await supabase
      .from("roles")
      .insert({ org_id: orgId, name: newRoleName.trim() });

    if (error) {
      setRoleError(
        error.message.includes("duplicate")
          ? "This role already exists."
          : error.message
      );
      return;
    }
    setNewRoleName("");
    fetchRoles();
  };

  const deleteRole = async (role: Role) => {
    if (!confirm(`Delete "${role.name}" role?`)) return;
    const { error } = await supabase
      .from("roles")
      .delete()
      .eq("id", role.id);
    if (error) {
      setRoleError(`Failed to delete: ${error.message}`);
      return;
    }
    fetchRoles();
  };

  const handleSeedData = async () => {
    if (!orgId || !profile) return;
    if (
      !confirm(
        "This will add sample volunteers, events, skills, roles, and committees to your organization. Continue?"
      )
    )
      return;
    setSeeding(true);
    setSeedMsg("");
    const result = await seedSampleData(supabase, orgId, profile.id);
    setSeedMsg(result.message);
    setSeeding(false);
    if (result.success) {
      fetchSkills();
      fetchRoles();
      fetchTeam();
    }
  };

  const allTabs = [
    {
      id: "organization" as const,
      label: "Organization",
      icon: Building2,
      minRole: "admin" as const,
    },
    {
      id: "team" as const,
      label: "Team",
      icon: Users,
      minRole: "admin" as const,
    },
    {
      id: "skills" as const,
      label: "Skills",
      icon: Tag,
      minRole: "editor" as const,
    },
    {
      id: "roles" as const,
      label: "Roles",
      icon: Shield,
      minRole: "editor" as const,
    },
  ];

  const tabs = allTabs.filter((tab) => {
    if (tab.minRole === "admin") return canManageTeam;
    if (tab.minRole === "editor") return canEdit;
    return true;
  });

  const visibleTabIds = tabs.map((t) => t.id);
  if (!visibleTabIds.includes(activeTab) && tabs.length > 0) {
    setActiveTab(tabs[0].id);
  }

  // Check if org form has changed
  const orgFormChanged =
    org &&
    (orgName !== org.name ||
      (orgDescription || "") !== (org.description || "") ||
      (contactEmail || "") !== (org.contact_email || "") ||
      (phone || "") !== (org.phone || "") ||
      (city || "") !== (org.city || "") ||
      (state || "") !== (org.state || "") ||
      (timezone || "") !== (org.timezone || "") ||
      fiscalYearStart !== (org.fiscal_year_start || 1));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Settings</h1>

      {/* Tabs */}
      <div
        className="flex gap-1 rounded-lg bg-gray-100 p-1"
        role="tablist"
        aria-label="Settings sections"
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`panel-${tab.id}`}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <tab.icon className="h-4 w-4" aria-hidden="true" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Organization Tab */}
      {activeTab === "organization" && (
        <div className="space-y-6">
          <Card
            id="panel-organization"
            role="tabpanel"
            aria-labelledby="tab-organization"
          >
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Organization Settings
            </h2>
            <div className="max-w-lg space-y-5">
              {/* Organization Name */}
              <Input
                label="Organization Name"
                id="org_name"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
              />

              {/* Description */}
              <div>
                <label
                  htmlFor="org_description"
                  className="mb-1.5 block text-sm font-medium text-gray-700"
                >
                  Description
                </label>
                <textarea
                  id="org_description"
                  rows={2}
                  maxLength={280}
                  value={orgDescription}
                  onChange={(e) => setOrgDescription(e.target.value)}
                  placeholder="Brief description of your organization"
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <p className="mt-1 text-xs text-gray-400">
                  {orgDescription.length}/280 characters
                </p>
              </div>

              {/* Contact Email */}
              <Input
                label="Contact email"
                id="contact_email"
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="org@example.com"
              />

              {/* Phone */}
              <div>
                <label
                  htmlFor="phone"
                  className="mb-1.5 block text-sm font-medium text-gray-700"
                >
                  Phone{" "}
                  <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(555) 555-0100"
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Location: City + State */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Location{" "}
                  <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="City"
                    className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <select
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    aria-label="State"
                    className="w-24 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">State</option>
                    {US_STATES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Timezone */}
              <div>
                <label
                  htmlFor="timezone"
                  className="mb-1.5 block text-sm font-medium text-gray-700"
                >
                  Timezone
                </label>
                <select
                  id="timezone"
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {COMMON_TIMEZONES.map((tz) => (
                    <option key={tz.value} value={tz.value}>
                      {tz.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Fiscal Year Start */}
              <div>
                <label
                  htmlFor="fiscal_year"
                  className="mb-1.5 block text-sm font-medium text-gray-700"
                >
                  Fiscal year starts
                </label>
                <select
                  id="fiscal_year"
                  value={fiscalYearStart}
                  onChange={(e) => setFiscalYearStart(Number(e.target.value))}
                  className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {MONTHS.map((month, i) => (
                    <option key={month} value={i + 1}>
                      {month}
                    </option>
                  ))}
                </select>
              </div>

              {/* Plan / Slug info */}
              {org && (
                <div className="space-y-2 border-t border-gray-100 pt-4">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Shield className="h-4 w-4" aria-hidden="true" />
                    <span>
                      Plan:{" "}
                      <span className="font-medium text-gray-700">
                        {org.tier.charAt(0).toUpperCase() + org.tier.slice(1)}
                      </span>
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                    Slug:{" "}
                    <span className="font-mono text-gray-700">{org.slug}</span>
                  </p>
                </div>
              )}

              {orgMsg && (
                <p
                  role="status"
                  className={`text-sm ${
                    orgMsg.includes("error") ||
                    orgMsg.includes("Error") ||
                    orgMsg.includes("Failed")
                      ? "text-red-600"
                      : "text-green-600"
                  }`}
                >
                  {orgMsg}
                </p>
              )}

              <Button
                onClick={saveOrg}
                loading={savingOrg}
                disabled={!orgFormChanged}
              >
                <Save className="mr-2 h-4 w-4" aria-hidden="true" />
                Save Changes
              </Button>
            </div>

            {/* Seed Data */}
            <div className="mt-8 border-t border-gray-200 pt-6">
              <h3 className="mb-2 text-sm font-semibold text-gray-900">
                Sample Data
              </h3>
              <p className="mb-3 text-sm text-gray-500">
                Load realistic sample data to test the app — 15 volunteers, 6
                events, skills, roles, and committees with assignments.
              </p>
              {seedMsg && (
                <p
                  role="status"
                  className={`mb-3 text-sm ${
                    seedMsg.includes("error") || seedMsg.includes("Error")
                      ? "text-red-600"
                      : "text-green-600"
                  }`}
                >
                  {seedMsg}
                </p>
              )}
              <Button
                variant="secondary"
                onClick={handleSeedData}
                loading={seeding}
              >
                <Database className="mr-2 h-4 w-4" aria-hidden="true" />
                Load Sample Data
              </Button>
            </div>

            {/* Quick Start Tour */}
            <div className="mt-6 border-t border-gray-200 pt-6">
              <h3 className="mb-2 text-sm font-semibold text-gray-900">
                Quick Start Tour
              </h3>
              <p className="mb-3 text-sm text-gray-500">
                Restart the guided tour to walk through the key features again.
              </p>
              <Button variant="secondary" onClick={restartTour}>
                <MapPin className="mr-2 h-4 w-4" aria-hidden="true" />
                Restart Tour
              </Button>
            </div>
          </Card>

          {/* Danger Zone */}
          <div className="rounded-xl border border-red-200 bg-white shadow-sm">
            <div className="border-l-4 border-red-500 p-6">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-5 w-5 text-red-500" aria-hidden="true" />
                <h3 className="text-lg font-semibold text-red-700">
                  Danger Zone
                </h3>
              </div>
              <p className="mb-4 text-sm text-gray-600">
                Permanently delete this organization and all associated data.
                This action cannot be undone.
              </p>
              <button
                onClick={() => {
                  setShowDeleteModal(true);
                  setDeleteConfirmName("");
                }}
                className="inline-flex items-center rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
              >
                <Trash2 className="mr-2 h-4 w-4" aria-hidden="true" />
                Delete organization
              </button>
            </div>
          </div>

          {/* Delete Confirmation Modal */}
          {showDeleteModal && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
              role="dialog"
              aria-modal="true"
              aria-labelledby="delete-org-title"
              onKeyDown={(e) => {
                if (e.key === "Escape") setShowDeleteModal(false);
              }}
            >
              <Card className="w-full max-w-md">
                <div className="mb-4 flex items-center justify-between">
                  <h2
                    id="delete-org-title"
                    className="text-lg font-semibold text-red-700"
                  >
                    Delete Organization
                  </h2>
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="rounded-lg p-1 hover:bg-gray-100"
                    aria-label="Close"
                  >
                    <X className="h-5 w-5 text-gray-500" />
                  </button>
                </div>

                <div className="rounded-lg bg-red-50 p-3 mb-4">
                  <p className="text-sm text-red-700">
                    This will permanently delete{" "}
                    <span className="font-semibold">{org?.name}</span> and all
                    associated data including volunteers, events, committees, and
                    team members.
                  </p>
                </div>

                <p className="mb-2 text-sm text-gray-600">
                  Type{" "}
                  <span className="font-mono font-semibold text-gray-900">
                    {org?.name}
                  </span>{" "}
                  to confirm:
                </p>
                <input
                  type="text"
                  value={deleteConfirmName}
                  onChange={(e) => setDeleteConfirmName(e.target.value)}
                  placeholder={org?.name}
                  className="mb-4 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                />

                <div className="flex justify-end gap-3">
                  <Button
                    variant="secondary"
                    onClick={() => setShowDeleteModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="danger"
                    onClick={handleDeleteOrg}
                    loading={deleting}
                    disabled={deleteConfirmName !== org?.name}
                  >
                    Delete Organization
                  </Button>
                </div>
              </Card>
            </div>
          )}
        </div>
      )}

      {/* Team Tab */}
      {activeTab === "team" && (
        <div
          id="panel-team"
          role="tabpanel"
          aria-labelledby="tab-team"
          className="space-y-6"
        >
          {/* Invite Form */}
          <Card>
            <h2 className="mb-2 text-lg font-semibold text-gray-900">
              Invite Team Member
            </h2>

            {!inviteTableExists ? (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                <p className="mb-2 text-sm font-medium text-amber-800">
                  Migration Required
                </p>
                <p className="mb-3 text-sm text-amber-700">
                  The team invites feature requires a database migration. Go to
                  your Supabase dashboard &rarr; SQL Editor and run the contents
                  of{" "}
                  <code className="rounded bg-amber-100 px-1 py-0.5 text-xs font-mono">
                    supabase/migrations/00005_team_invites.sql
                  </code>{" "}
                  and{" "}
                  <code className="rounded bg-amber-100 px-1 py-0.5 text-xs font-mono">
                    supabase/migrations/00006_event_address_and_seed.sql
                  </code>
                  , then refresh this page.
                </p>
              </div>
            ) : (
              <>
                <p className="mb-4 text-sm text-gray-500">
                  Invite people to help manage your organization. They&apos;ll
                  join automatically when they sign up with the invited email.
                </p>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <div className="flex-1">
                    <Input
                      ref={inviteEmailRef}
                      placeholder="colleague@example.com"
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => {
                        setInviteEmail(e.target.value);
                        setInviteError("");
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          sendInvite();
                        }
                      }}
                      aria-label="Email address to invite"
                    />
                  </div>
                  <div className="w-full sm:w-36">
                    <select
                      value={inviteRole}
                      onChange={(e) => setInviteRole(e.target.value)}
                      aria-label="Role for invited member"
                      className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      {INVITABLE_ROLES.map((r) => (
                        <option key={r.value} value={r.value}>
                          {r.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <Button
                    onClick={sendInvite}
                    loading={inviteLoading}
                    disabled={!inviteEmail.trim()}
                  >
                    <Mail className="mr-2 h-4 w-4" aria-hidden="true" />
                    Send Invite
                  </Button>
                </div>

                {inviteError && (
                  <p role="alert" aria-live="polite" className="mt-2 text-sm text-red-600">
                    {inviteError}
                  </p>
                )}
                {inviteSuccess && (
                  <p role="status" className="mt-2 text-sm text-green-600">
                    {inviteSuccess}
                  </p>
                )}
              </>
            )}
          </Card>

          {/* Pending Invites */}
          {inviteTableExists && invites.length > 0 && (
            <Card>
              <h3 className="mb-3 font-semibold text-gray-900">
                Pending Invites ({invites.length})
              </h3>
              <div className="space-y-2">
                {invites.map((invite) => (
                  <div
                    key={invite.id}
                    className="flex items-center justify-between rounded-lg border border-dashed border-gray-200 bg-gray-50 p-3"
                  >
                    <div className="flex items-center gap-3">
                      <Clock
                        className="h-4 w-4 text-gray-400"
                        aria-hidden="true"
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-700">
                          {invite.email}
                        </p>
                        <p className="text-xs text-gray-400">
                          Invited as{" "}
                          {ROLE_LABELS[invite.role] || invite.role}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => revokeInvite(invite)}
                      className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
                      aria-label={`Revoke invite for ${invite.email}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Current Team Members */}
          <Card>
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Team Members
            </h2>
            {loadingTeam ? (
              <div className="flex justify-center py-8">
                <div
                  className="h-6 w-6 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"
                  role="status"
                  aria-label="Loading team members"
                />
              </div>
            ) : (
              <div className="space-y-3">
                {teamMembers.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between rounded-lg border border-gray-100 p-4"
                  >
                    <div>
                      <p className="font-medium text-gray-900">
                        {member.full_name || "Unnamed"}
                      </p>
                      <p className="text-sm text-gray-500">{member.email}</p>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        ROLE_COLORS[member.role] || "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {ROLE_LABELS[member.role] || member.role}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Skills Tab */}
      {activeTab === "skills" && (
        <div
          id="panel-skills"
          role="tabpanel"
          aria-labelledby="tab-skills"
          className="space-y-6"
        >
          <Card>
            <h2 className="mb-2 text-lg font-semibold text-gray-900">
              Skills & Programs
            </h2>
            <p className="mb-4 text-sm text-gray-500">
              Define skills and programs that can be assigned to volunteers via
              checkboxes.
            </p>
            <div className="flex gap-3">
              <Input
                placeholder="New skill name..."
                value={newSkillName}
                onChange={(e) => {
                  setNewSkillName(e.target.value);
                  setSkillError("");
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addSkill();
                  }
                }}
                className="flex-1"
                aria-label="New skill name"
              />
              <Button onClick={addSkill} disabled={!newSkillName.trim()}>
                <Plus className="mr-1 h-4 w-4" aria-hidden="true" />
                Add
              </Button>
            </div>
            {skillError && (
              <p role="alert" aria-live="polite" className="mt-2 text-sm text-red-600">
                {skillError}
              </p>
            )}
          </Card>

          <Card>
            <h3 className="mb-3 font-semibold text-gray-900">
              All Skills ({skills.length})
            </h3>
            {loadingSkills ? (
              <div className="flex justify-center py-8">
                <div
                  className="h-6 w-6 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"
                  role="status"
                  aria-label="Loading skills"
                />
              </div>
            ) : skills.length === 0 ? (
              <p className="py-3 text-center text-sm text-gray-400">
                No skills defined yet.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <div
                    key={skill.id}
                    className="group flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1.5 text-sm text-blue-700"
                  >
                    <span>{skill.name}</span>
                    <button
                      onClick={() => deleteSkill(skill)}
                      className="ml-1 rounded-full p-0.5 opacity-0 transition-opacity hover:bg-white/50 group-hover:opacity-100"
                      aria-label={`Delete ${skill.name} skill`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Roles Tab */}
      {activeTab === "roles" && (
        <div
          id="panel-roles"
          role="tabpanel"
          aria-labelledby="tab-roles"
          className="space-y-6"
        >
          <Card>
            <h2 className="mb-2 text-lg font-semibold text-gray-900">Roles</h2>
            <p className="mb-4 text-sm text-gray-500">
              Define organizational roles like Walk Chair, Board Member, Regional
              Lead, etc.
            </p>
            <div className="flex gap-3">
              <Input
                placeholder="New role name..."
                value={newRoleName}
                onChange={(e) => {
                  setNewRoleName(e.target.value);
                  setRoleError("");
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addRole();
                  }
                }}
                className="flex-1"
                aria-label="New role name"
              />
              <Button onClick={addRole} disabled={!newRoleName.trim()}>
                <Plus className="mr-1 h-4 w-4" aria-hidden="true" />
                Add
              </Button>
            </div>
            {roleError && (
              <p role="alert" aria-live="polite" className="mt-2 text-sm text-red-600">
                {roleError}
              </p>
            )}
          </Card>

          <Card>
            <h3 className="mb-3 font-semibold text-gray-900">
              All Roles ({roles.length})
            </h3>
            {loadingRoles ? (
              <div className="flex justify-center py-8">
                <div
                  className="h-6 w-6 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"
                  role="status"
                  aria-label="Loading roles"
                />
              </div>
            ) : roles.length === 0 ? (
              <p className="py-3 text-center text-sm text-gray-400">
                No roles defined yet.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {roles.map((role) => (
                  <div
                    key={role.id}
                    className="group flex items-center gap-1 rounded-full bg-purple-50 px-3 py-1.5 text-sm text-purple-700"
                  >
                    <Shield className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>{role.name}</span>
                    <button
                      onClick={() => deleteRole(role)}
                      className="ml-1 rounded-full p-0.5 opacity-0 transition-opacity hover:bg-white/50 group-hover:opacity-100"
                      aria-label={`Delete ${role.name} role`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
