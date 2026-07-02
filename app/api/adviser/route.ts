import { NextResponse } from "next/server";
import { AGENT_PROMPTS } from "@/lib/agents/prompts";
import { generateText } from "@/lib/gemini";
import { adviserSchema, type AdviserInput } from "@/lib/api/schemas";
import { withHandler } from "@/lib/api/handler";

export async function POST(req: Request) {
  return withHandler(adviserSchema)(req as any, async (body: AdviserInput) => {
    const { message, history } = body;

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

    return NextResponse.json({
      response,
      agents: intentData.agentsNeeded,
      intent: intentData.primaryIntent,
      complexity: intentData.complexity,
    });
  });
}
