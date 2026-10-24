import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

const CONTENT_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".avif": "image/avif",
};

/**
 * Serves locally uploaded motorcycle photos in development when Vercel Blob is
 * not configured. Strict filename validation prevents path traversal.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ fileName: string }> },
) {
  const { fileName } = await params;

  if (!/^[a-f0-9-]{20,}\.(jpg|jpeg|png|webp|avif)$/i.test(fileName)) {
    return new NextResponse("Not found", { status: 404 });
  }

  const extension = path.extname(fileName).toLowerCase();
  const contentType = CONTENT_TYPES[extension];
  if (!contentType) return new NextResponse("Not found", { status: 404 });

  const configured = process.env.UPLOAD_DIR?.trim();
  const directory = configured
    ? path.resolve(/* turbopackIgnore: true */ process.cwd(), configured)
    : path.resolve(process.cwd(), ".data", "uploads");

  try {
    const file = await readFile(path.join(/* turbopackIgnore: true */ directory, fileName));
    return new NextResponse(new Uint8Array(file), {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
        "Content-Disposition": "inline",
        "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; sandbox",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
