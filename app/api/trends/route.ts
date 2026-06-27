import { NextRequest, NextResponse } from "next/server";
import { AGENT_PROMPTS } from "@/lib/agents/prompts";
import { generateText } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const { industry, region, timeHorizon } = await req.json();
    if (!industry) return NextResponse.json({ error: "Industry required" }, { status: 400 });

    const context = `
Industry/Sector: ${industry}
Geographic Region: ${region || "Global"}
Time Horizon: ${timeHorizon || "12-24 months"}

Please identify and analyze the top 5-8 most significant emerging trends affecting this industry, with detailed signal evidence, opportunity identification, and strategic implications.
`;

    const response = await generateText(AGENT_PROMPTS.trends, context);
    return NextResponse.json({ result: response });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
