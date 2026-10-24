"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, asc, eq, max, ne } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/lib/db";
import { motorcycleImages, motorcycles } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/auth";
import { motorcycleFormSchema } from "@/lib/validation";
import { slugify } from "@/lib/utils";
import { deleteStoredImage, ImageStorageError, storeImageFile } from "@/lib/storage";

export type BikeFormState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Record<string, string[]>;
};

export type ActionState = {
  status: "idle" | "success" | "error";
  message?: string;
};


function readField(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function fieldErrorsFrom(error: z.ZodError): Record<string, string[]> {
  const flattened = z.flattenError(error).fieldErrors as Record<string, string[] | undefined>;
  const result: Record<string, string[]> = {};
  for (const [key, value] of Object.entries(flattened)) {
    if (value && value.length > 0) result[key] = value;
  }
  return result;
}

function rawBikeValues(formData: FormData) {
  return {
    brand: readField(formData, "brand"),
    model: readField(formData, "model"),
    slug: readField(formData, "slug"),
    year: readField(formData, "year"),
    engineCc: readField(formData, "engineCc"),
    priceKes: readField(formData, "priceKes"),
    condition: readField(formData, "condition") || "good",
    odometerKm: readField(formData, "odometerKm"),
    transmission: readField(formData, "transmission"),
    fuelType: readField(formData, "fuelType"),
    colour: readField(formData, "colour"),
    usage: readField(formData, "usage"),
    registration: readField(formData, "registration"),
    description: readField(formData, "description"),
    inspectionNotes: readField(formData, "inspectionNotes"),
    serviceHistory: readField(formData, "serviceHistory"),
    status: readField(formData, "status") || "available",
    isPublished: readField(formData, "isPublished"),
    isFeatured: readField(formData, "isFeatured"),
    internalNotes: readField(formData, "internalNotes"),
  };
}

async function ensureUniqueSlug(base: string, excludeId?: string): Promise<string> {
  const db = await getDb();
  const root = slugify(base) || `motorcycle-${Date.now()}`;
  let candidate = root;
  let counter = 1;

  // A short loop is enough for a dealership-sized catalogue.
  while (counter < 50) {
    const rows = await db
      .select({ id: motorcycles.id })
      .from(motorcycles)
      .where(eq(motorcycles.slug, candidate))
      .limit(1);
    const existing = rows[0];
    if (!existing || existing.id === excludeId) return candidate;
    counter += 1;
    candidate = `${root}-${counter}`;
  }
  return `${root}-${Date.now()}`;
}

function revalidateInventory(slug?: string) {
  revalidatePath("/");
  revalidatePath("/bikes");
  revalidatePath("/brands");
  if (slug) revalidatePath(`/bikes/${slug}`);
  revalidatePath("/admin");
  revalidatePath("/admin/bikes");
}

function normaliseImageUrl(raw: string): string | null {
  const value = raw.trim();
  if (!value || value.length > 500) return null;
  if (value.startsWith("/") && !value.startsWith("//")) return value;
  try {
    const url = new URL(value);
    if (url.protocol === "https:") return url.toString();
  } catch {
    return null;
  }
  return null;
}

export async function createBikeAction(
  _previous: BikeFormState,
  formData: FormData,
): Promise<BikeFormState> {
  await requireAdmin("/admin/bikes/new");

  const parsed = motorcycleFormSchema.safeParse(rawBikeValues(formData));
  if (!parsed.success) {
    return {
      status: "error",
      message: "Please fix the highlighted fields.",
      fieldErrors: fieldErrorsFrom(parsed.error),
    };
  }

  const data = parsed.data;
  const slugBase = data.slug ?? [data.brand, data.model, data.year].filter(Boolean).join(" ");

  let newId: string;
  try {
    const db = await getDb();
    const slug = await ensureUniqueSlug(slugBase);
    const [created] = await db
      .insert(motorcycles)
      .values({
        slug,
        brand: data.brand,
        model: data.model,
        year: data.year ?? null,
        engineCc: data.engineCc ?? null,
        priceKes: data.priceKes,
        condition: data.condition as (typeof motorcycles.$inferInsert)["condition"],
        odometerKm: data.odometerKm ?? null,
        transmission: data.transmission ?? null,
        fuelType: data.fuelType ?? null,
        colour: data.colour ?? null,
        usage: data.usage ?? null,
        registration: data.registration ?? null,
        description: data.description,
        inspectionNotes: data.inspectionNotes ?? null,
        serviceHistory: data.serviceHistory ?? null,
        status: data.status as (typeof motorcycles.$inferInsert)["status"],
        isPublished: data.isPublished === "on",
        isFeatured: data.isFeatured === "on",
        internalNotes: data.internalNotes ?? null,
      })
      .returning({ id: motorcycles.id });

    if (!created) throw new Error("Insert failed");
    newId = created.id;
    revalidateInventory(slug);
  } catch {
    return {
      status: "error",
      message: "The motorcycle could not be saved. Check the details and try again.",
    };
  }

  redirect(`/admin/bikes/${newId}?created=1`);
}

export async function updateBikeAction(
  _previous: BikeFormState,
  formData: FormData,
): Promise<BikeFormState> {
  await requireAdmin("/admin/bikes");

  const id = readField(formData, "id");
  if (!z.uuid().safeParse(id).success) {
    return { status: "error", message: "Unknown listing." };
  }

  const parsed = motorcycleFormSchema.safeParse(rawBikeValues(formData));
  if (!parsed.success) {
    return {
      status: "error",
      message: "Please fix the highlighted fields.",
      fieldErrors: fieldErrorsFrom(parsed.error),
    };
  }

  const data = parsed.data;
  let savedSlug: string | null = null;

  try {
    const db = await getDb();
    const [existing] = await db
      .select({ id: motorcycles.id, slug: motorcycles.slug })
      .from(motorcycles)
      .where(eq(motorcycles.id, id))
      .limit(1);

    if (!existing) return { status: "error", message: "This listing no longer exists." };

    const slugBase =
      data.slug ??
      (existing.slug || [data.brand, data.model, data.year].filter(Boolean).join(" "));
    const slug = await ensureUniqueSlug(slugBase, existing.id);

    await db
      .update(motorcycles)
      .set({
        slug,
        brand: data.brand,
        model: data.model,
        year: data.year ?? null,
        engineCc: data.engineCc ?? null,
        priceKes: data.priceKes,
        condition: data.condition as (typeof motorcycles.$inferInsert)["condition"],
        odometerKm: data.odometerKm ?? null,
        transmission: data.transmission ?? null,
        fuelType: data.fuelType ?? null,
        colour: data.colour ?? null,
        usage: data.usage ?? null,
        registration: data.registration ?? null,
        description: data.description,
        inspectionNotes: data.inspectionNotes ?? null,
        serviceHistory: data.serviceHistory ?? null,
        status: data.status as (typeof motorcycles.$inferInsert)["status"],
        isPublished: data.isPublished === "on",
        isFeatured: data.isFeatured === "on",
        internalNotes: data.internalNotes ?? null,
        updatedAt: new Date(),
      })
      .where(eq(motorcycles.id, id));

    revalidateInventory(slug);
    if (slug !== existing.slug) revalidatePath(`/bikes/${existing.slug}`);
    savedSlug = slug;
  } catch {
    return { status: "error", message: "The changes could not be saved. Please try again." };
  }

  if (!savedSlug) {
    return { status: "error", message: "The changes could not be saved. Please try again." };
  }

  redirect(`/admin/bikes/${id}?saved=1`);
}

export async function deleteBikeAction(formData: FormData): Promise<void> {
  await requireAdmin("/admin/bikes");
  const id = readField(formData, "id");
  if (!z.uuid().safeParse(id).success) return;

  const db = await getDb();
  const [bike] = await db
    .select({ slug: motorcycles.slug })
    .from(motorcycles)
    .where(eq(motorcycles.id, id))
    .limit(1);

  const images = await db
    .select({ imageUrl: motorcycleImages.imageUrl, storageKey: motorcycleImages.storageKey })
    .from(motorcycleImages)
    .where(eq(motorcycleImages.motorcycleId, id));

  await db.delete(motorcycles).where(eq(motorcycles.id, id));

  for (const image of images) {
    await deleteStoredImage(image);
  }

  if (bike) revalidateInventory(bike.slug);
  redirect("/admin/bikes?deleted=1");
}

export async function setBikeStatusAction(formData: FormData): Promise<void> {
  await requireAdmin("/admin/bikes");
  const id = readField(formData, "id");
  const status = readField(formData, "status");
  if (!z.uuid().safeParse(id).success) return;

  const parsedStatus = z
    .enum(["available", "reserved", "pending_sale", "sold"])
    .safeParse(status);
  if (!parsedStatus.success) return;

  const db = await getDb();
  const [bike] = await db
    .select({ slug: motorcycles.slug })
    .from(motorcycles)
    .where(eq(motorcycles.id, id))
    .limit(1);
  if (!bike) return;

  await db
    .update(motorcycles)
    .set({ status: parsedStatus.data, updatedAt: new Date() })
    .where(eq(motorcycles.id, id));

  revalidateInventory(bike.slug);
}

export async function setBikePublishedAction(formData: FormData): Promise<void> {
  await requireAdmin("/admin/bikes");
  const id = readField(formData, "id");
  const publish = readField(formData, "publish") === "true";
  if (!z.uuid().safeParse(id).success) return;

  const db = await getDb();
  const [bike] = await db
    .select({ slug: motorcycles.slug })
    .from(motorcycles)
    .where(eq(motorcycles.id, id))
    .limit(1);
  if (!bike) return;

  await db
    .update(motorcycles)
    .set({ isPublished: publish, updatedAt: new Date() })
    .where(eq(motorcycles.id, id));

  revalidateInventory(bike.slug);
}

export async function toggleFeaturedAction(formData: FormData): Promise<void> {
  await requireAdmin("/admin/bikes");
  const id = readField(formData, "id");
  if (!z.uuid().safeParse(id).success) return;

  const db = await getDb();
  const [bike] = await db
    .select({ slug: motorcycles.slug, isFeatured: motorcycles.isFeatured })
    .from(motorcycles)
    .where(eq(motorcycles.id, id))
    .limit(1);
  if (!bike) return;

  await db
    .update(motorcycles)
    .set({ isFeatured: !bike.isFeatured, updatedAt: new Date() })
    .where(eq(motorcycles.id, id));

  revalidateInventory(bike.slug);
}

/* ------------------------------- images -------------------------------- */

async function nextSortOrder(bikeId: string): Promise<number> {
  const db = await getDb();
  const [row] = await db
    .select({ value: max(motorcycleImages.sortOrder) })
    .from(motorcycleImages)
    .where(eq(motorcycleImages.motorcycleId, bikeId));
  return Number(row?.value ?? -1) + 1;
}

export async function uploadBikeImageAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin("/admin/bikes");

  const bikeId = readField(formData, "bikeId");
  if (!z.uuid().safeParse(bikeId).success) {
    return { status: "error", message: "Unknown listing." };
  }

  const file = formData.get("image");
  if (!(file instanceof File) || file.size === 0) {
    return { status: "error", message: "Choose an image file first." };
  }

  const altText = readField(formData, "altText").slice(0, 160);

  try {
    const db = await getDb();
    const stored = await storeImageFile(file);
    await db.insert(motorcycleImages).values({
      motorcycleId: bikeId,
      imageUrl: stored.url,
      storageKey: stored.key,
      altText,
      sortOrder: await nextSortOrder(bikeId),
    });
    revalidateBikeById(bikeId);
    return { status: "success", message: "Photo uploaded." };
  } catch (error) {
    const message =
      error instanceof ImageStorageError
        ? error.message
        : "The photo could not be uploaded. Please try a smaller JPG or PNG file.";
    return { status: "error", message };
  }
}

