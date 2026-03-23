"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useOrg } from "@/hooks/use-org";
import { usePermissions } from "@/hooks/use-permissions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
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
  Lock,
} from "lucide-react";

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

export default function SettingsPage() {
  const { supabase, orgId, profile, refreshProfile } = useOrg();
  const { canManageTeam, canManageConfig, canEdit } = usePermissions();

  const [activeTab, setActiveTab] = useState<
    "organization" | "team" | "skills" | "roles"
  >("organization");

  // Org settings
  const [org, setOrg] = useState<Organization | null>(null);
  const [orgName, setOrgName] = useState("");
  const [savingOrg, setSavingOrg] = useState(false);
  const [orgMsg, setOrgMsg] = useState("");

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

  // Roles
  const [roles, setRoles] = useState<Role[]>([]);
  const [newRoleName, setNewRoleName] = useState("");
  const [loadingRoles, setLoadingRoles] = useState(true);
  const [roleError, setRoleError] = useState("");

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
    if (error?.message?.includes("schema cache") || error?.message?.includes("does not exist")) {
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
  const saveOrgName = async () => {
    if (!orgId || !profile || !orgName.trim()) return;
    setSavingOrg(true);
    setOrgMsg("");

    const baseSlug = orgName
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    const slug = `${baseSlug}-${Math.random().toString(36).slice(2, 10)}`;

    const { error } = await supabase
      .from("organizations")
      .update({ name: orgName.trim(), slug })
      .eq("id", orgId);

    if (error) {
      setOrgMsg(error.message);
    } else {
      setOrgMsg("Organization name updated.");
      setOrg((prev) => (prev ? { ...prev, name: orgName.trim(), slug } : prev));
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

  // --- Invites ---
  const sendInvite = async () => {
    if (!orgId || !profile) return;
    const email = inviteEmail.trim().toLowerCase();

    // Validate email
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setInviteError("Please enter a valid email address.");
      return;
    }

    // Check if already a team member
    if (teamMembers.some((m) => m.email?.toLowerCase() === email)) {
      setInviteError("This person is already a team member.");
      return;
    }

    // Check if already invited
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
    setInviteSuccess(`Invite sent to ${email}. They'll join your org when they sign up.`);
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

  const deleteSkill = async (skill: Skill) => {
    if (!confirm(`Delete "${skill.name}" skill?`)) return;
    const { error } = await supabase.from("skills").delete().eq("id", skill.id);
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
    const { error } = await supabase.from("roles").delete().eq("id", role.id);
    if (error) {
      setRoleError(`Failed to delete: ${error.message}`);
      return;
    }
    fetchRoles();
  };

  const handleSeedData = async () => {
    if (!orgId || !profile) return;
    if (!confirm("This will add sample volunteers, events, skills, roles, and committees to your organization. Continue?")) return;
    setSeeding(true);
    setSeedMsg("");
    const result = await seedSampleData(supabase, orgId, profile.id);
    setSeedMsg(result.message);
    setSeeding(false);
    if (result.success) {
      // Refresh all data
      fetchSkills();
      fetchRoles();
      fetchTeam();
    }
  };

  const allTabs = [
    { id: "organization" as const, label: "Organization", icon: Building2, minRole: "admin" as const },
    { id: "team" as const, label: "Team", icon: Users, minRole: "admin" as const },
    { id: "skills" as const, label: "Skills", icon: Tag, minRole: "editor" as const },
    { id: "roles" as const, label: "Roles", icon: Shield, minRole: "editor" as const },
  ];

  const tabs = allTabs.filter((tab) => {
    if (tab.minRole === "admin") return canManageTeam;
    if (tab.minRole === "editor") return canEdit;
    return true;
  });

  // If current tab is no longer visible, switch to first available
  const visibleTabIds = tabs.map((t) => t.id);
  if (!visibleTabIds.includes(activeTab) && tabs.length > 0) {
    setActiveTab(tabs[0].id);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Settings</h1>

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg bg-gray-100 p-1" role="tablist" aria-label="Settings sections">
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
        <Card id="panel-organization" role="tabpanel" aria-labelledby="tab-organization">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Organization Settings
          </h2>
          <div className="max-w-md space-y-4">
            <Input
              label="Organization Name"
              id="org_name"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
            />
            {org && (
              <div className="space-y-2">
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
                className={`text-sm ${orgMsg.includes("error") || orgMsg.includes("Error") ? "text-red-600" : "text-green-600"}`}
              >
                {orgMsg}
              </p>
            )}
            <Button
              onClick={saveOrgName}
              loading={savingOrg}
              disabled={orgName === org?.name}
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
              Load realistic sample data to test the app — 15 volunteers, 6 events,
              skills, roles, and committees with assignments.
            </p>
            {seedMsg && (
              <p role="status" className={`mb-3 text-sm ${seedMsg.includes("error") || seedMsg.includes("Error") ? "text-red-600" : "text-green-600"}`}>
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
        </Card>
      )}

      {/* Team Tab */}
      {activeTab === "team" && (
        <div id="panel-team" role="tabpanel" aria-labelledby="tab-team" className="space-y-6">
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
                  The team invites feature requires a database migration. Go to your
                  Supabase dashboard &rarr; SQL Editor and run the contents of{" "}
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
              Invite people to help manage your organization. They&apos;ll join
              automatically when they sign up with the invited email.
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
              <p role="alert" className="mt-2 text-sm text-red-600">
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
                      <Clock className="h-4 w-4 text-gray-400" aria-hidden="true" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">
                          {invite.email}
                        </p>
                        <p className="text-xs text-gray-400">
                          Invited as {ROLE_LABELS[invite.role] || invite.role}
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
                <div className="h-6 w-6 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" role="status" aria-label="Loading team members" />
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
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${ROLE_COLORS[member.role] || "bg-gray-100 text-gray-700"}`}>
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
        <div id="panel-skills" role="tabpanel" aria-labelledby="tab-skills" className="space-y-6">
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
              <p role="alert" className="mt-2 text-sm text-red-600">{skillError}</p>
            )}
          </Card>

          <Card>
            <h3 className="mb-3 font-semibold text-gray-900">
              All Skills ({skills.length})
            </h3>
            {loadingSkills ? (
              <div className="flex justify-center py-8">
                <div className="h-6 w-6 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" role="status" aria-label="Loading skills" />
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
        <div id="panel-roles" role="tabpanel" aria-labelledby="tab-roles" className="space-y-6">
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
              <p role="alert" className="mt-2 text-sm text-red-600">{roleError}</p>
            )}
          </Card>

          <Card>
            <h3 className="mb-3 font-semibold text-gray-900">
              All Roles ({roles.length})
            </h3>
            {loadingRoles ? (
              <div className="flex justify-center py-8">
                <div className="h-6 w-6 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" role="status" aria-label="Loading roles" />
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
