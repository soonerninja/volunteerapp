"use client";

import {
  Users,
  UserCheck,
  UserMinus,
  Clock,
  Calendar,
  AlertCircle,
  Activity,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate, formatRelativeTime } from "@/utils/format";
import type {
  DashboardStats,
  UpcomingEvent,
  NeedsOutreachVolunteer,
  AuditLog,
} from "@/types/database";
import Link from "next/link";

interface DashboardContentProps {
  stats: DashboardStats;
  upcomingEvents: UpcomingEvent[];
  needsOutreach: NeedsOutreachVolunteer[];
  recentActivity: AuditLog[];
  orgName: string;
}

function StatCard({
  title,
  value,
  icon: Icon,
  color,
}: {
  title: string;
  value: number;
  icon: React.ElementType;
  color: string;
}) {
  const colorMap: Record<string, { bg: string; text: string }> = {
    blue: { bg: "bg-blue-50", text: "text-blue-600" },
    green: { bg: "bg-green-50", text: "text-green-600" },
    amber: { bg: "bg-amber-50", text: "text-amber-600" },
    purple: { bg: "bg-purple-50", text: "text-purple-600" },
  };
  const colors = colorMap[color] || colorMap.blue;

  return (
    <Card>
      <div className="flex items-center gap-4">
        <div className={`rounded-lg ${colors.bg} p-3`}>
          <Icon className={`h-5 w-5 ${colors.text}`} />
        </div>
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </Card>
  );
}

function formatAction(action: string): string {
  const parts = action.split(".");
  if (parts.length !== 2) return action;
  const [entity, verb] = parts;
  const pastVerbs: Record<string, string> = {
    created: "created",
    updated: "updated",
    deleted: "deleted",
    logged: "logged",
  };
  return `${entity} ${pastVerbs[verb] || verb}`;
}

export function DashboardContent({
  stats,
  upcomingEvents,
  needsOutreach,
  recentActivity,
  orgName,
}: DashboardContentProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500">{orgName}</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Active Volunteers"
          value={stats.activeVolunteers}
          icon={UserCheck}
          color="green"
        />
        <StatCard
          title="Total Volunteers"
          value={stats.totalVolunteers}
          icon={Users}
          color="blue"
        />
        <StatCard
          title="On Leave / Inactive"
          value={stats.onLeaveCount + stats.inactiveCount}
          icon={UserMinus}
          color="amber"
        />
        <StatCard
          title="Hours This Year"
          value={stats.hoursThisYear}
          icon={Clock}
          color="purple"
        />
      </div>

      {/* Two-column layout for lists */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Upcoming Events */}
        <Card>
          <div className="mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-500" />
            <h2 className="text-lg font-semibold text-gray-900">
              Upcoming Events
            </h2>
          </div>
          {upcomingEvents.length === 0 ? (
            <EmptyState
              icon={Calendar}
              title="No upcoming events"
              description="Create your first event to start coordinating volunteers."
              action={
                <Link
                  href="/events"
                  className="text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  Go to Events &rarr;
                </Link>
              }
            />
          ) : (
            <div className="space-y-3">
              {upcomingEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between rounded-lg border border-gray-100 p-3"
                >
                  <div>
                    <p className="font-medium text-gray-900">{event.title}</p>
                    <p className="text-sm text-gray-500">
                      {formatDate(event.start_date)}
                      {event.location && ` · ${event.location}`}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-medium text-gray-700">
                      {event.signup_count}
                      {event.max_volunteers
                        ? `/${event.max_volunteers}`
                        : ""}{" "}
                      signed up
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Needs Outreach */}
        <Card>
          <div className="mb-4 flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-500" />
            <h2 className="text-lg font-semibold text-gray-900">
              Needs Outreach
            </h2>
          </div>
          <p className="mb-3 text-xs text-gray-500">
            Active volunteers with no event participation in 60+ days
          </p>
          {needsOutreach.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No volunteers need outreach"
              description="All active volunteers have recent participation. Great job!"
            />
          ) : (
            <div className="space-y-2">
              {needsOutreach.map((v) => (
                <div
                  key={v.id}
                  className="flex items-center justify-between rounded-lg border border-gray-100 p-3"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      {v.first_name} {v.last_name}
                    </p>
                    {v.email && (
                      <p className="text-sm text-gray-500">{v.email}</p>
                    )}
                  </div>
                  <span className="text-xs text-gray-400">
                    {v.last_event_date
                      ? `Last: ${formatDate(v.last_event_date)}`
                      : "Never participated"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <div className="mb-4 flex items-center gap-2">
          <Activity className="h-5 w-5 text-blue-500" />
          <h2 className="text-lg font-semibold text-gray-900">
            Recent Activity
          </h2>
        </div>
        {recentActivity.length === 0 ? (
          <EmptyState
            icon={Activity}
            title="No activity yet"
            description="Activity will appear here as you add volunteers, create events, and log hours."
          />
        ) : (
          <div className="space-y-2">
            {recentActivity.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between border-b border-gray-50 py-2 last:border-0"
              >
                <p className="text-sm text-gray-700">
                  {formatAction(entry.action)}
                </p>
                <span className="text-xs text-gray-400">
                  {formatRelativeTime(entry.created_at)}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
