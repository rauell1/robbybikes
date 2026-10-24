"use client";

import Link from "next/link";
import { useEffect } from "react";
import { ArrowRight, Heart, Trash2, X } from "lucide-react";
import { useFavorites } from "@/components/bikes/favorites-context";
import { BikePhoto } from "@/components/bikes/bike-photo";
import { WhatsAppIcon } from "@/components/icons";
import { formatEngine, formatKes, formatOdometer } from "@/lib/format";
import { bikeWhatsAppMessage, whatsappHref } from "@/lib/contact";
import { absoluteUrl } from "@/lib/seo";

export function FavoritesModal() {
  const { savedBikes, isModalOpen, closeFavoritesModal, removeFavorite, clearFavorites } =
    useFavorites();

  useEffect(() => {
    if (!isModalOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeFavoritesModal();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isModalOpen, closeFavoritesModal]);

  if (!isModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="relative flex h-full w-full max-w-md flex-col bg-white shadow-2xl animate-slide-left">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-mist-200 px-5 py-4">
          <div className="flex items-center gap-2">
            <div className="grid size-8 place-items-center rounded-lg bg-red-50 text-red-600">
              <Heart className="size-4 fill-red-600" />
            </div>
            <div>
              <h2 className="font-bold text-base text-ink-900">Saved motorcycles</h2>
              <p className="text-xs text-mist-500">
                {savedBikes.length} {savedBikes.length === 1 ? "bike" : "bikes"} in your shortlist
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={closeFavoritesModal}
            className="grid size-8 place-items-center rounded-lg text-mist-400 hover:bg-mist-100 hover:text-ink-900 transition-colors"
            aria-label="Close saved bikes"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {savedBikes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="grid size-14 place-items-center rounded-2xl bg-mist-100 text-mist-400">
                <Heart className="size-6 text-mist-400" />
              </div>
              <h3 className="mt-4 font-bold text-sm text-ink-900">Your shortlist is empty</h3>
              <p className="mt-1 max-w-xs text-xs text-mist-500">
                Tap the heart icon on any motorcycle in our catalogue to save it here for quick access.
              </p>
              <Link
                href="/bikes"
                onClick={closeFavoritesModal}
                className="mt-5 inline-flex items-center gap-1.5 rounded-xl bg-ink-900 px-4 py-2 text-xs font-bold text-white hover:bg-ink-800 transition-colors"
              >
                <span>Browse inventory</span>
                <ArrowRight className="size-3.5" />
              </Link>
            </div>
          ) : (
            savedBikes.map((bike) => {
              const primaryPhoto = bike.images[0] ?? null;
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
                <div
                  key={bike.id}
                  className="flex gap-3 rounded-xl border border-mist-200 bg-white p-3 shadow-xs hover:border-mist-300 transition-all"
                >
                  <div className="relative aspect-[4/3] w-24 shrink-0 overflow-hidden rounded-lg bg-mist-100">
                    <BikePhoto
                      image={primaryPhoto}
                      alt={`${bike.brand} ${bike.model}`}
                      sizes="96px"
                      className="size-full object-cover"
                    />
                  </div>
                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-1">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-mist-500">
                            {bike.brand}
                          </p>
                          <h4 className="font-bold text-xs text-ink-900 leading-snug">
                            <Link
                              href={`/bikes/${bike.slug}`}
                              onClick={closeFavoritesModal}
                              className="hover:text-accent-600 transition-colors"
                            >
                              {bike.model}
                            </Link>
                          </h4>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFavorite(bike.id)}
                          className="text-mist-400 hover:text-red-600 p-1 transition-colors"
                          title="Remove from shortlist"
                          aria-label={`Remove ${bike.model} from shortlist`}
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                      <p className="mt-1 font-black text-sm text-ink-900">
                        {formatKes(bike.priceKes)}
                      </p>
                      <div className="mt-1 flex items-center gap-2 text-[10px] text-mist-500">
                        {bike.year ? <span>{bike.year}</span> : null}
                        {bike.engineCc ? <span>{formatEngine(bike.engineCc)}</span> : null}
                        {bike.odometerKm !== null ? <span>{formatOdometer(bike.odometerKm)}</span> : null}
                      </div>
                    </div>

                    <div className="mt-2.5 flex items-center gap-2">
                      <Link
                        href={`/bikes/${bike.slug}`}
                        onClick={closeFavoritesModal}
                        className="inline-flex flex-1 items-center justify-center rounded-lg border border-mist-300 py-1.5 text-[11px] font-bold text-ink-900 hover:bg-mist-50 transition-colors"
                      >
                        View details
                      </Link>
                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex size-7 shrink-0 items-center justify-center rounded-lg bg-whatsapp text-white hover:bg-whatsapp-dark transition-colors"
                        title="Chat on WhatsApp"
                        aria-label={`WhatsApp about ${bike.model}`}
                      >
                        <WhatsAppIcon className="size-3.5" />
                      </a>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {savedBikes.length > 0 ? (
          <div className="border-t border-mist-200 p-4 bg-mist-50 flex items-center justify-between">
            <button
              type="button"
              onClick={clearFavorites}
              className="text-xs font-semibold text-mist-500 hover:text-red-600 transition-colors"
            >
              Clear all
            </button>
            <Link
              href="/bikes"
              onClick={closeFavoritesModal}
              className="inline-flex items-center gap-1 text-xs font-bold text-accent-700 hover:text-accent-800"
            >
              <span>Continue browsing</span>
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
        ) : null}
      </div>
    </div>
  );
}
