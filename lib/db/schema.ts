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

export const userRoleEnum = pgEnum("user_role", ["user", "admin"]);
export const messageRoleEnum = pgEnum("message_role", ["user", "assistant", "system"]);
export const reportStatusEnum = pgEnum("report_status", ["draft", "complete", "archived"]);

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull(),
  name: text("name").notNull(),
  avatarUrl: text("avatar_url"),
  role: userRoleEnum("role").notNull().default("user"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
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
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  userIdx: uniqueIndex("user_settings_user_unique").on(table.userId),
}));

export const conversations = pgTable("conversations", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  summary: text("summary"),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  userCreatedIdx: index("conversations_user_created_idx").on(table.userId, table.createdAt),
}));

export const messages = pgTable("messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  conversationId: uuid("conversation_id").notNull().references(() => conversations.id, { onDelete: "cascade" }),
  role: messageRoleEnum("role").notNull(),
  content: text("content").notNull(),
  activeAgents: jsonb("active_agents").$type<string[]>().notNull().default([]),
  tokenCount: integer("token_count"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  conversationCreatedIdx: index("messages_conversation_created_idx").on(table.conversationId, table.createdAt),
}));

export const reports = pgTable("reports", {
  id: uuid("id").defaultRandom().primaryKey(),
  conversationId: uuid("conversation_id").notNull().references(() => conversations.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  type: text("type").notNull(),
  summary: text("summary").notNull(),
  status: reportStatusEnum("status").notNull().default("draft"),
  sizeLabel: text("size_label").notNull().default("0 pages"),
  badge: text("badge").notNull().default("badge-primary"),
  exportPath: text("export_path"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  conversationCreatedIdx: index("reports_conversation_created_idx").on(table.conversationId, table.createdAt),
}));

export const usageEvents = pgTable("usage_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  route: text("route").notNull(),
  model: text("model").notNull(),
  requestTokens: integer("request_tokens").notNull().default(0),
  responseTokens: integer("response_tokens").notNull().default(0),
  costCents: integer("cost_cents").notNull().default(0),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  userCreatedIdx: index("usage_events_user_created_idx").on(table.userId, table.createdAt),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  settings: one(userSettings, {
    fields: [users.id],
    references: [userSettings.userId],
  }),
  conversations: many(conversations),
  usageEvents: many(usageEvents),
}));

export const userSettingsRelations = relations(userSettings, ({ one }) => ({
  user: one(users, {
    fields: [userSettings.userId],
    references: [users.id],
  }),
}));

export const conversationsRelations = relations(conversations, ({ one, many }) => ({
  user: one(users, {
    fields: [conversations.userId],
    references: [users.id],
  }),
  messages: many(messages),
  reports: many(reports),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  conversation: one(conversations, {
    fields: [messages.conversationId],
    references: [conversations.id],
  }),
}));

export const reportsRelations = relations(reports, ({ one }) => ({
  conversation: one(conversations, {
    fields: [reports.conversationId],
    references: [conversations.id],
  }),
}));

export const usageEventsRelations = relations(usageEvents, ({ one }) => ({
  user: one(users, {
    fields: [usageEvents.userId],
    references: [users.id],
  }),
}));

export type User = typeof users.$inferSelect;
export type UserSetting = typeof userSettings.$inferSelect;
export type Conversation = typeof conversations.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type Report = typeof reports.$inferSelect;
export type UsageEvent = typeof usageEvents.$inferSelect;
