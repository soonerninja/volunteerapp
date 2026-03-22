import { Users } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";

export default function VolunteersPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Volunteers</h1>
      <EmptyState
        icon={Users}
        title="Volunteer management coming soon"
        description="This page will let you add, search, and manage your volunteer database."
      />
    </div>
  );
}
