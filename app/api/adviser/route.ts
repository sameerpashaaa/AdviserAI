import { NextResponse, type NextRequest } from "next/server";
import { AGENT_PROMPTS } from "@/lib/agents/prompts";
import { generateText, generateStream } from "@/lib/gemini";
import { adviserSchema, type AdviserInput } from "@/lib/api/schemas";
import { withHandler } from "@/lib/api/handler";
import { getSessionFromCookiesAsync } from "@/lib/auth";
import {
  addConversationMessage,
  createConversation,
  createReport,
  getConversationForUser,
  getConversationMessages,
  getOrCreateUserByEmail,
  getOrCreateWorkspaceForUser,
  getWorkspaceConversations,
  recordUsage,
} from "@/lib/db/runtime";
import { sanitizeInput } from "@/lib/api/sanitizeInput";
import { checkQuotaForUser, calculateCostCents } from "@/lib/agents/tierLimits";
import { z } from "zod";

const intentClassifierSchema = z.object({
  primaryIntent: z.enum([
    "strategy",
    "research",
    "validation",
    "trends",
    "career",
    "finance",
    "risk",
    "general",
  ]),
  agentsNeeded: z.array(z.string()),
  complexity: z.enum(["simple", "moderate", "complex"]),
});

function inferReportMeta(message: string, agents: string[]) {
  const lower = message.toLowerCase();

  if (lower.includes("trend")) return { type: "Trends", badge: "badge-warning", icon: "📈" };
  if (lower.includes("career")) return { type: "Career", badge: "badge-neutral", icon: "🎓" };
  if (lower.includes("validate") || lower.includes("idea"))
    return { type: "Validation", badge: "badge-success", icon: "🚀" };
  if (lower.includes("research") || agents.includes("research"))
    return { type: "Research", badge: "badge-cyan", icon: "🔬" };

  return { type: "Strategy", badge: "badge-primary", icon: "🎯" };
}

async function resolveAuthedContext() {
  const session = await getSessionFromCookiesAsync();
  if (!session) return null;

  const user = await getOrCreateUserByEmail(session.email, session.name);
  const workspace = await getOrCreateWorkspaceForUser(
    user.id,
    session.workspaceId ? "Workspace" : "Default Workspace"
  );
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
  return withHandler(adviserSchema)(req as NextRequest, async (body: AdviserInput) => {
    const context = await resolveAuthedContext();
    if (!context) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // ── Server-Side Subscription Quota Check ─────────────────────────────────
    const quotaCheck = await checkQuotaForUser(context.user.id, "query");
    if (!quotaCheck.ok) {
      return NextResponse.json({ error: quotaCheck.error }, { status: 403 });
    }

    const { message: rawMessage, history, conversationId } = body;
    const message = sanitizeInput(rawMessage);

    // ── Intent Classification (with Zod schema validation fallback) ─────────
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
      primaryIntent: "general" as "strategy" | "research" | "validation" | "trends" | "career" | "finance" | "risk" | "general",
      agentsNeeded: ["chief", "research"],
      complexity: "moderate" as "simple" | "moderate" | "complex",
    };

    try {
      const parsed = JSON.parse(intentClassification.trim());
      const validated = intentClassifierSchema.parse(parsed);
      intentData = validated;
    } catch {
      // Use standard default values if intent parsing fails
    }

    // Build context from history
    const contextStr = history
      ? history
          .slice(-4)
          .map((m) => `${m.role}: ${m.content}`)
          .join("\n")
      : "";

    const fullPrompt = contextStr
      ? `Previous conversation context:\n${contextStr}\n\nCurrent question: ${message}`
      : message;

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

    // Save User message immediately to ensure persistent partial logs
    await addConversationMessage({
      conversationId: conversation.id,
      role: "user",
      content: message,
      activeAgents: intentData.agentsNeeded,
      metadata: { intent: intentData.primaryIntent, complexity: intentData.complexity },
    });

    // ── Server-Sent Events (SSE) Streaming Response ──────────────────────────
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const sendEvent = (data: Record<string, unknown>) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        };

        try {
          // Send initial metadata details
          sendEvent({
            agents: intentData.agentsNeeded,
            intent: intentData.primaryIntent,
            complexity: intentData.complexity,
            conversationId: conversation.id,
          });

          let accumulated = "";
          let promptTokens = 0;
          let completionTokens = 0;
          let resolvedModel = "gemini-2.5-flash";

          const streamGenerator = generateStream(
            AGENT_PROMPTS.chiefAdviser,
            fullPrompt,
            "gemini-2.5-flash"
          );

          for await (const chunk of streamGenerator) {
            resolvedModel = chunk.model;
            if (chunk.token) {
              accumulated += chunk.token;
              sendEvent({ token: chunk.token });
            }
            if (chunk.usage) {
              promptTokens = chunk.usage.promptTokens;
              completionTokens = chunk.usage.completionTokens;
            }
          }

          // Stream successfully completed: Save assistant message
          const assistantMessage = await addConversationMessage({
            conversationId: conversation.id,
            role: "assistant",
            content: accumulated,
            activeAgents: intentData.agentsNeeded,
            metadata: { intent: intentData.primaryIntent, complexity: intentData.complexity },
          });

          // Generate detailed structured report record
          const reportMeta = inferReportMeta(message, intentData.agentsNeeded);
          const report = await createReport({
            conversationId: conversation.id,
            workspaceId: context.workspace.id,
            userId: context.user.id,
            title,
            type: reportMeta.type,
            summary: accumulated.slice(0, 240),
            sizeLabel: `${Math.max(4, Math.min(20, Math.ceil(accumulated.length / 320)))} pages`,
            badge: reportMeta.badge,
            content: { message, response: accumulated, agents: intentData.agentsNeeded },
          });

          // Calculate actual LLM costs
          const costCents = calculateCostCents(resolvedModel, promptTokens, completionTokens);

          // Record usage events
          await recordUsage({
            userId: context.user.id,
            organizationId: context.user.organizationId,
            eventType: "query",
            route: "/api/adviser",
            model: resolvedModel,
            requestTokens: promptTokens,
            responseTokens: completionTokens,
            costCents,
            metadata: { conversationId: conversation.id, reportId: report.id },
            resourceId: report.id,
          });

          // Send final completed metadata block
          sendEvent({
            done: true,
            messageId: assistantMessage.id,
            report,
          });
        } catch (err) {
          console.error("[Adviser Stream Error]", err);
          sendEvent({
            error: "An error occurred while streaming the response from the advisor agent.",
          });
        } finally {
          controller.close();
        }
      },
    });

    return new NextResponse(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        "Connection": "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  });
}
