import { loadEnv } from "./load-env";

loadEnv();

/**
 * Destructive: drops every table in the public schema and re-runs migrations.
 * Requires --force so it can never run by accident.
 */
async function main() {
  const force = process.argv.includes("--force");
  if (!force) {
    console.error("Refusing to reset the database. Re-run with: npm run db:reset -- --force");
    process.exit(1);
  }

  const { getDb, describeDatabase } = await import("../lib/db");
  const { runMigrations } = await import("../lib/migrations");
  const { sql } = await import("drizzle-orm");

  const database = describeDatabase();
  if (database.driver === "neon") {
    console.warn("⚠ Resetting a Neon database. This deletes ALL inventory and enquiries.");
  }

  const db = await getDb();
  await db.execute(sql.raw("DROP SCHEMA IF EXISTS public CASCADE"));
  await db.execute(sql.raw("DROP SCHEMA IF EXISTS drizzle CASCADE"));
  await db.execute(sql.raw("CREATE SCHEMA public"));
  console.log("✔ Application and migration schemas dropped and recreated.");
  await runMigrations();
  console.log("✔ Migrations applied.");
  process.exit(0);
}

main().catch((error) => {
  console.error("✖ Reset failed:", error instanceof Error ? error.message : error);
  process.exit(1);
});
