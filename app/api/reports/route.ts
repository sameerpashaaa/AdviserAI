import { NextResponse } from "next/server";
import { z } from "zod";
import { withHandler } from "@/lib/api/handler";
import { getSessionFromCookiesAsync } from "@/lib/auth";
import { createReport, getOrCreateUserByEmail, getOrCreateWorkspaceForUser, getUserReports } from "@/lib/db/runtime";

const reportSchema = z.object({
  conversationId: z.string().uuid(),
  title: z.string().min(1).max(255),
  type: z.string().min(1).max(100),
  summary: z.string().min(1).max(5000),
  sizeLabel: z.string().max(50).optional(),
  badge: z.string().max(50).optional(),
  content: z.record(z.string(), z.any()).optional(),
  exportUrls: z.record(z.string(), z.string()).optional(),
});

async function resolveAuthedContext() {
  const session = await getSessionFromCookiesAsync();
  if (!session) return null;

  const user = await getOrCreateUserByEmail(session.email, session.name);
  const workspace = await getOrCreateWorkspaceForUser(user.id, session.workspaceId ? "Workspace" : "Default Workspace");
  return { user, workspace };
}

export async function GET() {
  const context = await resolveAuthedContext();
  if (!context) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const reports = await getUserReports(context.user.id);
  return NextResponse.json({ reports });
}

export async function POST(req: Request) {
  return withHandler(reportSchema)(req as any, async (body) => {
    const context = await resolveAuthedContext();
    if (!context) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const report = await createReport({
      conversationId: body.conversationId,
      workspaceId: context.workspace.id,
      userId: context.user.id,
      title: body.title,
      type: body.type,
      summary: body.summary,
      sizeLabel: body.sizeLabel,
      badge: body.badge,
      content: body.content,
      exportUrls: body.exportUrls,
    });

    return NextResponse.json({ report });
  });
}
