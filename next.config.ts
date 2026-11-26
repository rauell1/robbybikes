import type { NextConfig } from "next";

const allowedOrigins = (process.env.SERVER_ACTION_ALLOWED_ORIGINS ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const contentSecurityPolicy = [
  "default-src 'self'",
  // Next.js inlines its bootstrap scripts; Cloudflare Web Analytics is the only outside script.
  "script-src 'self' 'unsafe-inline' https://static.cloudflareinsights.com",
  "style-src 'self' 'unsafe-inline'",
  // Bike photos come from object storage, older uploads and pasted links, so any https image.
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "connect-src 'self' https:",
  "frame-src 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
].join("; ");

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  serverExternalPackages: ["postgres", "embedded-postgres"],
  // See lib/undici-fetch.ts: undici cannot run on Workers.
  turbopack: { resolveAlias: { undici: "./lib/undici-fetch.ts" } },
  experimental: {
    serverActions: {
      bodySizeLimit: "25mb",
      ...(allowedOrigins.length > 0 ? { allowedOrigins } : {}),
    },
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "localhost" },
    ],
    localPatterns: [{ pathname: "/**" }],
  },
  async redirects() {
    // The workers.dev address skips the firewall rules on the custom domain and
    // split search ranking between two addresses, so it sends visitors on.
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "robbybikes.rauell.workers.dev" }],
        destination: "https://robbybikes.rauell.systems/:path*",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=()",
          },
          { key: "X-DNS-Prefetch-Control", value: "on" },
          { key: "Content-Security-Policy", value: contentSecurityPolicy },
        ],
      },
      {
        source: "/admin/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
};

export default nextConfig;
