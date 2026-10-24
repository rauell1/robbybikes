import Link from "next/link";
import { ArrowRight, Phone } from "lucide-react";
import { HomeHero } from "@/components/home/home-hero";
import { SearchPanel } from "@/components/home/search-panel";
import { BrandGrid } from "@/components/home/brand-grid";
import { WhyUs } from "@/components/home/why-us";
import { HowItWorks } from "@/components/home/how-it-works";
import { RecentDeliveries } from "@/components/home/recent-deliveries";
import { LocationSection } from "@/components/home/location-section";
import { BikeGrid } from "@/components/bikes/bike-grid";
import { SectionHeading } from "@/components/site/section-heading";
import { SampleNotice } from "@/components/site/sample-notice";
import { buttonStyles } from "@/components/ui/button";
import { WhatsAppIcon } from "@/components/icons";
import {
  getBrandSummary,
  getFeaturedBikes,
  getInventoryStats,
  getSampleListingCount,
} from "@/lib/db/queries";
import { business } from "@/lib/business";
import { generalWhatsAppMessage, telHref, whatsappHref } from "@/lib/contact";
import { autoDealerJsonLd, jsonLdScriptProps, pageMetadata } from "@/lib/seo";
import { cn } from "@/lib/utils";

export const revalidate = 60;

export const metadata = pageMetadata({
  title: "Used motorcycles for sale in Eastleigh, Nairobi",
  description:
    "Browse used and second-hand motorcycles at Robbybikes, Juja Road, Eastleigh, Nairobi. Compare prices for commuter and utility bikes, then call or WhatsApp to arrange a viewing.",
  path: "/",
});

export default async function HomePage() {
  const [featured, brands, stats, sampleCount] = await Promise.all([
    getFeaturedBikes(6),
    getBrandSummary(),
    getInventoryStats(),
    getSampleListingCount(),
  ]);

  return (
    <>
      <script {...jsonLdScriptProps(autoDealerJsonLd())} />

      <HomeHero
        stats={{ available: stats.available, brands: stats.brands }}
        searchPanel={<SearchPanel brands={brands.map((brand) => brand.brand)} />}
      />

      <SampleNotice count={sampleCount} className="mt-6" />

      <section className="container-page py-14 sm:py-16">
        <SectionHeading
          eyebrow="In stock"
          title="Featured motorcycles"
          description={
            stats.available > 0
              ? "A selection of motorcycles currently listed as available. Tap through for full details, photos and a direct WhatsApp enquiry."
              : "New stock is being added. Contact us to hear what has just arrived in the yard."
          }
          action={{ href: "/bikes", label: "View all bikes" }}
        />

        {featured.length > 0 ? (
          <BikeGrid bikes={featured} className="mt-8" priorityCount={3} />
        ) : (
          <div className="mt-8 rounded-xl border border-dashed border-mist-300 bg-mist-50 px-6 py-14 text-center">
            <h3 className="text-lg font-semibold text-ink-900">Stock is being published</h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-mist-600">
              The catalogue is empty at the moment. Call or WhatsApp the team and tell us the bike
              you are looking for.
            </p>
            <div className="mt-5 flex flex-col justify-center gap-2 sm:flex-row">
              <a
                href={telHref(business.phones[0].international)}
                className={cn(buttonStyles({ variant: "dark" }), "justify-center")}
              >
                <Phone className="size-4" aria-hidden="true" />
                {business.phones[0].display}
              </a>
              <a
                href={whatsappHref(generalWhatsAppMessage())}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(buttonStyles({ variant: "whatsapp" }), "justify-center")}
              >
                <WhatsAppIcon className="size-4" />
                WhatsApp us
              </a>
            </div>
          </div>
        )}
      </section>

      <section className="border-y border-mist-200 bg-mist-50 py-14 sm:py-16">
        <div className="container-page">
          <SectionHeading
            eyebrow="Browse by brand"
            title="Shop the brands we carry"
            description="Jump straight to the motorcycles from a brand you already trust. Counts update automatically as stock is added or sold."
            action={{ href: "/brands", label: "All brands" }}
          />
          <div className="mt-8">
            <BrandGrid brands={brands} />
          </div>
          <p className="mt-6 text-xs text-mist-500">
            Also stocking other used commuter and utility motorcycles as they arrive.
          </p>
        </div>
      </section>

      <section className="container-page py-14 sm:py-16">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-14">
          <div>
            <SectionHeading
              eyebrow="Why Robbybikes"
              title="Buying a used bike should feel straightforward"
              description="No invented claims and no pressure. Here is what you can realistically expect when you deal with us."
            />
            <div className="mt-6 rounded-xl border border-mist-200 bg-mist-50 p-5">
              <p className="text-sm font-semibold text-ink-900">Prices you can check</p>
              <p className="mt-1.5 text-sm leading-relaxed text-mist-600">
                Every listing shows its asking price, engine size, year and mileage where the team
                has them. Ask us to confirm availability before you travel.
              </p>
              <p className="mt-2 text-xs text-mist-500">
                The final price is agreed after inspection at the yard.
              </p>
              <Link
                href="/bikes"
                className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-accent-700 hover:text-accent-800"
              >
                See current listings
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
          <WhyUs />
        </div>
      </section>

      <section className="bg-ink-950 py-14 sm:py-16">
        <div className="container-page">
          <SectionHeading
            eyebrow="How buying works"
            title="Three steps from browsing to riding"
            description="We keep it simple: find a bike you like, confirm it is still available, then come and inspect it in person."
            inverted
          />
          <div className="mt-8">
            <HowItWorks />
          </div>
        </div>
      </section>

      <section className="container-page py-14 sm:py-16">
        <LocationSection />
      </section>

      <section className="container-page pb-4">
        <div className="grid gap-6 overflow-hidden rounded-2xl bg-ink-900 p-6 sm:p-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Ready to see the bikes in person?
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/65">
              Tell us which motorcycle caught your eye and when you can visit. We will confirm
              availability and keep it ready for inspection.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
            <a
              href={whatsappHref(generalWhatsAppMessage())}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(buttonStyles({ variant: "whatsapp", size: "lg" }), "justify-center")}
            >
              <WhatsAppIcon className="size-5" />
              WhatsApp us
            </a>
            <a
              href={telHref(business.phones[0].international)}
              className={cn(buttonStyles({ variant: "outline", size: "lg" }), "justify-center bg-transparent text-white border-white/25 hover:bg-white/10 hover:border-white/50 hover:text-white")}
            >
              <Phone className="size-4" aria-hidden="true" />
              {business.phones[0].display}
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
