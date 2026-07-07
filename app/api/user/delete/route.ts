import { NextResponse } from "next/server";
import { getSessionFromCookiesAsync } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { users, workspaces, conversations, reports } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(): Promise<NextResponse> {
  // ── Authentication Check ───────────────────────────────────────────────────
  const session = await getSessionFromCookiesAsync();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const db = getDb();

  try {
    // 1. Resolve DB user
    const dbUserList = await db
      .select()
      .from(users)
      .where(eq(users.email, session.email))
      .limit(1);

    const user = dbUserList[0];
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.deletedAt) {
      return NextResponse.json({ error: "Account is already scheduled for deletion" }, { status: 400 });
    }

    const deletionTime = new Date();

    // ── Soft delete user and all user owned resources ────────────────────────
    await db.transaction(async (tx) => {
      // Soft delete user settings/preferences (optional, but keep user row)
      await tx
        .update(users)
        .set({ deletedAt: deletionTime, updatedAt: deletionTime })
        .where(eq(users.id, user.id));

      // Soft delete user's workspaces
      await tx
        .update(workspaces)
        .set({ deletedAt: deletionTime, updatedAt: deletionTime })
        .where(eq(workspaces.userId, user.id));

      // Soft delete user's conversations
      await tx
        .update(conversations)
        .set({ deletedAt: deletionTime, updatedAt: deletionTime })
        .where(eq(conversations.userId, user.id));

      // Soft delete user's reports
      await tx
        .update(reports)
        .set({ deletedAt: deletionTime, updatedAt: deletionTime })
        .where(eq(reports.userId, user.id));
    });

    return NextResponse.json({
      success: true,
      message: "Account scheduled for deletion. You have a 30-day grace period to contact support and recover your account.",
      gracePeriodEndsAt: new Date(deletionTime.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    });
  } catch (error) {
    console.error("[user/delete] Soft deletion failed:", error);
    return NextResponse.json({ error: "Failed to schedule account deletion" }, { status: 500 });
  }
}
