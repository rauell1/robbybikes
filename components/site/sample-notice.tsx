import Link from "next/link";
import { Info } from "lucide-react";

export function SampleNotice({ count, className }: { count: number; className?: string }) {
  if (count === 0) return null;

  return (
    <div className={className}>
      <div className="container-page">
        <div className="flex flex-col gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-start gap-2">
            <Info className="mt-0.5 size-4 shrink-0 text-amber-700" aria-hidden="true" />
            <span>
              <strong className="font-semibold">Demo inventory.</strong>{" "}
              {count} listing{count === 1 ? " is" : "s are"} clearly marked{" "}
              <span className="font-semibold">Sample</span> and use illustrative photos. They are not
              verified Robbybikes stock.
            </span>
          </p>
          <Link
            href="/contact"
            className="shrink-0 text-sm font-semibold text-amber-900 underline underline-offset-4 hover:text-amber-950"
          >
            Ask what&apos;s in stock
          </Link>
        </div>
      </div>
    </div>
  );
}
