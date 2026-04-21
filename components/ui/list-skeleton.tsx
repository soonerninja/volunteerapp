/**
 * Shimmer placeholder rows shown while list data is loading.
 * Matches the visual weight of a populated card list so the layout
 * doesn't jump when real data arrives.
 */
export function ListSkeleton({
  rows = 6,
  label = "Loading",
}: {
  rows?: number;
  label?: string;
}) {
  return (
    <div
      className="space-y-3"
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm"
        >
          <div className="h-10 w-10 shrink-0 animate-pulse rounded-full bg-gray-100" />
          <div className="flex-1 space-y-2">
            <div className="h-3.5 w-1/3 animate-pulse rounded bg-gray-100" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-gray-50" />
          </div>
          <div className="h-6 w-16 shrink-0 animate-pulse rounded-full bg-gray-100" />
        </div>
      ))}
      <span className="sr-only">{label}…</span>
    </div>
  );
}
