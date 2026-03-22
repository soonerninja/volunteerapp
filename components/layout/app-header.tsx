"use client";

import { useEffect, useState } from "react";
import { Menu, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { createClient } from "@/lib/supabase/client";

interface AppHeaderProps {
  onMenuClick: () => void;
}

export function AppHeader({ onMenuClick }: AppHeaderProps) {
  const { user, profile, signOut } = useAuth();
  const [orgName, setOrgName] = useState("");

  useEffect(() => {
    async function fetchOrg() {
      if (!profile?.org_id) return;
      const supabase = createClient();
      const { data } = await supabase
        .from("organizations")
        .select("name")
        .eq("id", profile.org_id)
        .single();
      if (data) setOrgName(data.name);
    }
    fetchOrg();
  }, [profile?.org_id]);

  const displayName = profile?.full_name || user?.email || "";

  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 lg:px-6">
      <button
        onClick={onMenuClick}
        className="rounded-md p-2 text-gray-500 hover:bg-gray-100 lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="hidden lg:block" />

      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm font-medium text-gray-900">{displayName}</p>
          {orgName && <p className="text-xs text-gray-500">{orgName}</p>}
        </div>
        <button
          onClick={signOut}
          className="rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          title="Sign out"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
