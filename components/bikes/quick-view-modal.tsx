"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  Bike,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Cog,
  Droplets,
  ExternalLink,
  Gauge,
  MapPin,
  Phone,
  ShieldCheck,
  Wrench,
  X,
} from "lucide-react";
import type { MotorcycleWithImages } from "@/lib/db/schema";
import { Badge } from "@/components/ui/badge";
import { WhatsAppIcon } from "@/components/icons";
import { formatEngine, formatKes, formatOdometer, statusMeta } from "@/lib/format";
import { business } from "@/lib/business";
import { bikeWhatsAppMessage, telHref, whatsappHref } from "@/lib/contact";
import { absoluteUrl } from "@/lib/seo";

type Props = {
  bike: MotorcycleWithImages;
  isOpen: boolean;
  onClose: () => void;
};

export function QuickViewModal({ bike, isOpen, onClose }: Props) {
  const [photoIndex, setPhotoIndex] = useState(0);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") {
        setPhotoIndex((prev) => (prev > 0 ? prev - 1 : bike.images.length - 1));
      }
      if (e.key === "ArrowRight") {
        setPhotoIndex((prev) => (prev < bike.images.length - 1 ? prev + 1 : 0));
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onClose, bike.images.length]);

  if (!isOpen) return null;

  const currentImage = bike.images[photoIndex] ?? null;
  const status = statusMeta(bike.status);
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
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="quick-view-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-ink-950/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div className="relative flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-mist-200 bg-white shadow-2xl animate-fade-in md:flex-row">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 z-20 grid size-8 place-items-center rounded-full bg-white/90 text-mist-600 shadow-md transition-colors hover:bg-mist-100 hover:text-ink-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
          aria-label="Close preview"
        >
          <X className="size-5" />
        </button>

        {/* Left Side: Photo Carousel */}
        <div className="relative flex flex-col justify-between bg-ink-950 md:w-1/2">
          <div className="relative aspect-[4/3] w-full overflow-hidden md:aspect-auto md:h-full">
            {currentImage ? (
              <Image
                src={currentImage.imageUrl}
                alt={currentImage.altText || `${bike.brand} ${bike.model}`}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            ) : (
              <div className="grid size-full place-items-center text-white/30">
                <Bike className="size-12" />
              </div>
            )}

            {/* Badges */}
            <div className="absolute left-3 top-3 flex gap-2">
              <Badge tone={status.tone} dot>
                {status.label}
              </Badge>
              {bike.isSample && <Badge tone="sample">Sample</Badge>}
            </div>

            {/* Arrow Navigation */}
            {bike.images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() =>
                    setPhotoIndex((prev) => (prev > 0 ? prev - 1 : bike.images.length - 1))
                  }
                  className="absolute left-2 top-1/2 -translate-y-1/2 grid size-8 place-items-center rounded-full bg-ink-950/70 text-white backdrop-blur-xs transition hover:bg-ink-950"
                  aria-label="Previous photo"
                >
                  <ChevronLeft className="size-5" />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setPhotoIndex((prev) => (prev < bike.images.length - 1 ? prev + 1 : 0))
                  }
                  className="absolute right-2 top-1/2 -translate-y-1/2 grid size-8 place-items-center rounded-full bg-ink-950/70 text-white backdrop-blur-xs transition hover:bg-ink-950"
                  aria-label="Next photo"
                >
                  <ChevronRight className="size-5" />
                </button>
              </>
            )}
          </div>

          {/* Thumbnail Strip */}
          {bike.images.length > 1 && (
            <div className="flex gap-1.5 overflow-x-auto bg-ink-900/90 p-2 scrollbar-none">
              {bike.images.map((img, idx) => (
                <button
                  key={img.id}
                  type="button"
                  onClick={() => setPhotoIndex(idx)}
                  className={`relative size-12 shrink-0 overflow-hidden rounded-md border-2 transition ${
                    idx === photoIndex ? "border-accent-500" : "border-transparent opacity-60"
                  }`}
                >
                  <Image src={img.imageUrl} alt="" fill sizes="48px" className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Details & CTAs */}
        <div className="flex flex-1 flex-col overflow-y-auto p-5 sm:p-6 scrollbar-thin">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-mist-500">{bike.brand}</p>
            <h3 id="quick-view-title" className="mt-1 text-xl font-extrabold text-ink-900">
              {bike.model}
            </h3>
            <p className="mt-2 text-2xl font-black text-ink-900">{formatKes(bike.priceKes)}</p>
            <p className="text-xs text-mist-500 mt-0.5">{status.description}</p>
          </div>

          {/* Quick Specs Grid */}
          <div className="mt-4 grid grid-cols-2 gap-2 rounded-xl bg-mist-50 p-3 text-xs">
            {bike.engineCc ? (
              <div className="flex items-center gap-1.5">
                <Cog className="size-4 text-mist-400" />
                <div>
                  <span className="block text-[10px] text-mist-500">Engine</span>
                  <span className="font-semibold text-ink-900">{formatEngine(bike.engineCc)}</span>
                </div>
              </div>
            ) : null}

            {bike.year ? (
              <div className="flex items-center gap-1.5">
                <Calendar className="size-4 text-mist-400" />
                <div>
                  <span className="block text-[10px] text-mist-500">Year</span>
                  <span className="font-semibold text-ink-900">{bike.year}</span>
                </div>
              </div>
            ) : null}

            {bike.odometerKm !== null ? (
              <div className="flex items-center gap-1.5">
                <Gauge className="size-4 text-mist-400" />
                <div>
                  <span className="block text-[10px] text-mist-500">Mileage</span>
                  <span className="font-semibold text-ink-900">
                    {formatOdometer(bike.odometerKm)}
                  </span>
                </div>
              </div>
            ) : null}

            {bike.fuelType ? (
              <div className="flex items-center gap-1.5">
                <Droplets className="size-4 text-mist-400" />
                <div>
                  <span className="block text-[10px] text-mist-500">Fuel</span>
                  <span className="font-semibold text-ink-900">{bike.fuelType}</span>
                </div>
              </div>
            ) : null}
          </div>

          {/* Yard Inspection Notice */}
          <div className="mt-4 flex items-start gap-2 rounded-lg border border-mist-200 bg-white p-2.5 text-xs text-mist-600">
            <MapPin className="size-4 shrink-0 text-accent-500 mt-0.5" />
            <span>
              Yard location: <strong>Juja Road, Eastleigh</strong> (Near Amana / Luqman Petrol
              Station). Call or WhatsApp before traveling to inspect.
            </span>
          </div>

          {/* Actions */}
          <div className="mt-6 flex flex-col gap-2">
            <a
              href={whatsappHref(whatsappMsg)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-whatsapp px-4 text-sm font-bold text-white shadow-green-glow transition hover:bg-whatsapp-dark"
            >
              <WhatsAppIcon className="size-4" />
              <span>WhatsApp About This Bike</span>
            </a>

            <div className="flex gap-2">
              <a
                href={telHref(business.phones[0].international)}
                className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-xl border border-mist-300 text-xs font-semibold text-ink-900 transition hover:bg-mist-50"
              >
                <Phone className="size-3.5" />
                <span>Call Yard</span>
              </a>
              <Link
                href={`/bikes/${bike.slug}`}
                onClick={onClose}
                className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-xl bg-ink-950 text-xs font-semibold text-white transition hover:bg-ink-800"
              >
                <span>Full Listing</span>
                <ArrowRight className="size-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
