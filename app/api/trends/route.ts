import { NextResponse } from "next/server";
import { AGENT_PROMPTS } from "@/lib/agents/prompts";
import { generateText } from "@/lib/gemini";
import { trendsSchema, type TrendsInput } from "@/lib/api/schemas";
import { withHandler } from "@/lib/api/handler";

export async function POST(req: Request) {
  return withHandler(trendsSchema)(req as any, async (body: TrendsInput) => {
    const { industry, region, timeHorizon } = body;

    const regionLabel =
      region === "north-america"
        ? "North America"
        : region === "asia-pacific"
        ? "Asia-Pacific"
        : region === "middle-east-africa"
        ? "Middle East & Africa"
        : region === "latin-america"
        ? "Latin America"
        : region === "global"
        ? "Global"
        : region;

    const horizonLabel =
      timeHorizon === "6months"
        ? "0-6 months"
        : timeHorizon === "1year"
        ? "12-24 months"
        : timeHorizon === "2years"
        ? "2-3 years"
        : timeHorizon === "5years"
        ? "5+ years"
        : timeHorizon;

    const context = `Industry/Sector: ${industry}
Geographic Region: ${regionLabel}
Time Horizon: ${horizonLabel}

Please identify and analyze the top 5-8 most significant emerging trends affecting this industry, with detailed signal evidence, opportunity identification, and strategic implications.`;

    const response = await generateText(AGENT_PROMPTS.trends, context);
    return NextResponse.json({ result: response });
  });
}
