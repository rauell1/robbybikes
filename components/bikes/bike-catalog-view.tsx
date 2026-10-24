"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  Calendar,
  Check,
  Cog,
  Eye,
  Gauge,
  LayoutGrid,
  List,
  Scale,
} from "lucide-react";
import type { MotorcycleWithImages } from "@/lib/db/schema";
import { BikeCard } from "@/components/bikes/bike-card";
import { BikePhoto } from "@/components/bikes/bike-photo";
import { QuickViewModal } from "@/components/bikes/quick-view-modal";
import { useCompare } from "@/components/bikes/compare-context";
import { Badge } from "@/components/ui/badge";
import { WhatsAppIcon } from "@/components/icons";
import { formatEngine, formatKes, formatOdometer, statusMeta } from "@/lib/format";
import { bikeWhatsAppMessage, whatsappHref } from "@/lib/contact";
import { absoluteUrl } from "@/lib/seo";
import { cn } from "@/lib/utils";

type Props = {
  bikes: MotorcycleWithImages[];
  priorityCount?: number;
};

export function BikeCatalogView({ bikes, priorityCount = 3 }: Props) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedQuickViewBike, setSelectedQuickViewBike] =
    useState<MotorcycleWithImages | null>(null);
  const { isComparing, toggleCompare } = useCompare();

  return (
    <div>
      {/* View Switcher Controls */}
      <div className="mb-4 flex items-center justify-between">
        <p className="text-xs font-semibold text-mist-500">
          Viewing {bikes.length} motorcycle{bikes.length === 1 ? "" : "s"}
        </p>

        <div className="flex items-center gap-1 rounded-xl border border-mist-200 bg-white p-1 shadow-xs">
          <button
            type="button"
            onClick={() => setViewMode("grid")}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all",
              viewMode === "grid"
                ? "bg-ink-950 text-white shadow-xs"
                : "text-mist-600 hover:text-ink-900",
            )}
            aria-label="Grid layout"
          >
            <LayoutGrid className="size-3.5" />
            <span className="hidden sm:inline">Grid</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode("list")}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all",
              viewMode === "list"
                ? "bg-ink-950 text-white shadow-xs"
                : "text-mist-600 hover:text-ink-900",
            )}
            aria-label="List layout"
          >
            <List className="size-3.5" />
            <span className="hidden sm:inline">List</span>
          </button>
        </div>
      </div>

      {/* Grid Mode */}
      {viewMode === "grid" ? (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {bikes.map((bike, index) => (
            <BikeCard key={bike.id} bike={bike} priority={index < priorityCount} />
          ))}
        </div>
      ) : (
        /* List Mode */
        <div className="space-y-4">
          {bikes.map((bike) => {
            const status = statusMeta(bike.status);
            const primary = bike.images[0] ?? null;
            const comparing = isComparing(bike.id);
            const listingUrl = absoluteUrl(`/bikes/${bike.slug}`);
            const whatsappMsg = bikeWhatsAppMessage(
              {
                brand: bike.brand,
                model: bike.model,
                priceKes: bike.priceKes,
                engineCc: bike.engineCc,
                year: bike.year,
              },
              listingUrl,
            );

            return (
              <article
                key={bike.id}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-mist-200 bg-white p-4 shadow-xs transition-all duration-300 hover:border-mist-300 hover:shadow-card sm:flex-row sm:items-center sm:gap-6"
              >
                {/* Thumbnail */}
                <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden rounded-xl bg-mist-100 sm:w-48">
                  <Link href={`/bikes/${bike.slug}`}>
                    <BikePhoto
                      image={primary}
                      alt={`${bike.brand} ${bike.model}`}
                      sizes="192px"
                      className="transition-transform duration-500 group-hover:scale-105"
                    />
                  </Link>
                  <div className="absolute left-2 top-2">
                    <Badge tone={status.tone} dot>
                      {status.label}
                    </Badge>
                  </div>
                  {bike.isSample && (
                    <div className="absolute right-2 top-2">
                      <Badge tone="sample">Sample</Badge>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="mt-3 flex-1 sm:mt-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-mist-500">
                      {bike.brand}
                    </span>
                    {bike.year && (
                      <span className="rounded-md bg-mist-100 px-1.5 py-0.5 text-[10px] font-semibold text-mist-600">
                        {bike.year}
                      </span>
                    )}
                  </div>
                  <h3 className="mt-1 text-base font-bold text-ink-900">
                    <Link
                      href={`/bikes/${bike.slug}`}
                      className="hover:text-accent-600 transition-colors"
                    >
                      {bike.model}
                    </Link>
                  </h3>

                  <p className="mt-1.5 text-xl font-black text-ink-900">
                    {formatKes(bike.priceKes)}
                  </p>

                  {/* Specs Row */}
                  <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-mist-600">
                    {bike.engineCc && (
                      <span className="inline-flex items-center gap-1">
                        <Cog className="size-3.5 text-mist-400" />
                        {formatEngine(bike.engineCc)}
                      </span>
                    )}
                    {bike.odometerKm !== null && (
                      <span className="inline-flex items-center gap-1">
                        <Gauge className="size-3.5 text-mist-400" />
                        {formatOdometer(bike.odometerKm)}
                      </span>
                    )}
                    <span className="capitalize font-medium">
                      Condition: {bike.condition.replaceAll("_", " ")}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-4 flex shrink-0 items-center gap-2 sm:mt-0 sm:flex-col sm:items-stretch">
                  <button
                    type="button"
                    onClick={() => toggleCompare(bike)}
                    className={cn(
                      "inline-flex h-9 items-center justify-center gap-1 rounded-xl px-3 text-xs font-semibold transition",
                      comparing
                        ? "bg-accent-500 text-white"
                        : "border border-mist-300 text-mist-700 hover:bg-mist-50",
                    )}
                  >
                    {comparing ? <Check className="size-3.5" /> : <Scale className="size-3.5" />}
                    <span>{comparing ? "Comparing" : "Compare"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedQuickViewBike(bike)}
                    className="inline-flex h-9 items-center justify-center gap-1 rounded-xl border border-mist-300 px-3 text-xs font-semibold text-ink-900 hover:bg-mist-50"
                  >
                    <Eye className="size-3.5" />
                    <span>Quick View</span>
                  </button>

                  <a
                    href={whatsappHref(whatsappMsg)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl bg-whatsapp px-4 text-xs font-bold text-white shadow-green-glow transition hover:bg-whatsapp-dark"
                  >
                    <WhatsAppIcon className="size-3.5" />
                    <span>WhatsApp</span>
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Quick View Modal */}
      {selectedQuickViewBike && (
        <QuickViewModal
          bike={selectedQuickViewBike}
          isOpen={Boolean(selectedQuickViewBike)}
          onClose={() => setSelectedQuickViewBike(null)}
        />
      )}
    </div>
  );
}
