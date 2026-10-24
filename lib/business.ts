/**
 * Single source of truth for dealership details.
 *
 * Everything here is either supplied by the dealership or configurable through
 * environment variables. Nothing is invented: items we could not verify are
 * deliberately absent and listed in docs/BUSINESS-VERIFICATION.md.
 */

const env = process.env;

function digitsOnly(value: string): string {
  return value.replace(/[^\d]/g, "");
}

export const PHONE_PRIMARY = {
  display: "0768 462 250",
  international: "+254768462250",
  label: "Sales & enquiries",
} as const;

export const PHONE_SECONDARY = {
  display: "0799 741 062",
  international: "+254799741062",
  label: "Alternative line",
} as const;

export const PHONES = [PHONE_PRIMARY, PHONE_SECONDARY] as const;

/**
 * WhatsApp number. The dealership runs two SIM cards; which one is registered
 * on WhatsApp has not been verified, so it is configurable. Defaults to the
 * number published on the Robbybikes Facebook page.
 */
const whatsappNumber = digitsOnly(env.WHATSAPP_NUMBER ?? "254768462250");

export const business = {
  name: "Robbybikes",
  legalName: "Robbybikes Ltd",
  description:
    "Used and second-hand motorcycle dealership in Eastleigh, Nairobi. Browse available bikes, compare prices and arrange a viewing.",
  category: "Used motorcycle dealership",
  address: {
    street: "Juja Road",
    area: "Eastleigh",
    city: "Nairobi",
    country: "Kenya",
    landmark: "Near Amana / Luqman Petrol Station",
    display: "Juja Road, Eastleigh, Nairobi, Kenya",
    shortDisplay: "Eastleigh, Juja Road, Nairobi",
  },
  phones: PHONES,
  whatsapp: {
    number: whatsappNumber,
    display: `+${whatsappNumber}`,
  },
  social: {
    // Verified from the dealership's public business reference.
    facebook: "https://www.facebook.com/Robbybikes.ltd/",
    facebookHandle: "Robbybikes.ltd",
    // Unverified profiles must not be linked. Set SOCIAL_TIKTOK_URL once the
    // owner confirms the official account.
    tiktok: env.SOCIAL_TIKTOK_URL?.trim() || null,
    tiktokHandle: "Robbybikes",
  },
  // Opening hours have not been confirmed, so they are not displayed.
  openingHours: null as string | null,
} as const;

export const mapsSearchUrl =
  "https://www.google.com/maps/search/?api=1&query=" +
  encodeURIComponent("Robbybikes, Juja Road, Eastleigh, Nairobi");

export const mapsDirectionsUrl =
  "https://www.google.com/maps/dir/?api=1&destination=" +
  encodeURIComponent("Robbybikes, Juja Road, Eastleigh, Nairobi");

/** Landmark-based directions, used instead of an unverified map pin. */
export const directionsNote =
  "We are on Juja Road in Eastleigh, near the Amana / Luqman petrol station. Call ahead and our team will guide you to the yard.";
