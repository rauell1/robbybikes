import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  Cog,
  Droplets,
  Gauge,
  Info,
  MapPin,
  Palette,
  Phone,
  Route,
  ShieldAlert,
  Wrench,
} from "lucide-react";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { BikeGallery } from "@/components/bikes/bike-gallery";
import { BikeGrid } from "@/components/bikes/bike-grid";
import { ShareListing } from "@/components/bikes/share-listing";
import { EnquiryForm } from "@/components/forms/enquiry-form";
import { SectionHeading } from "@/components/site/section-heading";
import { Badge } from "@/components/ui/badge";
import { WhatsAppIcon } from "@/components/icons";
import { buttonStyles } from "@/components/ui/button";
import { getBikeBySlug, getRelatedBikes, getSampleListingCount } from "@/lib/db/queries";
import { getSiteUrl, pageMetadata, bikeSeoDescription, bikeTitle, bikeProductJsonLd, breadcrumbJsonLd, jsonLdScriptProps, absoluteUrl } from "@/lib/seo";
import { formatDate, formatEngine, formatKes, formatOdometer, statusMeta } from "@/lib/format";
import { business } from "@/lib/business";
import { bikeWhatsAppMessage, telHref, viewingRequestMessage, whatsappHref } from "@/lib/contact";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const bike = await getBikeBySlug(slug);

  if (!bike) {
    return pageMetadata({
      title: "Motorcycle not found",
      description: "This motorcycle listing is no longer available.",
      path: `/bikes/${slug}`,
      noIndex: true,
    });
  }

  const title = `${bikeTitle(bike)} for sale in Nairobi`;
  return pageMetadata({
    title,
    description: bikeSeoDescription(bike),
    path: `/bikes/${bike.slug}`,
    image: bike.images[0]?.imageUrl,
  });
}

