/**
 * instrumentation.ts  (Next.js 14 Instrumentation Hook)
 *
 * This file is automatically loaded by Next.js when the application starts.
 * Enable it by setting `experimental.instrumentationHook = true` in next.config.
 *
 * Docs: https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 *
 * NOTE: Keep this file at the project root (same level as `app/` and `pages/`).
 */

export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    // ── Structured logger initialisation ──────────────────────────────────
    // We dynamically import to avoid pulling Node-only code into the edge runtime.
    const { logger } = await import("@/lib/logger");

    logger.info("[Instrumentation] AdviserAI server initialised", {
      nodeEnv: process.env.NODE_ENV,
      nodeVersion: process.version,
    });

    // ── Sentry (APM / error tracking) ─────────────────────────────────────
    // TODO: Once @sentry/nextjs is installed, initialise it here:
    //
    // const Sentry = await import('@sentry/nextjs');
    // Sentry.init({
    //   dsn: process.env.SENTRY_DSN,
    //   environment: process.env.NODE_ENV,
    //   tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    // });
    //
    // For now we just log that the DSN is present (or absent).
    if (process.env.SENTRY_DSN) {
      logger.info("[Instrumentation] SENTRY_DSN is set — install @sentry/nextjs to enable error reporting.");
    } else {
      logger.warn("[Instrumentation] SENTRY_DSN is not set — error reporting disabled.");
    }
  }

  // Edge runtime: minimal footprint — no Node APIs allowed here.
  if (process.env.NEXT_RUNTIME === "edge") {
    console.log("[Instrumentation] Edge runtime initialised");
  }
}
