/**
 * Sentry stub for AdviserAI.
 *
 * TODO: Install @sentry/nextjs and replace this stub:
 *   npm install @sentry/nextjs
 *   npx @sentry/wizard@latest -i nextjs
 *
 * Until then, this module provides the same interface so application code
 * can import captureException without crashing.
 */

import { logger } from "@/lib/logger";

const SENTRY_DSN = process.env.SENTRY_DSN;

let _initialized = false;

function ensureInitialized() {
  if (_initialized || !SENTRY_DSN) return;
  _initialized = true;
  // When @sentry/nextjs is installed, replace this block with:
  // import * as Sentry from '@sentry/nextjs';
  // Sentry.init({ dsn: SENTRY_DSN, tracesSampleRate: 0.1 });
  logger.info("[Sentry] DSN configured but @sentry/nextjs not installed — using console fallback");
}

/**
 * Capture an exception and send it to Sentry.
 * Falls back to logger.error if Sentry is not configured.
 */
export function captureException(
  err: Error,
  context?: Record<string, unknown>
): void {
  ensureInitialized();

  if (!SENTRY_DSN) {
    logger.error("[Sentry fallback] Exception captured", err, context);
    return;
  }

  // When @sentry/nextjs is installed, replace with:
  // Sentry.captureException(err, { extra: context });
  logger.error("[Sentry stub] Would send to Sentry", err, { dsn: SENTRY_DSN.slice(0, 20) + "...", ...context });
}

/**
 * Set user context for Sentry sessions.
 */
export function setUser(user: { id: string; email?: string } | null): void {
  if (!SENTRY_DSN) return;
  // When @sentry/nextjs is installed: Sentry.setUser(user);
}
