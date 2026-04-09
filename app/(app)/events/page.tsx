"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useOrg } from "@/hooks/use-org";
import { usePermissions } from "@/hooks/use-permissions";
import { usePlan } from "@/hooks/use-plan";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ListSkeleton } from "@/components/ui/list-skeleton";
import { PlanLimitBadge, UpgradePrompt } from "@/components/ui/upgrade-prompt";
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

const PAGE_SIZE = 25;

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
  const { supabase, orgId, profile } = useOrg();
  const { canEdit } = usePermissions();
  const { canAdd, usageLabel, refreshCounts } = usePlan();
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));

  const [events, setEvents] = useState<EventWithSignups[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("upcoming");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const firstInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    location: "",
    address: "",
    start_date: "",
    end_date: "",
    max_volunteers: "",
    status: "upcoming",
  });

  const fetchEvents = useCallback(async () => {
    if (!orgId) return;
    setLoading(true);

    const offset = (page - 1) * PAGE_SIZE;

    // Count query
    let countQuery = supabase
      .from("events")
      .select("*", { count: "exact", head: true })
      .eq("org_id", orgId);
    if (statusFilter) {
      countQuery = countQuery.eq("status", statusFilter);
    }
    const { count } = await countQuery;
    setTotalCount(count ?? 0);

    // Data query with pagination
    let query = supabase
      .from("events")
      .select("*, event_volunteers(count)")
      .eq("org_id", orgId)
      .order("start_date", { ascending: false })
      .range(offset, offset + PAGE_SIZE - 1);

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
  }, [orgId, supabase, statusFilter, page]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  useEffect(() => {
    if (showCreateForm) {
      setTimeout(() => firstInputRef.current?.focus(), 50);
    }
  }, [showCreateForm]);

  const resetForm = () => {
    setForm({
      title: "",
      description: "",
      location: "",
      address: "",
      start_date: "",
      end_date: "",
      max_volunteers: "",
      status: "upcoming",
    });
    setShowCreateForm(false);
    setError("");
    setFieldErrors({});
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!form.title.trim()) errors.title = "Title is required.";
    if (!form.start_date) errors.start_date = "Start date is required.";
    if (!form.end_date) errors.end_date = "End date is required.";

    if (form.start_date && form.end_date) {
      if (new Date(form.end_date) <= new Date(form.start_date)) {
        errors.end_date = "End date must be after start date.";
      }
    }

    if (form.max_volunteers) {
      const maxVol = parseInt(form.max_volunteers);
      if (isNaN(maxVol) || maxVol < 1) {
        errors.max_volunteers = "Must be a positive number.";
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgId || !profile) return;
    if (!validateForm()) return;

    setSaving(true);
    setError("");

    const eventData = {
      org_id: orgId,
      title: form.title.trim(),
      description: form.description.trim() || null,
      location: form.location.trim() || null,
      address: form.address.trim() || null,
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
    // Notify admins of new event. Awaited so serverless doesn't terminate
    // before the notification request is flushed; wrapped so email problems
    // never block navigation.
    try {
      await fetch("/api/notifications/event-saved", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId: newEvent.id, action: "created" }),
      });
    } catch {
      /* notification failures shouldn't block UX */
    }
    router.push(`/events/${newEvent.id}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900">Events</h1>
          <PlanLimitBadge usage={usageLabel("activeEvents")} atLimit={!canAdd("activeEvents")} />
        </div>
        {canEdit && (
          <div className="flex items-center gap-3">
            {!canAdd("activeEvents") && (
              <UpgradePrompt requiredTier="starter" feature="create more events" variant="inline" />
            )}
            <Button onClick={() => setShowCreateForm(true)} disabled={!canAdd("activeEvents")}>
              <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
              Create Event
            </Button>
          </div>
        )}
      </div>

      {/* Filter */}
      <div className="relative w-48">
        <label htmlFor="event-status-filter" className="sr-only">Filter by status</label>
        <select
          id="event-status-filter"
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
        <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" aria-hidden="true" />
      </div>

      {/* Quick Create Form */}
      {showCreateForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="create-event-title"
          onKeyDown={(e) => { if (e.key === "Escape") resetForm(); }}
        >
          <Card className="w-full max-w-lg">
            <div className="mb-4 flex items-center justify-between">
              <h2 id="create-event-title" className="text-lg font-semibold text-gray-900">
                Create Event
              </h2>
              <button
                onClick={resetForm}
                className="rounded-lg p-1 hover:bg-gray-100"
                aria-label="Close form"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {error && (
              <div role="alert" aria-live="polite" className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-4" noValidate>
              <Input
                ref={firstInputRef}
                label="Event Title *"
                id="title"
                value={form.title}
                onChange={(e) => {
                  setForm({ ...form, title: e.target.value });
                  setFieldErrors((p) => ({ ...p, title: "" }));
                }}
                error={fieldErrors.title}
                required
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Venue / Place Name"
                  id="location"
                  placeholder="e.g., Ruby Grant Park"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                />
                <Input
                  label="Address"
                  id="address"
                  placeholder="e.g., 123 Main St, Norman, OK"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Start Date/Time *"
                  id="start_date"
                  type="datetime-local"
                  value={form.start_date}
                  onChange={(e) => {
                    setForm({ ...form, start_date: e.target.value });
                    setFieldErrors((p) => ({ ...p, start_date: "", end_date: "" }));
                  }}
                  error={fieldErrors.start_date}
                  required
                />
                <Input
                  label="End Date/Time *"
                  id="end_date"
                  type="datetime-local"
                  value={form.end_date}
                  onChange={(e) => {
                    setForm({ ...form, end_date: e.target.value });
                    setFieldErrors((p) => ({ ...p, end_date: "" }));
                  }}
                  error={fieldErrors.end_date}
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
        <ListSkeleton rows={5} label="Loading events" />
      ) : events.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No events found"
          description="Create your first event to start coordinating volunteers."
          action={
            <Button size="sm" onClick={() => setShowCreateForm(true)}>
              <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
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
                      <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
                      {formatDate(evt.start_date)}
                    </span>
                    {(evt.location || evt.address) && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                        {evt.location || evt.address}
                        {evt.address && (
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(evt.address)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="ml-1 text-blue-600 hover:text-blue-800 underline"
                            aria-label={`Get directions to ${evt.location || evt.address}`}
                          >
                            Map
                          </a>
                        )}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" aria-hidden="true" />
                      {evt.signup_count}
                      {evt.max_volunteers
                        ? `/${evt.max_volunteers}`
                        : ""}{" "}
                      volunteers
                    </span>
                  </div>
                </div>
                <ChevronDown className="h-5 w-5 -rotate-90 text-gray-400" aria-hidden="true" />
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalCount > PAGE_SIZE && (
        <div className="flex items-center justify-between border-t border-gray-200 pt-4 mt-4">
          <p className="text-sm text-gray-500">
            Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, totalCount)} of {totalCount}
          </p>
          <div className="flex gap-2">
            <Link
              href={`?page=${page - 1}`}
              className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
                page <= 1 ? 'pointer-events-none text-gray-300 border-gray-100' : 'text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
              aria-disabled={page <= 1}
            >
              Previous
            </Link>
            <Link
              href={`?page=${page + 1}`}
              className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
                page * PAGE_SIZE >= totalCount ? 'pointer-events-none text-gray-300 border-gray-100' : 'text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
              aria-disabled={page * PAGE_SIZE >= totalCount}
            >
              Next
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
