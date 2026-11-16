import { NextRequest, NextResponse } from "next/server";
import { getObject, objectStorageConfigured } from "@/lib/object-storage";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ key: string[] }> },
) {
  const { key: keyParts } = await context.params;
  const key = keyParts.join("/");

  if (!key || key.includes("..")) {
    return new NextResponse("Invalid file path", { status: 400 });
  }

  if (!objectStorageConfigured()) {
    return new NextResponse("Object storage is not configured", { status: 503 });
  }

  try {
    const object = await getObject(key);
    if (!object?.body) {
      return new NextResponse("Not Found", { status: 404 });
    }
    const length = object.headers.get("content-length");
    return new Response(object.body, {
      headers: {
        "Content-Type": object.headers.get("content-type") || "application/octet-stream",
        "Cache-Control": "public, max-age=31536000, immutable",
        ...(length ? { "Content-Length": length } : {}),
      },
    });
  } catch {
    return new NextResponse("Error reading object", { status: 500 });
  }
}
