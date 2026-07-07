import { getDb } from "@/lib/db";
import { usageEvents, subscriptions, users } from "@/lib/db/schema";
import { eq, and, gte, count } from "drizzle-orm";

// ── Model Pricing per 1M tokens (in cents) ──────────────────────────────────
export const GEMINI_PRICING = {
  "gemini-2.5-flash": {
    inputCostPerMillion: 7.5, // 0.075 USD
    outputCostPerMillion: 30.0, // 0.30 USD
  },
  "gemini-1.5-flash": {
    inputCostPerMillion: 7.5,
    outputCostPerMillion: 30.0,
  },
} as const;

// ── Per-Tier Quotas (Queries & Reports per month) ───────────────────────────
export const TIER_QUOTAS = {
  free: {
    queriesPerMonth: 20,
    reportsPerMonth: 2,
  },
  pro: {
    queriesPerMonth: 200,
    reportsPerMonth: 20,
  },
  team: {
    queriesPerMonth: 1000,
    reportsPerMonth: 100,
  },
  enterprise: {
    queriesPerMonth: 10000,
    reportsPerMonth: 1000,
  },
} as const;

/**
 * Calculates LLM query cost in cents.
 */
export function calculateCostCents(
  model: string,
  inputTokens: number,
  outputTokens: number
): number {
  const pricing =
    GEMINI_PRICING[model as keyof typeof GEMINI_PRICING] || GEMINI_PRICING["gemini-2.5-flash"];
  const inputCost = (inputTokens / 1_000_000) * pricing.inputCostPerMillion;
  const outputCost = (outputTokens / 1_000_000) * pricing.outputCostPerMillion;

  // We keep costs as float cents internally, but return rounded cents for integer storage
  return Math.round(inputCost + outputCost);
}

/**
 * Check if the user has remaining quota for the specified event type in their billing cycle.
 */
export async function checkQuotaForUser(
  userId: string,
  eventType: "query" | "report_generated"
): Promise<{ ok: boolean; count: number; limit: number; error?: string }> {
  const db = getDb();

  // 1. Resolve user subscription tier
  const userList = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  const user = userList[0];
  if (!user) {
    return { ok: false, count: 0, limit: 0, error: "User not found" };
  }

  const tier = user.subscriptionTier;
  const quota = TIER_QUOTAS[tier];
  const limit = eventType === "query" ? quota.queriesPerMonth : quota.reportsPerMonth;

  // 2. Determine start date for counting usage (billing cycle start or current month start)
  let startDate = new Date();
  startDate.setDate(1); // Default to 1st of current month
  startDate.setHours(0, 0, 0, 0);

  const subList = await db
    .select()
    .from(subscriptions)
    .where(and(eq(subscriptions.userId, userId), eq(subscriptions.status, "active")))
    .limit(1);

  const sub = subList[0];
  if (sub && sub.currentPeriodStart) {
    startDate = new Date(sub.currentPeriodStart);
  }

  // 3. Count usage events since start date
  const [result] = await db
    .select({ count: count() })
    .from(usageEvents)
    .where(
      and(
        eq(usageEvents.userId, userId),
        eq(usageEvents.eventType, eventType),
        gte(usageEvents.createdAt, startDate)
      )
    );

  const currentCount = result?.count ?? 0;

  if (currentCount >= limit) {
    return {
      ok: false,
      count: currentCount,
      limit,
      error: `Monthly quota exceeded for subscription tier '${tier}'. Limit: ${limit}, Used: ${currentCount}.`,
    };
  }

  return { ok: true, count: currentCount, limit };
}
