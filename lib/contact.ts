import { business } from "@/lib/business";
import { formatKes } from "@/lib/format";

export function telHref(phoneInternational: string): string {
  return `tel:${phoneInternational.replace(/[^\d+]/g, "")}`;
}

export function whatsappHref(message?: string): string {
  const base = `https://wa.me/${business.whatsapp.number}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export function generalWhatsAppMessage(): string {
  return `Hello ${business.name}, I found your website and would like to enquire about the motorcycles you have in stock.`;
}

type BikeForMessage = {
  brand: string;
  model: string;
  priceKes: number;
  engineCc?: number | null;
  year?: number | null;
};

export function bikeWhatsAppMessage(bike: BikeForMessage, listingUrl: string): string {
  const specs = [
    bike.year ? `year ${bike.year}` : null,
    bike.engineCc ? `${bike.engineCc} cc` : null,
  ].filter(Boolean);
  const specText = specs.length > 0 ? ` (${specs.join(", ")})` : "";

  return [
    `Hello ${business.name}, I found your website and would like to enquire about the ${bike.brand} ${bike.model}${specText} listed at ${formatKes(bike.priceKes)}.`,
    "Is it still available? I would also like to arrange a viewing.",
    listingUrl,
  ].join("\n\n");
}

export function viewingRequestMessage(bike: BikeForMessage, listingUrl: string): string {
  return [
    `Hello ${business.name}, I would like to arrange a viewing for the ${bike.brand} ${bike.model} listed at ${formatKes(bike.priceKes)}.`,
    "Please let me know a convenient time to visit your yard in Eastleigh.",
    listingUrl,
  ].join("\n\n");
}

export function shareUrl(path: string, siteUrl: string): string {
  return `${siteUrl.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
}
