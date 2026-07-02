import React from "react";
import { renderMarkdown, type SafeMarkdownOptions } from "@/lib/safeMarkdown";

/**
 * Parse simple markdown strings into React nodes.
 * Used across Chat, Research, and Strategy pages.
 *
 * SECURITY: Delegates to `lib/safeMarkdown.tsx`, which renders through
 * `react-markdown` (AST-based, no raw HTML execution). This replaces the prior
 * implementation that used `dangerouslySetInnerHTML` on model output — a
 * DOM/stored-XSS sink. The public signature is unchanged for call sites.
 */
export interface FormatMarkdownOptions {
  h3Style?: React.CSSProperties;
  h4Style?: React.CSSProperties;
  pStyle?: React.CSSProperties;
  liStyle?: React.CSSProperties;
}

export function formatMarkdown(
  text: string,
  options: FormatMarkdownOptions = {}
): React.ReactNode[] {
  return renderMarkdown(text, options satisfies SafeMarkdownOptions);
}
