"use client";

import * as Sentry from "@sentry/nextjs";
import { useState } from "react";

export default function SentryExamplePage() {
  const [sent, setSent] = useState(false);

  function triggerError() {
    const id = Sentry.captureException(new Error("Sentry test error from GoodTally"));
    console.log("Sentry event ID:", id);
    setSent(true);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold text-gray-900">Sentry Test Page</h1>
        <p className="text-gray-500 text-sm">Click the button to send a test error to Sentry.</p>
        <button
          onClick={triggerError}
          className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
        >
          Send Test Error
        </button>
        {sent && (
          <p className="text-green-600 text-sm font-medium">
            Sent! Check your Sentry dashboard in ~30 seconds.
          </p>
        )}
      </div>
    </div>
  );
}
