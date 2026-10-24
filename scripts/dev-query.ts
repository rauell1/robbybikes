import { loadEnv } from "./load-env";
loadEnv();
async function main() {
  const { getDb } = await import("../lib/db");
  const { enquiries } = await import("../lib/db/schema");
  const { desc } = await import("drizzle-orm");
  const db = await getDb();
  const rows = await db.select().from(enquiries).orderBy(desc(enquiries.createdAt)).limit(5);
  for (const r of rows) {
    console.log([r.customerName, r.phoneNumber, r.email ?? "-", r.preferredContactMethod, r.source, r.status, r.motorcycleId ? "bike" : "general"].join(" | "));
    console.log("  msg:", r.message.slice(0, 80));
  }
  process.exit(0);
}
main();
