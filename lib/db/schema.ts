import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", ["user", "admin", "super_admin"]);
export const subscriptionTierEnum = pgEnum("subscription_tier", ["free", "pro", "team", "enterprise"]);
export const organizationPlanEnum = pgEnum("organization_plan", ["team", "enterprise"]);
export const workspaceTypeEnum = pgEnum("workspace_type", ["startup", "market_research", "career", "project", "investment"]);
export const workspaceStatusEnum = pgEnum("workspace_status", ["active", "archived"]);
export const sessionTypeEnum = pgEnum("session_type", ["research", "strategy", "validation", "trend", "career", "finance", "risk", "report", "general"]);
export const messageRoleEnum = pgEnum("message_role", ["user", "assistant", "agent", "system"]);
export const reportStatusEnum = pgEnum("report_status", ["draft", "generating", "complete", "exported"]);
export const knowledgeItemTypeEnum = pgEnum("knowledge_item_type", ["pdf", "url", "text", "spreadsheet"]);
export const knowledgeItemStatusEnum = pgEnum("knowledge_item_status", ["pending", "processing", "complete", "failed"]);
export const subscriptionStatusEnum = pgEnum("subscription_status", ["active", "cancelled", "past_due", "trialing"]);
export const usageEventTypeEnum = pgEnum("usage_event_type", ["query", "report_generated", "export", "api_call"]);

export const organizations = pgTable("organizations", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  plan: organizationPlanEnum("plan").notNull().default("team"),
  seatsLimit: integer("seats_limit"),
  seatsUsed: integer("seats_used").notNull().default(0),
  billingEmail: text("billing_email"),
  customDomain: text("custom_domain"),
  whiteLabelConfig: jsonb("white_label_config").$type<Record<string, unknown>>().notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  slugIdx: uniqueIndex("organizations_slug_unique").on(table.slug),
}));

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull(),
  name: text("name").notNull(),
  avatarUrl: text("avatar_url"),
  role: userRoleEnum("role").notNull().default("user"),
  subscriptionTier: subscriptionTierEnum("subscription_tier").notNull().default("free"),
  organizationId: uuid("organization_id").references(() => organizations.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  lastActiveAt: timestamp("last_active_at", { withTimezone: true }),
  settings: jsonb("settings").$type<Record<string, unknown>>().notNull().default({}),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
}, (table) => ({
  emailIdx: uniqueIndex("users_email_unique").on(table.email),
}));

export const userSettings = pgTable("user_settings", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  apiKeyLastFour: text("api_key_last_four"),
  fullName: text("full_name").notNull().default(""),
  company: text("company").notNull().default(""),
  role: text("role").notNull().default(""),
  emailDigestEnabled: boolean("email_digest_enabled").notNull().default(true),
  trendAlertsEnabled: boolean("trend_alerts_enabled").notNull().default(true),
  creditWarningsEnabled: boolean("credit_warnings_enabled").notNull().default(true),
  analysisDepth: text("analysis_depth").notNull().default("Standard"),
  responseFormat: text("response_format").notNull().default("Structured (Recommended)"),
  language: text("language").notNull().default("English"),
  theme: text("theme").notNull().default("dark"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  userIdx: uniqueIndex("user_settings_user_unique").on(table.userId),
}));

