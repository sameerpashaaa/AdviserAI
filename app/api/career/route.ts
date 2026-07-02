import { NextResponse } from "next/server";
import { AGENT_PROMPTS } from "@/lib/agents/prompts";
import { generateText } from "@/lib/gemini";
import { careerSchema, type CareerInput } from "@/lib/api/schemas";
import { withHandler } from "@/lib/api/handler";

export async function POST(req: Request) {
  return withHandler(careerSchema)(req as any, async (body: CareerInput) => {
    const { currentRole, skills, experience, interests, goals, constraints } = body;

    const context = `Current Role: ${currentRole}
Current Skills: ${skills ?? "Not specified"}
Years of Experience: ${experience}
Interests: ${interests ?? "Not specified"}
Career Goals: ${goals ?? "Not specified"}
Constraints: ${constraints ?? "None specified"}

Please provide a comprehensive career strategy analysis with 3 specific career paths, detailed skill gap analysis, learning roadmap, and market demand forecasting.`;

    const response = await generateText(AGENT_PROMPTS.career, context);
    return NextResponse.json({ result: response });
  });
}
