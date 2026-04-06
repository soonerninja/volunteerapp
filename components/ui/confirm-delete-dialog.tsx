"use client";

import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, X } from "lucide-react";
import { useEscapeKey } from "@/lib/hooks/use-escape-key";

interface ConfirmDeleteDialogProps {
  /** Name of the thing being deleted, e.g. "Sarah Johnson" */
  name: string;
  /** Type label, e.g. "volunteer", "event", "committee" */
  entityType: string;
  /** Called when user confirms deletion */
  onConfirm: () => void | Promise<void>;
  /** Called when user cancels */
  onCancel: () => void;
  /** Whether the delete action is in progress */
  loading?: boolean;
}

export function ConfirmDeleteDialog({
  name,
  entityType,
  onConfirm,
  onCancel,
  loading = false,
}: ConfirmDeleteDialogProps) {
  const [typed, setTyped] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const isMatch = typed.toLowerCase() === "delete";

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 50);
  }, []);

  useEscapeKey(() => {
    if (!loading) onCancel();
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isMatch && !loading) {
      onConfirm();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-delete-title"
    >
      <Card className="w-full max-w-md">
        <div className="mb-4 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle className="h-5 w-5 text-red-600" aria-hidden="true" />
            </div>
            <div>
              <h2 id="confirm-delete-title" className="text-lg font-semibold text-gray-900">
                Delete {entityType}
              </h2>
              <p className="text-sm text-gray-500">This action cannot be undone.</p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="rounded-lg p-1 hover:bg-gray-100"
            aria-label="Cancel"
          >
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3">
          <p className="text-sm text-red-800">
            You are about to permanently delete{" "}
            <span className="font-semibold">{name}</span>. All associated data
            will be removed and cannot be recovered.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <label
            htmlFor="confirm-delete-input"
            className="mb-1.5 block text-sm font-medium text-gray-700"
          >
            Type <span className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-red-600">delete</span> to confirm
          </label>
          <input
            ref={inputRef}
            id="confirm-delete-input"
            type="text"
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            placeholder="delete"
            autoComplete="off"
            className="mb-4 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
          />

          <div className="flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={onCancel}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="danger"
              disabled={!isMatch}
              loading={loading}
            >
              Delete {entityType}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
