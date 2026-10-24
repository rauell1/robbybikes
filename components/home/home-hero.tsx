import Image from "next/image";
import Link from "next/link";
import { MapPin, ShieldCheck } from "lucide-react";
import { buttonStyles } from "@/components/ui/button";
import { WhatsAppIcon } from "@/components/icons";
import { business } from "@/lib/business";
import { generalWhatsAppMessage, whatsappHref } from "@/lib/contact";
import { cn } from "@/lib/utils";

type HomeHeroProps = {
  stats: { available: number; brands: number };
  searchPanel: React.ReactNode;
};

export function HomeHero({ stats, searchPanel }: HomeHeroProps) {
  return (
    <section className="relative isolate overflow-hidden bg-ink-950">
      <div className="absolute inset-0 -z-10">
        <Image
          src="/sample/hero.jpg"
          alt="Illustrative photograph of commuter motorcycles parked at a dealership yard"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[60%_center] opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink-950 via-ink-950/85 to-ink-950/25" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-ink-950 to-transparent" />
      </div>

      <div className="container-page pb-0 pt-12 sm:pt-16 lg:pt-20">
        <div className="max-w-2xl">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/80 backdrop-blur">
            <MapPin className="size-3.5 text-accent-400" aria-hidden="true" />
            {business.address.area} · {business.address.city}
          </p>

          <h1 className="mt-5 text-3xl font-bold leading-[1.1] tracking-tight text-white sm:text-4xl lg:text-[3.25rem]">
            Find the right motorcycle for your next journey.
          </h1>

          <p className="mt-5 max-w-xl text-base leading-relaxed text-white/75 sm:text-lg">
            Explore used and second-hand motorcycles at {business.name} in{" "}
            {business.address.area}, Nairobi. Browse available bikes, compare prices, and contact
            our team to arrange a viewing.
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/bikes"
              className={cn(buttonStyles({ variant: "primary", size: "lg" }), "sm:w-auto")}
            >
              Browse available bikes
            </Link>
            <a
              href={whatsappHref(generalWhatsAppMessage())}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                buttonStyles({ variant: "whatsapp", size: "lg" }),
                "border border-white/10 sm:w-auto",
              )}
            >
              <WhatsAppIcon className="size-5" />
              Chat on WhatsApp
            </a>
          </div>

          <dl className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm text-white/70">
            <div className="flex items-baseline gap-2">
              <dt className="order-2 text-xs uppercase tracking-wide text-white/60">available now</dt>
              <dd className="order-1 text-xl font-bold text-white">{stats.available}</dd>
            </div>
            <div className="flex items-baseline gap-2">
              <dt className="order-2 text-xs uppercase tracking-wide text-white/60">brands</dt>
              <dd className="order-1 text-xl font-bold text-white">{stats.brands}</dd>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-accent-400" aria-hidden="true" />
              <span className="text-xs">Inspect in person before you buy</span>
            </div>
          </dl>
        </div>

        <div className="mt-10 pb-10 pt-2 sm:mt-12">{searchPanel}</div>
      </div>

      <p className="pointer-events-none absolute bottom-2 right-3 text-[10px] text-white/50">
        Illustrative image — to be replaced with dealership photography
      </p>
    </section>
  );
}
