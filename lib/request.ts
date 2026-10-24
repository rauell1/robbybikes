import { headers } from "next/headers";

/**
 * Best-effort client IP for rate limiting only. It is never stored with
 * enquiry records.
 */
export async function getClientIp(): Promise<string> {
  const headerStore = await headers();
  const forwarded = headerStore.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first.slice(0, 64);
  }
  return (
    headerStore.get("cf-connecting-ip") ??
    headerStore.get("x-real-ip") ??
    "unknown"
  );
}
