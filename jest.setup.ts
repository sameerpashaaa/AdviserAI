/**
 * jest.setup.ts
 *
 * Runs once per Jest worker before any test suite.
 * Sets environment variables needed by application code so that imports
 * don't throw during unit / integration tests.
 *
 * Values here are for test isolation only — they never reach production.
 */

// ── Database ───────────────────────────────────────────────────────────────
process.env.DATABASE_URL =
  process.env.DATABASE_URL ?? "postgres://test:test@localhost:5432/test_db";

// ── Auth0 ──────────────────────────────────────────────────────────────────
process.env.AUTH0_SECRET =
  process.env.AUTH0_SECRET ?? "test_secret_32_chars_minimum_here!!";
process.env.AUTH0_BASE_URL =
  process.env.AUTH0_BASE_URL ?? "http://localhost:3000";
process.env.AUTH0_ISSUER_BASE_URL =
  process.env.AUTH0_ISSUER_BASE_URL ?? "https://test.auth0.com";
process.env.AUTH0_CLIENT_ID = process.env.AUTH0_CLIENT_ID ?? "test_client_id";
process.env.AUTH0_CLIENT_SECRET =
  process.env.AUTH0_CLIENT_SECRET ?? "test_client_secret";

// ── Gemini ─────────────────────────────────────────────────────────────────
process.env.GEMINI_API_KEY = process.env.GEMINI_API_KEY ?? "test_gemini_key";

// ── Upstash Redis (leave empty so health checks use in-memory fallback) ────
process.env.UPSTASH_REDIS_REST_URL =
  process.env.UPSTASH_REDIS_REST_URL ?? "";
process.env.UPSTASH_REDIS_REST_TOKEN =
  process.env.UPSTASH_REDIS_REST_TOKEN ?? "";

// ── Misc ───────────────────────────────────────────────────────────────────
process.env.NODE_ENV = "test";
process.env.NEXT_RUNTIME = "nodejs";
