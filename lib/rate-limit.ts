/**
 * Lightweight in-memory rate limiter.
 *
 * This protects a single server instance (fine for local use and small
 * deployments). On multi-instance serverless hosting, pair it with a platform
 * WAF rule or a shared store such as Upstash Redis. Limitation documented in
 * README.md and docs/SECURITY.md.
 */
type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();
let lastSweep = Date.now();

function sweep(now: number) {
  if (now - lastSweep < 60_000) return;
  lastSweep = now;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

export type RateLimitResult = {
  ok: boolean;
  remaining: number;
  retryAfterSeconds: number;
};

export function rateLimit(
  key: string,
  { max, windowMs }: { max: number; windowMs: number },
): RateLimitResult {
  const now = Date.now();
  sweep(now);

  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: max - 1, retryAfterSeconds: 0 };
  }

  if (bucket.count >= max) {
    return {
      ok: false,
      remaining: 0,
      retryAfterSeconds: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
    };
  }

  bucket.count += 1;
  return { ok: true, remaining: max - bucket.count, retryAfterSeconds: 0 };
}

/** Test helper. */
export function resetRateLimits(): void {
  buckets.clear();
}

type RateLimiterBinding = { limit(options: { key: string }): Promise<{ success: boolean }> };

/**
 * Cloudflare rate limiting binding (wrangler.jsonc "ratelimits"), counted
 * across every Worker copy, which the in-memory limit above cannot do. Its
 * window is at most 60 seconds, so it guards bursts while rateLimit() keeps
 * the longer windows. Fails open where the binding is missing (local
 * development, tests) or errors, so a limiter fault never blocks customers.
 */
export async function sharedRateLimit(
  binding: "LOGIN_RATE_LIMITER" | "ENQUIRY_RATE_LIMITER",
  key: string,
): Promise<boolean> {
  try {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    const limiter = (getCloudflareContext().env as unknown as Record<string, RateLimiterBinding | undefined>)[binding];
    if (!limiter) return true;
    return (await limiter.limit({ key })).success;
  } catch {
    return true;
  }
}
