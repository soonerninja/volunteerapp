"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const TIERS = ["free", "starter", "growth"] as const;

export function TierControl({ orgId, currentTier }: { orgId: string; currentTier: string }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [value, setValue] = useState(currentTier);

  const change = async (next: string) => {
    if (next === value || saving) return;
    setSaving(true);
    setValue(next);
    const res = await fetch("/api/super/set-tier", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orgId, tier: next }),
    });
    if (!res.ok) {
      setValue(currentTier);
      setSaving(false);
      const { error } = await res.json().catch(() => ({ error: "" }));
      alert(`Failed to set tier: ${error || res.statusText}`);
      return;
    }
    setSaving(false);
    router.refresh();
  };

  return (
    <select
      value={value}
      disabled={saving}
      onChange={(e) => change(e.target.value)}
      className="text-xs rounded-md border-gray-300 bg-white px-1.5 py-0.5 disabled:opacity-50"
      aria-label="Change plan tier"
    >
      {TIERS.map((t) => (
        <option key={t} value={t}>{t}</option>
      ))}
    </select>
  );
}
