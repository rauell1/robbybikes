import { randomBytes } from "node:crypto";
import { loadEnv } from "./load-env";

loadEnv();

function argument(name: string): string | undefined {
  const prefix = `--${name}=`;
  const withEquals = process.argv.find((arg) => arg.startsWith(prefix));
  if (withEquals) return withEquals.slice(prefix.length);
  const index = process.argv.indexOf(`--${name}`);
  if (index >= 0) return process.argv[index + 1];
  return undefined;
}

async function main() {
  const { z } = await import("zod");
  const { getDb } = await import("../lib/db");
  const { runMigrations } = await import("../lib/migrations");
  const { adminUsers } = await import("../lib/db/schema");
  const { hashPassword } = await import("../lib/password");
  const { eq } = await import("drizzle-orm");

  const email = (argument("email") ?? process.env.ADMIN_EMAIL ?? "").trim().toLowerCase();
  const name = argument("name") ?? process.env.ADMIN_NAME ?? "Robbybikes administrator";
  const roleInput = argument("role") ?? "admin";
  const suppliedPassword = argument("password") ?? process.env.ADMIN_PASSWORD;
  const generated = !suppliedPassword;
  const password = suppliedPassword ?? randomBytes(12).toString("base64url");

  const parsedEmail = z.email().safeParse(email);
  if (!parsedEmail.success) {
    console.error("✖ Provide a valid email with --email you@example.com");
    process.exit(1);
  }
  if (password.length < 12) {
    console.error("✖ The password must be at least 12 characters.");
    process.exit(1);
  }
  if (roleInput !== "admin" && roleInput !== "staff") {
    console.error("✖ Role must be admin or staff.");
    process.exit(1);
  }

  await runMigrations();
  const db = await getDb();
  const passwordHash = await hashPassword(password);

  const [existing] = await db
    .select({ id: adminUsers.id })
    .from(adminUsers)
    .where(eq(adminUsers.email, parsedEmail.data))
    .limit(1);

  if (existing) {
    await db
      .update(adminUsers)
      .set({
        passwordHash,
        name,
        role: roleInput,
        isActive: true,
        updatedAt: new Date(),
      })
      .where(eq(adminUsers.id, existing.id));
    console.log(`✔ Password reset for existing administrator ${parsedEmail.data}.`);
  } else {
    await db.insert(adminUsers).values({
      email: parsedEmail.data,
      name,
      role: roleInput,
      passwordHash,
    });
    console.log(`✔ Created administrator ${parsedEmail.data}.`);
  }

  if (generated) {
    console.log("");
    console.log("  Temporary password (shown once — store it securely):");
    console.log(`  ${password}`);
    console.log("");
    console.log("  Sign in at /admin/login and change it soon by re-running this script.");
  }

  process.exit(0);
}

main().catch((error) => {
  console.error("✖ Could not create the administrator:", error instanceof Error ? error.message : error);
  process.exit(1);
});
