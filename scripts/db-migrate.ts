import { loadEnv } from "./load-env";

loadEnv();

async function main() {
  const { describeDatabase } = await import("../lib/db");
  const { runMigrations } = await import("../lib/migrations");
  const { label } = describeDatabase();
  await runMigrations();
  console.log(`✔ Migrations applied (${label}).`);
  process.exit(0);
}

main().catch((error) => {
  console.error("✖ Migration failed:", error instanceof Error ? error.message : error);
  process.exit(1);
});
