/**
 * Structured JSON logger for AdviserAI.
 * In production: emits newline-delimited JSON to stdout (parseable by log aggregators).
 * In development: emits pretty, colorized output.
 */

type LogLevel = "debug" | "info" | "warn" | "error";

type LogEntry = {
  level: LogLevel;
  message: string;
  timestamp: string;
  [key: string]: unknown;
};

const IS_PROD = process.env.NODE_ENV === "production";
const MIN_LEVEL: LogLevel = (process.env.LOG_LEVEL as LogLevel) ?? (IS_PROD ? "info" : "debug");

const LEVEL_ORDER: Record<LogLevel, number> = { debug: 0, info: 1, warn: 2, error: 3 };

const DEV_COLORS: Record<LogLevel, string> = {
  debug: "\x1b[90m",
  info:  "\x1b[36m",
  warn:  "\x1b[33m",
  error: "\x1b[31m",
};
const RESET = "\x1b[0m";

function shouldLog(level: LogLevel): boolean {
  return LEVEL_ORDER[level] >= LEVEL_ORDER[MIN_LEVEL];
}

function emit(level: LogLevel, message: string, context?: Record<string, unknown>, err?: unknown): void {
  if (!shouldLog(level)) return;

  const entry: LogEntry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...context,
  };

  if (err instanceof Error) {
    entry.error = {
      name: err.name,
      message: err.message,
      stack: IS_PROD ? undefined : err.stack,
    };
  } else if (err !== undefined) {
    entry.error = String(err);
  }

  if (IS_PROD) {
    // Newline-delimited JSON for log aggregators (Datadog, Loki, GCP Logging, etc.)
    const output = JSON.stringify(entry);
    if (level === "error" || level === "warn") {
      process.stderr.write(output + "\n");
    } else {
      process.stdout.write(output + "\n");
    }
  } else {
    // Pretty dev output
    const color = DEV_COLORS[level];
    const prefix = `${color}[${level.toUpperCase().padEnd(5)}]${RESET}`;
    const time = `\x1b[90m${entry.timestamp}\x1b[0m`;
    const extras = Object.keys(context ?? {}).length
      ? "\n  " + JSON.stringify(context, null, 2).split("\n").join("\n  ")
      : "";
    const errPart = err instanceof Error ? `\n  ${err.stack}` : "";
    console.log(`${prefix} ${time} ${message}${extras}${errPart}`);
  }
}

export const logger = {
  debug(message: string, context?: Record<string, unknown>): void {
    emit("debug", message, context);
  },
  info(message: string, context?: Record<string, unknown>): void {
    emit("info", message, context);
  },
  warn(message: string, context?: Record<string, unknown>): void {
    emit("warn", message, context);
  },
  error(message: string, err?: unknown, context?: Record<string, unknown>): void {
    emit("error", message, context, err);
  },
};

export default logger;
