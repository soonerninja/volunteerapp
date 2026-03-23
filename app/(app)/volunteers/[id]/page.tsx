"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useOrg } from "@/hooks/use-org";
import { usePermissions } from "@/hooks/use-permissions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog";
import { formatDate, formatRelativeTime, formatAction } from "@/utils/format";
import type {
  Volunteer,
  Skill,
  Role,
  AuditLog,
} from "@/types/database";
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  Shield,
  Users,
  Clock,
  Edit2,
  Trash2,
  MapPin,
  FileText,
} from "lucide-react";

type EventParticipation = {
  id: string;
  event_id: string;
  hours_logged: number;
  checked_in: boolean;
  notes: string | null;
  events: {
    id: string;
    title: string;
    start_date: string;
    end_date: string;
    status: string;
    location: string | null;
  };
};

type CommitteeMembership = {
  committee_id: string;
  role: string;
  joined_at: string;
  committees: {
    id: string;
    name: string;
    description: string | null;
  };
};

const STATUS_COLORS: Record<string, string> = {
  active: "bg-green-100 text-green-700",
  inactive: "bg-gray-100 text-gray-700",
  on_leave: "bg-amber-100 text-amber-700",
};

const EVENT_STATUS_COLORS: Record<string, string> = {
  upcoming: "bg-blue-100 text-blue-700",
  active: "bg-green-100 text-green-700",
  completed: "bg-gray-100 text-gray-700",
  cancelled: "bg-red-100 text-red-700",
};

