import { UsersRound } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";

export default function CommitteesPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Committees</h1>
      <EmptyState
        icon={UsersRound}
        title="Committee management coming soon"
        description="This page will let you organize volunteers into committees and working groups."
      />
    </div>
  );
}
