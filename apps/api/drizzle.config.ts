import "dotenv/config";

import { env } from "node:process";

import { type Config, defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./drizzle/migrations",
  schema: "./src/db/schema",
  dialect: "postgresql",
  dbCredentials: {
    url: env.DATABASE_URL ?? "failed to load DATABASE_URL",
  },
}) satisfies Config;
