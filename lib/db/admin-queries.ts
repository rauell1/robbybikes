import { and, asc, count, desc, eq, ilike, or, type SQL } from "drizzle-orm";
import { getDb } from "./index";
import {
  enquiries,
  motorcycleImages,
  motorcycles,
  type EnquiryStatus,
  type EnquiryWithMotorcycle,
  type MotorcycleStatus,
  type MotorcycleWithImages,
} from "./schema";

const ADMIN_PAGE_SIZE = 20;
const imageOrder = [asc(motorcycleImages.sortOrder), asc(motorcycleImages.createdAt)];

export type AdminBikeFilter = {
  q: string;
  status: MotorcycleStatus | "all" | "unpublished";
  page: number;
};

export type AdminBikeList = {
  items: MotorcycleWithImages[];
  total: number;
  page: number;
  pageCount: number;
};

export async function listAdminBikes(filter: AdminBikeFilter): Promise<AdminBikeList> {
  const db = await getDb();
  const clauses: Array<SQL | undefined> = [];

  if (filter.q) {
    const term = `%${filter.q.replace(/[\\%_]/g, (match) => `\\${match}`)}%`;
    clauses.push(
      or(
        ilike(motorcycles.brand, term),
        ilike(motorcycles.model, term),
        ilike(motorcycles.slug, term),
      ),
    );
  }

  if (filter.status === "unpublished") clauses.push(eq(motorcycles.isPublished, false));
  else if (filter.status !== "all") clauses.push(eq(motorcycles.status, filter.status));

  const defined = clauses.filter((clause): clause is SQL => clause !== undefined);
  const where = defined.length > 0 ? and(...defined) : undefined;

  const [countRow] = await db.select({ value: count() }).from(motorcycles).where(where);
  const total = Number(countRow?.value ?? 0);
  const pageCount = Math.max(1, Math.ceil(total / ADMIN_PAGE_SIZE));
  const page = Math.min(Math.max(1, filter.page), pageCount);

  const items = await db.query.motorcycles.findMany({
    where,
    with: { images: { orderBy: imageOrder } },
    orderBy: [desc(motorcycles.updatedAt), desc(motorcycles.createdAt)],
    limit: ADMIN_PAGE_SIZE,
    offset: (page - 1) * ADMIN_PAGE_SIZE,
  });

  return { items, total, page, pageCount };
}

export async function getBikeBySlugAdmin(slug: string): Promise<MotorcycleWithImages | null> {
  const db = await getDb();
  const bike = await db.query.motorcycles.findFirst({
    where: eq(motorcycles.slug, slug),
    with: { images: { orderBy: imageOrder } },
  });
  return bike ?? null;
}

export type DashboardData = {
  totals: {
    all: number;
    published: number;
    unpublished: number;
    available: number;
    reserved: number;
    pendingSale: number;
    sold: number;
    sample: number;
  };
  enquiries: {
    new: number;
    contacted: number;
    inProgress: number;
    closed: number;
    total: number;
  };
  recentBikes: Array<Pick<MotorcycleWithImages, "id" | "slug" | "brand" | "model" | "priceKes" | "status" | "isPublished" | "updatedAt">>;
  recentEnquiries: EnquiryWithMotorcycle[];
};

export async function getDashboardData(): Promise<DashboardData> {
  const db = await getDb();

  const [bikeRows, enquiryRows, recentBikes, recentEnquiries] = await Promise.all([
    db
      .select({
        status: motorcycles.status,
        isPublished: motorcycles.isPublished,
        isSample: motorcycles.isSample,
        value: count(),
      })
      .from(motorcycles)
      .groupBy(motorcycles.status, motorcycles.isPublished, motorcycles.isSample),
    db
      .select({ status: enquiries.status, value: count() })
      .from(enquiries)
      .groupBy(enquiries.status),
    db.query.motorcycles.findMany({
      columns: {
        id: true,
        slug: true,
        brand: true,
        model: true,
        priceKes: true,
        status: true,
        isPublished: true,
        updatedAt: true,
      },
      orderBy: [desc(motorcycles.updatedAt)],
      limit: 5,
    }),
    db.query.enquiries.findMany({
      with: {
        motorcycle: { columns: { id: true, slug: true, brand: true, model: true, priceKes: true } },
      },
      orderBy: [desc(enquiries.createdAt)],
      limit: 5,
    }),
  ]);

  const totals = {
    all: 0,
    published: 0,
    unpublished: 0,
    available: 0,
    reserved: 0,
    pendingSale: 0,
    sold: 0,
    sample: 0,
  };

  for (const row of bikeRows) {
    const value = Number(row.value);
    totals.all += value;
    if (row.isPublished) totals.published += value;
    else totals.unpublished += value;
    if (row.isSample) totals.sample += value;
    if (row.status === "available") totals.available += value;
    if (row.status === "reserved") totals.reserved += value;
    if (row.status === "pending_sale") totals.pendingSale += value;
    if (row.status === "sold") totals.sold += value;
  }

  const enquiryTotals = { new: 0, contacted: 0, inProgress: 0, closed: 0, total: 0 };
  for (const row of enquiryRows) {
    const value = Number(row.value);
    enquiryTotals.total += value;
    if (row.status === "new") enquiryTotals.new = value;
    if (row.status === "contacted") enquiryTotals.contacted = value;
    if (row.status === "in_progress") enquiryTotals.inProgress = value;
    if (row.status === "closed") enquiryTotals.closed = value;
  }

  return {
    totals,
    enquiries: enquiryTotals,
    recentBikes,
    recentEnquiries: recentEnquiries as EnquiryWithMotorcycle[],
  };
}

