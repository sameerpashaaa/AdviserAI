import { NextRequest, NextResponse } from "next/server";
import { AGENT_PROMPTS } from "@/lib/agents/prompts";
import { generateText } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const { query, depth = "standard" } = await req.json();
    if (!query) return NextResponse.json({ error: "Query required" }, { status: 400 });

    const depthInstruction = depth === "deep"
      ? "Provide an exhaustive, deeply detailed analysis with comprehensive data points, multiple perspectives, and extensive strategic implications."
      : "Provide a thorough but concise research summary with key findings and strategic implications.";

    const response = await generateText(
      AGENT_PROMPTS.research + "\n\n" + depthInstruction,
      query
    );

    return NextResponse.json({ result: response, query });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
