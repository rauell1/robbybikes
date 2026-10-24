import "server-only";
import { createRealtime, rawSql } from "@neon/realtime/server";

type RealtimeInstance = ReturnType<typeof createRealtime>;

let realtimeInstance: RealtimeInstance | null = null;

export function getRealtimeServer(): RealtimeInstance | null {
  const url = process.env.NEON_REALTIME_URL;
  const secret = process.env.NEON_REALTIME_SECRET;
  if (!url || !secret) return null;

  realtimeInstance ??= createRealtime({
    url,
    secret,
    db: "neondb",
  });
  return realtimeInstance;
}

export async function sealMotorcyclesLiveQuery(): Promise<{
  ok: boolean;
  sealed?: unknown;
  url?: string;
  error?: string;
}> {
  const realtime = getRealtimeServer();
  if (!realtime) {
    return { ok: false, error: "Realtime environment variables are not configured." };
  }

  try {
    const query = rawSql(
      "SELECT id, make, model, price_kes, status FROM motorcycles ORDER BY created_at DESC LIMIT 10",
    );
    const sealed = await realtime.seal({ query });
    return {
      ok: true,
      sealed,
      url: process.env.NEON_REALTIME_URL,
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Failed to seal query",
    };
  }
}
