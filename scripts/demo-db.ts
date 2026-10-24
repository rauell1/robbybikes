import { existsSync, readdirSync } from "node:fs";
import path from "node:path";
import { loadEnv } from "./load-env";

loadEnv();

/**
 * Local/demo database server.
 *
 * Runs a real PostgreSQL cluster (binaries from the `embedded-postgres`
 * dev dependency) on the loopback interface so local development and previews
 * use the exact same driver and SQL dialect as Neon in production.
 *
 * This script is for local development only - production deployments must set
 * DATABASE_URL to a hosted Neon (or other PostgreSQL) connection string.
 */
const HOST = process.env.DEMO_DB_HOST?.trim() || "127.0.0.1";
const PORT = Number(process.env.DEMO_DB_PORT ?? "5433");
const DATA_DIR = path.resolve(process.cwd(), process.env.DEMO_DB_DATA_DIR?.trim() || ".data/pg");
const USER = process.env.DEMO_DB_USER?.trim() || "postgres";
const PASSWORD = process.env.DEMO_DB_PASSWORD?.trim() || "postgres";

function directoryIsEmpty(dir: string): boolean {
  if (!existsSync(dir)) return true;
  return readdirSync(dir).length === 0;
}

function looksLikePostgresCluster(dir: string): boolean {
  return existsSync(path.join(dir, "PG_VERSION"));
}

async function main() {
  const { default: EmbeddedPostgres } = await import("embedded-postgres");

  if (!directoryIsEmpty(DATA_DIR) && !looksLikePostgresCluster(DATA_DIR)) {
    console.error(`✖ ${DATA_DIR} exists but is not a PostgreSQL data directory.`);
    console.error("  Move it aside or delete it, then run `npm run demo:db` again.");
    process.exit(1);
  }

  console.log(`Starting demo PostgreSQL on ${HOST}:${PORT} (data: ${DATA_DIR})…`);

  const postgres = new EmbeddedPostgres({
    databaseDir: DATA_DIR,
    port: PORT,
    user: USER,
    password: PASSWORD,
    persistent: true,
    onLog: () => {},
    onError: (message) => {
      const text = message instanceof Error ? message.message : String(message);
      if (/FATAL|PANIC/i.test(text)) console.error(text.trim());
    },
  });

  if (!looksLikePostgresCluster(DATA_DIR)) {
    console.log("Creating a new database cluster…");
    await postgres.initialise();
  }

  await postgres.start();

  const url = `postgresql://${USER}:${PASSWORD}@${HOST}:${PORT}/postgres`;
  process.env.DATABASE_URL = url;

  const { runMigrations } = await import("../lib/migrations");
  await runMigrations();
  await runMigrations(); // idempotent; confirms the migration ledger is intact

  console.log("");
  console.log("✔ Demo database ready.");
  console.log(`  DATABASE_URL="${url}"`);
  console.log(`  Local data is stored in ${DATA_DIR}.`);
  console.log("  Stop with Ctrl+C - PostgreSQL shuts down cleanly and keeps your data.");

  let closing = false;
  const shutdown = async (signal: string) => {
    if (closing) return;
    closing = true;
    console.log(`\n${signal} received - stopping demo database…`);
    try {
      await postgres.stop();
      console.log("Demo database stopped.");
    } catch (error) {
      console.error("Could not stop the demo database cleanly:", error);
      process.exitCode = 1;
    } finally {
      process.exit();
    }
  };

  process.on("SIGINT", () => void shutdown("SIGINT"));
  process.on("SIGTERM", () => void shutdown("SIGTERM"));
}

main().catch((error) => {
  console.error("✖ Demo database failed to start:", error instanceof Error ? error.message : error);
  process.exit(1);
});
