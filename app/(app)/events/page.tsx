"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate } from "@/utils/format";
import type { Event, Volunteer } from "@/types/database";
import {
  Calendar,
  Plus,
  X,
  ChevronDown,
  Edit2,
  Trash2,
  MapPin,
  Users,
  Clock,
  UserPlus,
  Save,
} from "lucide-react";

type EventWithSignups = Event & { signup_count: number };
type EventVolunteerRow = {
  id: string;
  volunteer_id: string;
  hours_logged: number;
  notes: string | null;
  volunteers: { id: string; first_name: string; last_name: string };
};

const STATUS_OPTIONS = [
  { value: "", label: "All Events" },
  { value: "upcoming", label: "Upcoming" },
  { value: "active", label: "Active" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

const STATUS_COLORS: Record<string, string> = {
  upcoming: "bg-blue-100 text-blue-700",
  active: "bg-green-100 text-green-700",
  completed: "bg-gray-100 text-gray-700",
  cancelled: "bg-red-100 text-red-700",
};

export default function EventsPage() {
  const { profile } = useAuth();
  const supabase = createClient();
  const orgId = profile?.org_id;

  const [events, setEvents] = useState<EventWithSignups[]>([]);
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("upcoming");
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Volunteer assignment panel
  const [selectedEvent, setSelectedEvent] = useState<EventWithSignups | null>(
    null
  );
  const [eventVolunteers, setEventVolunteers] = useState<EventVolunteerRow[]>(
    []
  );
  const [assignVolunteerId, setAssignVolunteerId] = useState("");
  const [hoursEdits, setHoursEdits] = useState<Record<string, string>>({});

  const [form, setForm] = useState({
    title: "",
    description: "",
    location: "",
    start_date: "",
    end_date: "",
    max_volunteers: "",
    status: "upcoming",
  });

  const fetchEvents = useCallback(async () => {
    if (!orgId) return;
    setLoading(true);

    let query = supabase
      .from("events")
      .select("*, event_volunteers(count)")
      .eq("org_id", orgId)
      .order("start_date", { ascending: false });

    if (statusFilter) {
      query = query.eq("status", statusFilter);
    }

    const { data } = await query;
    const eventsWithCount: EventWithSignups[] = (data || []).map((e) => ({
      ...e,
      signup_count: Array.isArray(e.event_volunteers)
        ? e.event_volunteers[0]?.count ?? 0
        : 0,
    }));
    setEvents(eventsWithCount);
    setLoading(false);
  }, [orgId, supabase, statusFilter]);

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
    fetchEvents();
    fetchVolunteers();
  }, [fetchEvents, fetchVolunteers]);

  const resetForm = () => {
    setForm({
      title: "",
      description: "",
      location: "",
      start_date: "",
      end_date: "",
      max_volunteers: "",
      status: "upcoming",
    });
    setEditingEvent(null);
    setShowForm(false);
    setError("");
  };

  const openEdit = (evt: Event) => {
    setEditingEvent(evt);
    setForm({
      title: evt.title,
      description: evt.description || "",
      location: evt.location || "",
      start_date: evt.start_date.slice(0, 16),
      end_date: evt.end_date.slice(0, 16),
      max_volunteers: evt.max_volunteers?.toString() || "",
      status: evt.status,
    });
    setShowForm(true);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgId || !profile) return;
    setSaving(true);
    setError("");

    const eventData = {
      org_id: orgId,
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

    if (editingEvent) {
      const { error: updateErr } = await supabase
        .from("events")
        .update(eventData)
        .eq("id", editingEvent.id);

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
        entity_id: editingEvent.id,
        metadata: { title: form.title },
      });
    } else {
      const { data: newEvent, error: insertErr } = await supabase
        .from("events")
        .insert(eventData)
        .select()
        .single();

      if (insertErr || !newEvent) {
        setError(insertErr?.message || "Failed to create event");
        setSaving(false);
        return;
      }

      await supabase.from("audit_log").insert({
        org_id: orgId,
        user_id: profile.id,
        action: "event.created",
        entity_type: "event",
        entity_id: newEvent.id,
        metadata: { title: form.title },
      });
    }

    setSaving(false);
    resetForm();
    fetchEvents();
  };

  const handleDelete = async (evt: Event) => {
    if (!confirm(`Delete "${evt.title}"?`)) return;
    if (!orgId || !profile) return;

    await supabase.from("events").delete().eq("id", evt.id);
    await supabase.from("audit_log").insert({
      org_id: orgId,
      user_id: profile.id,
      action: "event.deleted",
      entity_type: "event",
      entity_id: evt.id,
      metadata: { title: evt.title },
    });
    if (selectedEvent?.id === evt.id) setSelectedEvent(null);
    fetchEvents();
  };

  // --- Volunteer Assignment ---
  const openAssignPanel = async (evt: EventWithSignups) => {
    setSelectedEvent(evt);
    const { data } = await supabase
      .from("event_volunteers")
      .select(
        "id, volunteer_id, hours_logged, notes, volunteers(id, first_name, last_name)"
      )
      .eq("event_id", evt.id);
    setEventVolunteers((data as unknown as EventVolunteerRow[]) || []);
    setHoursEdits({});
  };

  const assignVolunteer = async () => {
    if (!assignVolunteerId || !selectedEvent || !orgId || !profile) return;

    const { error: assignErr } = await supabase
      .from("event_volunteers")
      .insert({
        event_id: selectedEvent.id,
        volunteer_id: assignVolunteerId,
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
      entity_id: selectedEvent.id,
      metadata: { volunteer_id: assignVolunteerId },
    });

    setAssignVolunteerId("");
    openAssignPanel(selectedEvent);
    fetchEvents();
  };

  const removeVolunteer = async (evId: string) => {
    if (!orgId || !profile || !selectedEvent) return;
    await supabase.from("event_volunteers").delete().eq("id", evId);
    await supabase.from("audit_log").insert({
      org_id: orgId,
      user_id: profile.id,
      action: "signup.deleted",
      entity_type: "event_volunteer",
      entity_id: selectedEvent.id,
    });
    openAssignPanel(selectedEvent);
    fetchEvents();
  };

  const saveHours = async (evId: string) => {
    const hours = parseFloat(hoursEdits[evId] || "0");
    if (isNaN(hours) || !orgId || !profile || !selectedEvent) return;

    await supabase
      .from("event_volunteers")
      .update({ hours_logged: hours })
      .eq("id", evId);

    await supabase.from("audit_log").insert({
      org_id: orgId,
      user_id: profile.id,
      action: "hours.logged",
      entity_type: "event_volunteer",
      entity_id: selectedEvent.id,
      metadata: { hours },
    });

    openAssignPanel(selectedEvent);
  };

  const assignedVolunteerIds = eventVolunteers.map((ev) => ev.volunteer_id);
  const unassignedVolunteers = volunteers.filter(
    (v) => !assignedVolunteerIds.includes(v.id)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Events</h1>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Event
        </Button>
      </div>

      {/* Filter */}
      <div className="relative w-48">
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

      {/* Create/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingEvent ? "Edit Event" : "Create Event"}
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
              <Input
                label="Event Title *"
                id="title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
              <Input
                label="Location"
                id="location"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Start Date/Time *"
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
              </div>
              <div className="grid grid-cols-2 gap-3">
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
                  {editingEvent ? "Save Changes" : "Create Event"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Volunteer Assignment Panel */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {selectedEvent.title}
                </h2>
                <p className="text-sm text-gray-500">
                  Manage volunteers & hours
                </p>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
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

            {/* Assign new volunteer */}
            <div className="mb-4 flex gap-2">
              <div className="relative flex-1">
                <select
                  value={assignVolunteerId}
                  onChange={(e) => setAssignVolunteerId(e.target.value)}
                  className="block w-full appearance-none rounded-lg border border-gray-300 bg-white px-3 py-2 pr-8 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">Select volunteer to assign...</option>
                  {unassignedVolunteers.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.first_name} {v.last_name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              </div>
              <Button
                onClick={assignVolunteer}
                disabled={!assignVolunteerId}
                size="sm"
              >
                <UserPlus className="mr-1 h-4 w-4" />
                Assign
              </Button>
            </div>

            {/* Assigned volunteers */}
            {eventVolunteers.length === 0 ? (
              <EmptyState
                icon={Users}
                title="No volunteers assigned"
                description="Assign volunteers to this event using the dropdown above."
              />
            ) : (
              <div className="space-y-2">
                {eventVolunteers.map((ev) => (
                  <div
                    key={ev.id}
                    className="flex items-center justify-between rounded-lg border border-gray-100 p-3"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {ev.volunteers.first_name} {ev.volunteers.last_name}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-gray-400" />
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
                          className="w-16 rounded border border-gray-200 px-2 py-1 text-sm"
                        />
                        <span className="text-xs text-gray-500">hrs</span>
                      </div>
                      {hoursEdits[ev.id] !== undefined &&
                        hoursEdits[ev.id] !== ev.hours_logged.toString() && (
                          <button
                            onClick={() => saveHours(ev.id)}
                            className="rounded p-1 text-blue-600 hover:bg-blue-50"
                            title="Save hours"
                          >
                            <Save className="h-4 w-4" />
                          </button>
                        )}
                      <button
                        onClick={() => removeVolunteer(ev.id)}
                        className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-600"
                        title="Remove"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
                <div className="pt-2 text-right text-sm text-gray-500">
                  Total:{" "}
                  {eventVolunteers
                    .reduce((sum, ev) => {
                      const edited = hoursEdits[ev.id];
                      return (
                        sum +
                        (edited !== undefined
                          ? parseFloat(edited) || 0
                          : ev.hours_logged)
                      );
                    }, 0)
                    .toFixed(1)}{" "}
                  hours
                </div>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Event List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        </div>
      ) : events.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No events found"
          description="Create your first event to start coordinating volunteers."
          action={
            <Button size="sm" onClick={() => setShowForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Event
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {events.map((evt) => (
            <Card key={evt.id} padding="sm">
              <div className="flex items-start justify-between gap-4">
                <div
                  className="min-w-0 flex-1 cursor-pointer"
                  onClick={() => openAssignPanel(evt)}
                >
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-gray-900">{evt.title}</h3>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[evt.status]}`}
                    >
                      {evt.status.charAt(0).toUpperCase() +
                        evt.status.slice(1)}
                    </span>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {formatDate(evt.start_date)}
                    </span>
                    {evt.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {evt.location}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      {evt.signup_count}
                      {evt.max_volunteers
                        ? `/${evt.max_volunteers}`
                        : ""}{" "}
                      volunteers
                    </span>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => openEdit(evt)}
                    className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                    title="Edit"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(evt)}
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
