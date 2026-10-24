/**
 * Unit checks for the pure logic behind the public site and admin forms.
 *
 * Run with `npm test`. These tests do not touch the database or the network:
 * they cover phone normalisation, price formatting, filter parsing, CSV
 * parsing, enquiry validation, rate limiting and contact-link generation.
 */
import assert from "node:assert/strict";
import { formatEngine, formatKes, formatOdometer, conditionLabel, statusMeta } from "@/lib/format";
import {
  activeFilterCount,
  filtersToQueryString,
  parseBikeFilters,
  parseBikeFiltersFromQueryString,
} from "@/lib/filters";
import { resetRateLimits, rateLimit } from "@/lib/rate-limit";
import { business } from "@/lib/business";
import {
  bikeWhatsAppMessage,
  generalWhatsAppMessage,
  shareUrl,
  telHref,
  viewingRequestMessage,
  whatsappHref,
} from "@/lib/contact";
import { normalisePhone, slugify, truncate, uniqueSlug, formatPhoneDisplay } from "@/lib/utils";
import { enquiryFormSchema } from "@/lib/validation";
import { getSiteUrl } from "@/lib/seo";
import { parseCsv } from "./csv";

type Test = { name: string; fn: () => void };

const tests: Test[] = [];
function test(name: string, fn: () => void) {
  tests.push({ name, fn });
}

/* ------------------------------------------------------------------ phones */

test("normalises Kenyan mobile numbers written in the usual ways", () => {
  assert.equal(normalisePhone("0712 345 678"), "+254712345678");
  assert.equal(normalisePhone("+254 712 345 678"), "+254712345678");
  assert.equal(normalisePhone("254712345678"), "+254712345678");
  assert.equal(normalisePhone("0712-345-678"), "+254712345678");
  assert.equal(normalisePhone("0110 000 111"), "+254110000111");
});

test("rejects numbers that are not Kenyan mobiles", () => {
  assert.equal(normalisePhone("12345"), null);
  assert.equal(normalisePhone("020 123 4567"), null); // Nairobi landline
  assert.equal(normalisePhone("0712 345 67"), null);
  assert.equal(normalisePhone(""), null);
});

test("formats phone numbers for display", () => {
  assert.equal(formatPhoneDisplay("+254712345678"), "0712 345 678");
  assert.equal(formatPhoneDisplay("0712345678"), "0712 345 678");
  assert.equal(formatPhoneDisplay("+254768462250"), "0768 462 250");
});

/* ------------------------------------------------------------------- slugs */

test("builds URL-safe slugs", () => {
  assert.equal(slugify("Bajaj Boxer BM 125 (2022)"), "bajaj-boxer-bm-125-2022");
  assert.equal(slugify("Café & Commuter"), "cafe-and-commuter");
  assert.equal(slugify("   "), "");
});

test("keeps slugs unique", () => {
  assert.equal(uniqueSlug("Honda CB 150", []), "honda-cb-150");
  assert.equal(uniqueSlug("Honda CB 150", ["honda-cb-150"]), "honda-cb-150-2");
  assert.equal(uniqueSlug("Honda CB 150", ["honda-cb-150", "honda-cb-150-2"]), "honda-cb-150-3");
  assert.equal(uniqueSlug("!!!", []), "listing");
});

test("truncates long copy without breaking the limit", () => {
  assert.equal(truncate("short", 10), "short");
  const value = truncate("a".repeat(200), 20);
  assert.equal(value.length, 20);
  assert.ok(value.endsWith("…"));
});

/* ----------------------------------------------------------------- pricing */

test("formats asking prices as KSh with separators", () => {
  assert.equal(formatKes(125000), "KSh 125,000");
  assert.equal(formatKes(98000), "KSh 98,000");
  assert.equal(formatKes(1500), "KSh 1,500");
});

test("omits unknown specifications instead of printing zero", () => {
  assert.equal(formatEngine(150), "150 cc");
  assert.equal(formatEngine(null), null);
  assert.equal(formatEngine(0), null);
  assert.equal(formatOdometer(9600), "9,600 km");
  assert.equal(formatOdometer(null), null);
  assert.equal(formatOdometer(0), "0 km");
});

test("labels conditions and availability for customers", () => {
  assert.equal(conditionLabel("very_good"), "Very good");
  assert.equal(conditionLabel(null), "Not provided");
  assert.equal(statusMeta("available").label, "Available");
  assert.equal(statusMeta("pending_sale").tone, "pending");
  assert.equal(statusMeta("sold").tone, "sold");
});

