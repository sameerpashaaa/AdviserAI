import { z } from "zod";

// ── Reusable helpers ──────────────────────────────────────────────────────
const messageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().max(4000),
});

// ── Adviser ────────────────────────────────────────────────────────────────
export const adviserSchema = z.object({
  message: z.string().trim().min(1).max(4000),
  history: z.array(messageSchema).max(20).optional(),
  conversationId: z.string().uuid().optional(),
});

export type AdviserInput = z.infer<typeof adviserSchema>;

// ── Research ───────────────────────────────────────────────────────────────
export const researchSchema = z.object({
  query: z.string().trim().min(1).max(2000),
  depth: z.enum(["standard", "deep"]).default("standard"),
});

export type ResearchInput = z.infer<typeof researchSchema>;

// ── Strategy ──────────────────────────────────────────────────────────────
export const strategySchema = z.object({
  context: z.string().trim().min(1).max(2000),
  framework: z
    .enum([
      "swot",
      "pestle",
      "porter",
      "bcg",
      "ansoff",
      "blue-ocean",
      "value-chain",
      "jtbd",
      "auto",
    ])
    .default("auto"),
});

export type StrategyInput = z.infer<typeof strategySchema>;

// ── Trends ────────────────────────────────────────────────────────────────
export const trendsSchema = z.object({
  industry: z.string().trim().min(1).max(500),
  region: z
    .enum(["north-america", "europe", "asia-pacific", "middle-east-africa", "latin-america", "global"])
    .default("global"),
  timeHorizon: z.enum(["6months", "1year", "2years", "5years"]).default("1year"),
});

export type TrendsInput = z.infer<typeof trendsSchema>;

// ── Career ───────────────────────────────────────────────────────────────
export const careerSchema = z.object({
  currentRole: z.string().trim().min(1).max(500),
  skills: z.string().max(2000).optional(),
  experience: z
    .enum(["0-2 years", "3-5 years", "6-10 years", "10+ years"])
    .default("3-5 years"),
  interests: z.string().max(2000).optional(),
  goals: z.string().max(2000).optional(),
  constraints: z.string().max(2000).optional(),
});

export type CareerInput = z.infer<typeof careerSchema>;

// ── Validate / Startup ───────────────────────────────────────────────────
export const validateSchema = z.object({
  idea: z.string().trim().min(1).max(2000),
  businessModel: z
    .enum(["saas", "marketplace", "ecommerce", "consulting", "hardware", "other"])
    .default("saas"),
  targetMarket: z.string().max(1000).optional(),
  stage: z
    .enum(["idea", "mvp", "early-revenue", "growth", "scale"])
    .default("idea"),
});

export type ValidateInput = z.infer<typeof validateSchema>;
