/**
 * Subscription tier cache using Upstash Redis.
 * Reduces DB round-trips on every authenticated request by caching the user's
 * subscription tier for 5 minutes.
 *
 * Falls back gracefully to a direct DB query when Redis is not configured.
 */

import { getDb } from "@/lib/db";
import { subscriptions } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { logger } from "@/lib/logger";

const CACHE_TTL_SECONDS = 300; // 5 minutes
const CACHE_KEY_PREFIX = "sub_tier:";

type SubscriptionTier = "free" | "pro" | "team" | "enterprise";

// Lazily initialise Redis only if env vars are present
function getRedis() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;

  const { Redis } = require("@upstash/redis");
  return new Redis({ url, token }) as { get: (k: string) => Promise<string | null>; set: (k: string, v: string, o: { ex: number }) => Promise<unknown>; del: (k: string) => Promise<unknown> };
}

async function getTierFromDb(userId: string): Promise<SubscriptionTier> {
  try {
    const db = getDb();
    const [sub] = await db
      .select({ plan: subscriptions.plan })
      .from(subscriptions)
      .where(eq(subscriptions.userId, userId))
      .orderBy(desc(subscriptions.createdAt))
      .limit(1);
    return (sub?.plan as SubscriptionTier) ?? "free";
  } catch (err) {
    logger.error("[subscriptionCache] DB query failed", err, { userId });
    return "free";
  }
}

/**
 * Returns the subscription tier for a user, checking Redis cache first.
 * Falls back to DB on cache miss or Redis unavailability.
 */
export async function getSubscriptionTier(userId: string): Promise<SubscriptionTier> {
  const redis = getRedis();
  const key = `${CACHE_KEY_PREFIX}${userId}`;

  if (redis) {
    try {
      const cached = await redis.get(key);
      if (cached) {
        return cached as SubscriptionTier;
      }
    } catch (err) {
      logger.warn("[subscriptionCache] Redis get failed, falling back to DB", { userId });
    }
  }

  const tier = await getTierFromDb(userId);

  if (redis) {
    try {
      await redis.set(key, tier, { ex: CACHE_TTL_SECONDS });
    } catch {
      // Non-fatal: cache write failure doesn't block the request
    }
  }

  return tier;
}

/**
 * Invalidates the cached subscription tier for a user.
 * Call this after any subscription update or cancellation.
 */
export async function invalidateSubscriptionCache(userId: string): Promise<void> {
  const redis = getRedis();
  if (!redis) return;

  const key = `${CACHE_KEY_PREFIX}${userId}`;
  try {
    await redis.del(key);
    logger.debug("[subscriptionCache] Cache invalidated", { userId });
  } catch (err) {
    logger.warn("[subscriptionCache] Redis del failed", { userId });
  }
}
