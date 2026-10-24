import type { Metadata } from "next";
import { business } from "@/lib/business";
import { formatKes, statusMeta } from "@/lib/format";
import type { MotorcycleWithImages } from "@/lib/db/schema";

export function getSiteUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) return configured.replace(/\/+$/, "");
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

export function absoluteUrl(path = "/"): string {
  return `${getSiteUrl()}${path.startsWith("/") ? path : `/${path}`}`;
}

type PageMetadataInput = {
  title: string;
  description: string;
  path: string;
  image?: string;
  noIndex?: boolean;
};

export function pageMetadata({ title, description, path, image, noIndex }: PageMetadataInput): Metadata {
  const url = absoluteUrl(path);
  const defaultImage = "/sample/hero.jpg";
  const ogImage = image ?? defaultImage;

  return {
    title,
    description,
    alternates: { canonical: url },
    robots: noIndex ? { index: false, follow: true } : undefined,
    openGraph: {
      type: "website",
      siteName: business.name,
      title,
      description,
      url,
      locale: "en_KE",
      images: [{ url: ogImage, alt: `${business.name} — ${title}` }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export function bikeTitle(bike: Pick<MotorcycleWithImages, "brand" | "model" | "year">): string {
  return [bike.brand, bike.model, bike.year ? String(bike.year) : null].filter(Boolean).join(" ");
}

export function bikeSeoDescription(bike: MotorcycleWithImages): string {
  const specs = [
    bike.year ? String(bike.year) : null,
    bike.engineCc ? `${bike.engineCc} cc` : null,
    bike.condition ? `${bike.condition.replaceAll("_", " ")} condition` : null,
  ].filter(Boolean);
  return `${bike.brand} ${bike.model}${specs.length ? ` (${specs.join(", ")})` : ""} for ${formatKes(
    bike.priceKes,
  )} at ${business.name}, ${business.address.shortDisplay}. ${statusMeta(bike.status).description}`;
}

export function jsonLdScriptProps(data: Record<string, unknown>) {
  return {
    type: "application/ld+json" as const,
    dangerouslySetInnerHTML: { __html: JSON.stringify(data).replace(/</g, "\\u003c") },
  };
}

export function autoDealerJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "AutoDealer",
    name: business.name,
    description: business.description,
    url: getSiteUrl(),
    telephone: business.phones.map((phone) => phone.international),
    address: {
      "@type": "PostalAddress",
      streetAddress: `Juja Road, ${business.address.area}`,
      addressLocality: business.address.city,
      addressRegion: "Nairobi County",
      addressCountry: "KE",
    },
    areaServed: [
      { "@type": "City", name: "Nairobi" },
      { "@type": "Country", name: "Kenya" },
    ],
    sameAs: [business.social.facebook, business.social.tiktok].filter(Boolean),
    currenciesAccepted: "KES",
  };
}

export function bikeProductJsonLd(bike: MotorcycleWithImages) {
  const meta = statusMeta(bike.status);
  const availability =
    bike.status === "sold"
      ? "https://schema.org/SoldOut"
      : bike.status === "available"
        ? "https://schema.org/InStock"
        : "https://schema.org/LimitedAvailability";

  const properties = [
    bike.year ? { "@type": "PropertyValue", name: "Year", value: bike.year } : null,
    bike.engineCc ? { "@type": "PropertyValue", name: "Engine capacity", value: `${bike.engineCc} cc` } : null,
    bike.odometerKm !== null
      ? { "@type": "PropertyValue", name: "Odometer", value: `${bike.odometerKm} km` }
      : null,
    bike.transmission ? { "@type": "PropertyValue", name: "Transmission", value: bike.transmission } : null,
    { "@type": "PropertyValue", name: "Condition", value: meta.label },
  ].filter(Boolean);

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: bikeTitle(bike),
    description: bike.description || bikeSeoDescription(bike),
    url: absoluteUrl(`/bikes/${bike.slug}`),
    image: bike.images.map((image) => absoluteUrl(image.imageUrl)),
    brand: { "@type": "Brand", name: bike.brand },
    itemCondition: "https://schema.org/UsedCondition",
    additionalProperty: properties,
    offers: {
      "@type": "Offer",
      priceCurrency: "KES",
      price: bike.priceKes,
      availability,
      url: absoluteUrl(`/bikes/${bike.slug}`),
      seller: { "@type": "AutoDealer", name: business.name },
    },
  };
}

export function breadcrumbJsonLd(items: Array<{ name: string; path: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}
