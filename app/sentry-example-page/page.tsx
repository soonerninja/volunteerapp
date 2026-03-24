"use client";

export default function SentryExamplePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold text-gray-900">Sentry Test Page</h1>
        <p className="text-gray-500 text-sm">Click the button to trigger a test error.</p>
        <button
          onClick={() => {
            throw new Error("Sentry test error from GoodTally");
          }}
          className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
        >
          Trigger Test Error
        </button>
      </div>
    </div>
  );
}
