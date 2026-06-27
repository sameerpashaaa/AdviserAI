import { NextRequest, NextResponse } from "next/server";
import { AGENT_PROMPTS } from "@/lib/agents/prompts";
import { generateText } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const { idea, businessModel, targetMarket, stage } = await req.json();
    if (!idea) return NextResponse.json({ error: "Business idea required" }, { status: 400 });

    const context = `
Business Idea: ${idea}
Business Model: ${businessModel || "Not specified"}
Target Market: ${targetMarket || "Not specified"}
Current Stage: ${stage || "Ideation"}
`;

    const response = await generateText(AGENT_PROMPTS.validate, context);
    return NextResponse.json({ result: response });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
