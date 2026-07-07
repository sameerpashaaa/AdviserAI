import { Redis } from "@upstash/redis";

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

// ── Upstash Redis Client Initialization ─────────────────────────────────────
const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

/**
 * Check (and consume) one token for the given key (IP or user ID).
 * Uses Upstash Redis if configured, otherwise falls back to local in-memory.
 */
export async function rateLimit(
  key: string,
  max = DEFAULT_MAX,
  windowMs = DEFAULT_WINDOW_MS
): Promise<RateLimitResult> {
  if (!redis) {
    // Fall back to in-memory rate limiting in development/local if Redis config is absent
    return rateLimitInMemory(key, max, windowMs);
  }

  try {
    const now = Date.now();
    const redisKey = `adviserai:ratelimit:${key}`;

    // Increment request count
    const count = await redis.incr(redisKey);

    if (count === 1) {
      // First request in the window: set expiration
      await redis.pexpire(redisKey, windowMs);
      return { ok: true, remaining: max - 1, resetAt: now + windowMs };
    }

    const pttl = await redis.pttl(redisKey);
    const resetAt = pttl > 0 ? now + pttl : now + windowMs;
    const remaining = Math.max(0, max - count);

    return {
      ok: count <= max,
      remaining,
      resetAt,
    };
  } catch (error) {
    console.error("[RateLimit Error] Upstash Redis rate limit failed, falling back to memory:", error);
    return rateLimitInMemory(key, max, windowMs);
  }
}

/**
 * Local in-memory fixed-window rate limiter fallback.
 */
function rateLimitInMemory(
  key: string,
  max = DEFAULT_MAX,
  windowMs = DEFAULT_WINDOW_MS
): RateLimitResult {
  const now = Date.now();

  let bucket = store.get(key);
  if (!bucket || now >= bucket.resetAt) {
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
 * Derive a rate-limit key from a NextRequest (uses x-forwarded-for or x-real-ip).
 */
export function getClientKey(req: globalThis.Request): string {
  const forwarded = req.headers.get("x-forwarded-for") ?? "";
  const realIp = req.headers.get("x-real-ip") ?? "";
  if (forwarded) return forwarded.split(",")[0].trim();
  if (realIp) return realIp;
  return "unknown";
}

/**
 * Periodically prune stale entries so the local fallback map doesn't grow without bound.
 */
const PRUNE_INTERVAL = 60_000;
if (typeof globalThis !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, bucket] of store) {
      if (now >= bucket.resetAt) store.delete(key);
    }
  }, PRUNE_INTERVAL);
}
