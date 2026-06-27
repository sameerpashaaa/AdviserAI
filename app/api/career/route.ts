import { NextRequest, NextResponse } from "next/server";
import { AGENT_PROMPTS } from "@/lib/agents/prompts";
import { generateText } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const { currentRole, skills, experience, interests, goals, constraints } = await req.json();
    if (!currentRole) return NextResponse.json({ error: "Current role required" }, { status: 400 });

    const context = `
Current Role: ${currentRole}
Current Skills: ${skills || "Not specified"}
Years of Experience: ${experience || "Not specified"}
Interests: ${interests || "Not specified"}
Career Goals: ${goals || "Not specified"}
Constraints: ${constraints || "None specified"}

Please provide a comprehensive career strategy analysis with 3 specific career paths, detailed skill gap analysis, learning roadmap, and market demand forecasting.
`;

    const response = await generateText(AGENT_PROMPTS.career, context);
    return NextResponse.json({ result: response });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
