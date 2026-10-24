import { cache } from "react";
import { and, asc, count, desc, eq, gte, ilike, inArray, lte, max, min, ne, or, type SQL } from "drizzle-orm";
import { getDb } from "./index";
import {
  motorcycleImages,
  motorcycles,
  type MotorcycleCondition,
  type MotorcycleWithImages,
} from "./schema";
import type { BikeFilters } from "@/lib/filters";
import { PAGE_SIZE } from "@/lib/filters";

const imageOrder = [asc(motorcycleImages.sortOrder), asc(motorcycleImages.createdAt)];

const IN_STOCK_STATUSES = ["available", "reserved", "pending_sale"] as const;

function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, (match) => `\\${match}`);
}

function availabilityWhere(availability: BikeFilters["availability"]): SQL | undefined {
  switch (availability) {
    case "available":
      return eq(motorcycles.status, "available");
    case "reserved":
      return eq(motorcycles.status, "reserved");
    case "pending_sale":
      return eq(motorcycles.status, "pending_sale");
    case "sold":
      return eq(motorcycles.status, "sold");
    case "all":
      return undefined;
    case "in_stock":
    default:
      return inArray(motorcycles.status, [...IN_STOCK_STATUSES]);
  }
}

export function publicWhere(filters?: Partial<BikeFilters>): SQL | undefined {
  const clauses: Array<SQL | undefined> = [eq(motorcycles.isPublished, true)];

  if (filters) {
    clauses.push(availabilityWhere(filters.availability ?? "in_stock"));
    if (filters.q) {
      const term = `%${escapeLike(filters.q)}%`;
      clauses.push(
        or(
          ilike(motorcycles.brand, term),
          ilike(motorcycles.model, term),
          ilike(motorcycles.colour, term),
          ilike(motorcycles.usage, term),
          ilike(motorcycles.description, term),
        ),
      );
    }
    if (filters.brand) clauses.push(ilike(motorcycles.brand, filters.brand));
    if (filters.model) clauses.push(ilike(motorcycles.model, `%${escapeLike(filters.model)}%`));
    if (filters.minPrice) clauses.push(gte(motorcycles.priceKes, filters.minPrice));
    if (filters.maxPrice) clauses.push(lte(motorcycles.priceKes, filters.maxPrice));
    if (filters.minCc) clauses.push(gte(motorcycles.engineCc, filters.minCc));
    if (filters.maxCc) clauses.push(lte(motorcycles.engineCc, filters.maxCc));
    if (filters.yearFrom) clauses.push(gte(motorcycles.year, filters.yearFrom));
    if (filters.yearTo) clauses.push(lte(motorcycles.year, filters.yearTo));
    if (filters.condition) clauses.push(eq(motorcycles.condition, filters.condition));
    if (filters.transmission) clauses.push(ilike(motorcycles.transmission, filters.transmission));
    if (filters.usage) clauses.push(ilike(motorcycles.usage, filters.usage));
  }

  const defined = clauses.filter((clause): clause is SQL => clause !== undefined);
  return defined.length > 0 ? and(...defined) : undefined;
}

function orderFor(sort: BikeFilters["sort"]) {
  switch (sort) {
    case "price_asc":
      return [asc(motorcycles.priceKes), desc(motorcycles.createdAt)];
    case "price_desc":
      return [desc(motorcycles.priceKes), desc(motorcycles.createdAt)];
    case "updated":
      return [desc(motorcycles.updatedAt), desc(motorcycles.createdAt)];
    case "newest":
    default:
      return [desc(motorcycles.createdAt), desc(motorcycles.updatedAt)];
  }
}

export type BikeListResult = {
  items: MotorcycleWithImages[];
  total: number;
  page: number;
  pageCount: number;
  pageSize: number;
};

export async function listBikes(filters: BikeFilters): Promise<BikeListResult> {
  const db = await getDb();
  const where = publicWhere(filters);
  const page = Math.max(1, filters.page);
  const offset = (page - 1) * PAGE_SIZE;

  const [countRow] = await db
    .select({ value: count() })
    .from(motorcycles)
    .where(where);
  const total = Number(countRow?.value ?? 0);
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);

  const items = await db.query.motorcycles.findMany({
    where,
    with: { images: { orderBy: imageOrder } },
    orderBy: orderFor(filters.sort),
    limit: PAGE_SIZE,
    offset: (safePage - 1) * PAGE_SIZE,
  });

  return { items, total, page: safePage, pageCount, pageSize: PAGE_SIZE };
}

export type BrandSummary = {
  brand: string;
  total: number;
  minPrice: number | null;
  available: number;
};

