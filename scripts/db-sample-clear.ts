import { loadEnv } from "./load-env";

loadEnv();

/** Removes demonstration inventory and enquiries. Real records are untouched. */
async function main() {
  const { getDb } = await import("../lib/db");
  const { enquiries, motorcycles } = await import("../lib/db/schema");
  const { and, count, eq, like } = await import("drizzle-orm");

  const db = await getDb();

  const [bikeCount] = await db
    .select({ value: count() })
    .from(motorcycles)
    .where(like(motorcycles.slug, "sample-%"));

  const [enquiryCount] = await db
    .select({ value: count() })
    .from(enquiries)
    .where(eq(enquiries.source, "seed-sample"));

  await db.delete(enquiries).where(eq(enquiries.source, "seed-sample"));
  await db
    .delete(motorcycles)
    .where(and(like(motorcycles.slug, "sample-%"), eq(motorcycles.isSample, true)));

  console.log(
    `✔ Removed ${Number(bikeCount?.value ?? 0)} sample listings and ${Number(enquiryCount?.value ?? 0)} sample enquiries.`,
  );
  process.exit(0);
}

main().catch((error) => {
  console.error("✖ Could not clear sample data:", error instanceof Error ? error.message : error);
  process.exit(1);
});
