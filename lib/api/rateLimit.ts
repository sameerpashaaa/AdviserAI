/**
 * Lightweight in-memory fixed-window rate limiter.
 *
 * Phase-1 pragmatic solution — works for a single-server / single-instance
 * deployment (e.g. one Vercel function instance). Replace with Redis-backed
 * (Upstash / @upstash/ratelimit) in Phase 2 when auth + DB are added.
 */

interface Bucket {
  tokens: number;
  resetAt: number;
}

const store = new Map<string, Bucket>();

/** Default: 20 requests per minute per IP. */
const DEFAULT_MAX = Number(process.env.RATE_LIMIT_MAX ?? 20);
const DEFAULT_WINDOW_MS = Number(process.env.RATE_LIMIT_WINDOW_MS ?? 60_000);

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  resetAt: number;
}

/**
 * Check (and consume) one token for the given key (typically an IP address).
 * Returns `{ ok: false }` when the limit is exceeded.
 */
export function rateLimit(
  key: string,
  max = DEFAULT_MAX,
  windowMs = DEFAULT_WINDOW_MS
): RateLimitResult {
  const now = Date.now();

  let bucket = store.get(key);
  if (!bucket || now >= bucket.resetAt) {
    // Create a fresh window.
    bucket = { tokens: max, resetAt: now + windowMs };
    store.set(key, bucket);
  }

  if (bucket.tokens <= 0) {
    return { ok: false, remaining: 0, resetAt: bucket.resetAt };
  }

  bucket.tokens -= 1;
  return { ok: true, remaining: bucket.tokens, resetAt: bucket.resetAt };
}

/**
 * Derive a rate-limit key from a NextRequest (uses `x-forwarded-for` or
 * `x-real-ip` or falls back to `"unknown"`).
 */
export function getClientKey(req: globalThis.Request): string {
  const forwarded = req.headers.get("x-forwarded-for") ?? "";
  const realIp = req.headers.get("x-real-ip") ?? "";
  if (forwarded) return forwarded.split(",")[0].trim();
  if (realIp) return realIp;
  return "unknown";
}

/**
 * Periodically prune stale entries so the map doesn't grow without bound.
 * Safe to call frequently; O(n) only over expired entries.
 */
const PRUNE_INTERVAL = 60_000; // every minute
if (typeof globalThis !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, bucket] of store) {
      if (now >= bucket.resetAt) store.delete(key);
    }
  }, PRUNE_INTERVAL);
}
