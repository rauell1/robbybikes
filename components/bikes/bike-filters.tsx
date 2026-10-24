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

export function BikeFilterForm({ filters, brands, transmissions, usages }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const activeCount = activeFilterCount(filters);

  const transmissionOptions = Array.from(
    new Set([...TRANSMISSION_OPTIONS, ...transmissions].filter(Boolean)),
  );
  const usageOptions = Array.from(new Set([...USAGE_OPTIONS, ...usages].filter(Boolean)));

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
        <h2 className="text-base font-semibold text-ink-900">Filters</h2>
        <div className="flex items-center gap-2">
          {activeCount > 0 ? (
            <a href="/bikes" className="text-xs font-semibold text-accent-700 hover:text-accent-800">
              Clear all
            </a>
          ) : null}
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="grid size-8 place-items-center rounded-md text-mist-600 hover:bg-mist-100 lg:hidden"
          >
            <span className="sr-only">Close filters</span>
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      <Field label="Keyword" htmlFor="filter-q">
        <Input
          id="filter-q"
          name="q"
          type="search"
          placeholder="Model, colour, keyword"
          defaultValue={filters.q}
        />
      </Field>

      <Field label="Brand" htmlFor="filter-brand">
        <Select id="filter-brand" name="brand" defaultValue={filters.brand}>
          <option value="">All brands</option>
          {brands.map((brand) => (
            <option key={brand} value={brand}>
              {brand}
            </option>
          ))}
        </Select>
      </Field>

      <Field label="Model" htmlFor="filter-model">
        <Input id="filter-model" name="model" placeholder="e.g. Boxer" defaultValue={filters.model} />
      </Field>

      <fieldset>
        <legend className="field-label">Price (KSh)</legend>
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
            defaultValue={filters.minPrice}
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
            defaultValue={filters.maxPrice}
          />
        </div>
      </fieldset>

      <fieldset>
        <legend className="field-label">Engine capacity (cc)</legend>
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
          />
        </div>
      </fieldset>

      <fieldset>
        <legend className="field-label">Manufacturing year</legend>
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
          />
        </div>
      </fieldset>

      <Field label="Condition" htmlFor="filter-condition">
        <Select id="filter-condition" name="condition" defaultValue={filters.condition ?? ""}>
          <option value="">Any condition</option>
          {CONDITION_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </Field>

      <Field label="Transmission" htmlFor="filter-transmission">
        <Select id="filter-transmission" name="transmission" defaultValue={filters.transmission}>
          <option value="">Any transmission</option>
          {transmissionOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </Select>
      </Field>

      <Field label="Intended use" htmlFor="filter-usage">
        <Select id="filter-usage" name="usage" defaultValue={filters.usage}>
          <option value="">Any use</option>
          {usageOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </Select>
      </Field>

      <Field label="Availability" htmlFor="filter-availability">
        <Select id="filter-availability" name="availability" defaultValue={filters.availability}>
          {AVAILABILITY_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </Field>

      <div className="space-y-2 pt-1">
        <Button type="submit" full size="md">
          Apply filters
        </Button>
        <a href="/bikes" className={cn(buttonStyles({ variant: "ghost", size: "md" }), "w-full")}>
          Reset filters
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
        className="flex w-full items-center justify-between rounded-lg border border-mist-300 bg-white px-4 py-3 text-sm font-semibold text-ink-900 lg:hidden"
      >
        <span className="inline-flex items-center gap-2">
          <SlidersHorizontal className="size-4" aria-hidden="true" />
          Filters
        </span>
        {activeCount > 0 ? (
          <span className="rounded-full bg-accent-600 px-2 py-0.5 text-xs font-bold text-white">
            {activeCount}
          </span>
        ) : (
          <span className="text-xs font-normal text-mist-500">Refine results</span>
        )}
      </button>

      <div className="hidden lg:block">
        <div className="sticky top-32 rounded-xl border border-mist-200 bg-white p-5">{panel}</div>
      </div>

      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-ink-950/50"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Filter motorcycles"
            className="absolute inset-x-0 bottom-0 max-h-[90vh] overflow-y-auto rounded-t-2xl bg-white p-5 shadow-lift"
          >
            {panel}
          </div>
        </div>
      ) : null}
    </>
  );
}
