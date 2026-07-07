import { NextResponse } from "next/server";
import { getSessionFromCookiesAsync } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { conversations, reports } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { z } from "zod";

const renameSchema = z.object({
  conversationId: z.string().uuid(),
  title: z.string().trim().min(1).max(256),
});

const pinSchema = z.object({
  conversationId: z.string().uuid(),
  pinned: z.boolean(),
});

// ── PUT: Rename conversation ────────────────────────────────────────────────
export async function PUT(req: Request) {
  const session = await getSessionFromCookiesAsync();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const db = getDb();

  try {
    const body = await req.json();
    const parsed = renameSchema.parse(body);

    // Verify ownership
    const existing = await db
      .select()
      .from(conversations)
      .where(
        and(
          eq(conversations.id, parsed.conversationId),
          eq(conversations.userId, session.userId)
        )
      )
      .limit(1);

    if (!existing[0]) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    const updated = await db
      .update(conversations)
      .set({
        title: parsed.title,
        updatedAt: new Date(),
      })
      .where(eq(conversations.id, parsed.conversationId))
      .returning();

    return NextResponse.json({ success: true, conversation: updated[0] });
  } catch (err) {
    console.error("[conversation/rename]", err);
    return NextResponse.json({ error: "Failed to rename conversation" }, { status: 500 });
  }
}

// ── DELETE: Soft-delete conversation ────────────────────────────────────────
export async function DELETE(req: Request) {
  const session = await getSessionFromCookiesAsync();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const db = getDb();

  try {
    const { searchParams } = new URL(req.url);
    const conversationId = searchParams.get("conversationId");

    if (!conversationId) {
      return NextResponse.json({ error: "Missing conversationId" }, { status: 400 });
    }

    // Verify ownership
    const existing = await db
      .select()
      .from(conversations)
      .where(
        and(
          eq(conversations.id, conversationId),
          eq(conversations.userId, session.userId)
        )
      )
      .limit(1);

    if (!existing[0]) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    const deleteTime = new Date();

    // Transactional soft delete: conversation and nested reports
    await db.transaction(async (tx) => {
      await tx
        .update(conversations)
        .set({
          deletedAt: deleteTime,
          updatedAt: deleteTime,
        })
        .where(eq(conversations.id, conversationId));

      await tx
        .update(reports)
        .set({
          deletedAt: deleteTime,
          updatedAt: deleteTime,
        })
        .where(eq(reports.conversationId, conversationId));
    });

    return NextResponse.json({ success: true, message: "Conversation soft-deleted successfully" });
  } catch (err) {
    console.error("[conversation/delete]", err);
    return NextResponse.json({ error: "Failed to delete conversation" }, { status: 500 });
  }
}

// ── PATCH: Toggle conversation pinned state ─────────────────────────────────
export async function PATCH(req: Request) {
  const session = await getSessionFromCookiesAsync();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const db = getDb();

  try {
    const body = await req.json();
    const parsed = pinSchema.parse(body);

    // Verify ownership
    const existing = await db
      .select()
      .from(conversations)
      .where(
        and(
          eq(conversations.id, parsed.conversationId),
          eq(conversations.userId, session.userId)
        )
      )
      .limit(1);

    if (!existing[0]) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    const updated = await db
      .update(conversations)
      .set({
        pinned: parsed.pinned,
        updatedAt: new Date(),
      })
      .where(eq(conversations.id, parsed.conversationId))
      .returning();

    return NextResponse.json({ success: true, conversation: updated[0] });
  } catch (err) {
    console.error("[conversation/pin]", err);
    return NextResponse.json({ error: "Failed to pin/unpin conversation" }, { status: 500 });
  }
}
