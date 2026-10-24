"use client";

import { useRouter } from "next/navigation";
import { SORT_OPTIONS, filtersToQueryString, type BikeFilters } from "@/lib/filters";

export function SortSelect({ filters }: { filters: BikeFilters }) {
  const router = useRouter();

  return (
    <label className="inline-flex items-center gap-2 text-sm">
      <span className="hidden text-mist-600 sm:inline">Sort by</span>
      <select
        value={filters.sort}
        onChange={(event) => {
          const sort = event.target.value as BikeFilters["sort"];
          const query = filtersToQueryString({ ...filters, sort, page: 1 });
          router.push(`/bikes${query}`);
        }}
        className="h-9 rounded-lg border border-mist-300 bg-white px-2.5 pr-7 text-sm font-medium text-ink-900 hover:border-mist-400 focus:border-accent-600 focus:outline-none focus:ring-2 focus:ring-accent-600/20"
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
