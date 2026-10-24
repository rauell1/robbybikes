import { NextResponse } from "next/server";
import { desc } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { enquiries } from "@/lib/db/schema";

function escapeCsv(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
    return `"${str.replaceAll('"', '""')}"`;
  }
  return str;
}

export async function GET() {
  await requireAdmin("/admin/enquiries");

  const db = await getDb();
  const rows = await db
    .select()
    .from(enquiries)
    .orderBy(desc(enquiries.createdAt));

  const headers = [
    "ID",
    "Customer Name",
    "Phone Number",
    "Email",
    "Preferred Contact",
    "Message",
    "Status",
    "Source",
    "Motorcycle ID",
    "Created At",
  ];

  const csvRows = [headers.join(",")];

  for (const item of rows) {
    csvRows.push(
      [
        escapeCsv(item.id),
        escapeCsv(item.customerName),
        escapeCsv(item.phoneNumber),
        escapeCsv(item.email),
        escapeCsv(item.preferredContactMethod),
        escapeCsv(item.message),
        escapeCsv(item.status),
        escapeCsv(item.source),
        escapeCsv(item.motorcycleId),
        escapeCsv(item.createdAt.toISOString().slice(0, 10)),
      ].join(","),
    );
  }

  const csvData = "\uFEFF" + csvRows.join("\r\n");
  const today = new Date().toISOString().slice(0, 10);

  return new NextResponse(csvData, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="robbybikes-enquiries-${today}.csv"`,
    },
  });
}
