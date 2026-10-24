import Link from "next/link";
import { ArrowRight, MessageCircle, SearchX } from "lucide-react";
import { ActiveFilters } from "@/components/bikes/active-filters";
import { SortSelect } from "@/components/bikes/sort-select";
import { BikeCatalogView } from "@/components/bikes/bike-catalog-view";
import { Pagination } from "@/components/bikes/pagination";
import { buttonStyles } from "@/components/ui/button";
import { WhatsAppIcon } from "@/components/icons";
import { getSampleListingCount, listBikes } from "@/lib/db/queries";
import { filtersToQueryString, type BikeFilters } from "@/lib/filters";
import { business } from "@/lib/business";
import { generalWhatsAppMessage, telHref, whatsappHref } from "@/lib/contact";
import { cn } from "@/lib/utils";

const QUICK_BUDGETS = [
  { label: "All Budgets", min: undefined, max: undefined },
  { label: "Under 120k", min: undefined, max: 120000 },
  { label: "120k - 140k", min: 120000, max: 140000 },
  { label: "140k+", min: 140000, max: undefined },
] as const;

export async function BikeResults({ filters }: { filters: BikeFilters }) {
  const [result, sampleCount] = await Promise.all([listBikes(filters), getSampleListingCount()]);
  const isSoldArchive = filters.availability === "sold";

  return (
    <section aria-labelledby="results-heading">
      <div className="flex flex-col gap-3 border-b border-mist-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 id="results-heading" className="text-base font-bold text-ink-900" aria-live="polite">
            {result.total === 0
              ? "No motorcycles match"
              : `${result.total} motorcycle${result.total === 1 ? "" : "s"} found`}
          </h2>
          <p className="mt-0.5 text-xs text-mist-500">
            {isSoldArchive
              ? "Sold archive: these bikes are no longer available."
              : filters.availability === "available"
                ? "Available stock only."
                : "Includes available, reserved and pending-sale bikes."}
            {sampleCount > 0 ? " Some listings are marked Sample (demo data)." : ""}
          </p>
        </div>
        <SortSelect filters={filters} />
      </div>

      {/* Quick Budget Chips */}
      <div className="mt-4 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-[11px] font-bold uppercase tracking-wider text-mist-500 shrink-0 mr-1">
          Budget:
        </span>
        {QUICK_BUDGETS.map((budget) => {
          const isActive =
            filters.minPrice === budget.min && filters.maxPrice === budget.max;
          const href = `/bikes${filtersToQueryString({
            ...filters,
            minPrice: budget.min,
            maxPrice: budget.max,
            page: 1,
          })}`;

          return (
            <Link
              key={budget.label}
              href={href}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-semibold shrink-0 transition-all",
                isActive
                  ? "bg-accent-600 text-white shadow-xs"
                  : "bg-mist-100 text-ink-800 hover:bg-mist-200",
              )}
            >
              {budget.label}
            </Link>
          );
        })}
      </div>

      <div className="mt-3">
        <ActiveFilters filters={filters} />
      </div>

      {result.items.length > 0 ? (
        <div className="mt-5">
          <BikeCatalogView bikes={result.items} priorityCount={3} />
          <div className="mt-8">
            <Pagination filters={filters} page={result.page} pageCount={result.pageCount} />
            <p className="mt-3 text-center text-xs text-mist-500">
              Showing {(result.page - 1) * result.pageSize + 1} to 
              {Math.min(result.page * result.pageSize, result.total)} of {result.total}
            </p>
          </div>
        </div>
      ) : (
        <div className="mt-6 rounded-2xl border border-mist-200 bg-white px-6 py-14 text-center shadow-xs">
          <span className="mx-auto grid size-12 place-items-center rounded-full bg-mist-100 text-mist-500">
            <SearchX className="size-6" aria-hidden="true" />
          </span>
          <h3 className="mt-4 text-lg font-bold text-ink-900">Nothing matches those filters yet</h3>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-mist-600">
            Stock changes often. Try a wider price range or a different brand, or ask us directly
            what has just arrived in the yard.
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-2 sm:flex-row">
            <Link href="/bikes" className={cn(buttonStyles({ variant: "dark" }), "justify-center rounded-xl font-bold")}>
              Clear filters
            </Link>
            <a
              href={whatsappHref(
                `Hello ${business.name}, I was browsing your website but could not find the bike I want. Do you have anything similar?`,
              )}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(buttonStyles({ variant: "whatsapp" }), "justify-center rounded-xl font-bold shadow-green-glow")}
            >
              <WhatsAppIcon className="size-4" />
              Ask on WhatsApp
            </a>
          </div>
          <p className="mt-4 text-xs text-mist-500">
            Or call{" "}
            <a
              href={telHref(business.phones[0].international)}
              className="font-bold text-ink-800 underline underline-offset-2"
            >
              {business.phones[0].display}
            </a>
          </p>
        </div>
      )}

      <div className="mt-10 flex flex-col gap-4 rounded-2xl bg-mist-50 border border-mist-200 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white text-accent-700 ring-1 ring-mist-200 shadow-xs">
            <MessageCircle className="size-5" aria-hidden="true" />
          </span>
          <div>
            <p className="text-sm font-bold text-ink-900">Looking for a specific model?</p>
            <p className="mt-0.5 text-xs text-mist-600">
              Tell us what you need and we will check the yard for you.
            </p>
          </div>
        </div>
        <a
          href={whatsappHref(generalWhatsAppMessage())}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(buttonStyles({ variant: "whatsapp" }), "justify-center rounded-xl font-bold shadow-green-glow")}
        >
          <WhatsAppIcon className="size-4" />
          Request on WhatsApp
        </a>
      </div>
    </section>
  );
}
