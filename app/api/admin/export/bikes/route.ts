import { NextResponse } from "next/server";
import { desc } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { motorcycles } from "@/lib/db/schema";

function escapeCsv(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
    return `"${str.replaceAll('"', '""')}"`;
  }
  return str;
}

export async function GET() {
  await requireAdmin("/admin/bikes");

  const db = await getDb();
  const rows = await db
    .select()
    .from(motorcycles)
    .orderBy(desc(motorcycles.createdAt));

  const headers = [
    "ID",
    "Brand",
    "Model",
    "Year",
    "Engine CC",
    "Price KES",
    "Condition",
    "Odometer KM",
    "Fuel Type",
    "Transmission",
    "Colour",
    "Usage",
    "Registration",
    "Status",
    "Published",
    "Featured",
    "Created At",
  ];

  const csvRows = [headers.join(",")];

  for (const bike of rows) {
    csvRows.push(
      [
        escapeCsv(bike.id),
        escapeCsv(bike.brand),
        escapeCsv(bike.model),
        escapeCsv(bike.year),
        escapeCsv(bike.engineCc),
        escapeCsv(bike.priceKes),
        escapeCsv(bike.condition),
        escapeCsv(bike.odometerKm),
        escapeCsv(bike.fuelType),
        escapeCsv(bike.transmission),
        escapeCsv(bike.colour),
        escapeCsv(bike.usage),
        escapeCsv(bike.registration),
        escapeCsv(bike.status),
        escapeCsv(bike.isPublished ? "Yes" : "No"),
        escapeCsv(bike.isFeatured ? "Yes" : "No"),
        escapeCsv(bike.createdAt.toISOString().slice(0, 10)),
      ].join(","),
    );
  }

  const csvData = "\uFEFF" + csvRows.join("\r\n");
  const today = new Date().toISOString().slice(0, 10);

  return new NextResponse(csvData, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="robbybikes-inventory-${today}.csv"`,
    },
  });
}
