"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { ArrowRight, Bike, Check, ExternalLink, Scale, Trash2, X } from "lucide-react";
import { useCompare } from "./compare-context";
import { WhatsAppIcon } from "@/components/icons";
import { formatEngine, formatKes, formatOdometer } from "@/lib/format";
import { business } from "@/lib/business";
import { whatsappHref } from "@/lib/contact";

export function CompareModal() {
  const { compared, removeBike, clearCompare, closeModal } = useCompare();
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };
    document.addEventListener("keydown", handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [closeModal]);

  if (compared.length === 0) return null;

  // Build combined WhatsApp enquiry message
  const bikeListText = compared
    .map(
      (b, i) =>
        `${i + 1}. ${b.brand} ${b.model} (${formatKes(b.priceKes)})${b.year ? ` - ${b.year}` : ""}`,
    )
    .join("\n");

  const compareMessage = `Hello ${business.name}, I am comparing the following motorcycles on your website:\n\n${bikeListText}\n\nCould you please let me know which of these are currently in the yard in Eastleigh for viewing today?`;

  const lowestPrice = Math.min(...compared.map((b) => b.priceKes));

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="compare-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-ink-950/80 backdrop-blur-sm transition-opacity"
        onClick={closeModal}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div
        ref={modalRef}
        className="relative flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-mist-200 bg-white shadow-2xl animate-fade-in"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-mist-200 bg-mist-50 px-5 py-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <div className="grid size-9 place-items-center rounded-xl bg-accent-500 text-white">
              <Scale className="size-5" aria-hidden="true" />
            </div>
            <div>
              <h2 id="compare-modal-title" className="text-base font-bold text-ink-900 sm:text-lg">
                Compare Motorcycles ({compared.length})
              </h2>
              <p className="text-xs text-mist-500">
                Side-by-side comparison for bikes at Robbybikes Eastleigh yard
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={clearCompare}
              className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-mist-600 hover:bg-mist-200 hover:text-ink-900"
            >
              <Trash2 className="size-3.5" aria-hidden="true" />
              <span>Clear all</span>
            </button>
            <button
              type="button"
              onClick={closeModal}
              className="grid size-8 place-items-center rounded-lg text-mist-500 hover:bg-mist-200 hover:text-ink-900"
              aria-label="Close modal"
            >
              <X className="size-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Comparison Content */}
        <div className="flex-1 overflow-x-auto overflow-y-auto p-4 sm:p-6 scrollbar-thin">
          <div
            className="grid min-w-[600px] gap-4"
            style={{
              gridTemplateColumns: `140px repeat(${compared.length}, minmax(180px, 1fr))`,
            }}
          >
            {/* Headers / Photo Row */}
            <div className="font-semibold text-xs uppercase tracking-wider text-mist-400 self-end pb-2">
              Motorcycle
            </div>
            {compared.map((bike) => (
              <div
                key={bike.id}
                className="relative flex flex-col rounded-xl border border-mist-200 bg-white p-3 shadow-xs"
              >
                <button
                  type="button"
                  onClick={() => removeBike(bike.id)}
                  className="absolute right-2 top-2 z-10 grid size-6 place-items-center rounded-full bg-white/90 text-mist-400 shadow-xs hover:bg-mist-100 hover:text-ink-900"
                  aria-label={`Remove ${bike.model}`}
                >
                  <X className="size-3.5" />
                </button>
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-mist-100">
                  {bike.imageUrl ? (
                    <Image
                      src={bike.imageUrl}
                      alt={`${bike.brand} ${bike.model}`}
                      fill
                      sizes="200px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="grid size-full place-items-center text-mist-400">
                      <Bike className="size-8" />
                    </div>
                  )}
                </div>
                <div className="mt-2.5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-mist-500">
                    {bike.brand}
                  </p>
                  <h3 className="font-bold text-sm text-ink-900 line-clamp-1">{bike.model}</h3>
                  <div className="mt-1 flex items-baseline gap-1.5">
                    <span className="font-extrabold text-base text-ink-900">
                      {formatKes(bike.priceKes)}
                    </span>
                    {bike.priceKes === lowestPrice && compared.length > 1 && (
                      <span className="rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700">
                        Lowest
                      </span>
                    )}
                  </div>
                  <Link
                    href={`/bikes/${bike.slug}`}
                    onClick={closeModal}
                    className="mt-2 inline-flex w-full items-center justify-center gap-1 rounded-lg border border-mist-300 py-1 text-xs font-semibold text-ink-800 transition-colors hover:bg-mist-50 hover:border-ink-900"
                  >
                    <span>Full Details</span>
                    <ExternalLink className="size-3" />
                  </Link>
                </div>
              </div>
            ))}

            {/* Spec: Year */}
            <div className="border-t border-mist-100 py-2.5 text-xs font-semibold text-mist-500">
              Year
            </div>
            {compared.map((bike) => (
              <div
                key={`year-${bike.id}`}
                className="border-t border-mist-100 py-2.5 text-xs font-medium text-ink-900"
              >
                {bike.year ?? "Not specified"}
              </div>
            ))}

            {/* Spec: Engine CC */}
            <div className="border-t border-mist-100 py-2.5 text-xs font-semibold text-mist-500">
              Engine Size
            </div>
            {compared.map((bike) => (
              <div
                key={`cc-${bike.id}`}
                className="border-t border-mist-100 py-2.5 text-xs font-semibold text-ink-900"
              >
                {formatEngine(bike.engineCc) ?? "-"}
              </div>
            ))}

            {/* Spec: Mileage / Odometer */}
            <div className="border-t border-mist-100 py-2.5 text-xs font-semibold text-mist-500">
              Odometer
            </div>
            {compared.map((bike) => (
              <div
                key={`odo-${bike.id}`}
                className="border-t border-mist-100 py-2.5 text-xs font-medium text-ink-900"
              >
                {formatOdometer(bike.odometerKm) ?? "-"}
              </div>
            ))}

            {/* Spec: Condition */}
            <div className="border-t border-mist-100 py-2.5 text-xs font-semibold text-mist-500">
              Condition
            </div>
            {compared.map((bike) => (
              <div
                key={`cond-${bike.id}`}
                className="border-t border-mist-100 py-2.5 text-xs font-medium capitalize text-ink-900"
              >
                {bike.condition.replaceAll("_", " ")}
              </div>
            ))}

            {/* Spec: Transmission */}
            <div className="border-t border-mist-100 py-2.5 text-xs font-semibold text-mist-500">
              Transmission
            </div>
            {compared.map((bike) => (
              <div
                key={`trans-${bike.id}`}
                className="border-t border-mist-100 py-2.5 text-xs font-medium text-ink-900"
              >
                {bike.transmission ?? "Manual"}
              </div>
            ))}

            {/* Spec: Fuel Type */}
            <div className="border-t border-mist-100 py-2.5 text-xs font-semibold text-mist-500">
              Fuel Type
            </div>
            {compared.map((bike) => (
              <div
                key={`fuel-${bike.id}`}
                className="border-t border-mist-100 py-2.5 text-xs font-medium text-ink-900"
              >
                {bike.fuelType ?? "Petrol"}
              </div>
            ))}

            {/* Spec: Registration / Logbook */}
            <div className="border-t border-mist-100 py-2.5 text-xs font-semibold text-mist-500">
              Registration
            </div>
            {compared.map((bike) => (
              <div
                key={`reg-${bike.id}`}
                className="border-t border-mist-100 py-2.5 text-xs font-medium text-ink-900"
              >
                {bike.registration ?? "Logbook ready upon inspection"}
              </div>
            ))}
          </div>
        </div>

        {/* Footer with Combined WhatsApp Action */}
        <div className="border-t border-mist-200 bg-mist-50 p-4 sm:flex sm:items-center sm:justify-between sm:px-6">
          <p className="text-xs text-mist-600 mb-3 sm:mb-0">
            Have questions about these bikes? WhatsApp our Eastleigh yard team directly.
          </p>
          <a
            href={whatsappHref(compareMessage)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-whatsapp px-5 py-2.5 text-sm font-bold text-white shadow-green-glow transition-all hover:bg-whatsapp-dark sm:w-auto"
          >
            <WhatsAppIcon className="size-4" />
            <span>Enquire on WhatsApp About All {compared.length}</span>
          </a>
        </div>
      </div>
    </div>
  );
}
