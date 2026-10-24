"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { Input, Select } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { Button, buttonStyles } from "@/components/ui/button";
import {
  AVAILABILITY_OPTIONS,
  CONDITION_OPTIONS,
  TRANSMISSION_OPTIONS,
  USAGE_OPTIONS,
  activeFilterCount,
  filtersToQueryString,
  type BikeFilters as Filters,
} from "@/lib/filters";
import { cn } from "@/lib/utils";

type Props = {
  filters: Filters;
  brands: string[];
  transmissions: string[];
  usages: string[];
};

const SIDEBAR_BUDGETS = [
  { label: "Under 115k", min: "", max: "115000" },
  { label: "115k - 135k", min: "115000", max: "135000" },
  { label: "135k - 150k", min: "135000", max: "150000" },
  { label: "150k+", min: "150000", max: "" },
] as const;

export function BikeFilterForm({ filters, brands, transmissions, usages }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [minPriceVal, setMinPriceVal] = useState<string>(
    filters.minPrice ? String(filters.minPrice) : "",
  );
  const [maxPriceVal, setMaxPriceVal] = useState<string>(
    filters.maxPrice ? String(filters.maxPrice) : "",
  );
  const [queryVal, setQueryVal] = useState(filters.q ?? "");

  const activeCount = activeFilterCount(filters);

  const transmissionOptions = Array.from(
    new Set([...TRANSMISSION_OPTIONS, ...transmissions].filter(Boolean)),
  );
  const usageOptions = Array.from(new Set([...USAGE_OPTIONS, ...usages].filter(Boolean)));

  function applyPreset(min: string, max: string) {
    setMinPriceVal(min);
    setMaxPriceVal(max);
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const next: Record<string, string> = {};

    for (const [key, raw] of data.entries()) {
      const value = String(raw).trim();
      if (!value) continue;
      if (key === "page") continue;
      if (key === "availability" && value === "in_stock") continue;
      if (key === "sort" && value === "newest") continue;
      next[key] = value;
    }

    const query = filtersToQueryString({
      ...filters,
      ...next,
      q: next.q ?? "",
      brand: next.brand ?? "",
      model: next.model ?? "",
      minPrice: next.minPrice ? Number(next.minPrice) : undefined,
      maxPrice: next.maxPrice ? Number(next.maxPrice) : undefined,
      minCc: next.minCc ? Number(next.minCc) : undefined,
      maxCc: next.maxCc ? Number(next.maxCc) : undefined,
      yearFrom: next.yearFrom ? Number(next.yearFrom) : undefined,
      yearTo: next.yearTo ? Number(next.yearTo) : undefined,
      condition: next.condition as Filters["condition"],
      transmission: next.transmission ?? "",
      usage: next.usage ?? "",
      availability: (next.availability ?? "in_stock") as Filters["availability"],
      sort: filters.sort,
      page: 1,
    });

    router.push(`/bikes${query}`);
    setOpen(false);
  }

  const panel = (
    <form onSubmit={onSubmit} className="space-y-5" aria-label="Filter motorcycles">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-ink-900">Filter Inventory</h2>
        <div className="flex items-center gap-2">
          {activeCount > 0 ? (
            <a href="/bikes" className="text-xs font-bold text-accent-700 hover:text-accent-800">
              Clear all
            </a>
          ) : null}
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="grid size-8 place-items-center rounded-lg text-mist-600 hover:bg-mist-100 lg:hidden"
          >
            <span className="sr-only">Close filters</span>
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      <Field label="Keyword" htmlFor="filter-q">
        <div className="relative">
          <Input
            id="filter-q"
            name="q"
            type="search"
            placeholder="Model, keyword"
            value={queryVal}
            onChange={(e) => setQueryVal(e.target.value)}
            className="rounded-xl pr-8"
          />
          {queryVal && (
            <button
              type="button"
              onClick={() => setQueryVal("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-mist-400 hover:text-ink-900"
              aria-label="Clear keyword"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>
      </Field>

      <Field label="Brand" htmlFor="filter-brand">
        <Select id="filter-brand" name="brand" defaultValue={filters.brand} className="rounded-xl">
          <option value="">All brands</option>
          {brands.map((brand) => (
            <option key={brand} value={brand}>
              {brand}
            </option>
          ))}
        </Select>
      </Field>

      <Field label="Model" htmlFor="filter-model">
        <Input id="filter-model" name="model" placeholder="e.g. Boxer" defaultValue={filters.model} className="rounded-xl" />
      </Field>

      <fieldset>
        <legend className="field-label text-xs font-bold text-ink-800">Price Range (KSh)</legend>
        <div className="grid grid-cols-2 gap-2">
          <label className="sr-only" htmlFor="filter-min-price">
            Minimum price
          </label>
          <Input
            id="filter-min-price"
            name="minPrice"
            type="number"
            inputMode="numeric"
            min={1}
            step={1000}
            placeholder="Min"
            value={minPriceVal}
            onChange={(e) => setMinPriceVal(e.target.value)}
            className="rounded-xl"
          />
          <label className="sr-only" htmlFor="filter-max-price">
            Maximum price
          </label>
          <Input
            id="filter-max-price"
            name="maxPrice"
            type="number"
            inputMode="numeric"
            min={1}
            step={1000}
            placeholder="Max"
            value={maxPriceVal}
            onChange={(e) => setMaxPriceVal(e.target.value)}
            className="rounded-xl"
          />
        </div>

        {/* Budget quick chips */}
        <div className="mt-2 flex flex-wrap gap-1">
          {SIDEBAR_BUDGETS.map((b) => (
            <button
              key={b.label}
              type="button"
              onClick={() => applyPreset(b.min, b.max)}
              className="rounded-md bg-mist-100 px-2 py-0.5 text-[10px] font-semibold text-mist-700 hover:bg-mist-200 transition-colors"
            >
              {b.label}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="field-label text-xs font-bold text-ink-800">Engine capacity (cc)</legend>
        <div className="grid grid-cols-2 gap-2">
          <label className="sr-only" htmlFor="filter-min-cc">
            Minimum engine capacity
          </label>
          <Input
            id="filter-min-cc"
            name="minCc"
            type="number"
            inputMode="numeric"
            min={1}
            placeholder="Min"
            defaultValue={filters.minCc}
            className="rounded-xl"
          />
          <label className="sr-only" htmlFor="filter-max-cc">
            Maximum engine capacity
          </label>
          <Input
            id="filter-max-cc"
            name="maxCc"
            type="number"
            inputMode="numeric"
            min={1}
            placeholder="Max"
            defaultValue={filters.maxCc}
            className="rounded-xl"
          />
        </div>
      </fieldset>

      <fieldset>
        <legend className="field-label text-xs font-bold text-ink-800">Manufacturing year</legend>
        <div className="grid grid-cols-2 gap-2">
          <label className="sr-only" htmlFor="filter-year-from">
            Year from
          </label>
          <Input
            id="filter-year-from"
            name="yearFrom"
            type="number"
            inputMode="numeric"
            min={1950}
            max={2100}
            placeholder="From"
            defaultValue={filters.yearFrom}
            className="rounded-xl"
          />
          <label className="sr-only" htmlFor="filter-year-to">
            Year to
          </label>
          <Input
            id="filter-year-to"
            name="yearTo"
            type="number"
            inputMode="numeric"
            min={1950}
            max={2100}
            placeholder="To"
            defaultValue={filters.yearTo}
            className="rounded-xl"
          />
        </div>
      </fieldset>

      <Field label="Condition" htmlFor="filter-condition">
        <Select id="filter-condition" name="condition" defaultValue={filters.condition ?? ""} className="rounded-xl">
          <option value="">Any condition</option>
          {CONDITION_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </Field>

      <Field label="Transmission" htmlFor="filter-transmission">
        <Select id="filter-transmission" name="transmission" defaultValue={filters.transmission} className="rounded-xl">
          <option value="">Any transmission</option>
          {transmissionOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </Select>
      </Field>

      <Field label="Intended use" htmlFor="filter-usage">
        <Select id="filter-usage" name="usage" defaultValue={filters.usage} className="rounded-xl">
          <option value="">Any use</option>
          {usageOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </Select>
      </Field>

      <Field label="Availability" htmlFor="filter-availability">
        <Select id="filter-availability" name="availability" defaultValue={filters.availability} className="rounded-xl">
          {AVAILABILITY_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </Field>

      <div className="space-y-2 pt-2">
        <Button type="submit" full size="md" className="rounded-xl font-bold shadow-glow">
          Apply Filters
        </Button>
        <a href="/bikes" className={cn(buttonStyles({ variant: "ghost", size: "md" }), "w-full rounded-xl")}>
          Reset All
        </a>
      </div>
    </form>
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-expanded={open}
        className="flex w-full items-center justify-between rounded-2xl border border-mist-300 bg-white px-4 py-3.5 text-sm font-bold text-ink-900 lg:hidden shadow-xs"
      >
        <span className="inline-flex items-center gap-2">
          <SlidersHorizontal className="size-4 text-accent-600" aria-hidden="true" />
          <span>Filters & Search</span>
        </span>
        {activeCount > 0 ? (
          <span className="rounded-full bg-accent-600 px-2.5 py-0.5 text-xs font-bold text-white shadow-xs">
            {activeCount} active
          </span>
        ) : (
          <span className="text-xs font-normal text-mist-500">Refine</span>
        )}
      </button>

      <div className="hidden lg:block">
        <div className="sticky top-28 rounded-2xl border border-mist-200 bg-white p-5 shadow-card">{panel}</div>
      </div>

      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-ink-950/70 backdrop-blur-xs transition-opacity"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Filter motorcycles"
            className="absolute inset-x-0 bottom-0 max-h-[90vh] overflow-y-auto rounded-t-3xl bg-white p-6 shadow-2xl animate-slide-up scrollbar-thin"
          >
            {panel}
          </div>
        </div>
      ) : null}
    </>
  );
}
