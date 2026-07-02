import { NextResponse } from "next/server";
import { z } from "zod";
import { withHandler } from "@/lib/api/handler";
import { getDemoSettings, saveDemoSettings } from "@/lib/db/settings";

const settingsSchema = z.object({
  apiKey: z.string().max(256),
  fullName: z.string().max(200),
  email: z.string().email().or(z.literal("")),
  company: z.string().max(200),
  role: z.string().max(200),
  analysisDepth: z.enum(["Standard", "Deep"]),
  responseFormat: z.enum(["Structured (Recommended)", "Narrative", "Bullet Points"]),
  language: z.enum(["English", "Spanish", "French", "German"]),
  emailDigestEnabled: z.boolean(),
  trendAlertsEnabled: z.boolean(),
  creditWarningsEnabled: z.boolean(),
});

const getHandler = async () => {
  const settings = await getDemoSettings();
  return NextResponse.json({ settings });
};

const postHandler = async (body: z.infer<typeof settingsSchema>) => {
  const settings = await saveDemoSettings(body);
  return NextResponse.json({ settings });
};

export async function GET() {
  return getHandler();
}

export async function POST(req: Request) {
  return withHandler(settingsSchema)(req as any, postHandler);
}