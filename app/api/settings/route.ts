import { NextResponse } from "next/server";
import { z } from "zod";
import { withHandler } from "@/lib/api/handler";
import { getSessionFromCookiesAsync } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { userSettings, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { sendWelcomeEmail, sendSettingsChangeEmail } from "@/lib/email";

const settingsSchema = z.object({
  apiKey: z.string().max(256),
  fullName: z.string().max(200),
  email: z.string().email().or(z.literal("")),
  company: z.string().max(200),
  role: z.string().max(200),
  analysisDepth: z.enum(["Standard", "Deep"]),
  responseFormat: z.enum(["Structured (Recommended)", "Narrative", "Bullet Points"]),
  language: z.enum(["English", "Spanish", "French", "German"]),
  theme: z.enum(["light", "dark"]),
  emailDigestEnabled: z.boolean(),
  trendAlertsEnabled: z.boolean(),
  creditWarningsEnabled: z.boolean(),
});

async function getOrCreateAuthedUser() {
  const session = await getSessionFromCookiesAsync();
  if (!session) return null;

  const db = getDb();
  const existing = await db.select().from(users).where(eq(users.email, session.email)).limit(1);
  if (existing[0]) return existing[0];

  const inserted = await db.insert(users).values({
    email: session.email,
    name: session.name,
    organizationId: session.organizationId,
  }).returning();

  // Send welcome email in background
  void sendWelcomeEmail(session.email, session.name || "User");

  return inserted[0];
}

const getHandler = async () => {
  const db = getDb();
  const user = await getOrCreateAuthedUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const settings = await db.select().from(userSettings).where(eq(userSettings.userId, user.id)).limit(1);
  return NextResponse.json({ settings: settings[0] ?? null });
};

const postHandler = async (body: z.infer<typeof settingsSchema>) => {
  const db = getDb();
  const user = await getOrCreateAuthedUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const apiKeyLastFour = body.apiKey.trim().slice(-4) || null;
  const existing = await db.select().from(userSettings).where(eq(userSettings.userId, user.id)).limit(1);

  const payload = {
    userId: user.id,
    apiKeyLastFour,
    fullName: body.fullName,
    company: body.company,
    role: body.role,
    emailDigestEnabled: body.emailDigestEnabled,
    trendAlertsEnabled: body.trendAlertsEnabled,
    creditWarningsEnabled: body.creditWarningsEnabled,
    analysisDepth: body.analysisDepth,
    responseFormat: body.responseFormat,
    language: body.language,
    theme: body.theme,
    updatedAt: new Date(),
  };

  const settings = existing[0]
    ? await db.update(userSettings).set(payload).where(eq(userSettings.userId, user.id)).returning()
    : await db.insert(userSettings).values(payload).returning();

  // Send settings update confirmation email in background
  void sendSettingsChangeEmail(user.email, user.name || body.fullName || "User");

  return NextResponse.json({ settings: settings[0] });
};

export async function GET() {
  return getHandler();
}

export async function POST(req: Request) {
  return withHandler(settingsSchema)(req as any, postHandler);
}