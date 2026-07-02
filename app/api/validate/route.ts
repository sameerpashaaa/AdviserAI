import { NextResponse } from "next/server";
import { AGENT_PROMPTS } from "@/lib/agents/prompts";
import { generateText } from "@/lib/gemini";
import { validateSchema, type ValidateInput } from "@/lib/api/schemas";
import { withHandler } from "@/lib/api/handler";

export async function POST(req: Request) {
  return withHandler(validateSchema)(req as any, async (body: ValidateInput) => {
    const { idea, businessModel, targetMarket, stage } = body;

    const stageLabel =
      stage === "idea"
        ? "Ideation"
        : stage === "mvp"
        ? "MVP"
        : stage === "early-revenue"
        ? "Early Revenue"
        : stage === "growth"
        ? "Growth"
        : "Scale";

    const context = `Business Idea: ${idea}
Business Model: ${businessModel}
Target Market: ${targetMarket ?? "Not specified"}
Current Stage: ${stageLabel}`;

    const response = await generateText(AGENT_PROMPTS.validate, context);
    return NextResponse.json({ result: response });
  });
}
