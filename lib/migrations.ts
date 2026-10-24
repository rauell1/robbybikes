/**
 * Applies pending SQL migrations from ./drizzle through the PostgreSQL driver.
 * Used by `npm run db:migrate`, `db:seed`, `db:reset` and `admin:create`.
 *
 * Neon best practice: use unpooled / direct connection for schema migrations
 * and advisory locks, falling back to pooled connection.
 */
export async function runMigrations(migrationsFolder = "drizzle"): Promise<void> {
  const path = await import("node:path");
  const folder = path.resolve(/* turbopackIgnore: true */ process.cwd(), migrationsFolder);
  const { migrate } = await import("drizzle-orm/postgres-js/migrator");
  const { drizzle } = await import("drizzle-orm/postgres-js");
  const postgres = (await import("postgres")).default;

  const url = process.env.DATABASE_URL_UNPOOLED?.trim() || process.env.DATABASE_URL?.trim();
  if (!url) {
    throw new Error("No database connection string configured for migrations.");
  }

  const migrationClient = postgres(url, { max: 1 });
  const db = drizzle(migrationClient);
  try {
    await migrate(db, { migrationsFolder: folder });
  } finally {
    await migrationClient.end();
  }
}
