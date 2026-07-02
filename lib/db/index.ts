import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

// Runtime: prefer the pgBouncer pooled URL (port 6543).
// DATABASE_URL_NON_POOLING is intentionally last — it bypasses the pool and
// should only be used by drizzle-kit for schema migrations.
const connectionString =
  process.env.DATABASE_URL ||
  process.env.STORAGE_POSTGRES_PRISMA_URL ||
  process.env.STORAGE_POSTGRES_URL ||
  process.env.DATABASE_URL_NON_POOLING ||
  process.env.STORAGE_POSTGRES_URL_NON_POOLING;

let pool: Pool | null = null;
let dbInstance: ReturnType<typeof drizzle> | null = null;

export function getDb() {
  if (!connectionString) {
    throw new Error("DATABASE_URL is required to initialize the database layer.");
  }

  if (!pool) {
    pool = new Pool({ connectionString });
  }

  if (!dbInstance) {
    dbInstance = drizzle(pool);
  }

  return dbInstance;
}

export function getPool() {
  if (!connectionString) {
    throw new Error("DATABASE_URL is required to initialize the database layer.");
  }

  if (!pool) {
    pool = new Pool({ connectionString });
  }

  return pool;
}
