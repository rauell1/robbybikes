"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronUp, MapPin, Phone, Scale, X } from "lucide-react";
import { WhatsAppIcon } from "@/components/icons";
import { business, mapsSearchUrl } from "@/lib/business";
import { generalWhatsAppMessage, telHref, whatsappHref } from "@/lib/contact";
import { trackEvent } from "@/lib/analytics";
import { useCompare } from "@/components/bikes/compare-context";

export function WhatsAppFab() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { compared, openModal } = useCompare();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div ref={menuRef} className="fixed bottom-6 right-6 z-40 hidden md:flex flex-col items-end">
      {/* Expanded Speed-Dial Card */}
      {isOpen && (
        <div className="mb-3 w-72 animate-slide-up overflow-hidden rounded-2xl border border-mist-200 bg-white shadow-2xl">
          {/* Header */}
          <div className="bg-ink-950 p-4 text-white">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                <span className="size-2 rounded-full bg-emerald-400 animate-pulse-subtle" />
                Yard Open Today
              </span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="grid size-6 place-items-center rounded-full text-white/60 hover:bg-white/10 hover:text-white"
                aria-label="Close contact menu"
              >
                <X className="size-4" />
              </button>
            </div>
            <h4 className="mt-1 font-bold text-sm text-white">Robbybikes Eastleigh</h4>
            <p className="text-[11px] text-white/60">
              Juja Road, near Amana / Luqman Petrol Station
            </p>
          </div>

          {/* Quick Actions List */}
          <div className="p-2 space-y-1">
            <a
              href={whatsappHref(generalWhatsAppMessage())}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                trackEvent("contact_whatsapp", { context: "speed_dial" });
                setIsOpen(false);
              }}
              className="flex items-center gap-3 rounded-xl p-2.5 transition-colors hover:bg-emerald-50 text-ink-900 group"
            >
              <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-whatsapp text-white shadow-sm transition-transform group-hover:scale-105">
                <WhatsAppIcon className="size-5" />
              </div>
              <div className="text-left">
                <p className="font-bold text-xs text-ink-900 group-hover:text-whatsapp">
                  WhatsApp Us
                </p>
                <p className="text-[11px] text-mist-500">Fastest response · Photos & directions</p>
              </div>
            </a>

            <a
              href={telHref(business.phones[0].international)}
              onClick={() => {
                trackEvent("contact_phone", { context: "speed_dial_p1" });
                setIsOpen(false);
              }}
              className="flex items-center gap-3 rounded-xl p-2.5 transition-colors hover:bg-mist-50 text-ink-900 group"
            >
              <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-ink-950 text-white shadow-sm transition-transform group-hover:scale-105">
                <Phone className="size-4" />
              </div>
              <div className="text-left">
                <p className="font-bold text-xs text-ink-900">Call {business.phones[0].display}</p>
                <p className="text-[11px] text-mist-500">Primary yard line · Inquiries</p>
              </div>
            </a>

            <a
              href={telHref(business.phones[1].international)}
              onClick={() => {
                trackEvent("contact_phone", { context: "speed_dial_p2" });
                setIsOpen(false);
              }}
              className="flex items-center gap-3 rounded-xl p-2.5 transition-colors hover:bg-mist-50 text-ink-900 group"
            >
              <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-ink-100 text-ink-900 shadow-sm transition-transform group-hover:scale-105">
                <Phone className="size-4" />
              </div>
              <div className="text-left">
                <p className="font-bold text-xs text-ink-900">Call {business.phones[1].display}</p>
                <p className="text-[11px] text-mist-500">Secondary yard line</p>
              </div>
            </a>

            <a
              href={mapsSearchUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 rounded-xl p-2.5 transition-colors hover:bg-mist-50 text-ink-900 group"
            >
              <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-accent-50 text-accent-700 shadow-sm transition-transform group-hover:scale-105">
                <MapPin className="size-4" />
              </div>
              <div className="text-left">
                <p className="font-bold text-xs text-ink-900">Get Directions</p>
                <p className="text-[11px] text-mist-500">Google Maps to Eastleigh yard</p>
              </div>
            </a>

            {compared.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  openModal();
                }}
                className="flex w-full items-center gap-3 rounded-xl p-2.5 transition-colors hover:bg-mist-50 text-ink-900 group border-t border-mist-100 mt-1"
              >
                <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-accent-500 text-white shadow-sm transition-transform group-hover:scale-105">
                  <Scale className="size-4" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-xs text-ink-900">
                    Compare Bikes ({compared.length})
                  </p>
                  <p className="text-[11px] text-mist-500">View side-by-side specs</p>
                </div>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Floating Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-label="Open contact and enquiry menu"
        className="group flex items-center gap-2.5 rounded-full bg-whatsapp px-4 py-3 text-white shadow-lift transition-all hover:scale-105 hover:bg-whatsapp-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 md:px-5"
      >
        <WhatsAppIcon className="size-5 transition-transform group-hover:rotate-12" />
        <span className="text-xs font-bold sm:inline">Contact & Yard</span>
        <ChevronUp
          className={`size-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>
    </div>
  );
}
