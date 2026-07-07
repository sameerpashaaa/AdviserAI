import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, isAdminContext } from "@/lib/api/requireAdmin";
import { getDb } from "@/lib/db";
import { featureFlags, auditLogs } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { invalidateFlagCache } from "@/lib/api/featureFlags";
import { z } from "zod";

export const dynamic = "force-dynamic";

const patchSchema = z.object({
  name: z.string().min(1),
  enabled: z.boolean().optional(),
  minimumTier: z.enum(["free", "pro", "team", "enterprise"]).optional(),
});

// ── GET /api/admin/flags — list all feature flags ──────────────────────────
export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!isAdminContext(auth)) return auth;

  const db = getDb();
  const flags = await db.select().from(featureFlags).orderBy(featureFlags.name);
  return NextResponse.json({ flags });
}

// ── PATCH /api/admin/flags — toggle or update a flag ──────────────────────
export async function PATCH(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!isAdminContext(auth)) return auth;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const { name, enabled, minimumTier } = parsed.data;
  const db = getDb();

  const [existing] = await db
    .select()
    .from(featureFlags)
    .where(eq(featureFlags.name, name))
    .limit(1);

  if (!existing) {
    // Create new flag if it doesn't exist
    const [created] = await db
      .insert(featureFlags)
      .values({
        name,
        enabled: enabled ?? true,
        minimumTier: minimumTier ?? "free",
      })
      .returning();

    return NextResponse.json({ success: true, flag: created, created: true });
  }

  const updates: Partial<typeof featureFlags.$inferInsert> = { updatedAt: new Date() };
  if (enabled !== undefined) updates.enabled = enabled;
  if (minimumTier) updates.minimumTier = minimumTier;

  const [updated] = await db
    .update(featureFlags)
    .set(updates)
    .where(eq(featureFlags.name, name))
    .returning();

  // Invalidate module-level cache for this flag
  invalidateFlagCache(name);

  await db.insert(auditLogs).values({
    userId: auth.dbUser.id,
    action: "admin.feature_flag.update",
    resourceType: "feature_flag",
    resourceId: existing.id,
    oldValue: { enabled: existing.enabled, minimumTier: existing.minimumTier },
    newValue: { enabled: updated.enabled, minimumTier: updated.minimumTier },
  });

  return NextResponse.json({ success: true, flag: updated });
}
