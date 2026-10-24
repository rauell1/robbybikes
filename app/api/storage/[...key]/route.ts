import { NextRequest, NextResponse } from "next/server";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ key: string[] }> },
) {
  const { key: keyParts } = await context.params;
  const key = keyParts.join("/");

  if (!key || key.includes("..")) {
    return new NextResponse("Invalid file path", { status: 400 });
  }

  const endpoint = process.env.AWS_ENDPOINT_URL_S3;
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
  const region = process.env.AWS_REGION || "us-east-2";
  const bucket = process.env.NEON_OBJECT_STORAGE_BUCKET || "assets";

  if (!endpoint || !accessKeyId || !secretAccessKey) {
    return new NextResponse("Object storage is not configured", { status: 503 });
  }

  const s3 = new S3Client({
    forcePathStyle: true,
    endpoint,
    region,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });

  try {
    const res = await s3.send(
      new GetObjectCommand({
        Bucket: bucket,
        Key: key,
      }),
    );

    if (!res.Body) {
      return new NextResponse("File not found", { status: 404 });
    }

    const stream = res.Body.transformToWebStream();
    return new Response(stream, {
      headers: {
        "Content-Type": res.ContentType || "application/octet-stream",
        "Cache-Control": "public, max-age=31536000, immutable",
        ...(res.ContentLength ? { "Content-Length": String(res.ContentLength) } : {}),
      },
    });
  } catch (error: unknown) {
    const err = error as { name?: string; message?: string };
    if (err.name === "NoSuchKey") {
      return new NextResponse("Not Found", { status: 404 });
    }
    return new NextResponse(err.message || "Error reading object", { status: 500 });
  }
}
