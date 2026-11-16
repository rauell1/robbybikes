import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import kvIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/kv-incremental-cache";
import { withRegionalCache } from "@opennextjs/cloudflare/overrides/incremental-cache/regional-cache";
import memoryQueue from "@opennextjs/cloudflare/overrides/queue/memory-queue";

// Serve prerendered and ISR pages from cache instead of rendering them on
// every request: Workers KV holds them (filled at deploy), the Cloudflare cache
// in each data center keeps a copy close to visitors, and the queue refreshes
// pages in the background when their revalidate time passes.
const config = defineCloudflareConfig({
  incrementalCache: withRegionalCache(kvIncrementalCache, { mode: "long-lived" }),
  queue: memoryQueue,
  enableCacheInterception: true,
});

export default config;
