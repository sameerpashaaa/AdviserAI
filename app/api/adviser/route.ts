import { NextRequest, NextResponse } from "next/server";
import { AGENT_PROMPTS } from "@/lib/agents/prompts";
import { generateText } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const { message, history } = await req.json();

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

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

    let intentData = { primaryIntent: "general", agentsNeeded: ["chief", "research"], complexity: "moderate" };
    try {
      intentData = JSON.parse(intentClassification);
    } catch {
      // Use defaults if parsing fails
    }

    // Build context from history
    const contextStr = history
      ? history.slice(-4).map((m: { role: string; content: string }) => `${m.role}: ${m.content}`).join("\n")
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
  } catch (error: unknown) {
    console.error("Adviser API error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to generate advisory response: " + message },
      { status: 500 }
    );
  }
}