export async function addBikeImageUrlAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin("/admin/bikes");

  const bikeId = readField(formData, "bikeId");
  if (!z.uuid().safeParse(bikeId).success) {
    return { status: "error", message: "Unknown listing." };
  }

  const url = normaliseImageUrl(readField(formData, "imageUrl"));
  if (!url) {
    return {
      status: "error",
      message: "Enter a full https:// image URL or a path that starts with /.",
    };
  }

  try {
    const db = await getDb();
    await db.insert(motorcycleImages).values({
      motorcycleId: bikeId,
      imageUrl: url,
      storageKey: null,
      altText: readField(formData, "altText").slice(0, 160),
      sortOrder: await nextSortOrder(bikeId),
    });
    revalidateBikeById(bikeId);
    return { status: "success", message: "Photo link added." };
  } catch {
    return { status: "error", message: "The photo link could not be saved." };
  }
}

export async function deleteBikeImageAction(formData: FormData): Promise<void> {
  await requireAdmin("/admin/bikes");
  const imageId = readField(formData, "imageId");
  if (!z.uuid().safeParse(imageId).success) return;

  const db = await getDb();
  const [image] = await db
    .select({
      id: motorcycleImages.id,
      motorcycleId: motorcycleImages.motorcycleId,
      imageUrl: motorcycleImages.imageUrl,
      storageKey: motorcycleImages.storageKey,
    })
    .from(motorcycleImages)
    .where(eq(motorcycleImages.id, imageId))
    .limit(1);

  if (!image) return;

  await db.delete(motorcycleImages).where(eq(motorcycleImages.id, imageId));
  await deleteStoredImage(image);
  revalidateBikeById(image.motorcycleId);
}

