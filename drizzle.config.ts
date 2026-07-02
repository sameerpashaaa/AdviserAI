import { defineConfig } from "drizzle-kit";
import { config } from "dotenv";

// Load local environment variables
config({ path: ".env.local" });

export default defineConfig({
  dialect: "postgresql",
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    // Must use direct (non-pooling) connection for DDL — pgBouncer blocks CREATE TABLE etc.
    // Uses the true direct host: db.<ref>.supabase.co:5432 (not the pooler)
    url:
      process.env.DATABASE_URL_NON_POOLING ??
      process.env.STORAGE_POSTGRES_URL_NON_POOLING ??
      process.env.DATABASE_URL ??
      process.env.STORAGE_POSTGRES_URL ??
      "",
    ssl: true,
  },
});
