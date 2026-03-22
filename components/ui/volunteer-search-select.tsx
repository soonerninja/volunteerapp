"use client";

import { useState, useRef, useEffect } from "react";
import { Search, X } from "lucide-react";
import type { Volunteer } from "@/types/database";

interface VolunteerSearchSelectProps {
  volunteers: Volunteer[];
  excludeIds?: string[];
  onSelect: (volunteer: Volunteer) => void;
  placeholder?: string;
}

export function VolunteerSearchSelect({
  volunteers,
  excludeIds = [],
  onSelect,
  placeholder = "Search volunteers...",
}: VolunteerSearchSelectProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const available = volunteers.filter((v) => !excludeIds.includes(v.id));

  const filtered = query.trim()
    ? available.filter((v) =>
        `${v.first_name} ${v.last_name} ${v.email || ""}`
          .toLowerCase()
          .includes(query.toLowerCase())
      )
    : available;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (vol: Volunteer) => {
    onSelect(vol);
    setQuery("");
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative flex-1">
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="block w-full rounded-lg border border-gray-300 bg-white py-2 pl-8 pr-8 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        {query && (
          <button
            onClick={() => {
              setQuery("");
              inputRef.current?.focus();
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-gray-400 hover:text-gray-600"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {isOpen && (
        <div className="absolute z-20 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
          {filtered.length === 0 ? (
            <div className="px-3 py-2 text-sm text-gray-500">
              {available.length === 0
                ? "All volunteers already assigned"
                : "No matches found"}
            </div>
          ) : (
            filtered.map((v) => (
              <button
                key={v.id}
                onClick={() => handleSelect(v)}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-blue-50"
              >
                <span className="font-medium text-gray-900">
                  {v.first_name} {v.last_name}
                </span>
                {v.email && (
                  <span className="text-gray-400">{v.email}</span>
                )}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
