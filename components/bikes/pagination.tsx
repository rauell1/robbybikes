import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { filtersToQueryString, type BikeFilters } from "@/lib/filters";
import { cn } from "@/lib/utils";

type PaginationProps = {
  filters: BikeFilters;
  page: number;
  pageCount: number;
};

export function Pagination({ filters, page, pageCount }: PaginationProps) {
  if (pageCount <= 1) return null;

  const pages = Array.from({ length: pageCount }, (_, index) => index + 1).filter((candidate) => {
    if (pageCount <= 7) return true;
    return candidate === 1 || candidate === pageCount || Math.abs(candidate - page) <= 1;
  });

  return (
    <nav className="mt-10 flex items-center justify-center gap-1" aria-label="Inventory pages">
      {page > 1 ? (
        <Link
          href={`/bikes${filtersToQueryString({ ...filters, page: page - 1 })}`}
          className="inline-flex h-9 items-center gap-1 rounded-lg border border-mist-300 bg-white px-3 text-sm font-medium text-ink-900 hover:border-mist-400 hover:bg-mist-50"
          rel="prev"
        >
          <ChevronLeft className="size-4" aria-hidden="true" />
          <span className="hidden sm:inline">Previous</span>
        </Link>
      ) : null}

      <ul className="flex items-center gap-1">
        {pages.map((candidate, index) => {
          const previous = pages[index - 1];
          const showGap = previous !== undefined && candidate - previous > 1;
          return (
            <li key={candidate} className="flex items-center gap-1">
              {showGap ? <span className="px-1 text-sm text-mist-400">…</span> : null}
              <Link
                href={`/bikes${filtersToQueryString({ ...filters, page: candidate })}`}
                aria-current={candidate === page ? "page" : undefined}
                className={cn(
                  "inline-flex size-9 items-center justify-center rounded-lg text-sm font-semibold transition-colors",
                  candidate === page
                    ? "bg-ink-900 text-white"
                    : "text-ink-700 hover:bg-mist-100",
                )}
              >
                {candidate}
              </Link>
            </li>
          );
        })}
      </ul>

      {page < pageCount ? (
        <Link
          href={`/bikes${filtersToQueryString({ ...filters, page: page + 1 })}`}
          className="inline-flex h-9 items-center gap-1 rounded-lg border border-mist-300 bg-white px-3 text-sm font-medium text-ink-900 hover:border-mist-400 hover:bg-mist-50"
          rel="next"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="size-4" aria-hidden="true" />
        </Link>
      ) : null}
    </nav>
  );
}
