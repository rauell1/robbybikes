"use client";

import { usePathname } from "next/navigation";
import { Heart, Phone } from "lucide-react";
import { WhatsAppIcon } from "@/components/icons";
import { business } from "@/lib/business";
import { generalWhatsAppMessage, telHref, whatsappHref } from "@/lib/contact";
import { trackEvent } from "@/lib/analytics";
import { useFavorites } from "@/components/bikes/favorites-context";
import { cn } from "@/lib/utils";

export function MobileContactBar() {
  const pathname = usePathname();
  const { count, openFavoritesModal } = useFavorites();

  // Hide on admin routes
  if (pathname.startsWith("/admin")) {
    return null;
  }

  const primaryPhone = business.phones[0];

  return (
    <div className="fixed bottom-0 inset-x-0 z-30 border-t border-mist-200 bg-white/95 px-3 pt-2 pb-[max(0.6rem,env(safe-area-inset-bottom))] shadow-lg backdrop-blur supports-[backdrop-filter]:bg-white/85 md:hidden">
      <div className="flex items-center gap-2 max-w-md mx-auto">
        {/* Shortlist button */}
        <button
          type="button"
          onClick={openFavoritesModal}
          className="relative grid size-11 shrink-0 place-items-center rounded-xl border border-mist-200 bg-white text-mist-600 hover:text-red-600 transition-colors"
          aria-label="View saved shortlist"
        >
          <Heart className={cn("size-4", count > 0 && "fill-red-600 text-red-600")} />
          {count > 0 ? (
            <span className="absolute -top-1 -right-1 grid size-4 place-items-center rounded-full bg-red-600 text-[10px] font-bold text-white">
              {count}
            </span>
          ) : null}
        </button>

        {/* Call button */}
        <a
          href={telHref(primaryPhone.international)}
          onClick={() => trackEvent("contact_phone", { context: "mobile_bottom_bar" })}
          className="flex h-11 flex-1 items-center justify-center gap-1.5 rounded-xl bg-ink-950 px-2.5 text-xs font-bold text-white transition-all active:scale-98"
        >
          <Phone className="size-3.5 shrink-0" aria-hidden="true" />
          <span className="truncate">Call: {primaryPhone.display}</span>
        </a>

        {/* WhatsApp button */}
        <a
          href={whatsappHref(generalWhatsAppMessage())}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackEvent("contact_whatsapp", { context: "mobile_bottom_bar" })}
          className="flex h-11 flex-1 items-center justify-center gap-1.5 rounded-xl bg-whatsapp px-2.5 text-xs font-bold text-white shadow-green-glow transition-all active:scale-98 hover:bg-whatsapp-dark"
        >
          <WhatsAppIcon className="size-4 shrink-0" />
          <span className="truncate">WhatsApp Us</span>
        </a>
      </div>
    </div>
  );
}
