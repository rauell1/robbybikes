import { Suspense } from "react";
import { BikeFilterForm } from "@/components/bikes/bike-filters";
import { BikeResults } from "@/components/bikes/results-section";
import { BikeResultsSkeleton } from "@/components/bikes/results-skeleton";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { getDistinctFieldValues, getInventoryFacets } from "@/lib/db/queries";
import { activeFilterCount, parseBikeFilters, type RawSearchParams } from "@/lib/filters";
import { business } from "@/lib/business";
import { breadcrumbJsonLd, jsonLdScriptProps, pageMetadata } from "@/lib/seo";

export const revalidate = 60;

type PageProps = { searchParams: Promise<RawSearchParams> };

export async function generateMetadata({ searchParams }: PageProps) {
  const params = await searchParams;
  const filters = parseBikeFilters(params);
  const canonical = filters.brand
    ? `/bikes?brand=${encodeURIComponent(filters.brand)}`
    : "/bikes";

  const title = filters.brand
    ? `Used ${filters.brand} motorcycles for sale in Nairobi`
    : "Used motorcycles for sale in Nairobi";

  const description = filters.brand
    ? `Browse used and second-hand ${filters.brand} motorcycles at Robbybikes, Juja Road, Eastleigh, Nairobi. Compare prices and enquire on WhatsApp.`
    : "Browse the full Robbybikes motorcycle inventory in Eastleigh, Nairobi. Filter by brand, price, engine capacity, year and condition, then arrange a viewing.";

  return pageMetadata({
    title,
    description,
    path: canonical,
    noIndex: filters.page > 1 || activeFilterCount(filters) > 1,
  });
}

export default async function BikesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const filters = parseBikeFilters(params);

  const [facets, fieldValues] = await Promise.all([
    getInventoryFacets(),
    getDistinctFieldValues(),
  ]);

  const isSoldArchive = filters.availability === "sold";
  const heading = filters.brand
    ? `Used ${filters.brand} motorcycles in Nairobi`
    : isSoldArchive
      ? "Recently sold motorcycles"
      : "Motorcycles for sale in Nairobi";

  const description = filters.brand
    ? `Every ${filters.brand} currently listed by ${business.name}. Confirm availability with our team before travelling to Eastleigh.`
    : isSoldArchive
      ? "A record of motorcycles that have been sold. They are kept for reference and are not presented as available stock."
      : `Browse ${business.name} stock at our Juja Road yard in Eastleigh. Filter by brand, budget, engine size and condition, then contact us to arrange a viewing.`;

  return (
    <>
      <script
        {...jsonLdScriptProps(
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Bikes", path: "/bikes" },
          ]),
        )}
      />

      <div className="border-b border-mist-200 bg-mist-50">
        <div className="container-page py-8 sm:py-10">
          <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "Bikes", path: "/bikes" }]} />
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">
            {heading}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-mist-600 sm:text-base">
            {description}
          </p>
          <p className="mt-4 text-xs text-mist-500">
            {business.address.display}. Prices in Kenyan Shillings. Confirm availability before
            travelling.
          </p>
        </div>
      </div>

      <div className="container-page grid gap-6 py-8 lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-10">
        <aside aria-label="Inventory filters" className="lg:self-start">
          <BikeFilterForm
            filters={filters}
            brands={facets.brands.map((brand) => brand.brand)}
            transmissions={fieldValues.transmissions}
            usages={fieldValues.usages}
          />
        </aside>

        <Suspense fallback={<BikeResultsSkeleton />}>
          <BikeResults filters={filters} />
        </Suspense>
      </div>
    </>
  );
}
