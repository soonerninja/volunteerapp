import { Settings } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
      <EmptyState
        icon={Settings}
        title="Settings coming soon"
        description="Manage your organization settings, team members, and billing."
      />
    </div>
  );
}
