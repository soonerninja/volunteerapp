export type OrganizationTier = "free" | "starter" | "growth";

export interface Organization {
  id: string;
  name: string;
  slug: string;
  tier: OrganizationTier;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  max_volunteers: number;
  created_at: string;
  updated_at: string;
}

export type UserRole = "owner" | "admin" | "editor" | "viewer";

export interface Profile {
  id: string;
  org_id: string | null;
  email: string;
  full_name: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export type VolunteerStatus = "active" | "inactive" | "on_leave";

export interface Volunteer {
  id: string;
  org_id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  status: VolunteerStatus;
  notes: string | null;
  joined_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface Skill {
  id: string;
  org_id: string;
  name: string;
  created_at: string;
}

export interface VolunteerSkill {
  volunteer_id: string;
  skill_id: string;
}

export interface Role {
  id: string;
  org_id: string;
  name: string;
  created_at: string;
}

export interface VolunteerRole {
  volunteer_id: string;
  role_id: string;
  assigned_at: string;
}

export interface Committee {
  id: string;
  org_id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface VolunteerCommittee {
  volunteer_id: string;
  committee_id: string;
  role: string;
  joined_at: string;
}

export type EventStatus = "upcoming" | "active" | "completed" | "cancelled";

export interface Event {
  id: string;
  org_id: string;
  title: string;
  description: string | null;
  location: string | null;
  start_date: string;
  end_date: string;
  max_volunteers: number | null;
  status: EventStatus;
  created_at: string;
  updated_at: string;
}

export interface EventVolunteer {
  id: string;
  event_id: string;
  volunteer_id: string;
  hours_logged: number;
  checked_in: boolean;
  notes: string | null;
  created_at: string;
}

export type InviteStatus = "pending" | "accepted" | "expired";

export interface TeamInvite {
  id: string;
  org_id: string;
  email: string;
  role: UserRole;
  invited_by: string;
  status: InviteStatus;
  created_at: string;
}

export type AuditAction =
  | "volunteer.created"
  | "volunteer.updated"
  | "volunteer.deleted"
  | "event.created"
  | "event.updated"
  | "event.deleted"
  | "committee.created"
  | "committee.updated"
  | "committee.deleted"
  | "signup.created"
  | "signup.deleted"
  | "hours.logged"
  | "org.updated"
  | "team.invited"
  | "team.invite_revoked";

export interface AuditLog {
  id: string;
  org_id: string;
  user_id: string;
  action: AuditAction;
  entity_type: string;
  entity_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

// Dashboard types
export interface DashboardStats {
  activeVolunteers: number;
  totalVolunteers: number;
  onLeaveCount: number;
  inactiveCount: number;
  hoursThisYear: number;
}

export interface UpcomingEvent extends Event {
  signup_count: number;
}

export interface NeedsOutreachVolunteer {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  last_event_date: string | null;
}
