import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { sql } from "drizzle-orm";
import postgres from "postgres";
import * as schema from "./schema";

export type Database = PostgresJsDatabase<typeof schema>;
export type DatabaseDriver = "neon" | "local" | "postgres";

type DbGlobal = {
  db?: Promise<Database>;
  client?: ReturnType<typeof postgres>;
};

const globalForDb = globalThis as typeof globalThis & {
  __robbybikesDb?: DbGlobal;
};

function store(): DbGlobal {
  globalForDb.__robbybikesDb ??= {};
  return globalForDb.__robbybikesDb;
}

function connectionString(): string {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) {
    throw new Error(
      "DATABASE_URL is not configured. Set it to your Neon connection string. For local " +
        "development, run `npm run demo:db` and copy the printed DATABASE_URL into .env.local.",
    );
  }
  return url;
}

/** Describes where the current connection points, for display in the admin UI. */
export function describeDatabase(): { driver: DatabaseDriver; host: string; label: string } {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) {
    return { driver: "local", host: "", label: "Not configured" };
  }
  try {
    const parsed = new URL(url);
    const host = parsed.hostname;
    if (host.includes("neon.tech")) {
      return { driver: "neon", host, label: "Neon PostgreSQL" };
    }
    if (host === "127.0.0.1" || host === "localhost") {
      return { driver: "local", host, label: "Local demo PostgreSQL" };
    }
    return { driver: "postgres", host, label: "PostgreSQL" };
  } catch {
    return { driver: "postgres", host: "", label: "PostgreSQL" };
  }
}

async function createDatabase(): Promise<Database> {
  const client = postgres(connectionString(), {
    max: 5,
    prepare: false, // required by Neon's pooled (PgBouncer) endpoint
    idle_timeout: 20,
    connect_timeout: 15,
  });
  store().client = client;
  return drizzle(client, { schema });
}

export function getDb(): Promise<Database> {
  const state = store();
  state.db ??= createDatabase();
  return state.db;
}

export async function getDbDriver(): Promise<DatabaseDriver> {
  return describeDatabase().driver;
}

export async function checkDatabaseConnection(): Promise<{
  ok: boolean;
  label: string;
  error?: string;
}> {
  const { label } = describeDatabase();
  try {
    const db = await getDb();
    await db.execute(sql`select 1`);
    return { ok: true, label };
  } catch (error) {
    return {
      ok: false,
      label,
      error: error instanceof Error ? error.message : "Unknown database error",
    };
  }
}

export { schema };
