/**
 * Applies pending SQL migrations from ./drizzle through the PostgreSQL driver.
 * Used by `npm run db:migrate`, `db:seed`, `db:reset` and `admin:create`.
 */
export async function runMigrations(migrationsFolder = "drizzle"): Promise<void> {
  const path = await import("node:path");
  const folder = path.resolve(/* turbopackIgnore: true */ process.cwd(), migrationsFolder);
  const { migrate } = await import("drizzle-orm/postgres-js/migrator");
  const { getDb } = await import("./db");
  const db = await getDb();
  await migrate(db, { migrationsFolder: folder });
}
