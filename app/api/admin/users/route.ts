import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, isAdminContext } from "@/lib/api/requireAdmin";
import { getDb } from "@/lib/db";
import { users, auditLogs } from "@/lib/db/schema";
import { eq, desc, isNull } from "drizzle-orm";
import { z } from "zod";

export const dynamic = "force-dynamic";

const patchSchema = z.object({
  userId: z.string().uuid(),
  role: z.enum(["user", "admin", "super_admin"]).optional(),
  subscriptionTier: z.enum(["free", "pro", "team", "enterprise"]).optional(),
});

const deleteSchema = z.object({
  userId: z.string().uuid(),
});

// ── GET /api/admin/users — paginated user list ──────────────────────────────
export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!isAdminContext(auth)) return auth;

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") ?? "20")));
  const offset = (page - 1) * limit;

  const db = getDb();
  const rows = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
      subscriptionTier: users.subscriptionTier,
      createdAt: users.createdAt,
      lastActiveAt: users.lastActiveAt,
      deletedAt: users.deletedAt,
    })
    .from(users)
    .orderBy(desc(users.createdAt))
    .limit(limit)
    .offset(offset);

  return NextResponse.json({ users: rows, page, limit });
}

// ── PATCH /api/admin/users — update role or tier ────────────────────────────
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

  const { userId, role, subscriptionTier } = parsed.data;
  if (!role && !subscriptionTier) {
    return NextResponse.json({ error: "Provide role or subscriptionTier to update" }, { status: 400 });
  }

  const db = getDb();
  const [existing] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!existing) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const updates: Partial<typeof users.$inferInsert> = { updatedAt: new Date() };
  if (role) updates.role = role;
  if (subscriptionTier) updates.subscriptionTier = subscriptionTier;

  const [updated] = await db.update(users).set(updates).where(eq(users.id, userId)).returning();

  // Write audit log
  await db.insert(auditLogs).values({
    userId: auth.dbUser.id,
    action: "admin.user.update",
    resourceType: "user",
    resourceId: userId,
    oldValue: { role: existing.role, subscriptionTier: existing.subscriptionTier },
    newValue: { role: updated.role, subscriptionTier: updated.subscriptionTier },
  });

  return NextResponse.json({ success: true, user: updated });
}

// ── DELETE /api/admin/users — soft-delete user ──────────────────────────────
export async function DELETE(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!isAdminContext(auth)) return auth;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = deleteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const { userId } = parsed.data;
  if (userId === auth.dbUser.id) {
    return NextResponse.json({ error: "Cannot delete your own account via admin panel" }, { status: 400 });
  }

  const db = getDb();
  const [existing] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!existing) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const now = new Date();
  await db.update(users).set({ deletedAt: now, updatedAt: now }).where(eq(users.id, userId));

  await db.insert(auditLogs).values({
    userId: auth.dbUser.id,
    action: "admin.user.soft_delete",
    resourceType: "user",
    resourceId: userId,
    oldValue: { deletedAt: null },
    newValue: { deletedAt: now.toISOString() },
  });

  return NextResponse.json({ success: true, message: "User soft-deleted" });
}
