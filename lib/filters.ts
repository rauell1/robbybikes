import type { MotorcycleCondition, MotorcycleStatus } from "@/lib/db/schema";

export const PAGE_SIZE = 12;

export const SORT_OPTIONS = [
  { value: "newest", label: "Recently added" },
  { value: "price_asc", label: "Price: low to high" },
  { value: "price_desc", label: "Price: high to low" },
  { value: "updated", label: "Recently updated" },
] as const;

export type SortOption = (typeof SORT_OPTIONS)[number]["value"];

export const AVAILABILITY_OPTIONS = [
  { value: "in_stock", label: "In stock (excludes sold)" },
  { value: "available", label: "Available only" },
  { value: "reserved", label: "Reserved" },
  { value: "pending_sale", label: "Pending sale" },
  { value: "sold", label: "Sold archive" },
  { value: "all", label: "All listings" },
] as const;

export type AvailabilityFilter = (typeof AVAILABILITY_OPTIONS)[number]["value"];

export const CONDITION_OPTIONS = [
  { value: "excellent", label: "Excellent" },
  { value: "very_good", label: "Very good" },
  { value: "good", label: "Good" },
  { value: "fair", label: "Fair" },
  { value: "needs_repair", label: "Needs repair" },
] as const satisfies ReadonlyArray<{ value: MotorcycleCondition; label: string }>;

export const TRANSMISSION_OPTIONS = ["Manual", "Automatic", "Semi-automatic"] as const;
export const USAGE_OPTIONS = ["Commuting", "Boda boda", "Utility / cargo", "Off-road", "Touring"] as const;

export type BikeFilters = {
  q: string;
  brand: string;
  model: string;
  minPrice?: number;
  maxPrice?: number;
  minCc?: number;
  maxCc?: number;
  yearFrom?: number;
  yearTo?: number;
  condition?: MotorcycleCondition;
  transmission: string;
  usage: string;
  availability: AvailabilityFilter;
  sort: SortOption;
  page: number;
};

export type RawSearchParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

function positiveInt(value: string): number | undefined {
  if (!/^\d{1,7}$/.test(value)) return undefined;
  const parsed = Number(value);
  return parsed > 0 ? parsed : undefined;
}

function isSort(value: string): value is SortOption {
  return SORT_OPTIONS.some((option) => option.value === value);
}

function isAvailability(value: string): value is AvailabilityFilter {
  return AVAILABILITY_OPTIONS.some((option) => option.value === value);
}

function isCondition(value: string): value is MotorcycleCondition {
  return CONDITION_OPTIONS.some((option) => option.value === value);
}

export function parseBikeFilters(params: RawSearchParams): BikeFilters {
  const q = first(params.q).trim().slice(0, 80);
  const brand = first(params.brand).trim().slice(0, 60);
  const model = first(params.model).trim().slice(0, 60);

  const minPrice = positiveInt(first(params.minPrice));
  const maxPrice = positiveInt(first(params.maxPrice));
  const minCc = positiveInt(first(params.minCc));
  const maxCc = positiveInt(first(params.maxCc));
  const yearFrom = positiveInt(first(params.yearFrom));
  const yearTo = positiveInt(first(params.yearTo));
  const condition = first(params.condition);
  const availability = first(params.availability);
  const sort = first(params.sort);
  const page = positiveInt(first(params.page)) ?? 1;

  return {
    q,
    brand,
    model,
    minPrice,
    maxPrice: maxPrice !== undefined && minPrice !== undefined ? Math.max(maxPrice, minPrice) : maxPrice,
    minCc,
    maxCc: maxCc !== undefined && minCc !== undefined ? Math.max(maxCc, minCc) : maxCc,
    yearFrom,
    yearTo: yearTo !== undefined && yearFrom !== undefined ? Math.max(yearTo, yearFrom) : yearTo,
    condition: isCondition(condition) ? condition : undefined,
    transmission: first(params.transmission).trim().slice(0, 40),
    usage: first(params.usage).trim().slice(0, 40),
    availability: isAvailability(availability) ? availability : "in_stock",
    sort: isSort(sort) ? sort : "newest",
    page: Math.min(page, 500),
  };
}

export function parseBikeFiltersFromQueryString(query: string): BikeFilters {
  const params = new URLSearchParams(query);
  const record: RawSearchParams = {};
  for (const [key, value] of params.entries()) record[key] = value;
  return parseBikeFilters(record);
}

const DEFAULT_FILTERS: Pick<
  BikeFilters,
  "availability" | "sort" | "page"
> = { availability: "in_stock", sort: "newest", page: 1 };

/** Serialises filters to a query string, omitting defaults and page 1. */
export function filtersToQueryString(filters: Partial<BikeFilters>): string {
  const params = new URLSearchParams();
  const merged = { ...DEFAULT_FILTERS, ...filters };

  if (merged.q) params.set("q", merged.q);
  if (merged.brand) params.set("brand", merged.brand);
  if (merged.model) params.set("model", merged.model);
  if (merged.minPrice) params.set("minPrice", String(merged.minPrice));
  if (merged.maxPrice) params.set("maxPrice", String(merged.maxPrice));
  if (merged.minCc) params.set("minCc", String(merged.minCc));
  if (merged.maxCc) params.set("maxCc", String(merged.maxCc));
  if (merged.yearFrom) params.set("yearFrom", String(merged.yearFrom));
  if (merged.yearTo) params.set("yearTo", String(merged.yearTo));
  if (merged.condition) params.set("condition", merged.condition);
  if (merged.transmission) params.set("transmission", merged.transmission);
  if (merged.usage) params.set("usage", merged.usage);
  if (merged.availability !== "in_stock") params.set("availability", merged.availability);
  if (merged.sort !== "newest") params.set("sort", merged.sort);
  if (merged.page && merged.page > 1) params.set("page", String(merged.page));

  const query = params.toString();
  return query ? `?${query}` : "";
}

export function activeFilterCount(filters: BikeFilters): number {
  let total = 0;
  if (filters.q) total += 1;
  if (filters.brand) total += 1;
  if (filters.model) total += 1;
  if (filters.minPrice) total += 1;
  if (filters.maxPrice) total += 1;
  if (filters.minCc) total += 1;
  if (filters.maxCc) total += 1;
  if (filters.yearFrom) total += 1;
  if (filters.yearTo) total += 1;
  if (filters.condition) total += 1;
  if (filters.transmission) total += 1;
  if (filters.usage) total += 1;
  if (filters.availability !== "in_stock") total += 1;
  return total;
}
