import { NextResponse } from "next/server";
import { getSessionFromCookiesAsync } from "@/lib/auth";
import { getDb } from "@/lib/db";
import {
  users,
  userSettings,
  workspaces,
  conversations,
  messages,
  reports,
  subscriptions,
  usageEvents,
  type Message,
} from "@/lib/db/schema";
import { eq, inArray } from "drizzle-orm";

export async function GET(): Promise<Response> {
  // ── Authentication Check ───────────────────────────────────────────────────
  const session = await getSessionFromCookiesAsync();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const db = getDb();

  try {
    // 1. Resolve user profile
    const dbUserList = await db
      .select()
      .from(users)
      .where(eq(users.email, session.email))
      .limit(1);

    const user = dbUserList[0];
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 2. Fetch user settings
    const settingsList = await db
      .select()
      .from(userSettings)
      .where(eq(userSettings.userId, user.id))
      .limit(1);

    // 3. Fetch workspaces
    const userWorkspaces = await db
      .select()
      .from(workspaces)
      .where(eq(workspaces.userId, user.id));

    // 4. Fetch conversations
    const userConversations = await db
      .select()
      .from(conversations)
      .where(eq(conversations.userId, user.id));

    // 5. Fetch messages for all user's conversations
    let userMessages: Message[] = [];
    if (userConversations.length > 0) {
      const conversationIds = userConversations.map((c) => c.id);
      userMessages = await db
        .select()
        .from(messages)
        .where(inArray(messages.conversationId, conversationIds));
    }

    // 6. Fetch reports
    const userReports = await db
      .select()
      .from(reports)
      .where(eq(reports.userId, user.id));

    // 7. Fetch subscriptions
    const userSubscriptions = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, user.id));

    // 8. Fetch usage events
    const userUsageEvents = await db
      .select()
      .from(usageEvents)
      .where(eq(usageEvents.userId, user.id));

    // ── Build Export JSON Payload ────────────────────────────────────────────
    const exportData = {
      exportVersion: "1.0",
      exportedAt: new Date().toISOString(),
      profile: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        subscriptionTier: user.subscriptionTier,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        avatarUrl: user.avatarUrl,
        settings: settingsList[0] || null,
      },
      workspaces: userWorkspaces.map((w) => ({
        id: w.id,
        title: w.title,
        description: w.description,
        type: w.type,
        status: w.status,
        metadata: w.metadata,
        createdAt: w.createdAt,
        updatedAt: w.updatedAt,
      })),
      conversations: userConversations.map((c) => {
        const conversationMessages = userMessages.filter(
          (m) => m.conversationId === c.id
        );
        return {
          id: c.id,
          workspaceId: c.workspaceId,
          title: c.title,
          summary: c.summary,
          active: c.active,
          createdAt: c.createdAt,
          updatedAt: c.updatedAt,
          messages: conversationMessages.map((m) => ({
            id: m.id,
            role: m.role,
            content: m.content,
            activeAgents: m.activeAgents,
            agentSource: m.agentSource,
            tokenCount: m.tokenCount,
            metadata: m.metadata,
            createdAt: m.createdAt,
          })),
        };
      }),
      reports: userReports.map((r) => ({
        id: r.id,
        conversationId: r.conversationId,
        workspaceId: r.workspaceId,
        title: r.title,
        type: r.type,
        summary: r.summary,
        status: r.status,
        content: r.content,
        version: r.version,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
      })),
      subscriptions: userSubscriptions,
      usageHistory: userUsageEvents.map((u) => ({
        id: u.id,
        eventType: u.eventType,
        route: u.route,
        model: u.model,
        requestTokens: u.requestTokens,
        responseTokens: u.responseTokens,
        costCents: u.costCents,
        metadata: u.metadata,
        createdAt: u.createdAt,
      })),
    };

    // ── Stream / Download Response ───────────────────────────────────────────
    const jsonString = JSON.stringify(exportData, null, 2);
    return new Response(jsonString, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="adviserai-data-export-${user.id}.json"`,
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  } catch (error) {
    console.error("[user/export] Data export failed:", error);
    return NextResponse.json({ error: "Failed to generate user data export" }, { status: 500 });
  }
}
