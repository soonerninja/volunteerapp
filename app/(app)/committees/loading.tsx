export default function Loading() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-8 w-48 bg-gray-200 rounded-lg" />
      <div className="h-10 w-full bg-gray-100 rounded-lg" />
      {[...Array(8)].map((_, i) => (
        <div key={i} className="h-16 w-full bg-gray-100 rounded-xl" />
      ))}
    </div>
  );
}
