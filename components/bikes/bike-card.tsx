import Link from "next/link";
import { ArrowRight, Gauge, Calendar, Cog } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { BikePhoto } from "@/components/bikes/bike-photo";
import { WhatsAppIcon } from "@/components/icons";
import { formatEngine, formatKes, formatOdometer, statusMeta } from "@/lib/format";
import { bikeWhatsAppMessage, whatsappHref } from "@/lib/contact";
import { absoluteUrl } from "@/lib/seo";
import type { MotorcycleWithImages } from "@/lib/db/schema";
import { cn } from "@/lib/utils";

export function BikeCard({ bike, priority = false }: { bike: MotorcycleWithImages; priority?: boolean }) {
  const primary = bike.images[0] ?? null;
  const status = statusMeta(bike.status);
  const specs = [
    bike.year ? { icon: Calendar, value: String(bike.year) } : null,
    bike.engineCc ? { icon: Cog, value: formatEngine(bike.engineCc) } : null,
    bike.odometerKm !== null ? { icon: Gauge, value: formatOdometer(bike.odometerKm) } : null,
  ].filter((spec): spec is { icon: typeof Calendar; value: string } => spec !== null);

  return (
    <article
      className={cn(
        "group flex flex-col overflow-hidden rounded-xl border border-mist-200 bg-white transition-all hover:border-mist-300 hover:shadow-card",
        bike.status === "sold" && "opacity-90",
      )}
    >
      <Link
        href={`/bikes/${bike.slug}`}
        className="relative block aspect-[4/3] overflow-hidden bg-mist-100"
        tabIndex={-1}
        aria-hidden="true"
      >
        <BikePhoto
          image={primary}
          alt={`${bike.brand} ${bike.model}`}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          priority={priority}
          className={cn(
            "transition-transform duration-500 group-hover:scale-[1.03]",
            bike.status === "sold" && "grayscale",
          )}
        />
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          <Badge tone={status.tone} dot>
            {status.label}
          </Badge>
        </div>
        {bike.isSample ? (
          <div className="absolute right-3 top-3">
            <Badge tone="sample">Sample</Badge>
          </div>
        ) : null}
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-mist-500">
          {bike.brand}
        </p>
        <h3 className="mt-1 text-base font-semibold leading-snug tracking-tight text-ink-900">
          <Link href={`/bikes/${bike.slug}`} className="hover:text-accent-700">
            {bike.model}
          </Link>
        </h3>

        <p className="mt-2 text-xl font-bold tracking-tight text-ink-900">
          {formatKes(bike.priceKes)}
        </p>
        <p className="mt-1 text-xs text-mist-500">{status.description}</p>

        {specs.length > 0 ? (
          <ul className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-mist-600">
            {specs.map((spec) => (
              <li key={spec.value} className="inline-flex items-center gap-1.5">
                <spec.icon className="size-3.5 text-mist-400" aria-hidden="true" />
                {spec.value}
              </li>
            ))}
          </ul>
        ) : null}

        <div className="mt-4 flex items-center gap-2 pt-1">
          <Link
            href={`/bikes/${bike.slug}`}
            className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-lg border border-mist-300 text-sm font-semibold text-ink-900 transition-colors hover:border-ink-900 hover:bg-mist-50"
          >
            View details
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
          <a
            href={whatsappHref(
              bikeWhatsAppMessage(
                {
                  brand: bike.brand,
                  model: bike.model,
                  priceKes: bike.priceKes,
                  engineCc: bike.engineCc,
                  year: bike.year,
                },
                absoluteUrl(`/bikes/${bike.slug}`),
              ),
            )}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Enquire about the ${bike.brand} ${bike.model} on WhatsApp`}
            className="inline-flex size-10 items-center justify-center rounded-lg bg-whatsapp text-white transition-colors hover:bg-whatsapp-dark"
          >
            <WhatsAppIcon className="size-[18px]" />
          </a>
        </div>
      </div>
    </article>
  );
}
