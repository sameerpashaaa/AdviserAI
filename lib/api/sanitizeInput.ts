/**
 * Sanitizes user input before it is passed to LLM prompts.
 * Helps mitigate prompt injection vectors, removes control characters,
 * collapses redundant whitespace, and strips null bytes.
 */
export function sanitizeInput(input: string): string {
  if (!input) return "";

  return input
    .replace(/\u0000/g, "") // Remove null bytes
    // Strip control characters, keeping tabs, newlines, and carriage returns
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, "")
    // Collapse consecutive spaces and tabs into a single space
    .replace(/[ \t]+/g, " ")
    // Cap consecutive newlines at 2 to prevent prompt truncation / layout injection
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
