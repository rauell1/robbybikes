import Link from "next/link";
import { X } from "lucide-react";
import { formatKes } from "@/lib/format";
import { CONDITION_OPTIONS, filtersToQueryString, type BikeFilters } from "@/lib/filters";

type Chip = { label: string; clear: Partial<BikeFilters> };

export function ActiveFilters({ filters }: { filters: BikeFilters }) {
  const chips: Chip[] = [];

  if (filters.q) chips.push({ label: `“${filters.q}”`, clear: { q: "" } });
  if (filters.brand) chips.push({ label: filters.brand, clear: { brand: "" } });
  if (filters.model) chips.push({ label: `Model: ${filters.model}`, clear: { model: "" } });
  if (filters.minPrice) chips.push({ label: `From ${formatKes(filters.minPrice)}`, clear: { minPrice: undefined } });
  if (filters.maxPrice) chips.push({ label: `Up to ${formatKes(filters.maxPrice)}`, clear: { maxPrice: undefined } });
  if (filters.minCc) chips.push({ label: `From ${filters.minCc} cc`, clear: { minCc: undefined } });
  if (filters.maxCc) chips.push({ label: `Up to ${filters.maxCc} cc`, clear: { maxCc: undefined } });
  if (filters.yearFrom) chips.push({ label: `From ${filters.yearFrom}`, clear: { yearFrom: undefined } });
  if (filters.yearTo) chips.push({ label: `Up to ${filters.yearTo}`, clear: { yearTo: undefined } });
  if (filters.condition) {
    const label = CONDITION_OPTIONS.find((option) => option.value === filters.condition)?.label;
    chips.push({ label: `Condition: ${label ?? filters.condition}`, clear: { condition: undefined } });
  }
  if (filters.transmission) {
    chips.push({ label: `Transmission: ${filters.transmission}`, clear: { transmission: "" } });
  }
  if (filters.usage) chips.push({ label: `Use: ${filters.usage}`, clear: { usage: "" } });
  if (filters.availability !== "in_stock") {
    chips.push({ label: `Availability: ${filters.availability.replace("_", " ")}`, clear: { availability: "in_stock" } });
  }

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs font-medium text-mist-500">Active:</span>
      {chips.map((chip) => (
        <Link
          key={chip.label}
          href={`/bikes${filtersToQueryString({ ...filters, ...chip.clear, page: 1 })}`}
          className="group inline-flex items-center gap-1 rounded-full bg-mist-100 py-1 pl-2.5 pr-1.5 text-xs font-medium text-ink-800 transition-colors hover:bg-mist-200"
        >
          {chip.label}
          <span className="grid size-4 place-items-center rounded-full bg-white/70 text-mist-600 group-hover:text-ink-900">
            <X className="size-3" aria-hidden="true" />
            <span className="sr-only">Remove {chip.label} filter</span>
          </span>
        </Link>
      ))}
      <Link href="/bikes" className="ml-1 text-xs font-semibold text-accent-700 hover:text-accent-800">
        Clear all
      </Link>
    </div>
  );
}
