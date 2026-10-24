"use server";

import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { adminUsers } from "@/lib/db/schema";
import { loginSchema } from "@/lib/validation";
import {
  createSessionCookie,
  clearSessionCookie,
  DUMMY_PASSWORD_HASH,
  verifyPassword,
} from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/request";

export type LoginState = { error?: string };

function safeNext(value: FormDataEntryValue | null): string {
  const next = typeof value === "string" ? value : "";
  if (next.startsWith("/admin") && !next.startsWith("//") && !next.includes("\\")) return next;
  return "/admin";
}

export async function loginAction(_previous: LoginState, formData: FormData): Promise<LoginState> {
  const ip = await getClientIp();
  const ipLimit = rateLimit(`login:ip:${ip}`, { max: 10, windowMs: 15 * 60_000 });
  if (!ipLimit.ok) {
    return {
      error: `Too many sign-in attempts. Try again in ${Math.ceil(ipLimit.retryAfterSeconds / 60)} minutes.`,
    };
  }

  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: "Enter a valid email address and password." };
  }

  const { email, password } = parsed.data;

  const emailLimit = rateLimit(`login:email:${email}`, { max: 8, windowMs: 15 * 60_000 });
  if (!emailLimit.ok) {
    return { error: "Too many sign-in attempts for this account. Please try again later." };
  }

  try {
    const db = await getDb();
    const [user] = await db
      .select()
      .from(adminUsers)
      .where(eq(adminUsers.email, email))
      .limit(1);

    const passwordValid = await verifyPassword(password, user?.passwordHash ?? DUMMY_PASSWORD_HASH);

    if (!user || !user.isActive || !passwordValid) {
      return { error: "Email or password is incorrect." };
    }

    await db
      .update(adminUsers)
      .set({ lastLoginAt: new Date(), updatedAt: new Date() })
      .where(eq(adminUsers.id, user.id));

    await createSessionCookie({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });
  } catch {
    return {
      error: "Sign-in is temporarily unavailable. Check the database configuration and try again.",
    };
  }

  redirect(safeNext(formData.get("next")));
}

export async function logoutAction(): Promise<void> {
  await clearSessionCookie();
  redirect("/admin/login?loggedOut=1");
}
