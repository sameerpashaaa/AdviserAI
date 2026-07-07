import { NextResponse } from "next/server";
import { getSessionFromCookiesAsync } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { conversations } from "@/lib/db/schema";
import { eq, and, ilike, or, isNull } from "drizzle-orm";

export async function GET(req: Request) {
  const session = await getSessionFromCookiesAsync();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q")?.trim() || "";

  if (!query) {
    return NextResponse.json({ conversations: [] });
  }

  const db = getDb();

  try {
    const results = await db
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
      );

    return NextResponse.json({ conversations: results });
  } catch (err) {
    console.error("[adviser/search]", err);
    return NextResponse.json({ error: "Failed to search conversations" }, { status: 500 });
  }
}