export const getBrandSummary = cache(async (): Promise<BrandSummary[]> => {
  const db = await getDb();
  const rows = await db
    .select({
      brand: motorcycles.brand,
      total: count(),
      minPrice: min(motorcycles.priceKes),
      available: count(motorcycles.status),
    })
    .from(motorcycles)
    .where(and(eq(motorcycles.isPublished, true), inArray(motorcycles.status, [...IN_STOCK_STATUSES])))
    .groupBy(motorcycles.brand)
    .orderBy(desc(count()), asc(motorcycles.brand));

  return rows.map((row) => ({
    brand: row.brand,
    total: Number(row.total),
    available: Number(row.available),
    minPrice: row.minPrice === null ? null : Number(row.minPrice),
  }));
});

export type InventoryFacets = {
  brands: BrandSummary[];
  priceBounds: { min: number; max: number };
  ccBounds: { min: number; max: number };
  yearBounds: { min: number; max: number };
};

export const getInventoryFacets = cache(async (): Promise<InventoryFacets> => {
  const db = await getDb();
  const inStock = and(
    eq(motorcycles.isPublished, true),
    inArray(motorcycles.status, [...IN_STOCK_STATUSES]),
  );

  const [brandRows, boundsRow] = await Promise.all([
    db
      .select({ brand: motorcycles.brand, total: count(), minPrice: min(motorcycles.priceKes) })
      .from(motorcycles)
      .where(inStock)
      .groupBy(motorcycles.brand)
      .orderBy(asc(motorcycles.brand)),
    db
      .select({
        minPrice: min(motorcycles.priceKes),
        maxPrice: max(motorcycles.priceKes),
        minCc: min(motorcycles.engineCc),
        maxCc: max(motorcycles.engineCc),
        minYear: min(motorcycles.year),
        maxYear: max(motorcycles.year),
      })
      .from(motorcycles)
      .where(inStock),
  ]);

  const bounds = boundsRow[0];

  return {
    brands: brandRows.map((row) => ({
      brand: row.brand,
      total: Number(row.total),
      available: Number(row.total),
      minPrice: row.minPrice === null ? null : Number(row.minPrice),
    })),
    priceBounds: {
      min: Number(bounds?.minPrice ?? 0),
      max: Number(bounds?.maxPrice ?? 0),
    },
    ccBounds: {
      min: Number(bounds?.minCc ?? 0),
      max: Number(bounds?.maxCc ?? 0),
    },
    yearBounds: {
      min: Number(bounds?.minYear ?? 0),
      max: Number(bounds?.maxYear ?? 0),
    },
  };
});

export const getBikeBySlug = cache(async (slug: string): Promise<MotorcycleWithImages | null> => {
  const db = await getDb();
  const bike = await db.query.motorcycles.findFirst({
    where: and(eq(motorcycles.slug, slug), eq(motorcycles.isPublished, true)),
    with: { images: { orderBy: imageOrder } },
  });
  return bike ?? null;
});

export const getBikeById = cache(async (id: string): Promise<MotorcycleWithImages | null> => {
  const db = await getDb();
  const bike = await db.query.motorcycles.findFirst({
    where: eq(motorcycles.id, id),
    with: { images: { orderBy: imageOrder } },
  });
  return bike ?? null;
});

/** Featured listings, falling back to the newest available stock. */
export const getFeaturedBikes = cache(async (limit = 6): Promise<MotorcycleWithImages[]> => {
  const db = await getDb();
  const base = and(eq(motorcycles.isPublished, true), eq(motorcycles.status, "available"));

  const featured = await db.query.motorcycles.findMany({
    where: and(base, eq(motorcycles.isFeatured, true)),
    with: { images: { orderBy: imageOrder } },
    orderBy: [desc(motorcycles.createdAt)],
    limit,
  });

  if (featured.length >= limit) return featured;

  const fillIds = featured.map((bike) => bike.id);
  const fill = await db.query.motorcycles.findMany({
    where: fillIds.length > 0 ? and(base, ne(motorcycles.id, fillIds[0]!)) : base,
    with: { images: { orderBy: imageOrder } },
    orderBy: [desc(motorcycles.createdAt)],
    limit: limit + featured.length,
  });

  const merged = [...featured];
  for (const bike of fill) {
    if (merged.length >= limit) break;
    if (!merged.some((existing) => existing.id === bike.id)) merged.push(bike);
  }
  return merged;
});