export type EnquiryListFilter = {
  status: EnquiryStatus | "all";
  q: string;
  page: number;
};

export type EnquiryList = {
  items: EnquiryWithMotorcycle[];
  total: number;
  page: number;
  pageCount: number;
};

export async function listEnquiries(filter: EnquiryListFilter): Promise<EnquiryList> {
  const db = await getDb();
  const clauses: Array<SQL | undefined> = [];

  if (filter.status !== "all") clauses.push(eq(enquiries.status, filter.status));
  if (filter.q) {
    const term = `%${filter.q.replace(/[\\%_]/g, (match) => `\\${match}`)}%`;
    clauses.push(
      or(
        ilike(enquiries.customerName, term),
        ilike(enquiries.phoneNumber, term),
        ilike(enquiries.message, term),
      ),
    );
  }

  const defined = clauses.filter((clause): clause is SQL => clause !== undefined);
  const where = defined.length > 0 ? and(...defined) : undefined;

  const [countRow] = await db.select({ value: count() }).from(enquiries).where(where);
  const total = Number(countRow?.value ?? 0);
  const pageCount = Math.max(1, Math.ceil(total / ADMIN_PAGE_SIZE));
  const page = Math.min(Math.max(1, filter.page), pageCount);

  const items = await db.query.enquiries.findMany({
    where,
    with: {
      motorcycle: { columns: { id: true, slug: true, brand: true, model: true, priceKes: true } },
    },
    orderBy: [desc(enquiries.createdAt)],
    limit: ADMIN_PAGE_SIZE,
    offset: (page - 1) * ADMIN_PAGE_SIZE,
  });

  return { items: items as EnquiryWithMotorcycle[], total, page, pageCount };
}

export async function getEnquiryById(id: string): Promise<EnquiryWithMotorcycle | null> {
  const db = await getDb();
  const enquiry = await db.query.enquiries.findFirst({
    where: eq(enquiries.id, id),
    with: {
      motorcycle: { columns: { id: true, slug: true, brand: true, model: true, priceKes: true } },
    },
  });
  return (enquiry as EnquiryWithMotorcycle | undefined) ?? null;
}

export async function getBrandAndModelSuggestions(): Promise<{ brands: string[]; models: string[] }> {
  const db = await getDb();
  const [brandRows, modelRows] = await Promise.all([
    db.selectDistinct({ brand: motorcycles.brand }).from(motorcycles).orderBy(asc(motorcycles.brand)),
    db.selectDistinct({ model: motorcycles.model }).from(motorcycles).orderBy(asc(motorcycles.model)),
  ]);
  return {
    brands: brandRows.map((row) => row.brand),
    models: modelRows.map((row) => row.model),
  };
}

export async function countAllAdminBikes(): Promise<number> {
  const db = await getDb();
  const [row] = await db.select({ value: count() }).from(motorcycles);
  return Number(row?.value ?? 0);
}

export type EnquiryCounts = Record<"all" | EnquiryStatus, number>;

export async function getEnquiryCounts(): Promise<EnquiryCounts> {
  const db = await getDb();
  const rows = await db
    .select({ status: enquiries.status, value: count() })
    .from(enquiries)
    .groupBy(enquiries.status);

  const counts: EnquiryCounts = {
    all: 0,
    new: 0,
    contacted: 0,
    in_progress: 0,
    closed: 0,
  };

  for (const row of rows) {
    const value = Number(row.value);
    counts[row.status] = value;
    counts.all += value;
  }

  return counts;
}
