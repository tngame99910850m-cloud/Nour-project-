import path from "node:path";
import { existsSync, readFileSync } from "node:fs";
import { defineConfig } from "prisma/config";

// prisma.config.ts disables Prisma's automatic .env loading, so load it here
// for local CLI use. On Vercel, env vars are injected into process.env directly.
const envPath = path.join(process.cwd(), ".env");
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const m = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (m && process.env[m[1]] === undefined) {
      let v = (m[2] ?? "").trim();
      if (
        (v.startsWith('"') && v.endsWith('"')) ||
        (v.startsWith("'") && v.endsWith("'"))
      ) {
        v = v.slice(1, -1);
      }
      process.env[m[1]] = v;
    }
  }
}

export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),
  migrations: {
    seed: "tsx prisma/seed.ts",
  },
});
