import { NextRequest, NextResponse } from "next/server";
import { and, asc, eq, inArray } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/lib/db";
import { motorcycleImages, motorcycles } from "@/lib/db/schema";

export async function GET(request: NextRequest) {
  const rawIds = request.nextUrl.searchParams.get("ids") ?? "";
  const candidates = rawIds
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 20); // Cap at 20 items

  const uuidSchema = z.string().uuid();
  const validIds = candidates.filter((id) => uuidSchema.safeParse(id).success);

  if (validIds.length === 0) {
    return NextResponse.json({ bikes: [] });
  }

  try {
    const db = await getDb();
    const bikes = await db.query.motorcycles.findMany({
      where: and(
        eq(motorcycles.isPublished, true),
        inArray(motorcycles.id, validIds),
      ),
      with: {
        images: {
          orderBy: [asc(motorcycleImages.sortOrder), asc(motorcycleImages.createdAt)],
        },
      },
    });

    return NextResponse.json(
      { bikes },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      },
    );
  } catch (error) {
    console.error("Failed to fetch shortlist bikes:", error);
    return NextResponse.json({ bikes: [] }, { status: 500 });
  }
}
