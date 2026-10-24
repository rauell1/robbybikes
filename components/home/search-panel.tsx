"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Sparkles, X } from "lucide-react";
import { Input, Select } from "@/components/ui/input";
import { buttonStyles } from "@/components/ui/button";
import { business } from "@/lib/business";
import { cn } from "@/lib/utils";

type SearchPanelProps = {
  brands: string[];
  className?: string;
  defaults?: {
    brand?: string;
    q?: string;
    minPrice?: string;
    maxPrice?: string;
  };
};

const BUDGET_PRESETS = [
  { label: "Under 115k", min: "", max: "115000" },
  { label: "115k - 135k", min: "115000", max: "135000" },
  { label: "135k - 150k", min: "135000", max: "150000" },
  { label: "150k+", min: "150000", max: "" },
] as const;

export function SearchPanel({ brands, className, defaults }: SearchPanelProps) {
  const [selectedBrand, setSelectedBrand] = useState(defaults?.brand ?? "");
  const [query, setQuery] = useState(defaults?.q ?? "");
  const [minPrice, setMinPrice] = useState(defaults?.minPrice ?? "");
  const [maxPrice, setMaxPrice] = useState(defaults?.maxPrice ?? "");

  const setBudget = (min: string, max: string) => {
    setMinPrice(min);
    setMaxPrice(max);
  };

  return (
    <form
      action="/bikes"
      method="get"
      role="search"
      aria-label="Search motorcycle inventory"
      className={cn(
        "rounded-2xl border border-mist-200/90 bg-white/95 p-4 shadow-xl backdrop-blur-md sm:p-6",
        className,
      )}
    >
      {/* Brand Quick Selector Tabs */}
      <div className="mb-4 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-xs font-bold uppercase tracking-wider text-mist-500 mr-1 shrink-0">
          Brand:
        </span>
        <button
          type="button"
          onClick={() => setSelectedBrand("")}
          className={`rounded-full px-3 py-1 text-xs font-semibold transition-all shrink-0 ${
            selectedBrand === ""
              ? "bg-ink-950 text-white shadow-xs"
              : "bg-mist-100 text-ink-700 hover:bg-mist-200"
          }`}
        >
          All Brands
        </button>
        {brands.map((b) => (
          <button
            key={b}
            type="button"
            onClick={() => setSelectedBrand(b)}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition-all shrink-0 ${
              selectedBrand === b
                ? "bg-accent-600 text-white shadow-xs"
                : "bg-mist-100 text-ink-700 hover:bg-mist-200"
            }`}
          >
            {b}
          </button>
        ))}
      </div>

      <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-12">
        <div className="lg:col-span-3">
          <label htmlFor="hero-brand" className="field-label text-xs font-bold text-ink-800">
            Brand
          </label>
          <Select
            id="hero-brand"
            name="brand"
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
            className="rounded-xl border-mist-300 font-medium"
          >
            <option value="">All brands</option>
            {brands.map((brand) => (
              <option key={brand} value={brand}>
                {brand}
              </option>
            ))}
          </Select>
        </div>

        <div className="lg:col-span-3">
          <label htmlFor="hero-q" className="field-label text-xs font-bold text-ink-800">
            Model or keyword
          </label>
          <div className="relative">
            <Input
              id="hero-q"
              name="q"
              type="search"
              placeholder="e.g. Boxer BM, HLX, CB 150"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="rounded-xl border-mist-300 font-medium pr-8"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-mist-400 hover:text-ink-900"
                aria-label="Clear keyword search"
              >
                <X className="size-4" />
              </button>
            )}
          </div>
        </div>

        <div className="lg:col-span-2">
          <label htmlFor="hero-min-price" className="field-label text-xs font-bold text-ink-800">
            Min price (KSh)
          </label>
          <Input
            id="hero-min-price"
            name="minPrice"
            type="number"
            inputMode="numeric"
            min={1}
            step={1000}
            placeholder="105000"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="rounded-xl border-mist-300 font-medium"
          />
        </div>

        <div className="lg:col-span-2">
          <label htmlFor="hero-max-price" className="field-label text-xs font-bold text-ink-800">
            Max price (KSh)
          </label>
          <Input
            id="hero-max-price"
            name="maxPrice"
            type="number"
            inputMode="numeric"
            min={1}
            step={1000}
            placeholder="150000"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="rounded-xl border-mist-300 font-medium"
          />
        </div>

        <div className="flex items-end lg:col-span-2">
          <button
            type="submit"
            className={cn(
              buttonStyles({ variant: "primary", size: "md" }),
              "h-11 w-full rounded-xl shadow-glow transition-all hover:scale-[1.02] active:scale-98 font-bold",
            )}
          >
            <Search className="size-4" aria-hidden="true" />
            <span>Search bikes</span>
          </button>
        </div>
      </div>

      {/* Budget Quick-Select Chips */}
      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-mist-100 pt-3 text-xs text-mist-600">
        <span className="font-bold text-ink-800 text-[11px] uppercase tracking-wider">
          Budget:
        </span>
        {BUDGET_PRESETS.map((preset) => {
          const isActive = minPrice === preset.min && maxPrice === preset.max;
          return (
            <button
              key={preset.label}
              type="button"
              onClick={() => setBudget(preset.min, preset.max)}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                isActive
                  ? "bg-accent-500 text-white shadow-xs"
                  : "bg-mist-100 text-ink-800 hover:bg-mist-200"
              }`}
            >
              {preset.label}
            </button>
          );
        })}

        {(minPrice || maxPrice) && (
          <button
            type="button"
            onClick={() => {
              setMinPrice("");
              setMaxPrice("");
            }}
            className="text-[11px] font-semibold text-accent-700 hover:underline ml-1"
          >
            Reset budget
          </button>
        )}

        <Link
          href="/bikes"
          className="ml-auto inline-flex items-center gap-1 font-bold text-accent-700 hover:text-accent-800"
        >
          <Sparkles className="size-3.5" />
          <span>All inventory filters</span>
        </Link>
      </div>

      <input type="hidden" name="availability" value="in_stock" />
    </form>
  );
}
