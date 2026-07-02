import { NextResponse } from "next/server";
import { AGENT_PROMPTS } from "@/lib/agents/prompts";
import { generateText } from "@/lib/gemini";
import { researchSchema, type ResearchInput } from "@/lib/api/schemas";
import { withHandler } from "@/lib/api/handler";

export async function POST(req: Request) {
  return withHandler(researchSchema)(req as any, async (body: ResearchInput) => {
    const { query, depth } = body;

    const depthInstruction =
      depth === "deep"
        ? "Provide an exhaustive, deeply detailed analysis with comprehensive data points, multiple perspectives, and extensive strategic implications."
        : "Provide a thorough but concise research summary with key findings and strategic implications.";

    const response = await generateText(
      AGENT_PROMPTS.research + "\n\n" + depthInstruction,
      query
    );

    return NextResponse.json({ result: response, query });
  });
}
