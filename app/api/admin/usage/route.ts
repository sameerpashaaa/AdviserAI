import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, isAdminContext } from "@/lib/api/requireAdmin";
import { getDb } from "@/lib/db";
import { users, usageEvents } from "@/lib/db/schema";
import { count, sql, gte } from "drizzle-orm";

export const dynamic = "force-dynamic";

// ── GET /api/admin/usage — aggregated usage analytics ──────────────────────
export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!isAdminContext(auth)) return auth;

  const db = getDb();
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [totalUsersResult] = await db.select({ value: count() }).from(users);

  const [queriesTodayResult] = await db
    .select({ value: count() })
    .from(usageEvents)
    .where(gte(usageEvents.createdAt, todayStart));

  const [queriesMonthResult] = await db
    .select({ value: count() })
    .from(usageEvents)
    .where(gte(usageEvents.createdAt, monthStart));

  // Queries by tier (join users to get tier)
  const queriesByTier = await db.execute(
    sql`
      SELECT u.subscription_tier AS tier, COUNT(ue.id)::int AS total
      FROM usage_events ue
      JOIN users u ON ue.user_id = u.id
      WHERE ue.created_at >= ${monthStart}
      GROUP BY u.subscription_tier
      ORDER BY total DESC
    `
  );

  // Top routes by usage this month
  const topRoutes = await db.execute(
    sql`
      SELECT route, COUNT(id)::int AS total
      FROM usage_events
      WHERE created_at >= ${monthStart}
      GROUP BY route
      ORDER BY total DESC
      LIMIT 10
    `
  );

  // Users by tier breakdown
  const usersByTier = await db.execute(
    sql`
      SELECT subscription_tier AS tier, COUNT(id)::int AS total
      FROM users
      WHERE deleted_at IS NULL
      GROUP BY subscription_tier
      ORDER BY total DESC
    `
  );

  return NextResponse.json({
    totalUsers: totalUsersResult?.value ?? 0,
    queriesToday: queriesTodayResult?.value ?? 0,
    queriesThisMonth: queriesMonthResult?.value ?? 0,
    queriesByTier: queriesByTier.rows,
    topRoutes: topRoutes.rows,
    usersByTier: usersByTier.rows,
    generatedAt: now.toISOString(),
  });
}
