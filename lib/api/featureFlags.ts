import { getDb } from "@/lib/db";
import { featureFlags } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const TIER_ORDER: Record<string, number> = {
  free: 0,
  pro: 1,
  team: 2,
  enterprise: 3,
};

type CacheEntry = {
  enabled: boolean;
  minimumTier: string;
  expiresAt: number;
};

// Module-level cache with 60-second TTL
const cache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 60_000;

function isTierSufficient(userTier: string, minimumTier: string): boolean {
  const userLevel = TIER_ORDER[userTier] ?? 0;
  const requiredLevel = TIER_ORDER[minimumTier] ?? 0;
  return userLevel >= requiredLevel;
}

/**
 * Returns true if the feature flag is enabled AND the user's tier
 * meets or exceeds the flag's minimumTier requirement.
 */
export async function isFeatureEnabled(
  name: string,
  userTier: string
): Promise<boolean> {
  const now = Date.now();
  const cached = cache.get(name);

  if (cached && cached.expiresAt > now) {
    return cached.enabled && isTierSufficient(userTier, cached.minimumTier);
  }

  try {
    const db = getDb();
    const [flag] = await db
      .select()
      .from(featureFlags)
      .where(eq(featureFlags.name, name))
      .limit(1);

    if (!flag) {
      // Unknown flags default to enabled for backwards compatibility
      return true;
    }

    cache.set(name, {
      enabled: flag.enabled,
      minimumTier: flag.minimumTier,
      expiresAt: now + CACHE_TTL_MS,
    });

    return flag.enabled && isTierSufficient(userTier, flag.minimumTier);
  } catch {
    // Fail open on DB errors to avoid blocking features
    return true;
  }
}

/**
 * Returns all feature flags from the database (bypasses cache).
 */
export async function getAllFlags() {
  const db = getDb();
  return db.select().from(featureFlags).orderBy(featureFlags.name);
}

/**
 * Invalidate a specific flag's cache entry.
 */
export function invalidateFlagCache(name: string): void {
  cache.delete(name);
}
