import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, MapPin, Phone, Wrench } from "lucide-react";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { SectionHeading } from "@/components/site/section-heading";
import { buttonStyles } from "@/components/ui/button";
import { WhatsAppIcon } from "@/components/icons";
import { business, directionsNote, mapsDirectionsUrl } from "@/lib/business";
import { generalWhatsAppMessage, telHref, whatsappHref } from "@/lib/contact";
import { breadcrumbJsonLd, jsonLdScriptProps, pageMetadata } from "@/lib/seo";
import { cn } from "@/lib/utils";

export const metadata = pageMetadata({
  title: "About us",
  description:
    "Robbybikes is a used motorcycle dealership on Juja Road in Eastleigh, Nairobi, selling commuter and utility motorcycles with in-person inspections.",
  path: "/about",
});

const WHAT_WE_OFFER = [
  "Used commuter motorcycles for daily riding",
  "Utility and cargo motorcycles for business use",
  "Bikes suited to boda boda work",
  "Brands including Bajaj, Honda, TVS and UM as stock allows",
] as const;

export default function AboutPage() {
  return (
    <>
      <script
        {...jsonLdScriptProps(
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "About", path: "/about" },
          ]),
        )}
      />

      <div className="border-b border-mist-200 bg-mist-50">
        <div className="container-page py-8 sm:py-10">
          <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "About us", path: "/about" }]} />
          <h1 className="mt-3 max-w-3xl text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">
            A used motorcycle dealership in Eastleigh, Nairobi
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-mist-600 sm:text-base">
            Robbybikes buys, prepares and sells second-hand motorcycles for riders and small
            businesses across Nairobi. This page explains how we work and what you can expect when
            you visit.
          </p>
        </div>
      </div>

      <div className="container-page grid gap-10 py-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-14">
        <div className="prose-page max-w-none">
          <h2>What we sell</h2>
          <p>
            We focus on practical, everyday motorcycles rather than showroom exotics. Most of our
            stock is in the 125 cc to 180 cc range — the kind of bike that handles Nairobi traffic,
            carries a load, or earns a living.
          </p>
          <ul>
            {WHAT_WE_OFFER.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>

          <h2>How we describe a motorcycle</h2>
          <p>
            Each listing shows what we know about the motorcycle: make, model, engine size, year,
            mileage, colour and condition where these have been recorded. If a detail is missing, we
            leave it blank rather than guess. Photographs in a listing are the photos provided for
            that bike; where a listing uses an illustrative sample photo, it is clearly marked.
          </p>
          <p>
            Condition grading is our own assessment. It is a starting point for your inspection, not
            a warranty. We do not claim a service history, warranty, financing or a mechanical
            inspection unless the listing says so in writing.
          </p>

          <h2>Buying in person</h2>
          <p>
            We do not sell online and we do not take payments through this website. The process is
            deliberately simple: browse the listings, contact us to confirm availability, then visit
            the yard to inspect the motorcycle and agree the price in person.
          </p>
          <p>
            Bring a friend or mechanic if that helps you feel confident. Ask about the paperwork
            before you commit, and confirm what is included with the sale.
          </p>

          <h2>Visit us</h2>
          <p>{directionsNote}</p>
        </div>

        <div className="space-y-4">
          <div className="overflow-hidden rounded-xl border border-mist-200 bg-white">
            <div className="relative aspect-[4/3]">
              <Image
                src="/sample/workshop.jpg"
                alt="Illustrative photograph of a mechanic working on a motorcycle in a small workshop"
                fill
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-cover"
              />
            </div>
            <p className="px-4 py-2.5 text-[11px] text-mist-500">
              Illustrative image. Replace with real photographs of the Robbybikes yard and team.
            </p>
          </div>

          <div className="rounded-xl border border-mist-200 bg-white p-5">
            <h2 className="text-base font-semibold text-ink-900">Dealership details</h2>
            <dl className="mt-3 space-y-3 text-sm">
              <div className="flex gap-3">
                <MapPin className="mt-0.5 size-4 shrink-0 text-accent-600" aria-hidden="true" />
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-mist-500">
                    Location
                  </dt>
                  <dd className="mt-0.5 text-ink-800">
                    {business.address.street}, {business.address.area}, {business.address.city}
                    <br />
                    {business.address.landmark}
                  </dd>
                </div>
              </div>
              <div className="flex gap-3">
                <Phone className="mt-0.5 size-4 shrink-0 text-accent-600" aria-hidden="true" />
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-mist-500">
                    Telephone
                  </dt>
                  <dd className="mt-0.5 space-y-0.5">
                    {business.phones.map((phone) => (
                      <a
                        key={phone.international}
                        href={telHref(phone.international)}
                        className="block font-medium text-ink-800 hover:text-accent-700"
                      >
                        {phone.display}
                      </a>
                    ))}
                  </dd>
                </div>
              </div>
              <div className="flex gap-3">
                <Wrench className="mt-0.5 size-4 shrink-0 text-mist-400" aria-hidden="true" />
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-mist-500">
                    Opening hours
                  </dt>
                  <dd className="mt-0.5 text-mist-600">
                    Being confirmed. Call or WhatsApp before travelling and we will tell you when the
                    yard is open.
                  </dd>
                </div>
              </div>
            </dl>

            <div className="mt-4 flex flex-col gap-2">
              <a
                href={whatsappHref(generalWhatsAppMessage())}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(buttonStyles({ variant: "whatsapp" }), "justify-center")}
              >
                <WhatsAppIcon className="size-4" />
                WhatsApp the team
              </a>
              <Link href="/bikes" className={cn(buttonStyles({ variant: "outline" }), "justify-center")}>
                Browse current stock
              </Link>
            </div>
          </div>

          <div className="rounded-xl bg-ink-950 p-5 text-white">
            <h2 className="text-base font-semibold">What we will not do</h2>
            <ul className="mt-3 space-y-2 text-sm text-white/70">
              {[
                "Claim a warranty or service history we cannot evidence",
                "Publish a motorcycle as available when it is sold",
                "Ask for payment before you have inspected the bike",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-accent-400" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="container-page pb-4">
        <div className="rounded-xl border border-mist-200 bg-mist-50 p-6 sm:p-8">
          <SectionHeading
            eyebrow="Next step"
            title="Come and see the bikes for yourself"
            description="Check the map, plan your visit, and call ahead so the motorcycle you want is ready for inspection."
            action={{ href: mapsDirectionsUrl, label: "Open directions" }}
          />
        </div>
      </div>
    </>
  );
}
