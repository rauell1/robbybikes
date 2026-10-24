import "server-only";
import { createNeonAuth } from "@neondatabase/auth/next/server";

export const neonAuth = process.env.NEON_AUTH_BASE_URL
  ? createNeonAuth({
      baseUrl: process.env.NEON_AUTH_BASE_URL,
      cookies: {
        secret:
          process.env.NEON_AUTH_COOKIE_SECRET ||
          process.env.ADMIN_SESSION_SECRET ||
          "robbybikes-session-secret-neon-auth-cookie-32chars",
      },
    })
  : null;
