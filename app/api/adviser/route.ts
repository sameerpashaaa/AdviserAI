import { NextResponse } from "next/server";
import { AGENT_PROMPTS } from "@/lib/agents/prompts";
import { generateText } from "@/lib/gemini";
import { adviserSchema, type AdviserInput } from "@/lib/api/schemas";
import { withHandler } from "@/lib/api/handler";
import { getSessionFromCookiesAsync } from "@/lib/auth";
import { addConversationMessage, createConversation, createReport, getConversationForUser, getConversationMessages, getOrCreateUserByEmail, getOrCreateWorkspaceForUser, getWorkspaceConversations, recordUsage } from "@/lib/db/runtime";

function inferReportMeta(message: string, agents: string[]) {
  const lower = message.toLowerCase();

  if (lower.includes("trend")) return { type: "Trends", badge: "badge-warning", icon: "📈" };
  if (lower.includes("career")) return { type: "Career", badge: "badge-neutral", icon: "🎓" };
  if (lower.includes("validate") || lower.includes("idea")) return { type: "Validation", badge: "badge-success", icon: "🚀" };
  if (lower.includes("research") || agents.includes("research")) return { type: "Research", badge: "badge-cyan", icon: "🔬" };

  return { type: "Strategy", badge: "badge-primary", icon: "🎯" };
}

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

  const conversations = await getWorkspaceConversations(context.workspace.id);
  const latestConversation = conversations[0] ?? null;
  if (!latestConversation) {
    return NextResponse.json({ conversation: null, messages: [] });
  }

  const messages = await getConversationMessages(latestConversation.id);
  return NextResponse.json({ conversation: latestConversation, messages });
}

export async function POST(req: Request) {
  return withHandler(adviserSchema)(req as any, async (body: AdviserInput) => {
    const context = await resolveAuthedContext();
    if (!context) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { message, history, conversationId } = body;

    // Classify the intent to determine which specialist agents to invoke
    const intentClassification = await generateText(
      `You are an intent classifier. Given a user message, respond with ONLY a JSON object (no markdown) in this exact format:
{
  "primaryIntent": "strategy|research|validation|trends|career|finance|risk|general",
  "agentsNeeded": ["chief", "research", "market", "trend", "finance", "startup", "tech", "risk", "report", "verify"],
  "complexity": "simple|moderate|complex"
}
Choose only the 2-4 most relevant agents from the list for agentsNeeded.`,
      message
    );

    let intentData = {
      primaryIntent: "general" as string,
      agentsNeeded: ["chief", "research"] as string[],
      complexity: "moderate" as string,
    };
    try {
      const parsed = JSON.parse(intentClassification);
      if (parsed?.primaryIntent) intentData.primaryIntent = parsed.primaryIntent;
      if (Array.isArray(parsed?.agentsNeeded)) intentData.agentsNeeded = parsed.agentsNeeded;
      if (parsed?.complexity) intentData.complexity = parsed.complexity;
    } catch {
      // Use defaults if parsing fails
    }

    // Build context from history
    const contextStr = history
      ? history
          .slice(-4)
          .map((m) => `${m.role}: ${m.content}`)
          .join("\n")
      : "";

    // Generate the main advisory response
    const fullPrompt = contextStr
      ? `Previous conversation context:\n${contextStr}\n\nCurrent question: ${message}`
      : message;

    const response = await generateText(AGENT_PROMPTS.chiefAdviser, fullPrompt);
    const title = message.trim().slice(0, 80) || "Chief Adviser Session";
    const conversation = conversationId
      ? await getConversationForUser(conversationId, context.user.id)
      : await createConversation({
          userId: context.user.id,
          workspaceId: context.workspace.id,
          title,
          summary: message.slice(0, 240),
        });

    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    await addConversationMessage({
      conversationId: conversation.id,
      role: "user",
      content: message,
      activeAgents: intentData.agentsNeeded,
      metadata: { intent: intentData.primaryIntent, complexity: intentData.complexity },
    });

    const assistantMessage = await addConversationMessage({
      conversationId: conversation.id,
      role: "assistant",
      content: response,
      activeAgents: intentData.agentsNeeded,
      metadata: { intent: intentData.primaryIntent, complexity: intentData.complexity },
    });

    const reportMeta = inferReportMeta(message, intentData.agentsNeeded);
    const report = await createReport({
      conversationId: conversation.id,
      workspaceId: context.workspace.id,
      userId: context.user.id,
      title,
      type: reportMeta.type,
      summary: response.slice(0, 240),
      sizeLabel: `${Math.max(4, Math.min(20, Math.ceil(response.length / 320)))} pages`,
      badge: reportMeta.badge,
      content: { message, response, agents: intentData.agentsNeeded },
    });

    await recordUsage({
      userId: context.user.id,
      organizationId: context.user.organizationId,
      eventType: "query",
      route: "/api/adviser",
      model: "gemini-2.5-flash",
      metadata: { conversationId: conversation.id, reportId: report.id },
      resourceId: report.id,
    });

    return NextResponse.json({
      response,
      agents: intentData.agentsNeeded,
      intent: intentData.primaryIntent,
      complexity: intentData.complexity,
      conversationId: conversation.id,
      messageId: assistantMessage.id,
      report,
    });
  });
}
