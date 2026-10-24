import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

/**
 * Minimal .env loader for CLI scripts (Next.js loads env files for the app).
 * Shell variables win; .env.local wins over .env.
 */
export function loadEnv(): void {
  for (const file of [".env.local", ".env"]) {
    const fullPath = path.resolve(process.cwd(), file);
    if (!existsSync(fullPath)) continue;

    const contents = readFileSync(fullPath, "utf8");
    for (const rawLine of contents.split(/\r?\n/)) {
      const line = rawLine.trim();
      if (!line || line.startsWith("#")) continue;
      const match = /^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/.exec(line);
      if (!match) continue;

      const key = match[1];
      let value = match[2] ?? "";
      if (!key || process.env[key] !== undefined) continue;

      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      } else {
        value = value.replace(/\s+#.*$/, "").trim();
      }

      process.env[key] = value;
    }
  }
}
