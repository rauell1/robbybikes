import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { formatPriceFrom } from "@/lib/format";
import type { BrandSummary } from "@/lib/db/queries";

export function BrandGrid({ brands }: { brands: BrandSummary[] }) {
  if (brands.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-mist-300 bg-mist-50 p-6 text-sm text-mist-600">
        Brands will appear here as soon as stock is published.
      </p>
    );
  }

  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {brands.map((brand) => (
        <li key={brand.brand}>
          <Link
            href={`/bikes?brand=${encodeURIComponent(brand.brand)}`}
            className="group flex h-full flex-col justify-between rounded-xl border border-mist-200 bg-white p-4 transition-all hover:-translate-y-0.5 hover:border-ink-900 hover:shadow-card"
          >
            <div className="flex items-start justify-between gap-2">
              <span className="text-lg font-bold tracking-tight text-ink-900">{brand.brand}</span>
              <ArrowUpRight
                className="size-4 text-mist-400 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent-600"
                aria-hidden="true"
              />
            </div>
            <div className="mt-6">
              <p className="text-xs text-mist-500">
                {brand.total} bike{brand.total === 1 ? "" : "s"} listed
              </p>
              {brand.minPrice ? (
                <p className="mt-0.5 text-xs font-semibold text-ink-800">
                  {formatPriceFrom(brand.minPrice)}
                </p>
              ) : null}
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
