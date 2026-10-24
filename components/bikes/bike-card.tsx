"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Calendar, Check, Cog, Eye, Gauge, Scale } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { BikePhoto } from "@/components/bikes/bike-photo";
import { QuickViewModal } from "@/components/bikes/quick-view-modal";
import { useCompare } from "@/components/bikes/compare-context";
import { WhatsAppIcon } from "@/components/icons";
import { formatEngine, formatKes, formatOdometer, statusMeta } from "@/lib/format";
import { bikeWhatsAppMessage, whatsappHref } from "@/lib/contact";
import { absoluteUrl } from "@/lib/seo";
import type { MotorcycleWithImages } from "@/lib/db/schema";
import { cn } from "@/lib/utils";

export function BikeCard({
  bike,
  priority = false,
}: {
  bike: MotorcycleWithImages;
  priority?: boolean;
}) {
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const { isComparing, toggleCompare } = useCompare();

  const comparing = isComparing(bike.id);
  const photos = bike.images.length > 0 ? bike.images : [];
  const currentPhoto = photos[activePhotoIdx] ?? null;
  const status = statusMeta(bike.status);

  const specs = [
    bike.year ? { icon: Calendar, value: String(bike.year) } : null,
    bike.engineCc ? { icon: Cog, value: formatEngine(bike.engineCc) } : null,
    bike.odometerKm !== null ? { icon: Gauge, value: formatOdometer(bike.odometerKm) } : null,
  ].filter((spec): spec is { icon: typeof Calendar; value: string } => spec !== null);

  const listingUrl = absoluteUrl(`/bikes/${bike.slug}`);
  const whatsappUrl = whatsappHref(
    bikeWhatsAppMessage(
      {
        brand: bike.brand,
        model: bike.model,
        priceKes: bike.priceKes,
        engineCc: bike.engineCc,
        year: bike.year,
      },
      listingUrl,
    ),
  );

  return (
    <>
      <article
        className={cn(
          "group relative flex flex-col overflow-hidden rounded-2xl border border-mist-200 bg-white transition-all duration-300 hover:border-mist-300 hover:shadow-card hover:-translate-y-1",
          bike.status === "sold" && "opacity-90",
        )}
      >
        {/* Photo Container */}
        <div className="relative aspect-[4/3] overflow-hidden bg-mist-100">
          <Link
            href={`/bikes/${bike.slug}`}
            className="block size-full"
            tabIndex={-1}
            aria-hidden="true"
          >
            <BikePhoto
              image={currentPhoto}
              alt={`${bike.brand} ${bike.model}`}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              priority={priority}
              className={cn(
                "transition-transform duration-500 group-hover:scale-[1.04]",
                bike.status === "sold" && "grayscale",
              )}
            />
          </Link>

          {/* Badges Overlay */}
          <div className="pointer-events-none absolute left-3 top-3 flex flex-wrap items-center gap-1.5">
            <Badge tone={status.tone} dot>
              {status.label}
            </Badge>
            {bike.status === "available" && (
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
              </span>
            )}
          </div>

          {bike.isSample ? (
            <div className="pointer-events-none absolute right-3 top-3">
              <Badge tone="sample">Sample</Badge>
            </div>
          ) : null}

          {/* Quick Action Floating Buttons (Quick View & Compare) */}
          <div className="absolute right-3 bottom-3 flex items-center gap-1.5 opacity-90 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
            <button
              type="button"
              onClick={() => setIsQuickViewOpen(true)}
              className="inline-flex items-center gap-1 rounded-lg bg-ink-950/85 px-2.5 py-1.5 text-xs font-medium text-white shadow-md backdrop-blur-xs transition hover:bg-ink-950"
              aria-label={`Quick preview for ${bike.model}`}
            >
              <Eye className="size-3.5" />
              <span className="hidden xs:inline">Quick view</span>
            </button>

            <button
              type="button"
              onClick={() => toggleCompare(bike)}
              className={cn(
                "inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold shadow-md backdrop-blur-xs transition",
                comparing
                  ? "bg-accent-500 text-white"
                  : "bg-ink-950/85 text-white hover:bg-ink-950",
              )}
              aria-label={comparing ? `Remove from comparison` : `Add to comparison`}
            >
              {comparing ? <Check className="size-3.5" /> : <Scale className="size-3.5" />}
              <span className="hidden xs:inline">{comparing ? "Compared" : "Compare"}</span>
            </button>
          </div>

          {/* Multi-Photo Flipper Indicator Dots */}
          {photos.length > 1 && (
            <div className="absolute inset-x-0 bottom-2 flex justify-center gap-1.5">
              {photos.map((img, idx) => (
                <button
                  key={img.id}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setActivePhotoIdx(idx);
                  }}
                  onMouseEnter={() => setActivePhotoIdx(idx)}
                  className={cn(
                    "size-2 rounded-full transition-all",
                    idx === activePhotoIdx
                      ? "bg-white scale-125 shadow-xs"
                      : "bg-white/50 hover:bg-white/80",
                  )}
                  aria-label={`View photo ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Bike Details */}
        <div className="flex flex-1 flex-col p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-mist-500">
              {bike.brand}
            </p>
            {bike.year && (
              <span className="rounded-md bg-mist-100 px-2 py-0.5 text-[11px] font-semibold text-mist-600">
                {bike.year}
              </span>
            )}
          </div>

          <h3 className="mt-1.5 text-base font-bold leading-snug tracking-tight text-ink-900">
            <Link
              href={`/bikes/${bike.slug}`}
              className="transition-colors hover:text-accent-600"
            >
              {bike.model}
            </Link>
          </h3>

          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-xl font-extrabold tracking-tight text-ink-900 sm:text-2xl">
              {formatKes(bike.priceKes)}
            </span>
          </div>
          <p className="mt-0.5 text-xs text-mist-500">{status.description}</p>

          {specs.length > 0 ? (
            <ul className="mt-3.5 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-mist-600 border-t border-mist-100 pt-3">
              {specs.map((spec) => (
                <li key={spec.value} className="inline-flex items-center gap-1">
                  <spec.icon className="size-3.5 text-mist-400" aria-hidden="true" />
                  <span>{spec.value}</span>
                </li>
              ))}
            </ul>
          ) : null}

          {/* Actions */}
          <div className="mt-5 flex items-center gap-2 pt-1">
            <Link
              href={`/bikes/${bike.slug}`}
              className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-xl border border-mist-300 text-xs font-bold text-ink-900 transition-colors hover:border-ink-900 hover:bg-mist-50 active:scale-98"
            >
              <span>View details</span>
              <ArrowRight className="size-3.5" aria-hidden="true" />
            </Link>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Enquire about the ${bike.brand} ${bike.model} on WhatsApp`}
              className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-whatsapp text-white shadow-green-glow transition-all hover:bg-whatsapp-dark active:scale-95"
            >
              <WhatsAppIcon className="size-[18px]" />
            </a>
          </div>
        </div>
      </article>

      {/* Quick View Modal */}
      <QuickViewModal
        bike={bike}
        isOpen={isQuickViewOpen}
        onClose={() => setIsQuickViewOpen(false)}
      />
    </>
  );
}
