export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatDateTime(date: string | Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatRelativeTime(date: string | Date): string {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(date);
}

export function formatAction(action: string): string {
  const map: Record<string, string> = {
    "volunteer.created": "Volunteer profile created",
    "volunteer.updated": "Volunteer profile updated",
    "volunteer.deleted": "Volunteer deleted",
    "event.created": "Event created",
    "event.updated": "Event updated",
    "event.deleted": "Event deleted",
    "committee.created": "Committee created",
    "committee.updated": "Committee updated",
    "committee.deleted": "Committee deleted",
    "signup.created": "Signed up for event",
    "signup.deleted": "Removed from event",
    "hours.logged": "Hours logged",
    "org.updated": "Organization updated",
    "team.invited": "Team member invited",
    "team.invite_revoked": "Invite revoked",
  };
  if (map[action]) return map[action];
  const parts = action.split(".");
  if (parts.length === 2) {
    return `${parts[0]} ${parts[1]}`;
  }
  return action;
}
