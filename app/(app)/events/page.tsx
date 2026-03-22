import { Calendar } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";

export default function EventsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Events</h1>
      <EmptyState
        icon={Calendar}
        title="Event management coming soon"
        description="This page will let you create events, manage sign-ups, and track attendance."
      />
    </div>
  );
}
