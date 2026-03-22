import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DashboardContent } from "./dashboard-content";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("org_id")
    .eq("id", user.id)
    .single();

  if (!profile?.org_id) redirect("/onboarding");

  const orgId = profile.org_id;

  // Fetch all dashboard data in parallel
  const [
    volunteerCounts,
    hoursThisYear,
    upcomingEvents,
    needsOutreach,
    recentActivity,
    orgData,
  ] = await Promise.all([
    // Volunteer status counts
    supabase.from("volunteers").select("status").eq("org_id", orgId),

    // Hours this year
    supabase
      .from("event_volunteers")
      .select("hours_logged, events!inner(org_id, start_date)")
      .eq("events.org_id", orgId)
      .gte("events.start_date", `${new Date().getFullYear()}-01-01`),

    // Upcoming events (next 30 days)
    supabase
      .from("events")
      .select("*, event_volunteers(count)")
      .eq("org_id", orgId)
      .in("status", ["upcoming", "active"])
      .gte("start_date", new Date().toISOString())
      .lte(
        "start_date",
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      )
      .order("start_date", { ascending: true })
      .limit(5),

    // Needs outreach: active volunteers with no event in 60+ days
    supabase.rpc("get_needs_outreach_volunteers", {
      p_org_id: orgId,
      p_days: 60,
      p_limit: 5,
    }),

    // Recent activity
    supabase
      .from("audit_log")
      .select("*")
      .eq("org_id", orgId)
      .order("created_at", { ascending: false })
      .limit(10),

    // Org name
    supabase
      .from("organizations")
      .select("name")
      .eq("id", orgId)
      .single(),
  ]);

  // Compute stats
  const volunteers = volunteerCounts.data || [];
  const activeCount = volunteers.filter((v) => v.status === "active").length;
  const inactiveCount = volunteers.filter(
    (v) => v.status === "inactive"
  ).length;
  const onLeaveCount = volunteers.filter(
    (v) => v.status === "on_leave"
  ).length;
  const totalCount = volunteers.length;

  const totalHours = (hoursThisYear.data || []).reduce(
    (sum, ev) => sum + (Number(ev.hours_logged) || 0),
    0
  );

  // Format upcoming events with signup count
  const events = (upcomingEvents.data || []).map((e) => ({
    ...e,
    signup_count: Array.isArray(e.event_volunteers)
      ? e.event_volunteers[0]?.count ?? 0
      : 0,
  }));

  return (
    <DashboardContent
      stats={{
        activeVolunteers: activeCount,
        totalVolunteers: totalCount,
        onLeaveCount,
        inactiveCount,
        hoursThisYear: totalHours,
      }}
      upcomingEvents={events}
      needsOutreach={needsOutreach.data || []}
      recentActivity={recentActivity.data || []}
      orgName={orgData.data?.name || ""}
    />
  );
}