/* ----------------------------------------------------------------- filters */

test("parses empty search params into safe defaults", () => {
  const filters = parseBikeFilters({});
  assert.equal(filters.availability, "in_stock");
  assert.equal(filters.sort, "newest");
  assert.equal(filters.page, 1);
  assert.equal(filters.brand, "");
  assert.equal(filters.minPrice, undefined);
});

test("parses and validates filter values", () => {
  const filters = parseBikeFilters({
    brand: "  Bajaj ",
    minPrice: "100000",
    maxPrice: "140000",
    minCc: "125",
    condition: "excellent",
    availability: "sold",
    sort: "price_desc",
    page: "2",
  });
  assert.equal(filters.brand, "Bajaj");
  assert.equal(filters.minPrice, 100000);
  assert.equal(filters.maxPrice, 140000);
  assert.equal(filters.minCc, 125);
  assert.equal(filters.condition, "excellent");
  assert.equal(filters.availability, "sold");
  assert.equal(filters.sort, "price_desc");
  assert.equal(filters.page, 2);
});

test("ignores invalid filter values instead of failing", () => {
  const filters = parseBikeFilters({
    minPrice: "-5",
    condition: "mint",
    availability: "gone",
    sort: "cheapest",
    page: "lots",
  });
  assert.equal(filters.minPrice, undefined);
  assert.equal(filters.condition, undefined);
  assert.equal(filters.availability, "in_stock");
  assert.equal(filters.sort, "newest");
  assert.equal(filters.page, 1);
});

test("keeps price ranges coherent and caps deep pagination", () => {
  const filters = parseBikeFilters({ minPrice: "200000", maxPrice: "100000", page: "9999" });
  assert.equal(filters.maxPrice, 200000);
  assert.equal(filters.page, 500);
});

test("serialises filters without defaults", () => {
  assert.equal(filtersToQueryString({}), "");
  assert.equal(
    filtersToQueryString({ brand: "TVS", sort: "price_asc", page: 2 }),
    "?brand=TVS&sort=price_asc&page=2",
  );
  assert.ok(filtersToQueryString({ availability: "sold" }).includes("availability=sold"));
});

test("round-trips filters through a query string", () => {
  const original = parseBikeFilters({ brand: "Honda", minCc: "125", sort: "price_desc" });
  const roundTripped = parseBikeFiltersFromQueryString(filtersToQueryString(original));
  assert.deepEqual(roundTripped, original);
});

test("counts only active filters", () => {
  assert.equal(activeFilterCount(parseBikeFilters({})), 0);
  assert.equal(activeFilterCount(parseBikeFilters({ brand: "TVS", condition: "good" })), 2);
  assert.equal(activeFilterCount(parseBikeFilters({ availability: "sold" })), 1);
});

/* --------------------------------------------------------------------- CSV */

test("parses quoted CSV fields", () => {
  const rows = parseCsv(
    [
      "brand,model,description",
      'Bajaj,Boxer,"A tidy bike, well kept"',
      'Honda,CB 125,"He said ""as new"""',
    ].join("\n"),
  );
  assert.equal(rows.length, 3);
  assert.equal(rows[1]?.[2], "A tidy bike, well kept");
  assert.equal(rows[2]?.[2], 'He said "as new"');
});

test("skips blank CSV rows", () => {
  const rows = parseCsv("brand,model\n\nTVS,HLX\n\n");
  assert.equal(rows.length, 2);
});

/* ---------------------------------------------------------------- enquiries */

const validEnquiry = {
  name: "Amina Wanjiku",
  phone: "0712 345 678",
  email: "",
  preferredContact: "whatsapp",
  message: "I would like to view this motorcycle on Saturday morning.",
  motorcycleId: "",
  consent: "on",
  source: "listing:sample-honda-cb-150-2023",
  website: "",
  startedAt: "1700000000000",
};

test("accepts a complete enquiry", () => {
  const parsed = enquiryFormSchema.safeParse(validEnquiry);
  assert.equal(parsed.success, true);
  if (parsed.success) {
    assert.equal(parsed.data.preferredContact, "whatsapp");
    assert.equal(parsed.data.email, undefined);
  }
});

test("requires a valid phone number", () => {
  const parsed = enquiryFormSchema.safeParse({ ...validEnquiry, phone: "12345" });
  assert.equal(parsed.success, false);

  const landline = enquiryFormSchema.safeParse({ ...validEnquiry, phone: "020 123 4567" });
  assert.equal(landline.success, false);
});

