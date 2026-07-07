import { NextResponse } from "next/server";
import { getSessionFromCookiesAsync } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { notifications } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { z } from "zod";

const createNotificationSchema = z.object({
  title: z.string().trim().min(1).max(256),
  message: z.string().trim().min(1).max(2048),
  type: z.enum(["info", "warning", "success", "error"]).default("info"),
});

const readNotificationSchema = z.object({
  id: z.string().uuid().optional(),
});

// ── GET: Retrieve all user notifications ─────────────────────────────────────
export async function GET() {
  const session = await getSessionFromCookiesAsync();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const db = getDb();

  try {
    const list = await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, session.userId))
      .orderBy(notifications.read, notifications.createdAt);

    return NextResponse.json({ notifications: list });
  } catch (err) {
    console.error("[notifications/get]", err);
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
  }
}

// ── PUT: Mark notification(s) as read ────────────────────────────────────────
export async function PUT(req: Request) {
  const session = await getSessionFromCookiesAsync();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const db = getDb();

  try {
    const body = await req.json().catch(() => ({}));
    const parsed = readNotificationSchema.parse(body);

    const now = new Date();

    if (parsed.id) {
      // Mark a single notification as read (verify ownership)
      const updated = await db
        .update(notifications)
        .set({ read: true, readAt: now })
        .where(
          and(
            eq(notifications.id, parsed.id),
            eq(notifications.userId, session.userId)
          )
        )
        .returning();

      if (!updated[0]) {
        return NextResponse.json({ error: "Notification not found" }, { status: 404 });
      }

      return NextResponse.json({ success: true, notification: updated[0] });
    } else {
      // Mark all user's notifications as read
      await db
        .update(notifications)
        .set({ read: true, readAt: now })
        .where(
          and(
            eq(notifications.userId, session.userId),
            eq(notifications.read, false)
          )
        );

      return NextResponse.json({ success: true, message: "All notifications marked as read" });
    }
  } catch (err) {
    console.error("[notifications/read]", err);
    return NextResponse.json({ error: "Failed to update notifications" }, { status: 500 });
  }
}

// ── POST: Create a notification (for system/testing alerts) ──────────────────
export async function POST(req: Request) {
  const session = await getSessionFromCookiesAsync();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const db = getDb();

  try {
    const body = await req.json();
    const parsed = createNotificationSchema.parse(body);

    const inserted = await db
      .insert(notifications)
      .values({
        userId: session.userId,
        title: parsed.title,
        message: parsed.message,
        type: parsed.type,
      })
      .returning();

    return NextResponse.json({ success: true, notification: inserted[0] });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: `Validation error: ${err.issues[0].message}` }, { status: 400 });
    }
    console.error("[notifications/create]", err);
    return NextResponse.json({ error: "Failed to create notification" }, { status: 500 });
  }
}