export async function moveBikeImageAction(formData: FormData): Promise<void> {
  await requireAdmin("/admin/bikes");
  const imageId = readField(formData, "imageId");
  const direction = readField(formData, "direction");
  if (!z.uuid().safeParse(imageId).success) return;
  if (direction !== "up" && direction !== "down") return;

  const db = await getDb();
  const [image] = await db
    .select({ id: motorcycleImages.id, motorcycleId: motorcycleImages.motorcycleId })
    .from(motorcycleImages)
    .where(eq(motorcycleImages.id, imageId))
    .limit(1);
  if (!image) return;

  const images = await db
    .select({ id: motorcycleImages.id, sortOrder: motorcycleImages.sortOrder })
    .from(motorcycleImages)
    .where(eq(motorcycleImages.motorcycleId, image.motorcycleId))
    .orderBy(asc(motorcycleImages.sortOrder), asc(motorcycleImages.createdAt));

  const index = images.findIndex((item) => item.id === imageId);
  const swapIndex = direction === "up" ? index - 1 : index + 1;
  if (index < 0 || swapIndex < 0 || swapIndex >= images.length) return;

  const current = images[index];
  const neighbour = images[swapIndex];
  if (!current || !neighbour) return;

  // Normalise first so images added at the same sort order reorder predictably.
  for (let position = 0; position < images.length; position += 1) {
    const item = images[position];
    if (item && item.sortOrder !== position) {
      await db
        .update(motorcycleImages)
        .set({ sortOrder: position })
        .where(eq(motorcycleImages.id, item.id));
    }
  }

  await db
    .update(motorcycleImages)
    .set({ sortOrder: swapIndex })
    .where(eq(motorcycleImages.id, current.id));
  await db
    .update(motorcycleImages)
    .set({ sortOrder: index })
    .where(eq(motorcycleImages.id, neighbour.id));

  revalidateBikeById(image.motorcycleId);
}

