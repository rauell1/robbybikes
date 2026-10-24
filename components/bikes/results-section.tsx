import Link from "next/link";
import { ArrowRight, MessageCircle, SearchX } from "lucide-react";
import { ActiveFilters } from "@/components/bikes/active-filters";
import { SortSelect } from "@/components/bikes/sort-select";
import { BikeGrid } from "@/components/bikes/bike-grid";
import { Pagination } from "@/components/bikes/pagination";
import { buttonStyles } from "@/components/ui/button";
import { WhatsAppIcon } from "@/components/icons";
import { getSampleListingCount, listBikes } from "@/lib/db/queries";
import type { BikeFilters } from "@/lib/filters";
import { business } from "@/lib/business";
import { generalWhatsAppMessage, telHref, whatsappHref } from "@/lib/contact";
import { cn } from "@/lib/utils";

export async function BikeResults({ filters }: { filters: BikeFilters }) {
  const [result, sampleCount] = await Promise.all([listBikes(filters), getSampleListingCount()]);
  const isSoldArchive = filters.availability === "sold";

  return (
    <section aria-labelledby="results-heading">
      <div className="flex flex-col gap-3 border-b border-mist-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 id="results-heading" className="text-base font-semibold text-ink-900" aria-live="polite">
            {result.total === 0
              ? "No motorcycles match"
              : `${result.total} motorcycle${result.total === 1 ? "" : "s"} found`}
          </h2>
          <p className="mt-0.5 text-xs text-mist-500">
            {isSoldArchive
              ? "Sold archive — these bikes are no longer available."
              : filters.availability === "available"
                ? "Available stock only."
                : "Includes available, reserved and pending-sale bikes."}
            {sampleCount > 0 ? " Some listings are marked Sample (demo data)." : ""}
          </p>
        </div>
        <SortSelect filters={filters} />
      </div>

      <div className="mt-4">
        <ActiveFilters filters={filters} />
      </div>

      {result.items.length > 0 ? (
        <>
          <BikeGrid bikes={result.items} className="mt-5" priorityCount={3} />
          <Pagination filters={filters} page={result.page} pageCount={result.pageCount} />
          <p className="mt-3 text-center text-xs text-mist-500">
            Showing {(result.page - 1) * result.pageSize + 1}–
            {Math.min(result.page * result.pageSize, result.total)} of {result.total}
          </p>
        </>
      ) : (
        <div className="mt-6 rounded-xl border border-mist-200 bg-white px-6 py-14 text-center shadow-xs">
          <span className="mx-auto grid size-12 place-items-center rounded-full bg-mist-100 text-mist-500">
            <SearchX className="size-6" aria-hidden="true" />
          </span>
          <h3 className="mt-4 text-lg font-semibold text-ink-900">Nothing matches those filters yet</h3>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-mist-600">
            Stock changes often. Try a wider price range or a different brand — or ask us directly
            what has just arrived in the yard.
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-2 sm:flex-row">
            <Link href="/bikes" className={cn(buttonStyles({ variant: "dark" }), "justify-center")}>
              Clear filters
            </Link>
            <a
              href={whatsappHref(
                `Hello ${business.name}, I was browsing your website but could not find the bike I want. Do you have anything similar?`,
              )}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(buttonStyles({ variant: "whatsapp" }), "justify-center")}
            >
              <WhatsAppIcon className="size-4" />
              Ask on WhatsApp
            </a>
          </div>
          <p className="mt-4 text-xs text-mist-500">
            Or call{" "}
            <a
              href={telHref(business.phones[0].international)}
              className="font-semibold text-ink-800 underline underline-offset-2"
            >
              {business.phones[0].display}
            </a>
          </p>
        </div>
      )}

      <div className="mt-10 flex flex-col gap-4 rounded-xl bg-mist-50 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-white text-accent-700 ring-1 ring-mist-200">
            <MessageCircle className="size-5" aria-hidden="true" />
          </span>
          <div>
            <p className="text-sm font-semibold text-ink-900">Looking for a specific model?</p>
            <p className="mt-0.5 text-sm text-mist-600">
              Tell us what you need and we will check the yard for you.
            </p>
          </div>
        </div>
        <div className="flex shrink-0 gap-2">
          <a
            href={whatsappHref(generalWhatsAppMessage())}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(buttonStyles({ variant: "whatsapp", size: "md" }), "justify-center")}
          >
            <WhatsAppIcon className="size-4" />
            WhatsApp
          </a>
          <Link href="/contact" className={cn(buttonStyles({ variant: "outline", size: "md" }), "justify-center")}>
            Enquire
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
