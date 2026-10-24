export default function AdminLoading() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading admin data">
      <div className="h-8 w-56 animate-pulse rounded bg-mist-200" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-28 animate-pulse rounded-xl bg-mist-200/70" />
        ))}
      </div>
      <div className="h-72 animate-pulse rounded-xl bg-mist-200/70" />
    </div>
  );
}
