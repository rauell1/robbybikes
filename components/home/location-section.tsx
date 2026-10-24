import { Clock, MapPin, Navigation, Phone } from "lucide-react";
import { buttonStyles } from "@/components/ui/button";
import { business, directionsNote, mapsDirectionsUrl, mapsSearchUrl } from "@/lib/business";
import { telHref } from "@/lib/contact";
import { cn } from "@/lib/utils";

export function LocationSection() {
  return (
    <div className="grid overflow-hidden rounded-2xl border border-mist-200 bg-white lg:grid-cols-5">
      <div className="p-6 sm:p-8 lg:col-span-3">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-700">
          Visit the yard
        </p>
        <h2 className="mt-2 text-2xl font-bold tracking-tight text-ink-900 sm:text-3xl">
          Find us on Juja Road, Eastleigh
        </h2>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-mist-600">{directionsNote}</p>

        <dl className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="flex gap-3">
            <MapPin className="mt-0.5 size-5 shrink-0 text-accent-600" aria-hidden="true" />
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-mist-500">Address</dt>
              <dd className="mt-0.5 text-sm font-medium text-ink-900">
                {business.address.street}, {business.address.area}
                <br />
                {business.address.city}, {business.address.country}
              </dd>
            </div>
          </div>

          <div className="flex gap-3">
            <Phone className="mt-0.5 size-5 shrink-0 text-accent-600" aria-hidden="true" />
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-mist-500">Call ahead</dt>
              <dd className="mt-0.5 space-y-0.5 text-sm font-medium text-ink-900">
                {business.phones.map((phone) => (
                  <a
                    key={phone.international}
                    href={telHref(phone.international)}
                    className="block hover:text-accent-700"
                  >
                    {phone.display}
                  </a>
                ))}
              </dd>
            </div>
          </div>

          <div className="flex gap-3 sm:col-span-2">
            <Clock className="mt-0.5 size-5 shrink-0 text-mist-400" aria-hidden="true" />
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-mist-500">
                Opening hours
              </dt>
              <dd className="mt-0.5 text-sm text-mist-600">
                Hours are being confirmed with the dealership. Call or WhatsApp before travelling and
                the team will tell you when the yard is open.
              </dd>
            </div>
          </div>
        </dl>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <a
            href={mapsDirectionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(buttonStyles({ variant: "dark" }), "justify-center")}
          >
            <Navigation className="size-4" aria-hidden="true" />
            Get directions
          </a>
          <a
            href={mapsSearchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(buttonStyles({ variant: "outline" }), "justify-center")}
          >
            <MapPin className="size-4" aria-hidden="true" />
            Find us on Google Maps
          </a>
        </div>
      </div>

      <div className="relative flex flex-col justify-between overflow-hidden bg-ink-950 p-6 text-white sm:p-8 lg:col-span-2">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.14]"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(255,255,255,0.35) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.35) 1px, transparent 1px)",
            backgroundSize: "34px 34px",
          }}
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full bg-accent-500/20 blur-3xl"
          aria-hidden="true"
        />
        <div className="relative">
          <span className="inline-flex size-12 items-center justify-center rounded-xl bg-accent-500 text-white">
            <MapPin className="size-6" aria-hidden="true" />
          </span>
          <p className="mt-5 text-xl font-bold tracking-tight">Eastleigh, Juja Road</p>
          <p className="mt-2 text-sm leading-relaxed text-white/60">
            Landmark: {business.address.landmark}. If the junction is busy, call us and we will
            direct you to the entrance.
          </p>
        </div>

        <div className="relative mt-8 rounded-lg border border-white/10 bg-white/5 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-white/50">
            Before you travel
          </p>
          <p className="mt-1.5 text-sm text-white/75">
            A quick call confirms whether the motorcycle you saw online is still in the yard and
            ready for inspection.
          </p>
        </div>
      </div>
    </div>
  );
}
