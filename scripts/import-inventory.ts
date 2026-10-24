import { readFileSync } from "node:fs";
import path from "node:path";
import { loadEnv } from "./load-env";
import { parseCsv } from "./csv";

loadEnv();

const CONDITION_MAP: Record<string, string> = {
  excellent: "excellent",
  "very good": "very_good",
  very_good: "very_good",
  good: "good",
  fair: "fair",
  "needs repair": "needs_repair",
  needs_repair: "needs_repair",
  needs_work: "needs_repair",
};

const STATUS_MAP: Record<string, string> = {
  available: "available",
  reserved: "reserved",
  "pending sale": "pending_sale",
  pending_sale: "pending_sale",
  pending: "pending_sale",
  sold: "sold",
};

const REQUIRED_HEADERS = ["brand", "model", "price_kes"];

function flag(name: string): boolean {
  return process.argv.includes(`--${name}`);
}

function argument(name: string): string | undefined {
  const prefix = `--${name}=`;
  const withEquals = process.argv.find((arg) => arg.startsWith(prefix));
  if (withEquals) return withEquals.slice(prefix.length);
  const index = process.argv.indexOf(`--${name}`);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

function optionalInt(value: string | undefined, min: number, max: number, label: string): number | null | string {
  const trimmed = (value ?? "").trim();
  if (!trimmed) return null;
  if (!/^\d+$/.test(trimmed)) return `${label} must be a whole number`;
  const parsed = Number(trimmed);
  if (parsed < min || parsed > max) return `${label} must be between ${min} and ${max}`;
  return parsed;
}

async function main() {
  const filePath = path.resolve(process.cwd(), argument("file") ?? "data/inventory-template.csv");
  const dryRun = flag("dry-run");
  const publishAll = flag("publish");
  const markSample = flag("sample");

  const { getDb } = await import("../lib/db");
  const { runMigrations } = await import("../lib/migrations");
  const { motorcycleImages, motorcycles } = await import("../lib/db/schema");
  const { slugify, uniqueSlug } = await import("../lib/utils");

  const raw = readFileSync(filePath, "utf8");
  const rows = parseCsv(raw);

  if (rows.length < 2) {
    console.error("✖ The CSV has no data rows.");
    process.exit(1);
  }

  const headers = (rows[0] ?? []).map((header) => header.trim().toLowerCase());
  const missingHeaders = REQUIRED_HEADERS.filter((header) => !headers.includes(header));
  if (missingHeaders.length > 0) {
    console.error(`✖ Missing required columns: ${missingHeaders.join(", ")}`);
    process.exit(1);
  }

  const issues: string[] = [];
  const records: Array<{
    line: number;
    values: {
      slug: string;
      brand: string;
      model: string;
      year: number | null;
      engineCc: number | null;
      priceKes: number;
      condition: string;
      odometerKm: number | null;
      transmission: string | null;
      fuelType: string | null;
      colour: string | null;
      usage: string | null;
      registration: string | null;
      description: string;
      inspectionNotes: string | null;
      serviceHistory: string | null;
      status: string;
      isPublished: boolean;
      imageUrls: string[];
    };
  }> = [];

  const seenSlugs = new Set<string>();

  for (let rowIndex = 1; rowIndex < rows.length; rowIndex += 1) {
    const row = rows[rowIndex] ?? [];
    const line = rowIndex + 1;
    const get = (key: string): string => {
      const column = headers.indexOf(key);
      return column >= 0 ? (row[column] ?? "").trim() : "";
    };

    const brand = get("brand");
    const model = get("model");
    if (!brand) issues.push(`Line ${line}: brand is required`);
    if (!model) issues.push(`Line ${line}: model is required`);

    const priceRaw = get("price_kes").replace(/,/g, "");
    const price = /^\d+$/.test(priceRaw) ? Number(priceRaw) : NaN;
    if (!Number.isFinite(price) || price <= 0) {
      issues.push(`Line ${line}: price_kes must be a positive whole number`);
    }

    const year = optionalInt(get("year"), 1950, 2100, "year");
    const engineCc = optionalInt(get("engine_cc"), 1, 2000, "engine_cc");
    const odometer = optionalInt(get("odometer_km"), 0, 1_500_000, "odometer_km");
    for (const value of [year, engineCc, odometer]) {
      if (typeof value === "string") issues.push(`Line ${line}: ${value}`);
    }

    const conditionRaw = get("condition").toLowerCase() || "good";
    const condition = CONDITION_MAP[conditionRaw];
    if (!condition) {
      issues.push(`Line ${line}: condition "${get("condition")}" is not recognised`);
    }

    const statusRaw = get("status").toLowerCase() || "available";
    const status = STATUS_MAP[statusRaw];
    if (!status) {
      issues.push(`Line ${line}: status "${get("status")}" is not recognised`);
    }

    const images = get("image_urls")
      .split("|")
      .map((value) => value.trim())
      .filter(Boolean)
      .slice(0, 10);

    for (const url of images) {
      if (!/^https:\/\//.test(url) && !(url.startsWith("/") && !url.startsWith("//"))) {
        issues.push(`Line ${line}: image URL "${url}" must start with https:// or /`);
      }
    }

    const requestedSlug = get("slug");
    const baseSlug =
      (requestedSlug ? slugify(requestedSlug) : "") ||
      slugify([brand, model, get("year")].filter(Boolean).join(" ")) ||
      "motorcycle";
    let slug = baseSlug;
    let suffix = 2;
    while (seenSlugs.has(slug)) {
      slug = `${baseSlug}-${suffix}`;
      suffix += 1;
    }
    seenSlugs.add(slug);

    const publishValue = get("is_published").toLowerCase();
    const isPublished = publishAll || ["true", "1", "yes", "y"].includes(publishValue);

    records.push({
      line,
      values: {
        slug,
        brand,
        model,
        year: typeof year === "number" ? year : null,
        engineCc: typeof engineCc === "number" ? engineCc : null,
        priceKes: Number.isFinite(price) ? price : 0,
        condition: condition ?? "good",
        odometerKm: typeof odometer === "number" ? odometer : null,
        transmission: get("transmission") || null,
        fuelType: get("fuel_type") || null,
        colour: get("colour") || null,
        usage: get("usage") || null,
        registration: get("registration") || null,
        description: get("description") || "",
        inspectionNotes: get("inspection_notes") || null,
        serviceHistory: get("service_history") || null,
        status: status ?? "available",
        isPublished,
        imageUrls: images,
      },
    });
  }

  if (issues.length > 0) {
    console.error(`✖ Import aborted - ${issues.length} problem(s) found. Nothing was written.`);
    for (const issue of issues) console.error(`  • ${issue}`);
    process.exit(1);
  }

  await runMigrations();
  const db = await getDb();

  const existing = await db.select({ slug: motorcycles.slug }).from(motorcycles);
  const existingSlugs = existing.map((row) => row.slug);

  const prepared = records.map(({ values }) => {
    const finalSlug = uniqueSlug(values.slug, existingSlugs);
    existingSlugs.push(finalSlug);
    return { ...values, slug: finalSlug };
  });

  if (dryRun) {
    console.log(`✔ Dry run: ${prepared.length} row(s) valid. Nothing written.`);
    console.log(`  File: ${filePath}`);
    for (const row of prepared.slice(0, 5)) {
      console.log(`  • ${row.brand} ${row.model} - KSh ${row.priceKes} - ${row.status} - ${row.isPublished ? "published" : "draft"}`);
    }
    process.exit(0);
  }

  let inserted = 0;
  await db.transaction(async (tx) => {
    for (const row of prepared) {
      const [created] = await tx
        .insert(motorcycles)
        .values({
          slug: row.slug,
          brand: row.brand,
          model: row.model,
          year: row.year,
          engineCc: row.engineCc,
          priceKes: row.priceKes,
          condition: row.condition as (typeof motorcycles.$inferInsert)["condition"],
          odometerKm: row.odometerKm,
          transmission: row.transmission,
          fuelType: row.fuelType,
          colour: row.colour,
          usage: row.usage,
          registration: row.registration,
          description: row.description,
          inspectionNotes: row.inspectionNotes,
          serviceHistory: row.serviceHistory,
          status: row.status as (typeof motorcycles.$inferInsert)["status"],
          isPublished: row.isPublished,
          isSample: markSample,
        })
        .returning({ id: motorcycles.id });

      if (created && row.imageUrls.length > 0) {
        await tx.insert(motorcycleImages).values(
          row.imageUrls.map((url, index) => ({
            motorcycleId: created.id,
            imageUrl: url,
            altText: `${row.brand} ${row.model}`,
            sortOrder: index,
          })),
        );
      }
      inserted += 1;
    }
  });

  console.log(`✔ Imported ${inserted} motorcycle(s) from ${path.basename(filePath)}.`);
  console.log(`  Published: ${prepared.filter((row) => row.isPublished).length}. Review drafts in /admin/bikes.`);
  process.exit(0);
}

main().catch((error) => {
  console.error("✖ Import failed:", error instanceof Error ? error.message : error);
  process.exit(1);
});
