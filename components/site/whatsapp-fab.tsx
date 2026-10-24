"use client";

import { WhatsAppIcon } from "@/components/icons";
import { business } from "@/lib/business";
import { generalWhatsAppMessage, whatsappHref } from "@/lib/contact";
import { trackEvent } from "@/lib/analytics";

export function WhatsAppFab() {
  return (
    <a
      href={whatsappHref(generalWhatsAppMessage())}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Chat with ${business.name} on WhatsApp`}
      onClick={() => trackEvent("contact_whatsapp", { context: "floating_button" })}
      className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-4 z-40 inline-flex items-center gap-2 rounded-full bg-whatsapp px-4 py-3 text-sm font-semibold text-white shadow-lift transition-transform hover:scale-105 hover:bg-whatsapp-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-whatsapp md:right-6 md:px-5"
    >
      <WhatsAppIcon className="size-5" />
      <span className="hidden sm:inline">WhatsApp us</span>
      <span className="sr-only sm:hidden">WhatsApp</span>
    </a>
  );
}
