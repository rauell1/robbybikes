"use client";

import Image from "next/image";
import { ArrowRight, Bike, Scale, Trash2, X } from "lucide-react";
import { useCompare } from "./compare-context";
import { formatKes } from "@/lib/format";

export function CompareBar() {
  const { compared, removeBike, clearCompare, openModal } = useCompare();

  if (compared.length === 0) return null;

  return (
    <aside
      aria-label="Motorcycle comparison bar"
      className="fixed bottom-4 left-4 right-4 z-40 mx-auto max-w-4xl animate-slide-up rounded-2xl border border-white/20 bg-ink-950/95 p-3 text-white shadow-2xl backdrop-blur-md sm:bottom-6 sm:p-4"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <div className="flex shrink-0 items-center gap-1.5 rounded-lg bg-accent-500/20 px-2.5 py-1.5 text-xs font-semibold text-accent-300">
            <Scale className="size-4" aria-hidden="true" />
            <span>Compare ({compared.length}/4)</span>
          </div>

          <div className="flex items-center gap-2">
            {compared.map((bike) => (
              <div
                key={bike.id}
                className="group relative flex shrink-0 items-center gap-2 rounded-xl border border-white/10 bg-white/5 py-1 pl-1.5 pr-2 transition-colors hover:border-white/25"
              >
                <div className="relative size-9 overflow-hidden rounded-lg bg-ink-900">
                  {bike.imageUrl ? (
                    <Image
                      src={bike.imageUrl}
                      alt={`${bike.brand} ${bike.model}`}
                      fill
                      sizes="36px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="grid size-full place-items-center text-white/40">
                      <Bike className="size-4" />
                    </div>
                  )}
                </div>
                <div className="text-left text-xs leading-tight">
                  <p className="max-w-[100px] truncate font-medium text-white">{bike.model}</p>
                  <p className="font-semibold text-accent-400">{formatKes(bike.priceKes)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => removeBike(bike.id)}
                  className="rounded-full p-1 text-white/50 hover:bg-white/10 hover:text-white"
                  aria-label={`Remove ${bike.brand} ${bike.model} from comparison`}
                >
                  <X className="size-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-end gap-2 border-t border-white/10 pt-2 sm:border-t-0 sm:pt-0">
          <button
            type="button"
            onClick={clearCompare}
            className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-white/60 transition-colors hover:bg-white/10 hover:text-white"
          >
            <Trash2 className="size-3.5" aria-hidden="true" />
            <span>Clear</span>
          </button>
          <button
            type="button"
            onClick={openModal}
            className="inline-flex items-center gap-1.5 rounded-xl bg-accent-500 px-4 py-2 text-xs font-bold text-white shadow-glow transition-all hover:bg-accent-400 hover:shadow-lg active:scale-95"
          >
            <span>Compare Details</span>
            <ArrowRight className="size-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </aside>
  );
}