export const workspaces = pgTable("workspaces", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  organizationId: uuid("organization_id").references(() => organizations.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  type: workspaceTypeEnum("type").notNull().default("project"),
  status: workspaceStatusEnum("status").notNull().default("active"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

export const conversations = pgTable("conversations", {
  id: uuid("id").defaultRandom().primaryKey(),
  workspaceId: uuid("workspace_id").references(() => workspaces.id, { onDelete: "cascade" }),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  summary: text("summary"),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
}, (table) => ({
  userCreatedIdx: index("conversations_user_created_idx").on(table.userId, table.createdAt),
}));

export const advisorySessions = pgTable("advisory_sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  workspaceId: uuid("workspace_id").references(() => workspaces.id, { onDelete: "cascade" }),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  title: text("title"),
  sessionType: sessionTypeEnum("session_type").notNull().default("general"),
  agentsUsed: text("agents_used").array(),
  tokenUsage: jsonb("token_usage").$type<Record<string, unknown>>().notNull().default({}),
  processingTimeMs: integer("processing_time_ms"),
  qualityScore: integer("quality_score"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const messages = pgTable("messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  conversationId: uuid("conversation_id").notNull().references(() => conversations.id, { onDelete: "cascade" }),
  sessionId: uuid("session_id").references(() => advisorySessions.id, { onDelete: "cascade" }),
  role: messageRoleEnum("role").notNull(),
  content: text("content").notNull(),
  activeAgents: jsonb("active_agents").$type<string[]>().notNull().default([]),
  agentSource: text("agent_source"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}),
  tokenCount: integer("token_count"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  conversationCreatedIdx: index("messages_conversation_created_idx").on(table.conversationId, table.createdAt),
}));

export const reports = pgTable("reports", {
  id: uuid("id").defaultRandom().primaryKey(),
  conversationId: uuid("conversation_id").notNull().references(() => conversations.id, { onDelete: "cascade" }),
  workspaceId: uuid("workspace_id").references(() => workspaces.id, { onDelete: "cascade" }),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  reportType: text("report_type"),
  type: text("type").notNull(),
  summary: text("summary").notNull(),
  status: reportStatusEnum("status").notNull().default("draft"),
  content: jsonb("content").$type<Record<string, unknown>>().notNull().default({}),
  exportUrls: jsonb("export_urls").$type<Record<string, string>>().notNull().default({}),
  version: integer("version").notNull().default(1),
  isShared: boolean("is_shared").notNull().default(false),
  shareToken: text("share_token"),
  sizeLabel: text("size_label").notNull().default("0 pages"),
  badge: text("badge").notNull().default("badge-primary"),
  exportPath: text("export_path"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
}, (table) => ({
  conversationCreatedIdx: index("reports_conversation_created_idx").on(table.conversationId, table.createdAt),
}));

export const usageEvents = pgTable("usage_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  organizationId: uuid("organization_id").references(() => organizations.id, { onDelete: "cascade" }),
  eventType: usageEventTypeEnum("event_type").notNull().default("query"),
  route: text("route").notNull(),
  model: text("model").notNull(),
  requestTokens: integer("request_tokens").notNull().default(0),
  responseTokens: integer("response_tokens").notNull().default(0),
  costCents: integer("cost_cents").notNull().default(0),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}),
  resourceId: uuid("resource_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  userCreatedIdx: index("usage_events_user_created_idx").on(table.userId, table.createdAt),
}));

export const subscriptions = pgTable("subscriptions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  organizationId: uuid("organization_id").references(() => organizations.id, { onDelete: "cascade" }),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  plan: subscriptionTierEnum("plan").notNull().default("free"),
  status: subscriptionStatusEnum("status").notNull().default("active"),
  currentPeriodStart: timestamp("current_period_start", { withTimezone: true }),
  currentPeriodEnd: timestamp("current_period_end", { withTimezone: true }),
  usageThisPeriod: jsonb("usage_this_period").$type<Record<string, unknown>>().notNull().default({}),
  limits: jsonb("limits").$type<Record<string, unknown>>().notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const knowledgeItems = pgTable("knowledge_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  workspaceId: uuid("workspace_id").references(() => workspaces.id, { onDelete: "cascade" }),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  title: text("title"),
  type: knowledgeItemTypeEnum("type").notNull().default("text"),
  sourceUrl: text("source_url"),
  fileUrl: text("file_url"),
  processingStatus: knowledgeItemStatusEnum("processing_status").notNull().default("pending"),
  chunkCount: integer("chunk_count"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  action: text("action").notNull(),
  resourceType: text("resource_type").notNull(),
  resourceId: uuid("resource_id"),
  oldValue: jsonb("old_value").$type<Record<string, unknown>>(),
  newValue: jsonb("new_value").$type<Record<string, unknown>>(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const featureFlags = pgTable("feature_flags", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  enabled: boolean("enabled").notNull().default(true),
  minimumTier: subscriptionTierEnum("minimum_tier").notNull().default("free"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  nameIdx: uniqueIndex("feature_flags_name_unique").on(table.name),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [users.organizationId],
    references: [organizations.id],
  }),
  settings: one(userSettings, {
    fields: [users.id],
    references: [userSettings.userId],
  }),
  subscriptions: many(subscriptions),
  conversations: many(conversations),
  usageEvents: many(usageEvents),
  knowledgeItems: many(knowledgeItems),
  auditLogs: many(auditLogs),
}));

export const organizationsRelations = relations(organizations, ({ many }) => ({
  users: many(users),
  workspaces: many(workspaces),
  subscriptions: many(subscriptions),
  usageEvents: many(usageEvents),
}));

export const userSettingsRelations = relations(userSettings, ({ one }) => ({
  user: one(users, {
    fields: [userSettings.userId],
    references: [users.id],
  }),
}));

export const workspacesRelations = relations(workspaces, ({ one, many }) => ({
  user: one(users, {
    fields: [workspaces.userId],
    references: [users.id],
  }),
  organization: one(organizations, {
    fields: [workspaces.organizationId],
    references: [organizations.id],
  }),
  conversations: many(conversations),
  advisorySessions: many(advisorySessions),
  reports: many(reports),
  knowledgeItems: many(knowledgeItems),
}));

export const conversationsRelations = relations(conversations, ({ one, many }) => ({
  workspace: one(workspaces, {
    fields: [conversations.workspaceId],
    references: [workspaces.id],
  }),
  user: one(users, {
    fields: [conversations.userId],
    references: [users.id],
  }),
  messages: many(messages),
  reports: many(reports),
}));

export const advisorySessionsRelations = relations(advisorySessions, ({ one, many }) => ({
  workspace: one(workspaces, {
    fields: [advisorySessions.workspaceId],
    references: [workspaces.id],
  }),
  user: one(users, {
    fields: [advisorySessions.userId],
    references: [users.id],
  }),
  messages: many(messages),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  conversation: one(conversations, {
    fields: [messages.conversationId],
    references: [conversations.id],
  }),
  session: one(advisorySessions, {
    fields: [messages.sessionId],
    references: [advisorySessions.id],
  }),
}));

export const reportsRelations = relations(reports, ({ one }) => ({
  workspace: one(workspaces, {
    fields: [reports.workspaceId],
    references: [workspaces.id],
  }),
  user: one(users, {
    fields: [reports.userId],
    references: [users.id],
  }),
  conversation: one(conversations, {
    fields: [reports.conversationId],
    references: [conversations.id],
  }),
}));

export const usageEventsRelations = relations(usageEvents, ({ one }) => ({
  organization: one(organizations, {
    fields: [usageEvents.organizationId],
    references: [organizations.id],
  }),
  user: one(users, {
    fields: [usageEvents.userId],
    references: [users.id],
  }),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  user: one(users, {
    fields: [subscriptions.userId],
    references: [users.id],
  }),
  organization: one(organizations, {
    fields: [subscriptions.organizationId],
    references: [organizations.id],
  }),
}));

export const knowledgeItemsRelations = relations(knowledgeItems, ({ one }) => ({
  workspace: one(workspaces, {
    fields: [knowledgeItems.workspaceId],
    references: [workspaces.id],
  }),
  user: one(users, {
    fields: [knowledgeItems.userId],
    references: [users.id],
  }),
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  user: one(users, {
    fields: [auditLogs.userId],
    references: [users.id],
  }),
}));

export type User = typeof users.$inferSelect;
export type Organization = typeof organizations.$inferSelect;
export type UserSetting = typeof userSettings.$inferSelect;
export type Workspace = typeof workspaces.$inferSelect;
export type Conversation = typeof conversations.$inferSelect;
export type AdvisorySession = typeof advisorySessions.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type Report = typeof reports.$inferSelect;
export type Subscription = typeof subscriptions.$inferSelect;
export type KnowledgeItem = typeof knowledgeItems.$inferSelect;
export type UsageEvent = typeof usageEvents.$inferSelect;
export type AuditLog = typeof auditLogs.$inferSelect;
export type FeatureFlag = typeof featureFlags.$inferSelect;
