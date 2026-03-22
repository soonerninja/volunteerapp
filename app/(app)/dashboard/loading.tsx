export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <div>
        <div className="h-8 w-48 animate-pulse rounded bg-gray-200" />
        <div className="mt-2 h-4 w-32 animate-pulse rounded bg-gray-200" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="h-24 animate-pulse rounded-xl border border-gray-200 bg-white p-6"
          >
            <div className="flex items-center gap-4">
              <div className="h-11 w-11 rounded-lg bg-gray-100" />
              <div className="space-y-2">
                <div className="h-4 w-24 rounded bg-gray-100" />
                <div className="h-6 w-12 rounded bg-gray-100" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {[...Array(2)].map((_, i) => (
          <div
            key={i}
            className="h-64 animate-pulse rounded-xl border border-gray-200 bg-white p-6"
          />
        ))}
      </div>
    </div>
  );
}
