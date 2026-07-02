import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { userSettings, users, type UserSetting } from "@/lib/db/schema";

export type SettingsPayload = {
  apiKey: string;
  fullName: string;
  email: string;
  company: string;
  role: string;
  analysisDepth: string;
  responseFormat: string;
  language: string;
  emailDigestEnabled: boolean;
  trendAlertsEnabled: boolean;
  creditWarningsEnabled: boolean;
};

export const DEMO_USER_EMAIL = "demo@adviserai.local";

export const DEFAULT_SETTINGS: SettingsPayload = {
  apiKey: "",
  fullName: "Sameer Pasha",
  email: "",
  company: "",
  role: "",
  analysisDepth: "Standard",
  responseFormat: "Structured (Recommended)",
  language: "English",
  emailDigestEnabled: true,
  trendAlertsEnabled: true,
  creditWarningsEnabled: true,
};

async function getOrCreateDemoUser() {
  const db = getDb();
  const existing = await db.select().from(users).where(eq(users.email, DEMO_USER_EMAIL)).limit(1);

  if (existing[0]) {
    return existing[0];
  }

  const inserted = await db
    .insert(users)
    .values({
      email: DEMO_USER_EMAIL,
      name: "Demo User",
    })
    .returning();

  return inserted[0];
}

export async function getDemoSettings() {
  const db = getDb();
  const user = await getOrCreateDemoUser();
  const settings = await db.select().from(userSettings).where(eq(userSettings.userId, user.id)).limit(1);

  if (settings[0]) {
    return settings[0];
  }

  const created = await db
    .insert(userSettings)
    .values({
      userId: user.id,
      apiKeyLastFour: null,
      fullName: DEFAULT_SETTINGS.fullName,
      company: DEFAULT_SETTINGS.company,
      role: DEFAULT_SETTINGS.role,
      emailDigestEnabled: DEFAULT_SETTINGS.emailDigestEnabled,
      trendAlertsEnabled: DEFAULT_SETTINGS.trendAlertsEnabled,
      creditWarningsEnabled: DEFAULT_SETTINGS.creditWarningsEnabled,
      analysisDepth: DEFAULT_SETTINGS.analysisDepth,
      responseFormat: DEFAULT_SETTINGS.responseFormat,
      language: DEFAULT_SETTINGS.language,
    })
    .returning();

  return created[0];
}

export async function saveDemoSettings(payload: SettingsPayload): Promise<UserSetting> {
  const db = getDb();
  const user = await getOrCreateDemoUser();
  const existing = await db.select().from(userSettings).where(eq(userSettings.userId, user.id)).limit(1);
  const apiKeyLastFour = payload.apiKey.trim().slice(-4) || null;

  if (existing[0]) {
    const updated = await db
      .update(userSettings)
      .set({
        apiKeyLastFour,
        fullName: payload.fullName,
        company: payload.company,
        role: payload.role,
        emailDigestEnabled: payload.emailDigestEnabled,
        trendAlertsEnabled: payload.trendAlertsEnabled,
        creditWarningsEnabled: payload.creditWarningsEnabled,
        analysisDepth: payload.analysisDepth,
        responseFormat: payload.responseFormat,
        language: payload.language,
        updatedAt: new Date(),
      })
      .where(eq(userSettings.userId, user.id))
      .returning();

    return updated[0];
  }

  const created = await db
    .insert(userSettings)
    .values({
      userId: user.id,
      apiKeyLastFour,
      fullName: payload.fullName,
      company: payload.company,
      role: payload.role,
      emailDigestEnabled: payload.emailDigestEnabled,
      trendAlertsEnabled: payload.trendAlertsEnabled,
      creditWarningsEnabled: payload.creditWarningsEnabled,
      analysisDepth: payload.analysisDepth,
      responseFormat: payload.responseFormat,
      language: payload.language,
    })
    .returning();

  return created[0];
}