export async function getRelatedBikes(
  bike: { id: string; brand: string; priceKes: number },
  limit = 3,
): Promise<MotorcycleWithImages[]> {
  const db = await getDb();
  const base = and(eq(motorcycles.isPublished, true), eq(motorcycles.status, "available"));

  const sameBrand = await db.query.motorcycles.findMany({
    where: and(base, ne(motorcycles.id, bike.id), ilike(motorcycles.brand, bike.brand)),
    with: { images: { orderBy: imageOrder } },
    orderBy: [desc(motorcycles.createdAt)],
    limit,
  });

  const results = [...sameBrand];
  if (results.length < limit) {
    const others = await db.query.motorcycles.findMany({
      where: and(base, ne(motorcycles.id, bike.id)),
      with: { images: { orderBy: imageOrder } },
      orderBy: [desc(motorcycles.createdAt)],
      limit: limit + results.length,
    });
    for (const other of others) {
      if (results.length >= limit) break;
      if (!results.some((item) => item.id === other.id)) results.push(other);
    }
  }
  return results;
}

export type InventoryStats = {
  available: number;
  inStock: number;
  brands: number;
};

export const getInventoryStats = cache(async (): Promise<InventoryStats> => {
  const db = await getDb();
  const [row] = await db
    .select({
      available: count(),
    })
    .from(motorcycles)
    .where(and(eq(motorcycles.isPublished, true), eq(motorcycles.status, "available")));

  const brandRows = await db
    .selectDistinct({ brand: motorcycles.brand })
    .from(motorcycles)
    .where(and(eq(motorcycles.isPublished, true), inArray(motorcycles.status, [...IN_STOCK_STATUSES])));

  const [inStockRow] = await db
    .select({ value: count() })
    .from(motorcycles)
    .where(and(eq(motorcycles.isPublished, true), inArray(motorcycles.status, [...IN_STOCK_STATUSES])));

  return {
    available: Number(row?.available ?? 0),
    inStock: Number(inStockRow?.value ?? 0),
    brands: brandRows.length,
  };
});

export const getPublishedBikeSlugs = cache(async (): Promise<Array<{ slug: string; updatedAt: Date }>> => {
  const db = await getDb();
  const rows = await db
    .select({ slug: motorcycles.slug, updatedAt: motorcycles.updatedAt })
    .from(motorcycles)
    .where(and(eq(motorcycles.isPublished, true), inArray(motorcycles.status, [...IN_STOCK_STATUSES])))
    .orderBy(desc(motorcycles.updatedAt));
  return rows;
});

export const getSampleListingCount = cache(async (): Promise<number> => {
  const db = await getDb();
  const [row] = await db
    .select({ value: count() })
    .from(motorcycles)
    .where(and(eq(motorcycles.isSample, true), eq(motorcycles.isPublished, true)));
  return Number(row?.value ?? 0);
});

export const getDistinctFieldValues = cache(async (): Promise<{
  brands: string[];
  conditions: MotorcycleCondition[];
  transmissions: string[];
  usages: string[];
}> => {
  const db = await getDb();
  const [brandRows, transmissionRows, usageRows] = await Promise.all([
    db
      .selectDistinct({ brand: motorcycles.brand })
      .from(motorcycles)
      .where(eq(motorcycles.isPublished, true))
      .orderBy(asc(motorcycles.brand)),
    db
      .selectDistinct({ transmission: motorcycles.transmission })
      .from(motorcycles)
      .where(and(eq(motorcycles.isPublished, true), ne(motorcycles.transmission, "")))
      .orderBy(asc(motorcycles.transmission)),
    db
      .selectDistinct({ usage: motorcycles.usage })
      .from(motorcycles)
      .where(and(eq(motorcycles.isPublished, true), ne(motorcycles.usage, "")))
      .orderBy(asc(motorcycles.usage)),
  ]);

  return {
    brands: brandRows.map((row) => row.brand),
    conditions: ["excellent", "very_good", "good", "fair", "needs_repair"],
    transmissions: transmissionRows
      .map((row) => row.transmission)
      .filter((value): value is string => Boolean(value)),
    usages: usageRows.map((row) => row.usage).filter((value): value is string => Boolean(value)),
  };
});

export type ModelFamily = { model: string; brand: string; total: number; minPrice: number };

export const getModelFamilies = cache(async (): Promise<ModelFamily[]> => {
  const db = await getDb();
  const rows = await db
    .select({
      model: motorcycles.model,
      brand: motorcycles.brand,
      total: count(),
      minPrice: min(motorcycles.priceKes),
    })
    .from(motorcycles)
    .where(and(eq(motorcycles.isPublished, true), inArray(motorcycles.status, [...IN_STOCK_STATUSES])))
    .groupBy(motorcycles.model, motorcycles.brand)
    .orderBy(desc(count()), asc(motorcycles.model))
    .limit(12);

  return rows.map((row) => ({
    model: row.model,
    brand: row.brand,
    total: Number(row.total),
    minPrice: Number(row.minPrice ?? 0),
  }));
});
