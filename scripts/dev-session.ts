import { loadEnv } from "./load-env";
loadEnv();

async function main() {
  const { getDb } = await import("../lib/db");
  const { adminUsers } = await import("../lib/db/schema");
  const { signSessionToken } = await import("../lib/auth-core");
  const db = await getDb();
  const [user] = await db.select().from(adminUsers).limit(1);
  if (!user) throw new Error("no admin");
  const token = await signSessionToken({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  });
  console.log(token);
  process.exit(0);
}
main();
