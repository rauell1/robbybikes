import Link from "next/link";
import { MapPin, Phone } from "lucide-react";
import { Logo } from "@/components/site/logo";
import { FacebookIcon, TikTokIcon, WhatsAppIcon } from "@/components/icons";
import { business, mapsDirectionsUrl } from "@/lib/business";
import { generalWhatsAppMessage, telHref, whatsappHref } from "@/lib/contact";

const EXPLORE_LINKS = [
  { href: "/bikes", label: "Browse all bikes" },
  { href: "/brands", label: "Shop by brand" },
  { href: "/about", label: "About Robbybikes" },
  { href: "/contact", label: "Contact & enquiries" },
  { href: "/bikes?availability=sold", label: "Recently sold" },
] as const;

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-20 bg-ink-950 text-white">
      <div className="container-page grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
        <div className="sm:col-span-2 lg:col-span-1">
          <Logo inverted />
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-white/60">
            {business.description}
          </p>
          <div className="mt-5 flex items-center gap-2">
            <a
              href={business.social.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex size-9 items-center justify-center rounded-lg border border-white/15 text-white/70 transition-colors hover:border-white/40 hover:text-white"
              aria-label="Robbybikes on Facebook"
            >
              <FacebookIcon className="size-4" />
            </a>
            {business.social.tiktok ? (
              <a
                href={business.social.tiktok}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex size-9 items-center justify-center rounded-lg border border-white/15 text-white/70 transition-colors hover:border-white/40 hover:text-white"
                aria-label="Robbybikes on TikTok"
              >
                <TikTokIcon className="size-4" />
              </a>
            ) : null}
            <a
              href={whatsappHref(generalWhatsAppMessage())}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex size-9 items-center justify-center rounded-lg border border-white/15 text-white/70 transition-colors hover:border-white/40 hover:text-white"
              aria-label="Chat with Robbybikes on WhatsApp"
            >
              <WhatsAppIcon className="size-4" />
            </a>
          </div>
        </div>

        <nav aria-label="Footer navigation">
          <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-white/60">
            Explore
          </h2>
          <ul className="mt-4 space-y-2.5 text-sm">
            {EXPLORE_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-white/70 transition-colors hover:text-white">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-white/60">
            Visit the yard
          </h2>
          <address className="mt-4 space-y-2.5 text-sm not-italic text-white/70">
            <p className="flex gap-2">
              <MapPin className="mt-0.5 size-4 shrink-0 text-accent-400" aria-hidden="true" />
              <span>
                {business.address.street}
                <br />
                {business.address.area}, {business.address.city}
                <br />
                {business.address.country}
              </span>
            </p>
            <p className="text-white/50">{business.address.landmark}</p>
          </address>
          <a
            href={mapsDirectionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex text-sm font-semibold text-accent-300 underline-offset-4 hover:text-accent-200 hover:underline"
          >
            Get directions
          </a>
        </div>

        <div>
          <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-white/60">
            Talk to us
          </h2>
          <ul className="mt-4 space-y-3 text-sm">
            {business.phones.map((phone) => (
              <li key={phone.international}>
                <a
                  href={telHref(phone.international)}
                  className="flex items-start gap-2 text-white/70 transition-colors hover:text-white"
                >
                  <Phone className="mt-0.5 size-4 shrink-0 text-accent-400" aria-hidden="true" />
                  <span>
                    <span className="block font-semibold text-white">{phone.display}</span>
                    <span className="text-xs text-white/60">{phone.label}</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
          <a
            href={whatsappHref(generalWhatsAppMessage())}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-white/80 transition-colors hover:text-white"
          >
            <WhatsAppIcon className="size-4 text-[#4ade80]" />
            Chat on WhatsApp
          </a>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-page flex flex-col gap-3 pb-24 pt-6 text-xs text-white/60 sm:flex-row sm:items-center sm:justify-between md:pb-8">
          <p>© {year} {business.legalName}. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <Link href="/privacy" className="transition-colors hover:text-white">
              Privacy notice
            </Link>
            <Link href="/terms" className="transition-colors hover:text-white">
              Terms of use
            </Link>
            <span className="hidden max-w-sm text-white/50 sm:inline">
              Prices and availability can change. Please confirm before travelling.
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
