import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { sql } from "drizzle-orm";
import { Redis } from "@upstash/redis";

export const dynamic = "force-dynamic";

export async function GET() {
  const details: Record<string, unknown> = {};
  const status = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    details,
  };

  let hasError = false;

  // 1. Check Database Connectivity
  try {
    const db = getDb();
    await db.execute(sql`SELECT 1`);
    details.database = { status: "up" };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[Health Check] Database check failed:", err);
    details.database = { status: "down", error: message };
    hasError = true;
  }

  // 2. Check Redis/Upstash Connectivity (if configured)
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    try {
      const redis = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      });
      const pingResult = await redis.ping();
      details.redis = { status: "up", ping: pingResult };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      console.error("[Health Check] Redis check failed:", err);
      details.redis = { status: "down", error: message };
      hasError = true;
    }
  } else {
    details.redis = { status: "unconfigured", info: "In-memory rate limiter fallback active" };
  }

  // 3. Check Gemini API configuration
  if (process.env.GEMINI_API_KEY) {
    details.gemini = { status: "configured" };
  } else {
    details.gemini = { status: "missing_api_key" };
    hasError = true;
  }

  if (hasError) {
    status.status = "unhealthy";
    return NextResponse.json(status, { status: 500 });
  }

  return NextResponse.json(status);
}
