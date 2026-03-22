"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate } from "@/utils/format";
import type { Event } from "@/types/database";
import {
  Calendar,
  Plus,
  X,
  ChevronDown,
  MapPin,
  Users,
} from "lucide-react";

type EventWithSignups = Event & { signup_count: number };

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
  const router = useRouter();
  const supabase = createClient();
  const orgId = profile?.org_id;

  const [events, setEvents] = useState<EventWithSignups[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("upcoming");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

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

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

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
    setShowCreateForm(false);
    setError("");
  };

  const handleCreate = async (e: React.FormEvent) => {
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

    setSaving(false);
    resetForm();
    // Navigate to the new event's detail page
    router.push(`/events/${newEvent.id}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Events</h1>
        <Button onClick={() => setShowCreateForm(true)}>
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

      {/* Quick Create Form - small modal just for initial creation */}
      {showCreateForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-lg">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Create Event
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

            <form onSubmit={handleCreate} className="space-y-4">
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
              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="secondary" onClick={resetForm}>
                  Cancel
                </Button>
                <Button type="submit" loading={saving}>
                  Create & Open
                </Button>
              </div>
            </form>
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
            <Button size="sm" onClick={() => setShowCreateForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Event
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {events.map((evt) => (
            <Card
              key={evt.id}
              padding="sm"
              className="cursor-pointer transition-shadow hover:shadow-md"
              onClick={() => router.push(`/events/${evt.id}`)}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
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
                <ChevronDown className="h-5 w-5 -rotate-90 text-gray-400" />
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
