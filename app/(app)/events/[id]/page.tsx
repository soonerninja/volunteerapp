"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { VolunteerSearchSelect } from "@/components/ui/volunteer-search-select";
import { formatDate } from "@/utils/format";
import type { Event, Volunteer } from "@/types/database";
import {
  ArrowLeft,
  Save,
  Trash2,
  X,
  Clock,
  Users,
  Calendar,
  MapPin,
} from "lucide-react";
import Link from "next/link";

type EventVolunteerRow = {
  id: string;
  volunteer_id: string;
  hours_logged: number;
  notes: string | null;
  volunteers: { id: string; first_name: string; last_name: string };
};

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { profile } = useAuth();
  const supabase = createClient();
  const orgId = profile?.org_id;

  const [event, setEvent] = useState<Event | null>(null);
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [eventVolunteers, setEventVolunteers] = useState<EventVolunteerRow[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [hoursEdits, setHoursEdits] = useState<Record<string, string>>({});
  const [assignRole, setAssignRole] = useState("");
  const [stagedVolunteer, setStagedVolunteer] = useState<Volunteer | null>(null);

  // Form state
  const [form, setForm] = useState({
    title: "",
    description: "",
    location: "",
    start_date: "",
    end_date: "",
    max_volunteers: "",
    status: "upcoming",
  });

  const fetchEvent = useCallback(async () => {
    if (!orgId || !id) return;
    const { data } = await supabase
      .from("events")
      .select("*")
      .eq("id", id)
      .eq("org_id", orgId)
      .single();

    if (!data) {
      router.push("/events");
      return;
    }

    setEvent(data);
    setForm({
      title: data.title,
      description: data.description || "",
      location: data.location || "",
      start_date: data.start_date.slice(0, 16),
      end_date: data.end_date.slice(0, 16),
      max_volunteers: data.max_volunteers?.toString() || "",
      status: data.status,
    });
  }, [orgId, id, supabase, router]);

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

  const fetchEventVolunteers = useCallback(async () => {
    if (!id) return;
    const { data } = await supabase
      .from("event_volunteers")
      .select(
        "id, volunteer_id, hours_logged, notes, volunteers(id, first_name, last_name)"
      )
      .eq("event_id", id);
    setEventVolunteers((data as unknown as EventVolunteerRow[]) || []);
    setHoursEdits({});
  }, [id, supabase]);

  useEffect(() => {
    Promise.all([fetchEvent(), fetchVolunteers(), fetchEventVolunteers()]).then(
      () => setLoading(false)
    );
  }, [fetchEvent, fetchVolunteers, fetchEventVolunteers]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgId || !profile || !event) return;
    setSaving(true);
    setError("");
    setSuccess("");

    const eventData = {
      title: form.title.trim(),
      description: form.description.trim() || null,
      location: form.location.trim() || null,
      start_date: new Date(form.start_date).toISOString(),
      end_date: new Date(form.end_date).toISOString(),
      max_volunteers: form.max_volunteers
        ? parseInt(form.max_volunteers)
        : null,
      status: form.status,
    };

    const { error: updateErr } = await supabase
      .from("events")
      .update(eventData)
      .eq("id", event.id);

    if (updateErr) {
      setError(updateErr.message);
      setSaving(false);
      return;
    }

    await supabase.from("audit_log").insert({
      org_id: orgId,
      user_id: profile.id,
      action: "event.updated",
      entity_type: "event",
      entity_id: event.id,
      metadata: { title: form.title },
    });

    setSuccess("Event saved successfully.");
    setSaving(false);
    fetchEvent();
    setTimeout(() => setSuccess(""), 3000);
  };

  const handleDelete = async () => {
    if (!event || !orgId || !profile) return;
    if (!confirm(`Delete "${event.title}"? This cannot be undone.`)) return;

    await supabase.from("events").delete().eq("id", event.id);
    await supabase.from("audit_log").insert({
      org_id: orgId,
      user_id: profile.id,
      action: "event.deleted",
      entity_type: "event",
      entity_id: event.id,
      metadata: { title: event.title },
    });
    router.push("/events");
  };

  const assignVolunteer = async () => {
    if (!stagedVolunteer || !event || !orgId || !profile) return;

    const { error: assignErr } = await supabase
      .from("event_volunteers")
      .insert({
        event_id: event.id,
        volunteer_id: stagedVolunteer.id,
        notes: assignRole.trim() || null,
      });

    if (assignErr) {
      setError(assignErr.message);
      return;
    }

    await supabase.from("audit_log").insert({
      org_id: orgId,
      user_id: profile.id,
      action: "signup.created",
      entity_type: "event_volunteer",
      entity_id: event.id,
      metadata: { volunteer_id: stagedVolunteer.id },
    });

    setStagedVolunteer(null);
    setAssignRole("");
    fetchEventVolunteers();
  };

  const removeVolunteer = async (evId: string) => {
    if (!orgId || !profile || !event) return;
    await supabase.from("event_volunteers").delete().eq("id", evId);
    await supabase.from("audit_log").insert({
      org_id: orgId,
      user_id: profile.id,
      action: "signup.deleted",
      entity_type: "event_volunteer",
      entity_id: event.id,
    });
    fetchEventVolunteers();
  };

  const saveHours = async (evId: string) => {
    const hours = parseFloat(hoursEdits[evId] || "0");
    if (isNaN(hours) || !orgId || !profile || !event) return;

    await supabase
      .from("event_volunteers")
      .update({ hours_logged: hours })
      .eq("id", evId);

    await supabase.from("audit_log").insert({
      org_id: orgId,
      user_id: profile.id,
      action: "hours.logged",
      entity_type: "event_volunteer",
      entity_id: event.id,
      metadata: { hours },
    });

    fetchEventVolunteers();
  };

  const assignedIds = eventVolunteers.map((ev) => ev.volunteer_id);

  const totalHours = eventVolunteers.reduce((sum, ev) => {
    const edited = hoursEdits[ev.id];
    return sum + (edited !== undefined ? parseFloat(edited) || 0 : ev.hours_logged);
  }, 0);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (!event) return null;

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link
          href="/events"
          className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Events
        </Link>
        <span>/</span>
        <span className="text-gray-900">{event.title}</span>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left: Event Details Form */}
        <div className="lg:col-span-2">
          <Card>
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Edit Event
            </h2>

            {error && (
              <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">
                {success}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input
                  label="Event Name *"
                  id="title"
                  value={form.title}
                  onChange={(e) =>
                    setForm({ ...form, title: e.target.value })
                  }
                  required
                />
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Status
                  </label>
                  <select
                    value={form.status}
                    onChange={(e) =>
                      setForm({ ...form, status: e.target.value })
                    }
                    className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="upcoming">Upcoming</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Input
                  label="Date *"
                  id="start_date"
                  type="datetime-local"
                  value={form.start_date}
                  onChange={(e) =>
                    setForm({ ...form, start_date: e.target.value })
                  }
                  required
                />
                <Input
                  label="End Date/Time *"
                  id="end_date"
                  type="datetime-local"
                  value={form.end_date}
                  onChange={(e) =>
                    setForm({ ...form, end_date: e.target.value })
                  }
                  required
                />
                <Input
                  label="Location"
                  id="location"
                  value={form.location}
                  onChange={(e) =>
                    setForm({ ...form, location: e.target.value })
                  }
                />
              </div>

              <Input
                label="Max Volunteers"
                id="max_volunteers"
                type="number"
                min="1"
                value={form.max_volunteers}
                onChange={(e) =>
                  setForm({ ...form, max_volunteers: e.target.value })
                }
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
                  rows={4}
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex gap-3">
                  <Button type="submit" loading={saving}>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => router.push("/events")}
                  >
                    Cancel
                  </Button>
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleDelete}
                  className="!border-red-200 !text-red-600 hover:!bg-red-50"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </div>
            </form>
          </Card>
        </div>

        {/* Right: Assigned Volunteers */}
        <div className="lg:col-span-1">
          <Card>
            <div className="mb-4 flex items-center gap-2">
              <h2 className="text-lg font-semibold text-gray-900">
                Assigned Volunteers
              </h2>
              <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                {eventVolunteers.length}
              </span>
            </div>

            {/* Volunteer table */}
            {eventVolunteers.length > 0 && (
              <div className="mb-4">
                <div className="mb-2 grid grid-cols-[1fr_auto_auto] gap-2 text-xs font-medium uppercase text-gray-500">
                  <span>Volunteer</span>
                  <span className="w-20 text-center">Hours</span>
                  <span className="w-8" />
                </div>
                <div className="space-y-1.5">
                  {[...eventVolunteers]
                    .sort((a, b) => {
                      const aHasRole = a.notes ? 1 : 0;
                      const bHasRole = b.notes ? 1 : 0;
                      return bHasRole - aHasRole;
                    })
                    .map((ev) => {
                    const hasEdits =
                      hoursEdits[ev.id] !== undefined &&
                      hoursEdits[ev.id] !== ev.hours_logged.toString();
                    return (
                      <div
                        key={ev.id}
                        className="grid grid-cols-[1fr_auto_auto] items-center gap-2 rounded-lg border border-gray-100 px-3 py-2"
                      >
                        <div>
                          <Link
                            href={`/volunteers`}
                            className="text-sm font-medium text-blue-600 hover:text-blue-800"
                          >
                            {ev.volunteers.first_name} {ev.volunteers.last_name}
                          </Link>
                          {ev.notes && (
                            <p className="text-xs text-gray-500">{ev.notes}</p>
                          )}
                        </div>
                        <div className="flex w-20 items-center gap-1">
                          <input
                            type="number"
                            step="0.25"
                            min="0"
                            value={
                              hoursEdits[ev.id] ?? ev.hours_logged.toString()
                            }
                            onChange={(e) =>
                              setHoursEdits({
                                ...hoursEdits,
                                [ev.id]: e.target.value,
                              })
                            }
                            onBlur={() => {
                              if (hasEdits) saveHours(ev.id);
                            }}
                            className="w-16 rounded border border-gray-200 px-1.5 py-1 text-center text-sm"
                          />
                        </div>
                        <button
                          onClick={() => removeVolunteer(ev.id)}
                          className="flex h-6 w-6 items-center justify-center rounded text-gray-400 hover:bg-red-50 hover:text-red-600"
                          title="Remove"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-2 text-right text-xs text-gray-500">
                  Total: {totalHours.toFixed(1)} hours
                </div>
              </div>
            )}

            {/* Add volunteer */}
            <div className="border-t border-gray-100 pt-3">
              <p className="mb-2 text-xs font-medium text-gray-500">
                Add Volunteer
              </p>

              {stagedVolunteer ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between rounded-lg bg-blue-50 px-3 py-2">
                    <span className="text-sm font-medium text-blue-900">
                      {stagedVolunteer.first_name} {stagedVolunteer.last_name}
                    </span>
                    <button
                      onClick={() => setStagedVolunteer(null)}
                      className="rounded p-0.5 text-blue-400 hover:text-blue-600"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <input
                    type="text"
                    value={assignRole}
                    onChange={(e) => setAssignRole(e.target.value)}
                    placeholder="Role (optional)"
                    className="block w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <Button
                    onClick={assignVolunteer}
                    size="sm"
                    className="w-full"
                  >
                    Assign
                  </Button>
                </div>
              ) : (
                <VolunteerSearchSelect
                  volunteers={volunteers}
                  excludeIds={assignedIds}
                  onSelect={(vol) => setStagedVolunteer(vol)}
                  placeholder="Search to assign..."
                />
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