export default function VolunteerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { supabase, orgId, profile } = useOrg();
  const { canEdit, canDelete } = usePermissions();

  const [volunteer, setVolunteer] = useState<Volunteer | null>(null);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [volSkillIds, setVolSkillIds] = useState<string[]>([]);
  const [volRoleIds, setVolRoleIds] = useState<string[]>([]);
  const [events, setEvents] = useState<EventParticipation[]>([]);
  const [committees, setCommittees] = useState<CommitteeMembership[]>([]);
  const [activity, setActivity] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchVolunteer = useCallback(async () => {
    if (!orgId || !id) return;

    const { data } = await supabase
      .from("volunteers")
      .select("*")
      .eq("id", id)
      .eq("org_id", orgId)
      .single();

    if (!data) {
      router.push("/volunteers");
      return;
    }

    setVolunteer(data);
  }, [orgId, id, supabase, router]);

  const fetchRelations = useCallback(async () => {
    if (!orgId || !id) return;

    const [
      skillsRes,
      rolesRes,
      volSkillsRes,
      volRolesRes,
      eventsRes,
      committeesRes,
      activityRes,
    ] = await Promise.all([
      supabase.from("skills").select("*").eq("org_id", orgId).order("name"),
      supabase.from("roles").select("*").eq("org_id", orgId).order("name"),
      supabase.from("volunteer_skills").select("skill_id").eq("volunteer_id", id),
      supabase.from("volunteer_roles").select("role_id").eq("volunteer_id", id),
      supabase
        .from("event_volunteers")
        .select("id, event_id, hours_logged, checked_in, notes, events(id, title, start_date, end_date, status, location)")
        .eq("volunteer_id", id),
      supabase
        .from("volunteer_committees")
        .select("committee_id, role, joined_at, committees(id, name, description)")
        .eq("volunteer_id", id),
      supabase
        .from("audit_log")
        .select("*")
        .eq("entity_id", id)
        .eq("entity_type", "volunteer")
        .order("created_at", { ascending: false })
        .limit(10),
    ]);

    setSkills(skillsRes.data || []);
    setRoles(rolesRes.data || []);
    setVolSkillIds((volSkillsRes.data || []).map((s) => s.skill_id));
    setVolRoleIds((volRolesRes.data || []).map((r) => r.role_id));
    setEvents((eventsRes.data as unknown as EventParticipation[]) || []);
    setCommittees((committeesRes.data as unknown as CommitteeMembership[]) || []);
    setActivity(activityRes.data || []);
  }, [orgId, id, supabase]);

  useEffect(() => {
    Promise.all([fetchVolunteer(), fetchRelations()]).then(() =>
      setLoading(false)
    );
  }, [fetchVolunteer, fetchRelations]);

  const confirmDelete = async () => {
    if (!volunteer || !orgId || !profile) return;
    setDeleteLoading(true);

    const { error } = await supabase
      .from("volunteers")
      .delete()
      .eq("id", volunteer.id);

    if (error) {
      setDeleteLoading(false);
      setShowDeleteDialog(false);
      return;
    }

    await supabase.from("audit_log").insert({
      org_id: orgId,
      user_id: profile.id,
      action: "volunteer.deleted",
      entity_type: "volunteer",
      entity_id: volunteer.id,
      metadata: {
        name: `${volunteer.first_name} ${volunteer.last_name}`,
      },
    });

    setDeleteLoading(false);
    router.push("/volunteers");
  };

  const totalHours = events.reduce((sum, e) => sum + e.hours_logged, 0);
  const volSkillNames = volSkillIds
    .map((sid) => skills.find((s) => s.id === sid)?.name)
    .filter(Boolean);
  const volRoleNames = volRoleIds
    .map((rid) => roles.find((r) => r.id === rid)?.name)
    .filter(Boolean);

  const sortedEvents = [...events].sort(
    (a, b) =>
      new Date(b.events.start_date).getTime() -
      new Date(a.events.start_date).getTime()
  );

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div
          className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"
          role="status"
          aria-label="Loading volunteer"
        />
      </div>
    );
  }

  if (!volunteer) return null;

  const statusLabel =
    volunteer.status === "on_leave"
      ? "On Leave"
      : volunteer.status.charAt(0).toUpperCase() + volunteer.status.slice(1);

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-2 text-sm text-gray-500"
      >
        <Link
          href="/volunteers"
          className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          Volunteers
        </Link>
        <span aria-hidden="true">/</span>
        <span className="text-gray-900">
          {volunteer.first_name} {volunteer.last_name}
        </span>
      </nav>

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-lg font-semibold text-blue-700">
              {volunteer.first_name[0]}
              {volunteer.last_name[0]}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {volunteer.first_name} {volunteer.last_name}
              </h1>
              <span
                className={`mt-0.5 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[volunteer.status]}`}
              >
                {statusLabel}
              </span>
            </div>
          </div>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => router.push(`/volunteers?edit=${volunteer.id}`)}
            >
              <Edit2 className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
              Edit
            </Button>
            {canDelete && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowDeleteDialog(true)}
                className="!border-red-200 !text-red-600 hover:!bg-red-50"
              >
                <Trash2 className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
                Delete
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && volunteer && (
        <ConfirmDeleteDialog
          name={`${volunteer.first_name} ${volunteer.last_name}`}
          entityType="volunteer"
          onConfirm={confirmDelete}
          onCancel={() => setShowDeleteDialog(false)}
          loading={deleteLoading}
        />
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column: Contact & Details */}
        <div className="space-y-6 lg:col-span-1">
          {/* Contact Info */}
          <Card>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
              Contact
            </h2>
            <div className="space-y-3">
              {volunteer.email && (
                <div className="flex items-center gap-2.5 text-sm">
                  <Mail className="h-4 w-4 text-gray-400" aria-hidden="true" />
                  <a
                    href={`mailto:${volunteer.email}`}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    {volunteer.email}
                  </a>
                </div>
              )}
              {volunteer.phone && (
                <div className="flex items-center gap-2.5 text-sm">
                  <Phone
                    className="h-4 w-4 text-gray-400"
                    aria-hidden="true"
                  />
                  <a
                    href={`tel:${volunteer.phone}`}
                    className="text-gray-700 hover:text-gray-900"
                  >
                    {volunteer.phone}
                  </a>
                </div>
              )}
              {volunteer.joined_date && (
                <div className="flex items-center gap-2.5 text-sm text-gray-600">
                  <Calendar
                    className="h-4 w-4 text-gray-400"
                    aria-hidden="true"
                  />
                  Joined {formatDate(volunteer.joined_date)}
                </div>
              )}
              {!volunteer.email && !volunteer.phone && (
                <p className="text-sm text-gray-400">No contact info on file.</p>
              )}
            </div>
          </Card>

          {/* Stats */}
          <Card>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
              Stats
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-blue-50 p-3 text-center">
                <p className="text-2xl font-bold text-blue-700">
                  {totalHours.toFixed(1)}
                </p>
                <p className="text-xs text-blue-600">Hours Logged</p>
              </div>
              <div className="rounded-lg bg-green-50 p-3 text-center">
                <p className="text-2xl font-bold text-green-700">
                  {events.length}
                </p>
                <p className="text-xs text-green-600">Events</p>
              </div>
              <div className="rounded-lg bg-purple-50 p-3 text-center">
                <p className="text-2xl font-bold text-purple-700">
                  {committees.length}
                </p>
                <p className="text-xs text-purple-600">Committees</p>
              </div>
              <div className="rounded-lg bg-amber-50 p-3 text-center">
                <p className="text-2xl font-bold text-amber-700">
                  {volSkillNames.length}
                </p>
                <p className="text-xs text-amber-600">Skills</p>
              </div>
            </div>
          </Card>

          {/* Skills & Roles */}
          {(volSkillNames.length > 0 || volRoleNames.length > 0) && (
            <Card>
              {volRoleNames.length > 0 && (
                <div className="mb-4">
                  <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
                    Roles
                  </h2>
                  <div className="flex flex-wrap gap-1.5">
                    {volRoleNames.map((name) => (
                      <span
                        key={name}
                        className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2.5 py-1 text-xs font-medium text-purple-700"
                      >
                        <Shield className="h-3 w-3" aria-hidden="true" />
                        {name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {volSkillNames.length > 0 && (
                <div>
                  <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
                    Skills
                  </h2>
                  <div className="flex flex-wrap gap-1.5">
                    {volSkillNames.map((name) => (
                      <span
                        key={name}
                        className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700"
                      >
                        {name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          )}

          {/* Notes */}
          {volunteer.notes && (
            <Card>
              <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
                Notes
              </h2>
              <p className="whitespace-pre-wrap text-sm text-gray-700">
                {volunteer.notes}
              </p>
            </Card>
          )}
        </div>

        {/* Right Column: Events, Committees, Activity */}
        <div className="space-y-6 lg:col-span-2">
          {/* Events */}
          <Card>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
                <Calendar className="h-4 w-4" aria-hidden="true" />
                Event History
                <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium normal-case text-blue-700">
                  {events.length}
                </span>
              </h2>
              {totalHours > 0 && (
                <span className="text-sm font-medium text-gray-600">
                  {totalHours.toFixed(1)} total hours
                </span>
              )}
            </div>

            {sortedEvents.length === 0 ? (
              <p className="py-4 text-center text-sm text-gray-400">
                No events attended yet.
              </p>
            ) : (
              <div className="space-y-2">
                {sortedEvents.map((ep) => (
                  <Link
                    key={ep.id}
                    href={`/events/${ep.events.id}`}
                    className="flex items-center justify-between rounded-lg border border-gray-100 p-3 transition-colors hover:bg-gray-50"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-gray-900">
                          {ep.events.title}
                        </p>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${EVENT_STATUS_COLORS[ep.events.status]}`}
                        >
                          {ep.events.status.charAt(0).toUpperCase() +
                            ep.events.status.slice(1)}
                        </span>
                      </div>
                      <div className="mt-0.5 flex items-center gap-3 text-xs text-gray-500">
                        <span>{formatDate(ep.events.start_date)}</span>
                        {ep.events.location && (
                          <span className="flex items-center gap-0.5">
                            <MapPin className="h-3 w-3" aria-hidden="true" />
                            {ep.events.location}
                          </span>
                        )}
                        {ep.notes && <span>{ep.notes}</span>}
                      </div>
                    </div>
                    <div className="ml-4 text-right">
                      <span className="text-sm font-semibold text-gray-700">
                        {ep.hours_logged}h
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </Card>

          {/* Committees */}
          <Card>
            <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
              <Users className="h-4 w-4" aria-hidden="true" />
              Committees
              <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium normal-case text-purple-700">
                {committees.length}
              </span>
            </h2>

            {committees.length === 0 ? (
              <p className="py-4 text-center text-sm text-gray-400">
                Not a member of any committees.
              </p>
            ) : (
              <div className="space-y-2">
                {committees.map((cm) => (
                  <div
                    key={cm.committee_id}
                    className="flex items-center justify-between rounded-lg border border-gray-100 p-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {cm.committees.name}
                      </p>
                      {cm.committees.description && (
                        <p className="mt-0.5 text-xs text-gray-500 line-clamp-1">
                          {cm.committees.description}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="rounded-full bg-purple-50 px-2.5 py-0.5 text-xs font-medium text-purple-700">
                        {cm.role || "Member"}
                      </span>
                      <p className="mt-0.5 text-[10px] text-gray-400">
                        Since {formatDate(cm.joined_at)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Activity Timeline */}
          <Card>
            <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
              <Clock className="h-4 w-4" aria-hidden="true" />
              Recent Activity
            </h2>

            {activity.length === 0 ? (
              <p className="py-4 text-center text-sm text-gray-400">
                No activity recorded.
              </p>
            ) : (
              <div className="relative space-y-0">
                <div className="absolute left-[11px] top-2 h-[calc(100%-16px)] w-0.5 bg-gray-100" />
                {activity.map((log) => (
                  <div key={log.id} className="relative flex gap-3 pb-4">
                    <div className="relative z-10 mt-1 h-6 w-6 shrink-0 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center">
                      <FileText
                        className="h-3 w-3 text-gray-400"
                        aria-hidden="true"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-gray-700">
                        {formatAction(log.action)}
                      </p>
                      <p className="text-xs text-gray-400">
                        {formatRelativeTime(log.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}


