import { SignJWT, jwtVerify } from "jose";
import type { AdminRole } from "@/lib/db/schema";

export const SESSION_COOKIE = "robbybikes_admin";
export const SESSION_TTL_SECONDS = 60 * 60 * 8;

export type AdminSession = {
  id: string;
  email: string;
  name: string | null;
  role: AdminRole;
};

const ISSUER = "robbybikes";
const AUDIENCE = "robbybikes-admin";

function secretKey(): Uint8Array {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("ADMIN_SESSION_SECRET must be set to at least 32 characters.");
  }
  return new TextEncoder().encode(secret);
}

export async function signSessionToken(session: AdminSession): Promise<string> {
  return new SignJWT({
    email: session.email,
    name: session.name,
    role: session.role,
  })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setSubject(session.id)
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(secretKey());
}

export async function verifySessionToken(token: string): Promise<AdminSession | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey(), {
      issuer: ISSUER,
      audience: AUDIENCE,
      algorithms: ["HS256"],
    });
    if (!payload.sub || typeof payload.email !== "string") return null;
    const role = payload.role === "staff" ? "staff" : "admin";
    return {
      id: payload.sub,
      email: payload.email,
      name: typeof payload.name === "string" ? payload.name : null,
      role,
    };
  } catch {
    return null;
  }
}