export default async function BikeDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const bike = await getBikeBySlug(slug);

  if (!bike) notFound();

  const [related, sampleCount] = await Promise.all([
    getRelatedBikes(bike, 3),
    getSampleListingCount(),
  ]);

  const status = statusMeta(bike.status);
  const listingUrl = absoluteUrl(`/bikes/${bike.slug}`);
  const shareUrlValue = `${getSiteUrl()}/bikes/${bike.slug}`;
  const title = `${bike.brand} ${bike.model}`;

  const specs = [
    { label: "Engine capacity", value: formatEngine(bike.engineCc), icon: Cog },
    { label: "Manufacturing year", value: bike.year ? String(bike.year) : null, icon: CalendarDays },
    { label: "Odometer", value: formatOdometer(bike.odometerKm), icon: Gauge },
    { label: "Transmission", value: bike.transmission, icon: Wrench },
    { label: "Fuel type", value: bike.fuelType, icon: Droplets },
    { label: "Colour", value: bike.colour, icon: Palette },
    { label: "Intended use", value: bike.usage, icon: Route },
    { label: "Registration", value: bike.registration, icon: ClipboardCheck },
  ].filter((spec) => Boolean(spec.value));

  const message = bikeWhatsAppMessage(
    {
      brand: bike.brand,
      model: bike.model,
      priceKes: bike.priceKes,
      engineCc: bike.engineCc,
      year: bike.year,
    },
    listingUrl,
  );

  const isPurchasable = bike.status === "available";

  return (
    <>
      <script {...jsonLdScriptProps(bikeProductJsonLd(bike))} />
      <script
        {...jsonLdScriptProps(
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Bikes", path: "/bikes" },
            { name: bike.brand, path: `/bikes?brand=${encodeURIComponent(bike.brand)}` },
            { name: title, path: `/bikes/${bike.slug}` },
          ]),
        )}
      />

      <div className="border-b border-mist-200 bg-white">
        <div className="container-page py-4">
          <Breadcrumbs
            items={[
              { name: "Home", path: "/" },
              { name: "Bikes", path: "/bikes" },
              {
                name: bike.brand,
                path: `/bikes?brand=${encodeURIComponent(bike.brand)}`,
              },
              { name: title, path: `/bikes/${bike.slug}` },
            ]}
          />
        </div>
      </div>

      <div className="container-page grid gap-8 py-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-10 lg:py-10">
        <div>
          <BikeGallery
            images={bike.images.map((image) => ({
              id: image.id,
              imageUrl: image.imageUrl,
              altText: image.altText,
            }))}
            title={`${title} — photographs`}
            isSample={bike.isSample}
          />

          <div className="mt-8">
            <h2 className="text-lg font-semibold tracking-tight text-ink-900">About this motorcycle</h2>
            <div className="mt-3 space-y-3 text-sm leading-relaxed text-mist-600">
              {bike.description.split(/\n{2,}/).map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-lg font-semibold tracking-tight text-ink-900">Specifications</h2>
            {specs.length > 0 ? (
              <dl className="mt-3 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-mist-200 bg-mist-200 sm:grid-cols-3">
                {specs.map((spec) => (
                  <div key={spec.label} className="bg-white p-3.5">
                    <dt className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-mist-500">
                      <spec.icon className="size-3.5" aria-hidden="true" />
                      {spec.label}
                    </dt>
                    <dd className="mt-1 text-sm font-semibold text-ink-900">{spec.value}</dd>
                  </div>
                ))}
              </dl>
            ) : (
              <p className="mt-3 rounded-lg bg-mist-50 p-4 text-sm text-mist-600">
                Detailed specifications have not been recorded for this motorcycle yet. Ask us on
                WhatsApp and we will check it in the yard.
              </p>
            )}

            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-mist-200 p-4">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-ink-900">
                  <CheckCircle2 className="size-4 text-emerald-600" aria-hidden="true" />
                  Condition
                </h3>
                <p className="mt-1.5 text-sm text-mist-600">
                  {bike.condition
                    ? `Graded as ${bike.condition.replaceAll("_", " ")} by our team.`
                    : "Condition has not been recorded."}{" "}
                  Always inspect in person before paying.
                </p>
                {bike.inspectionNotes ? (
                  <p className="mt-2 whitespace-pre-line text-sm text-mist-600">{bike.inspectionNotes}</p>
                ) : null}
              </div>

              <div className="rounded-xl border border-mist-200 p-4">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-ink-900">
                  <Wrench className="size-4 text-mist-500" aria-hidden="true" />
                  Service history
                </h3>
                <p className="mt-1.5 text-sm text-mist-600">
                  {bike.serviceHistory
                    ? bike.serviceHistory
                    : "No service history has been documented for this motorcycle. We do not claim a verified history where none has been supplied."}
                </p>
              </div>
            </div>

            {!isPurchasable ? (
              <div
                className={cn(
                  "mt-3 flex items-start gap-3 rounded-xl border p-4",
                  bike.status === "sold"
                    ? "border-mist-300 bg-mist-50"
                    : "border-amber-200 bg-amber-50",
                )}
              >
                <ShieldAlert
                  className={cn(
                    "mt-0.5 size-5 shrink-0",
                    bike.status === "sold" ? "text-mist-500" : "text-amber-600",
                  )}
                  aria-hidden="true"
                />
                <div>
                  <p className="text-sm font-semibold text-ink-900">{status.label}</p>
                  <p className="mt-0.5 text-sm text-mist-600">
                    {status.description} Ask us about similar motorcycles currently in the yard.
                  </p>
                  <Link
                    href="/bikes"
                    className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-accent-700 hover:text-accent-800"
                  >
                    Browse available bikes
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </Link>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <aside className="lg:sticky lg:top-32 lg:self-start">
          <div className="rounded-xl border border-mist-200 bg-white p-5 shadow-xs sm:p-6">
            <div className="flex items-center justify-between gap-2">
              <Badge tone={status.tone} dot>
                {status.label}
              </Badge>
              {bike.isSample ? <Badge tone="accent">Sample listing</Badge> : null}
            </div>

            <p className="mt-4 text-xs font-semibold uppercase tracking-[0.14em] text-mist-500">
              {bike.brand}
            </p>
            <h1 className="mt-1 text-2xl font-bold leading-tight tracking-tight text-ink-900 sm:text-3xl">
              {bike.model}
            </h1>

            <p className="mt-4 text-3xl font-bold tracking-tight text-ink-900">
              {formatKes(bike.priceKes)}
            </p>
            <p className="mt-1 text-xs text-mist-500">
              Asking price. The final price is agreed after inspection at the yard.
            </p>

            <div className="mt-4 flex flex-wrap gap-2 text-xs text-mist-600">
              {bike.year ? (
                <span className="rounded-md bg-mist-100 px-2 py-1 font-medium">{bike.year}</span>
              ) : null}
              {bike.engineCc ? (
                <span className="rounded-md bg-mist-100 px-2 py-1 font-medium">{bike.engineCc} cc</span>
              ) : null}
              {bike.odometerKm !== null ? (
                <span className="rounded-md bg-mist-100 px-2 py-1 font-medium">
                  {formatOdometer(bike.odometerKm)}
                </span>
              ) : null}
              <span className="rounded-md bg-mist-100 px-2 py-1 font-medium capitalize">
                {bike.condition.replaceAll("_", " ")}
              </span>
            </div>

            <div className="mt-5 space-y-2">
              <a
                href={whatsappHref(message)}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(buttonStyles({ variant: "whatsapp", size: "lg" }), "w-full justify-center")}
              >
                <WhatsAppIcon className="size-5" />
                Enquire on WhatsApp
              </a>
              <a
                href={telHref(business.phones[0].international)}
                className={cn(buttonStyles({ variant: "dark", size: "lg" }), "w-full justify-center")}
              >
                <Phone className="size-4" aria-hidden="true" />
                Call about this bike
              </a>
              <a
                href="#enquiry"
                className={cn(buttonStyles({ variant: "outline", size: "lg" }), "w-full justify-center")}
              >
                Arrange a viewing
              </a>
            </div>

            <div className="mt-5 space-y-3 border-t border-mist-200 pt-4 text-xs text-mist-600">
              <p className="flex items-start gap-2">
                <MapPin className="mt-0.5 size-4 shrink-0 text-mist-400" aria-hidden="true" />
                <span>
                  View it at {business.address.display}. {business.address.landmark}.
                </span>
              </p>
              <p className="flex items-start gap-2">
                <Info className="mt-0.5 size-4 shrink-0 text-mist-400" aria-hidden="true" />
                <span>
                  Listed {formatDate(bike.createdAt)}
                  {bike.updatedAt > bike.createdAt
                    ? ` · updated ${formatDate(bike.updatedAt)}`
                    : ""}. Confirm availability before travelling.
                </span>
              </p>
              <div className="flex items-center justify-between gap-2 pt-1">
                <ShareListing title={`${title} — ${formatKes(bike.priceKes)}`} url={shareUrlValue} />
                <a
                  href={whatsappHref(viewingRequestMessage(
                    { brand: bike.brand, model: bike.model, priceKes: bike.priceKes },
                    listingUrl,
                  ))}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-accent-700 hover:text-accent-800"
                >
                  Request a viewing time
                </a>
              </div>
            </div>
          </div>

          <p className="mt-3 px-1 text-[11px] leading-relaxed text-mist-500">
            {sampleCount > 0
              ? "Sample listing: this motorcycle and its photo are demonstration data, not verified Robbybikes stock."
              : "Specifications are supplied by the dealership for guidance. Always inspect the motorcycle and paperwork before purchase."}
          </p>
        </aside>
      </div>

      <section id="enquiry" className="border-y border-mist-200 bg-mist-50 py-12 sm:py-14">
        <div className="container-page grid gap-8 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-12">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-700">
              Arrange a viewing
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-ink-900 sm:text-3xl">
              Ask about this {bike.brand} {bike.model}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-mist-600">
              Send us a short message and we will confirm whether this motorcycle is still available.
              You can also request extra photos, ask about the paperwork, or book a time to inspect
              it on Juja Road.
            </p>

            <ul className="mt-6 space-y-3 text-sm text-ink-700">
              {[
                "Your enquiry goes directly to the dealership team.",
                "We reply during business hours on the contact method you choose.",
                "No online payment — everything is settled in person after inspection.",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>

            <div className="mt-6 rounded-xl border border-mist-200 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-mist-500">
                Prefer to talk?
              </p>
              <div className="mt-2 space-y-1">
                {business.phones.map((phone) => (
                  <a
                    key={phone.international}
                    href={telHref(phone.international)}
                    className="block text-sm font-semibold text-ink-900 hover:text-accent-700"
                  >
                    {phone.display}{" "}
                    <span className="text-xs font-normal text-mist-500">· {phone.label}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-mist-200 bg-white p-5 shadow-xs sm:p-6">
            <EnquiryForm
              motorcycleId={bike.id}
              source={`listing:${bike.slug}`}
              defaultMessage={`Habari, I would like to arrange a viewing for the ${bike.brand} ${bike.model} listed at ${formatKes(bike.priceKes)}.`}
            />
          </div>
        </div>
      </section>

      {related.length > 0 ? (
        <section className="container-page py-12 sm:py-14">
          <SectionHeading
            eyebrow="Similar stock"
            title="Other motorcycles worth a look"
            action={{ href: "/bikes", label: "View all bikes" }}
          />
          <BikeGrid bikes={related} className="mt-6" />
        </section>
      ) : null}
    </>
  );
}
