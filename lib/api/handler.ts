import { NextRequest, NextResponse } from "next/server";
import { ZodSchema, ZodError } from "zod";
import { rateLimit, getClientKey } from "@/lib/api/rateLimit";
import { getSessionFromCookiesAsync } from "@/lib/auth";
import { logger } from "@/lib/logger";

/**
 * Wraps a POST route handler with:
 *  1. Rate limiting (per IP, or per user if authenticated).
 *  2. Request body validation via a Zod schema.
 *  3. Standardised error responses (never leaks internal details).
 *  4. Server-side console.error logging.
 */
export function withHandler<T>(schema: ZodSchema<T>) {
  return async (
    req: NextRequest,
    handler: (body: T) => Promise<NextResponse>
  ): Promise<NextResponse> => {
    // ── Rate limit key (user ID or IP fallback) ───────────────────────────
    let rateLimitKey = `ip:${getClientKey(req)}`;
    try {
      const session = await getSessionFromCookiesAsync();
      if (session?.userId) {
        rateLimitKey = `user:${session.userId}`;
      }
    } catch {
      // Ignore session errors at rate-limiting stage
    }

    const { ok, remaining, resetAt } = await rateLimit(rateLimitKey);
    if (!ok) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil((resetAt - Date.now()) / 1000)),
            "X-RateLimit-Remaining": "0",
          },
        }
      );
    }

    // ── Parse body ───────────────────────────────────────────────────────
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid request body. Expected valid JSON." },
        { status: 400, headers: { "X-RateLimit-Remaining": String(remaining) } }
      );
    }

    // ── Validate ────────────────────────────────────────────────────────
    let parsed: T;
    try {
      parsed = schema.parse(body);
    } catch (err) {
      if (err instanceof ZodError) {
        const first = err.issues[0];
        return NextResponse.json(
          { error: `Validation error: ${first.message}` },
          { status: 400, headers: { "X-RateLimit-Remaining": String(remaining) } }
        );
      }
      return NextResponse.json(
        { error: "Invalid request." },
        { status: 400, headers: { "X-RateLimit-Remaining": String(remaining) } }
      );
    }

    // ── Business logic ──────────────────────────────────────────────────
    const routePath = req.nextUrl?.pathname ?? "unknown";
    const startMs = Date.now();
    logger.info("[API] Request", { route: routePath, method: req.method, rateLimitKey });

    try {
      const res = await handler(parsed);
      // Append rate-limit header to successful responses.
      res.headers.set("X-RateLimit-Remaining", String(remaining));
      logger.info("[API] Response", { route: routePath, status: res.status, durationMs: Date.now() - startMs });
      return res;
    } catch (err: unknown) {
      logger.error("[API] Unhandled error", err, { route: routePath, durationMs: Date.now() - startMs });
      return NextResponse.json(
        { error: "Something went wrong. Please try again." },
        {
          status: 500,
          headers: { "X-RateLimit-Remaining": String(remaining) },
        }
      );
    }
  };
}
