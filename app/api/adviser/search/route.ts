import { NextResponse } from "next/server";
import { getSessionFromCookiesAsync } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { conversations, reports, knowledgeItems } from "@/lib/db/schema";
import { eq, and, ilike, or, isNull } from "drizzle-orm";

export async function GET(req: Request) {
  const session = await getSessionFromCookiesAsync();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q")?.trim() || "";

  if (!query) {
    return NextResponse.json({ conversations: [], reports: [], knowledgeItems: [] });
  }

  const db = getDb();

  try {
    // ── 1. Search conversations ──────────────────────────────────────────────
    const matchedConversations = await db
      .select()
      .from(conversations)
      .where(
        and(
          eq(conversations.userId, session.userId),
          isNull(conversations.deletedAt),
          or(
            ilike(conversations.title, `%${query}%`),
            ilike(conversations.summary, `%${query}%`)
          )
        )
      )
      .limit(30);

    // ── 2. Search reports ───────────────────────────────────────────────────
    const matchedReports = await db
      .select()
      .from(reports)
      .where(
        and(
          eq(reports.userId, session.userId),
          isNull(reports.deletedAt),
          or(
            ilike(reports.title, `%${query}%`),
            ilike(reports.summary, `%${query}%`)
          )
        )
      )
      .limit(30);

    // ── 3. Search knowledge items ────────────────────────────────────────────
    const matchedKnowledgeItems = await db
      .select()
      .from(knowledgeItems)
      .where(
        and(
          eq(knowledgeItems.userId, session.userId),
          ilike(knowledgeItems.title, `%${query}%`)
        )
      )
      .limit(30);

    return NextResponse.json({
      conversations: matchedConversations,
      reports: matchedReports,
      knowledgeItems: matchedKnowledgeItems,
    });
  } catch (err) {
    console.error("[adviser/search]", err);
    return NextResponse.json({ error: "Failed to perform global search" }, { status: 500 });
  }
}
