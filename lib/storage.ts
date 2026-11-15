import "server-only";
import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { deleteObject, objectStorageConfigured, putObject } from "./object-storage";

export const MAX_IMAGE_BYTES = 6 * 1024 * 1024;

const MIME_EXTENSIONS: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/avif": ".avif",
};

export class ImageStorageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ImageStorageError";
  }
}

export function isBlobStorageConfigured(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

/** S3-compatible object storage (Neon today, Cloudflare R2 later). */
export function isNeonStorageConfigured(): boolean {
  return objectStorageConfigured();
}

/** Magic-byte check so a spoofed Content-Type cannot sneak in a script. */
function hasValidSignature(buffer: Buffer, mimeType: string): boolean {
  if (mimeType === "image/jpeg") {
    return buffer.length > 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  }
  if (mimeType === "image/png") {
    return buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  }
  if (mimeType === "image/webp") {
    return (
      buffer.length > 12 &&
      buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
      buffer.subarray(8, 12).toString("ascii") === "WEBP"
    );
  }
  if (mimeType === "image/avif") {
    return buffer.length > 12 && buffer.subarray(4, 8).toString("ascii") === "ftyp";
  }
  return false;
}

function uploadsDirectory(): string {
  const configured = process.env.UPLOAD_DIR?.trim();
  if (!configured) return path.resolve(process.cwd(), ".data", "uploads");
  return path.resolve(/* turbopackIgnore: true */ process.cwd(), configured);
}

export type StoredImage = {
  url: string;
  key: string | null;
};

/**
 * Stores an uploaded motorcycle photo.
 * Prioritizes S3-compatible object storage (Neon, later Cloudflare R2) when configured,
 * then Vercel Blob when BLOB_READ_WRITE_TOKEN is configured,
 * otherwise writes to a local directory served through /api/uploads (development only).
 */
export async function storeImageFile(file: File): Promise<StoredImage> {
  if (!file || typeof file === "string" || file.size === 0) {
    throw new ImageStorageError("Choose an image file to upload.");
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw new ImageStorageError("Images must be 6 MB or smaller.");
  }

  const extension = MIME_EXTENSIONS[file.type];
  if (!extension) {
    throw new ImageStorageError("Upload a JPG, PNG, WebP or AVIF image.");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  if (!hasValidSignature(buffer, file.type)) {
    throw new ImageStorageError("That file does not look like a valid image.");
  }

  if (isNeonStorageConfigured()) {
    const key = `motorcycles/${randomUUID()}${extension}`;
    await putObject(key, buffer, file.type);
    return { url: `/api/storage/${key}`, key: `neon:${key}` };
  }

  if (isBlobStorageConfigured()) {
    const { put } = await import("@vercel/blob");
    const blob = await put(`motorcycles/${randomUUID()}${extension}`, buffer, {
      access: "public",
      contentType: file.type,
      addRandomSuffix: false,
    });
    return { url: blob.url, key: blob.pathname };
  }

  // Hosted deployments (Cloudflare Workers, Vercel) have no writable disk.
  const isHosted =
    process.env.VERCEL === "1" ||
    (typeof navigator !== "undefined" && navigator.userAgent === "Cloudflare-Workers");
  if (isHosted) {
    throw new ImageStorageError(
      "Image uploads need S3-compatible object storage (Cloudflare R2 or Neon) or Vercel Blob on this deployment. Set storage credentials, or add an image URL instead.",
    );
  }

  const directory = uploadsDirectory();
  await mkdir(directory, { recursive: true });
  const fileName = `${randomUUID()}${extension}`;
  await writeFile(path.join(/* turbopackIgnore: true */ directory, fileName), buffer);
  return { url: `/api/uploads/${fileName}`, key: `local:${fileName}` };
}

export async function deleteStoredImage(image: {
  imageUrl: string;
  storageKey: string | null;
}): Promise<void> {
  try {
    if (image.storageKey?.startsWith("neon:") && isNeonStorageConfigured()) {
      await deleteObject(image.storageKey.slice("neon:".length));
      return;
    }
    if (image.storageKey?.startsWith("local:")) {
      const fileName = image.storageKey.slice("local:".length);
      if (!/^[a-f0-9-]+\.(jpg|png|webp|avif)$/i.test(fileName)) return;
      await unlink(path.join(/* turbopackIgnore: true */ uploadsDirectory(), fileName));
      return;
    }
    if (image.storageKey && isBlobStorageConfigured()) {
      const { del } = await import("@vercel/blob");
      await del(image.imageUrl);
    }
  } catch {
    // A missing file must not block deleting a listing.
  }
}