test("requires consent to be ticked", () => {
  const parsed = enquiryFormSchema.safeParse({ ...validEnquiry, consent: "" });
  assert.equal(parsed.success, false);
});

test("rejects a filled honeypot and short messages", () => {
  assert.equal(enquiryFormSchema.safeParse({ ...validEnquiry, website: "spam" }).success, false);
  assert.equal(enquiryFormSchema.safeParse({ ...validEnquiry, message: "hi" }).success, false);
});

test("validates optional email addresses", () => {
  assert.equal(enquiryFormSchema.safeParse({ ...validEnquiry, email: "buyer@example.com" }).success, true);
  assert.equal(enquiryFormSchema.safeParse({ ...validEnquiry, email: "not-an-email" }).success, false);
});

/* ------------------------------------------------------------- rate limiting */

test("enforces per-key rate limits and resets", () => {
  resetRateLimits();
  const options = { max: 3, windowMs: 60_000 };
  assert.equal(rateLimit("test:key", options).ok, true);
  assert.equal(rateLimit("test:key", options).ok, true);
  assert.equal(rateLimit("test:key", options).ok, true);

  const blocked = rateLimit("test:key", options);
  assert.equal(blocked.ok, false);
  assert.equal(blocked.remaining, 0);
  assert.ok(blocked.retryAfterSeconds > 0);

  // A different key is unaffected.
  assert.equal(rateLimit("test:other", options).ok, true);
  resetRateLimits();
  assert.equal(rateLimit("test:key", options).ok, true);
});

/* ------------------------------------------------------------------ contact */

test("builds tel: links from international numbers", () => {
  assert.equal(telHref(business.phones[0].international), "tel:+254768462250");
  assert.equal(telHref(business.phones[1].international), "tel:+254799741062");
});

test("builds WhatsApp links with an encoded message", () => {
  assert.equal(whatsappHref(), `https://wa.me/${business.whatsapp.number}`);
  const href = whatsappHref("Hello Robbybikes\nIs this available?");
  assert.ok(href.startsWith(`https://wa.me/${business.whatsapp.number}?text=`));
  assert.ok(!href.includes("\n"));
  assert.equal(decodeURIComponent(href.split("text=")[1] ?? ""), "Hello Robbybikes\nIs this available?");
});

test("includes the motorcycle, price and listing link in the WhatsApp message", () => {
  const bike = { brand: "Honda", model: "CB 150", priceKes: 149000, year: 2023, engineCc: 150 };
  const url = "https://example.com/bikes/honda-cb-150-2023";
  const message = bikeWhatsAppMessage(bike, url);

  assert.ok(message.includes("Honda CB 150"));
  assert.ok(message.includes("KSh 149,000"));
  assert.ok(message.includes("2023"));
  assert.ok(message.includes(url));
  assert.ok(viewingRequestMessage(bike, url).includes("arrange a viewing"));
  assert.ok(generalWhatsAppMessage().includes(business.name));
});

test("joins site and path for share links", () => {
  assert.equal(shareUrl("/bikes/x", "https://example.com/"), "https://example.com/bikes/x");
  assert.equal(shareUrl("bikes/x", "https://example.com"), "https://example.com/bikes/x");
});

/* ---------------------------------------------------------------------- SEO */

test("falls back to a local site URL when none is configured", () => {
  const previous = process.env.NEXT_PUBLIC_SITE_URL;
  delete process.env.NEXT_PUBLIC_SITE_URL;
  assert.equal(getSiteUrl(), "http://localhost:3000");
  if (previous !== undefined) process.env.NEXT_PUBLIC_SITE_URL = previous;
});

/* -------------------------------------------------------------------- runner */

let passed = 0;
const failures: Array<{ name: string; error: unknown }> = [];

for (const { name, fn } of tests) {
  try {
    fn();
    passed += 1;
    console.log(`  ✔ ${name}`);
  } catch (error) {
    failures.push({ name, error });
    console.log(`  ✖ ${name}`);
  }
}

console.log("");

if (failures.length > 0) {
  for (const { name, error } of failures) {
    console.error(`✖ ${name}`);
    console.error(error instanceof Error ? error.stack ?? error.message : error);
    console.error("");
  }
  console.error(`✖ ${failures.length} of ${tests.length} checks failed, ${passed} passed.`);
  process.exit(1);
}

console.log(`✔ ${passed} checks passed.`);
