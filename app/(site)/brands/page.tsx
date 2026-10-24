import Link from "next/link";
import { ArrowUpRight, Boxes } from "lucide-react";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { BrandGrid } from "@/components/home/brand-grid";
import { SampleNotice } from "@/components/site/sample-notice";
import { getBrandSummary, getModelFamilies, getSampleListingCount } from "@/lib/db/queries";
import { formatPriceFrom } from "@/lib/format";
import { business } from "@/lib/business";
import { breadcrumbJsonLd, jsonLdScriptProps, pageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata = pageMetadata({
  title: "Motorcycle brands we stock",
  description:
    "Shop used Bajaj Boxer, Honda, TVS and UM motorcycles at Robbybikes in Eastleigh, Nairobi. Browse current stock by brand and compare prices.",
  path: "/brands",
});

export default async function BrandsPage() {
  const [brands, models, sampleCount] = await Promise.all([
    getBrandSummary(),
    getModelFamilies(),
    getSampleListingCount(),
  ]);

  return (
    <>
      <script
        {...jsonLdScriptProps(
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Brands", path: "/brands" },
          ]),
        )}
      />

      <div className="border-b border-mist-200 bg-mist-50">
        <div className="container-page py-8 sm:py-10">
          <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "Brands", path: "/brands" }]} />
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">
            Motorcycle brands at Robbybikes
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-mist-600 sm:text-base">
            We stock used commuter and utility motorcycles from brands Kenyan riders know well.
            Choose a brand to see what is currently listed at our {business.address.shortDisplay}{" "}
            yard.
          </p>
        </div>
      </div>

      <div className="container-page py-10">
        <SampleNotice count={sampleCount} className="-mt-2 mb-6" />

        <BrandGrid brands={brands} />

        <div className="mt-12 grid gap-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-ink-900">Popular model families</h2>
            <p className="mt-2 text-sm leading-relaxed text-mist-600">
              Model names customers ask for most often. If you do not see the exact bike you want,
              send us a message: stock changes quickly.
            </p>
            <Link
              href="/contact"
              className="mt-4 inline-flex text-sm font-semibold text-accent-700 hover:text-accent-800"
            >
              Ask about availability
            </Link>
          </div>

          {models.length > 0 ? (
            <ul className="grid gap-3 sm:grid-cols-2">
              {models.map((family) => (
                <li key={`${family.brand}-${family.model}`}>
                  <Link
                    href={`/bikes?q=${encodeURIComponent(family.model)}`}
                    className="group flex items-center justify-between gap-3 rounded-xl border border-mist-200 bg-white p-4 transition-colors hover:border-ink-900"
                  >
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-mist-500">
                        {family.brand}
                      </p>
                      <p className="mt-0.5 text-sm font-semibold text-ink-900">{family.model}</p>
                      <p className="mt-0.5 text-xs text-mist-500">
                        {family.total} listed · {formatPriceFrom(family.minPrice)}
                      </p>
                    </div>
                    <ArrowUpRight
                      className="size-4 shrink-0 text-mist-400 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent-600"
                      aria-hidden="true"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="rounded-xl border border-dashed border-mist-300 bg-mist-50 p-6">
              <Boxes className="size-6 text-mist-400" aria-hidden="true" />
              <p className="mt-2 text-sm text-mist-600">
                No stock published yet. Call or WhatsApp the team to hear what is in the yard.
              </p>
            </div>
          )}
        </div>

        <div className="mt-12 rounded-xl border border-mist-200 bg-mist-50 p-6">
          <h2 className="text-base font-semibold text-ink-900">A note on brand names</h2>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-mist-600">
            Brand and model names are used only to describe the motorcycles we sell. Robbybikes is an
            independent used-motorcycle dealership and is not an authorised dealer for any
            manufacturer unless we state otherwise in writing. Where a listing shows a brand, it
            reflects the make recorded for that motorcycle by the dealership.
          </p>
        </div>
      </div>
    </>
  );
}
