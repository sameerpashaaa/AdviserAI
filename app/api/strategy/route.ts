import { NextResponse } from "next/server";
import { AGENT_PROMPTS } from "@/lib/agents/prompts";
import { generateText } from "@/lib/gemini";
import { strategySchema, type StrategyInput } from "@/lib/api/schemas";
import { withHandler } from "@/lib/api/handler";

export async function POST(req: Request) {
  return withHandler(strategySchema)(req as any, async (body: StrategyInput) => {
    const { context, framework } = body;

    const frameworkInstruction =
      framework && framework !== "auto"
        ? `Focus specifically on the ${framework} framework for this analysis. Go deep on this framework with specific, evidence-backed content for each component.`
        : "Apply the most relevant strategic frameworks to this context. Choose the 2-3 frameworks that will provide the most strategic insight.";

    const response = await generateText(
      AGENT_PROMPTS.strategy + "\n\n" + frameworkInstruction,
      context
    );

    return NextResponse.json({ result: response, framework, context });
  });
}
