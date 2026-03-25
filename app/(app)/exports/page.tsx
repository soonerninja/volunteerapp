"use client";

import { useState } from "react";
import { useOrg } from "@/hooks/use-org";
import { usePlan } from "@/hooks/use-plan";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UpgradePrompt } from "@/components/ui/upgrade-prompt";
import { downloadCSV } from "@/lib/csv-export";
import {
  FileDown,
  Users,
  Calendar,
  Clock,
  UsersRound,
  Download,
} from "lucide-react";

interface ExportOption {
  id: string;
  label: string;
  description: string;
  icon: typeof Users;
}

const EXPORT_OPTIONS: ExportOption[] = [
  {
    id: "volunteers",
    label: "Volunteers",
    description: "All volunteers with status, contact info, join date",
    icon: Users,
  },
  {
    id: "events",
    label: "Events",
    description: "All events with dates, location, status, signup counts",
    icon: Calendar,
  },
  {
    id: "hours",
    label: "Volunteer Hours",
    description: "Hours logged per volunteer per event, with check-in status",
    icon: Clock,
  },
  {
    id: "committees",
    label: "Committees & Members",
    description: "Committees with member rosters and roles",
    icon: UsersRound,
  },
];

export default function ExportsPage() {
  const { supabase, orgId } = useOrg();
  const plan = usePlan();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState("");

  const canExport = plan.hasFeature("exports");

  const handleExport = async (exportId: string) => {
    if (!orgId) return;
    if (!plan.hasFeature('exports')) {
      setError('CSV exports require the Starter plan or higher. Upgrade in Settings > Plan & Billing.');
      return;
    }
    setLoading(exportId);
    setError("");

    try {
      switch (exportId) {
        case "volunteers":
          await exportVolunteers();
          break;
        case "events":
          await exportEvents();
          break;
        case "hours":
          await exportHours();
          break;
        case "committees":
          await exportCommittees();
          break;
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Export failed. Please try again."
      );
    }

    setLoading(null);
  };

  const exportVolunteers = async () => {
    const { data, error: fetchErr } = await supabase
      .from("volunteers")
      .select("*")
      .eq("org_id", orgId!)
      .order("last_name");

    if (fetchErr) throw new Error(fetchErr.message);
    if (!data || data.length === 0) throw new Error("No volunteers to export.");

    downloadCSV(
      data.map((v) => ({
        first_name: v.first_name,
        last_name: v.last_name,
        email: v.email || "",
        phone: v.phone || "",
        status: v.status,
        joined_date: v.joined_date || "",
        notes: v.notes || "",
      })),
      `volunteers-${new Date().toISOString().slice(0, 10)}`,
      [
        { key: "first_name", label: "First Name" },
        { key: "last_name", label: "Last Name" },
        { key: "email", label: "Email" },
        { key: "phone", label: "Phone" },
        { key: "status", label: "Status" },
        { key: "joined_date", label: "Joined Date" },
        { key: "notes", label: "Notes" },
      ]
    );
  };

  const exportEvents = async () => {
    const { data, error: fetchErr } = await supabase
      .from("events")
      .select("*, event_volunteers(id)")
      .eq("org_id", orgId!)
      .order("start_date", { ascending: false });

    if (fetchErr) throw new Error(fetchErr.message);
    if (!data || data.length === 0) throw new Error("No events to export.");

    downloadCSV(
      data.map((e) => ({
        title: e.title,
        status: e.status,
        start_date: e.start_date,
        end_date: e.end_date,
        location: e.location || "",
        address: e.address || "",
        max_volunteers: e.max_volunteers ?? "",
        signups: Array.isArray(e.event_volunteers)
          ? e.event_volunteers.length
          : 0,
        description: e.description || "",
      })),
      `events-${new Date().toISOString().slice(0, 10)}`,
      [
        { key: "title", label: "Event Title" },
        { key: "status", label: "Status" },
        { key: "start_date", label: "Start Date" },
        { key: "end_date", label: "End Date" },
        { key: "location", label: "Location" },
        { key: "address", label: "Address" },
        { key: "max_volunteers", label: "Max Volunteers" },
        { key: "signups", label: "Signups" },
        { key: "description", label: "Description" },
      ]
    );
  };

  const exportHours = async () => {
    const { data, error: fetchErr } = await supabase
      .from("event_volunteers")
      .select(
        "hours_logged, checked_in, notes, created_at, volunteer:volunteers(first_name, last_name, email), event:events!inner(title, start_date, org_id)"
      )
      .eq("event.org_id", orgId!)
      .order("created_at", { ascending: false });

    if (fetchErr) throw new Error(fetchErr.message);
    if (!data || data.length === 0)
      throw new Error("No volunteer hours to export.");

    downloadCSV(
      data.map((row) => {
        const vol = row.volunteer as unknown as Record<string, string> | null;
        const evt = row.event as unknown as Record<string, string> | null;
        return {
          volunteer_name: vol
            ? `${vol.first_name} ${vol.last_name}`
            : "Unknown",
          volunteer_email: vol?.email || "",
          event_title: evt?.title || "",
          event_date: evt?.start_date || "",
          hours_logged: row.hours_logged,
          checked_in: row.checked_in ? "Yes" : "No",
          notes: row.notes || "",
        };
      }),
      `volunteer-hours-${new Date().toISOString().slice(0, 10)}`,
      [
        { key: "volunteer_name", label: "Volunteer Name" },
        { key: "volunteer_email", label: "Volunteer Email" },
        { key: "event_title", label: "Event" },
        { key: "event_date", label: "Event Date" },
        { key: "hours_logged", label: "Hours Logged" },
        { key: "checked_in", label: "Checked In" },
        { key: "notes", label: "Notes" },
      ]
    );
  };

  const exportCommittees = async () => {
    // Fetch committees
    const { data: committees, error: commErr } = await supabase
      .from("committees")
      .select("*")
      .eq("org_id", orgId!)
      .order("name");

    if (commErr) throw new Error(commErr.message);
    if (!committees || committees.length === 0)
      throw new Error("No committees to export.");

    // Fetch committee memberships with volunteer info
    const { data: memberships, error: memErr } = await supabase
      .from("volunteer_committees")
      .select(
        "committee_id, role, joined_at, volunteer:volunteers(first_name, last_name, email)"
      )
      .in(
        "committee_id",
        committees.map((c) => c.id)
      );

    if (memErr) throw new Error(memErr.message);

    const committeeMap = new Map(committees.map((c) => [c.id, c.name]));
    const rows: Record<string, unknown>[] = [];

    // Add committee rows with members
    if (memberships && memberships.length > 0) {
      for (const m of memberships) {
        const vol = m.volunteer as unknown as Record<string, string> | null;
        rows.push({
          committee: committeeMap.get(m.committee_id) || "",
          member_name: vol
            ? `${vol.first_name} ${vol.last_name}`
            : "Unknown",
          member_email: vol?.email || "",
          committee_role: m.role || "",
          joined_at: m.joined_at || "",
        });
      }
    } else {
      // Just list committees without members
      for (const c of committees) {
        rows.push({
          committee: c.name,
          member_name: "",
          member_email: "",
          committee_role: "",
          joined_at: "",
        });
      }
    }

    downloadCSV(
      rows,
      `committees-${new Date().toISOString().slice(0, 10)}`,
      [
        { key: "committee", label: "Committee" },
        { key: "member_name", label: "Member Name" },
        { key: "member_email", label: "Member Email" },
        { key: "committee_role", label: "Role in Committee" },
        { key: "joined_at", label: "Joined" },
      ]
    );
  };

  if (plan.loading) {
    return (
      <div className="flex justify-center py-12">
        <div
          className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"
          role="status"
          aria-label="Loading"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Export Data</h1>
        <p className="mt-1 text-sm text-gray-500">
          Download your data as CSV files for reporting and analysis.
        </p>
      </div>

      {!canExport && (
        <UpgradePrompt
          feature="CSV exports"
          requiredTier="starter"
          variant="card"
        />
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {EXPORT_OPTIONS.map((option) => {
          const Icon = option.icon;
          const isLoading = loading === option.id;

          return (
            <Card key={option.id} className={!canExport ? "opacity-60" : ""}>
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                  <Icon className="h-5 w-5 text-blue-600" aria-hidden="true" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900">
                    {option.label}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {option.description}
                  </p>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="mt-3"
                    disabled={!canExport || isLoading}
                    loading={isLoading}
                    onClick={() => handleExport(option.id)}
                  >
                    <Download className="mr-1.5 h-4 w-4" aria-hidden="true" />
                    {isLoading ? "Exporting..." : "Download CSV"}
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {error && (
        <div
          role="alert"
          aria-live="polite"
          className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          {error}
        </div>
      )}
    </div>
  );
}
