import { NextRequest, NextResponse } from "next/server";
import { AGENT_PROMPTS } from "@/lib/agents/prompts";
import { generateText } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const { context, framework } = await req.json();
    if (!context) return NextResponse.json({ error: "Context required" }, { status: 400 });

    const frameworkInstruction = framework
      ? `Focus specifically on the ${framework} framework for this analysis. Go deep on this framework with specific, evidence-backed content for each component.`
      : "Apply the most relevant strategic frameworks to this context. Choose the 2-3 frameworks that will provide the most strategic insight.";

    const response = await generateText(
      AGENT_PROMPTS.strategy + "\n\n" + frameworkInstruction,
      context
    );

    return NextResponse.json({ result: response, framework, context });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
