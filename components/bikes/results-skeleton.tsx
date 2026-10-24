export function BikeResultsSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading motorcycle listings">
      <div className="flex items-center justify-between gap-3 border-b border-mist-200 pb-4">
        <div className="h-5 w-40 animate-pulse rounded bg-mist-200" />
        <div className="h-9 w-36 animate-pulse rounded bg-mist-100" />
      </div>
      <div className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="overflow-hidden rounded-xl border border-mist-200 bg-white">
            <div className="aspect-[4/3] animate-pulse bg-mist-100" />
            <div className="space-y-2 p-4">
              <div className="h-3 w-16 animate-pulse rounded bg-mist-100" />
              <div className="h-4 w-3/4 animate-pulse rounded bg-mist-100" />
              <div className="h-6 w-28 animate-pulse rounded bg-mist-100" />
              <div className="h-10 w-full animate-pulse rounded bg-mist-100" />
            </div>
          </div>
        ))}
      </div>
      <span className="sr-only">Loading motorcycle listings…</span>
    </div>
  );
}
