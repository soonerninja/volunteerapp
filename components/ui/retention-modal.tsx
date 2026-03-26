"use client";

import { useState } from "react";
import { X, Loader2, Heart, AlertTriangle } from "lucide-react";

interface RetentionModalProps {
  currentPlan: string;
  onAcceptDiscount: () => void;
  onContinueToPortal: () => void;
  onClose: () => void;
}

export function RetentionModal({
  currentPlan,
  onAcceptDiscount,
  onContinueToPortal,
  onClose,
}: RetentionModalProps) {
  const [accepting, setAccepting] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAcceptDiscount() {
    setAccepting(true);
    setError(null);
    try {
      const res = await fetch("/api/stripe/retention-discount", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        setAccepting(false);
        return;
      }
      setAccepted(true);
    } catch {
      setError("Network error. Please try again.");
      setAccepting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        {accepted ? (
          <div className="p-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
              <Heart className="h-7 w-7 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Thank you for staying!</h2>
            <p className="mt-2 text-sm text-gray-600">
              25% off has been applied to your next renewal. We appreciate your support.
            </p>
            <button
              onClick={onClose}
              className="mt-6 w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
            >
              Done
            </button>
          </div>
        ) : (
          <div className="p-8">
            <div className="mb-5 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-100">
                <AlertTriangle className="h-7 w-7 text-amber-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Before you go...</h2>
              <p className="mt-2 text-sm text-gray-600">
                We&apos;d love to keep you on {currentPlan}. As a thank you for being a GoodTally customer, we&apos;d like to offer you:
              </p>
            </div>

            <div className="mb-6 rounded-xl border-2 border-blue-200 bg-blue-50 p-4 text-center">
              <p className="text-2xl font-bold text-blue-900">25% off</p>
              <p className="text-sm text-blue-700">your next renewal — applied automatically</p>
            </div>

            {error && (
              <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{error}</p>
            )}

            <div className="space-y-3">
              <button
                onClick={handleAcceptDiscount}
                disabled={accepting}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors disabled:opacity-60"
              >
                {accepting && <Loader2 className="h-4 w-4 animate-spin" />}
                Keep {currentPlan} and save 25%
              </button>

              <button
                onClick={onContinueToPortal}
                className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                No thanks — change or cancel plan
              </button>
            </div>

            <p className="mt-4 text-center text-xs text-gray-400">
              You can cancel at any time. No questions asked.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
