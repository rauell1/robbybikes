import Link from "next/link";
import { Search } from "lucide-react";
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

export function SearchPanel({ brands, className, defaults }: SearchPanelProps) {
  return (
    <form
      action="/bikes"
      method="get"
      role="search"
      aria-label="Search motorcycle inventory"
      className={cn(
        "rounded-xl border border-mist-200 bg-white p-4 shadow-card sm:p-5",
        className,
      )}
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-12">
        <div className="lg:col-span-3">
          <label htmlFor="hero-brand" className="field-label">
            Brand
          </label>
          <Select id="hero-brand" name="brand" defaultValue={defaults?.brand ?? ""}>
            <option value="">All brands</option>
            {brands.map((brand) => (
              <option key={brand} value={brand}>
                {brand}
              </option>
            ))}
          </Select>
        </div>

        <div className="lg:col-span-3">
          <label htmlFor="hero-q" className="field-label">
            Model or keyword
          </label>
          <Input
            id="hero-q"
            name="q"
            type="search"
            placeholder="e.g. Boxer, commuter"
            defaultValue={defaults?.q}
          />
        </div>

        <div className="lg:col-span-2">
          <label htmlFor="hero-min-price" className="field-label">
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
            defaultValue={defaults?.minPrice}
          />
        </div>

        <div className="lg:col-span-2">
          <label htmlFor="hero-max-price" className="field-label">
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
            defaultValue={defaults?.maxPrice}
          />
        </div>

        <div className="flex items-end lg:col-span-2">
          <button type="submit" className={cn(buttonStyles({ variant: "primary", size: "md" }), "h-11 w-full")}>
            <Search className="size-4" aria-hidden="true" />
            Search bikes
          </button>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-mist-100 pt-3 text-xs text-mist-600">
        <span className="font-medium text-ink-700">Quick filters:</span>
        {["125 cc", "150 cc", "Bajaj", "Honda", "TVS"].map((label, index) => {
          const isCapacity = index < 2;
          const href = isCapacity
            ? `/bikes?minCc=${label.replace(" cc", "")}&maxCc=${label.replace(" cc", "")}`
            : `/bikes?brand=${encodeURIComponent(label)}`;
          return (
            <Link
              key={label}
              href={href}
              className="rounded-full bg-mist-100 px-2.5 py-1 font-medium text-ink-700 transition-colors hover:bg-mist-200"
            >
              {label}
            </Link>
          );
        })}
        <Link href="/bikes" className="ml-auto font-semibold text-accent-700 hover:text-accent-800">
          All filters
        </Link>
      </div>

      <p className="sr-only">
        Searching shows motorcycles listed by {business.name} in {business.address.shortDisplay}.
      </p>
      <input type="hidden" name="availability" value="in_stock" />
    </form>
  );
}