export async function makePrimaryImageAction(formData: FormData): Promise<void> {
  await requireAdmin("/admin/bikes");
  const imageId = readField(formData, "imageId");
  if (!z.uuid().safeParse(imageId).success) return;

  const db = await getDb();
  const [image] = await db
    .select({ id: motorcycleImages.id, motorcycleId: motorcycleImages.motorcycleId })
    .from(motorcycleImages)
    .where(eq(motorcycleImages.id, imageId))
    .limit(1);
  if (!image) return;

  await db
    .update(motorcycleImages)
    .set({ sortOrder: -1 })
    .where(eq(motorcycleImages.id, imageId));

  // Push any other -1 images back so ordering stays deterministic.
  await db
    .update(motorcycleImages)
    .set({ sortOrder: 0 })
    .where(
      and(
        eq(motorcycleImages.motorcycleId, image.motorcycleId),
        ne(motorcycleImages.id, imageId),
        eq(motorcycleImages.sortOrder, -1),
      ),
    );

  revalidateBikeById(image.motorcycleId);
}

async function revalidateBikeById(bikeId: string): Promise<void> {
  try {
    const db = await getDb();
    const [bike] = await db
      .select({ slug: motorcycles.slug })
      .from(motorcycles)
      .where(eq(motorcycles.id, bikeId))
      .limit(1);
    if (bike) revalidateInventory(bike.slug);
    revalidatePath(`/admin/bikes/${bikeId}`);
  } catch {
    revalidatePath("/admin/bikes");
  }
}
