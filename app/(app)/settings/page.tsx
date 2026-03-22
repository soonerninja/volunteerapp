"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import type { Organization, Profile, Skill } from "@/types/database";
import {
  Settings,
  Building2,
  Users,
  Tag,
  Plus,
  X,
  Trash2,
  Save,
  Shield,
} from "lucide-react";

const ROLE_LABELS: Record<string, string> = {
  owner: "Owner",
  admin: "Admin",
  editor: "Editor",
  viewer: "Viewer",
};

export default function SettingsPage() {
  const { profile, refreshProfile } = useAuth();
  const supabase = createClient();
  const orgId = profile?.org_id;

  const [activeTab, setActiveTab] = useState<
    "organization" | "team" | "skills"
  >("organization");

  // Org settings
  const [org, setOrg] = useState<Organization | null>(null);
  const [orgName, setOrgName] = useState("");
  const [savingOrg, setSavingOrg] = useState(false);
  const [orgMsg, setOrgMsg] = useState("");

  // Team
  const [teamMembers, setTeamMembers] = useState<Profile[]>([]);
  const [loadingTeam, setLoadingTeam] = useState(true);

  // Skills
  const [skills, setSkills] = useState<Skill[]>([]);
  const [newSkillName, setNewSkillName] = useState("");
  const [loadingSkills, setLoadingSkills] = useState(true);
  const [skillError, setSkillError] = useState("");

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

  useEffect(() => {
    fetchOrg();
    fetchTeam();
    fetchSkills();
  }, [fetchOrg, fetchTeam, fetchSkills]);

  const saveOrgName = async () => {
    if (!orgId || !profile || !orgName.trim()) return;
    setSavingOrg(true);
    setOrgMsg("");
    const { error } = await supabase
      .from("organizations")
      .update({ name: orgName.trim() })
      .eq("id", orgId);

    if (error) {
      setOrgMsg(error.message);
    } else {
      setOrgMsg("Organization name updated.");
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
    await supabase.from("skills").delete().eq("id", skill.id);
    fetchSkills();
  };

  const tabs = [
    { id: "organization" as const, label: "Organization", icon: Building2 },
    { id: "team" as const, label: "Team", icon: Users },
    { id: "skills" as const, label: "Skills / Tags", icon: Tag },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Settings</h1>

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg bg-gray-100 p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Organization Tab */}
      {activeTab === "organization" && (
        <Card>
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
                  <Shield className="h-4 w-4" />
                  <span>
                    Plan:{" "}
                    <span className="font-medium text-gray-700">
                      {org.tier.charAt(0).toUpperCase() + org.tier.slice(1)}
                    </span>
                  </span>
                </div>
                <p className="text-sm text-gray-500">
                  Slug: <span className="font-mono text-gray-700">{org.slug}</span>
                </p>
              </div>
            )}
            {orgMsg && (
              <p
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
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </div>
        </Card>
      )}

      {/* Team Tab */}
      {activeTab === "team" && (
        <Card>
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Team Members
          </h2>
          {loadingTeam ? (
            <div className="flex justify-center py-8">
              <div className="h-6 w-6 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
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
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                    {ROLE_LABELS[member.role] || member.role}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Skills Tab */}
      {activeTab === "skills" && (
        <Card>
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Skills / Tags
          </h2>
          <p className="mb-4 text-sm text-gray-500">
            Define skills and tags that can be assigned to volunteers.
          </p>

          {/* Add skill */}
          <div className="mb-4 flex gap-2">
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
            />
            <Button onClick={addSkill} disabled={!newSkillName.trim()}>
              <Plus className="mr-1 h-4 w-4" />
              Add
            </Button>
          </div>

          {skillError && (
            <p className="mb-3 text-sm text-red-600">{skillError}</p>
          )}

          {loadingSkills ? (
            <div className="flex justify-center py-8">
              <div className="h-6 w-6 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
            </div>
          ) : skills.length === 0 ? (
            <p className="py-4 text-center text-sm text-gray-500">
              No skills defined yet. Add your first skill above.
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
                    className="ml-1 rounded-full p-0.5 opacity-0 transition-opacity hover:bg-blue-100 group-hover:opacity-100"
                    title="Delete skill"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
