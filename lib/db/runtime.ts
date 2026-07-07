import { eq, desc, count, sql, and, isNull } from "drizzle-orm";
import { getDb } from "@/lib/db";
import {
  conversations,
  messages,
  organizations,
  reports,
  subscriptions,
  usageEvents,
  users,
  workspaces,
  type Conversation,
  type Message,
  type Report,
  type UsageEvent,
  type User,
  type Workspace,
} from "@/lib/db/schema";

export async function getOrCreateUserByEmail(email: string, name: string) {
  const db = getDb();
  const existing = await db.select().from(users).where(eq(users.email, email)).limit(1);

  if (existing[0]) return existing[0];

  const inserted = await db.insert(users).values({ email, name }).returning();
  return inserted[0];
}

export async function getOrCreateWorkspaceForUser(userId: string, title = "Default Workspace") {
  const db = getDb();
  const existing = await db.select().from(workspaces).where(eq(workspaces.userId, userId)).limit(1);
  if (existing[0]) return existing[0];

  const inserted = await db.insert(workspaces).values({ userId, title, type: "project" }).returning();
  return inserted[0];
}

export async function getOrCreateDemoContext() {
  const db = getDb();
  const user = await getOrCreateUserByEmail("demo@adviserai.local", "Demo User");
  const workspace = await getOrCreateWorkspaceForUser(user.id, "Demo Workspace");

  const subscriptionExists = await db.select().from(subscriptions).where(eq(subscriptions.userId, user.id)).limit(1);
  if (!subscriptionExists[0]) {
    await db.insert(subscriptions).values({ userId: user.id, plan: "free", status: "active" });
  }

  return { user, workspace };
}

export async function getUserWorkspaces(userId: string): Promise<Workspace[]> {
  const db = getDb();
  return db.select().from(workspaces).where(eq(workspaces.userId, userId)).orderBy(desc(workspaces.createdAt));
}

export async function getWorkspaceConversations(workspaceId: string): Promise<Conversation[]> {
  const db = getDb();
  return db
    .select()
    .from(conversations)
    .where(and(eq(conversations.workspaceId, workspaceId), isNull(conversations.deletedAt)))
    .orderBy(desc(conversations.pinned), desc(conversations.updatedAt));
}

export async function getConversationForUser(conversationId: string, userId: string): Promise<Conversation | null> {
  const db = getDb();
  const existing = await db
    .select()
    .from(conversations)
    .where(and(eq(conversations.id, conversationId), isNull(conversations.deletedAt)))
    .limit(1);
  const conversation = existing[0] ?? null;

  if (!conversation || conversation.userId !== userId) return null;
  return conversation;
}

export async function getConversationMessages(conversationId: string): Promise<Message[]> {
  const db = getDb();
  return db.select().from(messages).where(eq(messages.conversationId, conversationId)).orderBy(messages.createdAt);
}

export async function getUserReports(userId: string): Promise<Report[]> {
  const db = getDb();
  return db
    .select()
    .from(reports)
    .where(and(eq(reports.userId, userId), isNull(reports.deletedAt)))
    .orderBy(desc(reports.createdAt));
}

export async function createConversation(input: {
  userId: string;
  workspaceId: string;
  title: string;
  summary?: string | null;
}) {
  const db = getDb();
  const inserted = await db.insert(conversations).values({
    userId: input.userId,
    workspaceId: input.workspaceId,
    title: input.title,
    summary: input.summary ?? null,
    active: true,
  }).returning();
  return inserted[0];
}

export async function addConversationMessage(input: {
  conversationId: string;
  role: "user" | "assistant" | "agent" | "system";
  content: string;
  activeAgents?: string[];
  agentSource?: string | null;
  metadata?: Record<string, unknown>;
  tokenCount?: number | null;
  sessionId?: string | null;
}) {
  const db = getDb();
  const inserted = await db.insert(messages).values({
    conversationId: input.conversationId,
    sessionId: input.sessionId ?? null,
    role: input.role,
    content: input.content,
    activeAgents: input.activeAgents ?? [],
    agentSource: input.agentSource ?? null,
    metadata: input.metadata ?? {},
    tokenCount: input.tokenCount ?? null,
  }).returning();
  return inserted[0];
}

export async function createReport(input: {
  conversationId: string;
  workspaceId: string;
  userId: string;
  title: string;
  type: string;
  summary: string;
  content?: Record<string, unknown>;
  exportUrls?: Record<string, string>;
  sizeLabel?: string;
  badge?: string;
}) {
  const db = getDb();
  const inserted = await db.insert(reports).values({
    conversationId: input.conversationId,
    workspaceId: input.workspaceId,
    userId: input.userId,
    title: input.title,
    reportType: input.type,
    type: input.type,
    summary: input.summary,
    status: "complete",
    content: input.content ?? {},
    exportUrls: input.exportUrls ?? {},
    sizeLabel: input.sizeLabel ?? "0 pages",
    badge: input.badge ?? "badge-primary",
    version: 1,
  }).returning();
  return inserted[0];
}

export async function recordUsage(input: {
  userId: string;
  organizationId?: string | null;
  eventType: "query" | "report_generated" | "export" | "api_call";
  route: string;
  model: string;
  requestTokens?: number;
  responseTokens?: number;
  costCents?: number;
  metadata?: Record<string, unknown>;
  resourceId?: string | null;
}) {
  const db = getDb();
  const inserted = await db.insert(usageEvents).values({
    userId: input.userId,
    organizationId: input.organizationId ?? null,
    eventType: input.eventType,
    route: input.route,
    model: input.model,
    requestTokens: input.requestTokens ?? 0,
    responseTokens: input.responseTokens ?? 0,
    costCents: input.costCents ?? 0,
    metadata: input.metadata ?? {},
    resourceId: input.resourceId ?? null,
  }).returning();
  return inserted[0];
}

export async function getDashboardMetrics(userId: string) {
  const db = getDb();
  const workspace = await getOrCreateWorkspaceForUser(userId, "Default Workspace");

  const [conversationCountResult] = await db.select({ value: count() }).from(conversations).where(eq(conversations.userId, userId));
  const [reportCountResult] = await db.select({ value: count() }).from(reports).where(eq(reports.userId, userId));
  const [usageCountResult] = await db.select({ value: count() }).from(usageEvents).where(eq(usageEvents.userId, userId));

  return {
    workspace,
    conversationCount: conversationCountResult?.value ?? 0,
    reportCount: reportCountResult?.value ?? 0,
    usageCount: usageCountResult?.value ?? 0,
  };
}

