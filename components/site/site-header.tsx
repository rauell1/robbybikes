"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { MapPin, Menu, Phone, X } from "lucide-react";
import { Logo } from "@/components/site/logo";
import { WhatsAppIcon } from "@/components/icons";
import { business, mapsSearchUrl } from "@/lib/business";
import { generalWhatsAppMessage, telHref, whatsappHref } from "@/lib/contact";
import { trackEvent } from "@/lib/analytics";
import { buttonStyles } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/bikes", label: "Browse bikes" },
  { href: "/brands", label: "Brands" },
  { href: "/about", label: "About us" },
  { href: "/contact", label: "Contact" },
] as const;

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [openedOnPath, setOpenedOnPath] = useState(pathname);

  // Close the menu when navigation changes the route (state adjusted during
  // render rather than in an effect, per React's guidance).
  if (open && openedOnPath !== pathname) {
    setOpen(false);
    setOpenedOnPath(pathname);
  }

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-40 border-b border-mist-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/85">
      <div className="bg-ink-950 text-white">
        <div className="container-page flex h-9 items-center justify-between gap-4 text-[11px] sm:text-xs">
          <a
            href={mapsSearchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-w-0 items-center gap-1.5 text-white/75 transition-colors hover:text-white"
          >
            <MapPin className="size-3.5 shrink-0 text-accent-400" aria-hidden="true" />
            <span className="truncate">{business.address.shortDisplay}</span>
            <span className="hidden text-white/40 sm:inline">
              · {business.address.landmark}
            </span>
          </a>
          <a
            href={telHref(business.phones[0].international)}
            className="inline-flex shrink-0 items-center gap-1.5 font-semibold text-white transition-colors hover:text-accent-200"
            onClick={() => trackEvent("contact_phone", { context: "top_bar" })}
          >
            <Phone className="size-3.5" aria-hidden="true" />
            {business.phones[0].display}
          </a>
        </div>
      </div>

      <div className="container-page flex h-16 items-center justify-between gap-4 lg:h-[4.5rem]">
        <Logo />

        <nav aria-label="Main navigation" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={isActive(link.href) ? "page" : undefined}
                  className={cn(
                    "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive(link.href)
                      ? "text-accent-700"
                      : "text-ink-600 hover:bg-mist-50 hover:text-ink-900",
                  )}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={telHref(business.phones[0].international)}
            className={cn(
              buttonStyles({ variant: "outline", size: "md" }),
              "hidden xl:inline-flex",
            )}
            onClick={() => trackEvent("contact_phone", { context: "header" })}
          >
            <Phone className="size-4" aria-hidden="true" />
            Call us
          </a>
          <a
            href={whatsappHref(generalWhatsAppMessage())}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              buttonStyles({ variant: "whatsapp", size: "md" }),
              "hidden sm:inline-flex",
            )}
            onClick={() => trackEvent("contact_whatsapp", { context: "header" })}
          >
            <WhatsAppIcon className="size-[18px]" />
            WhatsApp us
          </a>
          <button
            type="button"
            onClick={() => {
              setOpen((value) => !value);
              setOpenedOnPath(pathname);
            }}
            aria-expanded={open}
            aria-controls="mobile-menu"
            className="inline-flex size-10 items-center justify-center rounded-lg border border-mist-300 text-ink-800 transition-colors hover:bg-mist-50 lg:hidden"
          >
            <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
            {open ? <X className="size-5" aria-hidden="true" /> : <Menu className="size-5" aria-hidden="true" />}
          </button>
        </div>
      </div>

      <div
        id="mobile-menu"
        className={cn(
          "border-t border-mist-200 bg-white lg:hidden",
          open ? "block" : "hidden",
        )}
      >
        <nav aria-label="Mobile navigation" className="container-page py-3">
          <ul className="flex flex-col">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={isActive(link.href) ? "page" : undefined}
                  className={cn(
                    "flex items-center justify-between rounded-lg px-3 py-3 text-base font-medium",
                    isActive(link.href)
                      ? "bg-accent-50 text-accent-800"
                      : "text-ink-800 hover:bg-mist-50",
                  )}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-3 grid gap-2 border-t border-mist-200 pt-3">
            {business.phones.map((phone) => (
              <a
                key={phone.international}
                href={telHref(phone.international)}
                className={cn(buttonStyles({ variant: "outline" }), "justify-start")}
                onClick={() => trackEvent("contact_phone", { context: "mobile_menu" })}
              >
                <Phone className="size-4" aria-hidden="true" />
                <span className="font-semibold">{phone.display}</span>
                <span className="text-mist-500">· {phone.label}</span>
              </a>
            ))}
            <a
              href={whatsappHref(generalWhatsAppMessage())}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(buttonStyles({ variant: "whatsapp" }), "justify-start")}
              onClick={() => trackEvent("contact_whatsapp", { context: "mobile_menu" })}
            >
              <WhatsAppIcon className="size-4" />
              Chat on WhatsApp
            </a>
          </div>
        </nav>
      </div>
    </header>
  );
}
