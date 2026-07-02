import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;

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
