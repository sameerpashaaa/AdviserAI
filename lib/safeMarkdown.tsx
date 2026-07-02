"use client";

import React from "react";
import ReactMarkdown, { type Components } from "react-markdown";

/**
 * Safe markdown rendering for AI/model output.
 *
 * SECURITY: This replaces the previous hand-rolled parser that injected raw
 * model output via `dangerouslySetInnerHTML` (a DOM/stored-XSS sink, since the
 * only transformation was a `**bold**` regex with no HTML escaping).
 * `react-markdown` parses to an AST and renders real React elements, so any
 * `<script>`/`<img onerror>`/HTML in the model output is treated as text, not
 * executed. No `dangerouslySetInnerHTML`, no `allowDangerousHtml`.
 */

export interface SafeMarkdownOptions {
  h3Style?: React.CSSProperties;
  h4Style?: React.CSSProperties;
  pStyle?: React.CSSProperties;
  liStyle?: React.CSSProperties;
  /** Optional map of exact-line substrings -> className to apply to that line. */
  lineBadge?: Record<string, string>;
  /** Optional line-level renderer for special-case lines (e.g. risk verdicts). */
  renderLine?: (line: string) => React.ReactNode | null;
}

const DEFAULT_H3: React.CSSProperties = {
  color: "var(--text-primary)",
  margin: "20px 0 8px",
};

const DEFAULT_H4: React.CSSProperties = {
  color: "var(--text-accent)",
  margin: "14px 0 6px",
};

const DEFAULT_P: React.CSSProperties = {
  marginBottom: 6,
  color: "var(--text-secondary)",
};

const DEFAULT_LI: React.CSSProperties = {
  color: "var(--text-secondary)",
};

/**
 * Safely render inline `**bold**` markers within a single line as React nodes
 * (no HTML string, no dangerouslySetInnerHTML). Use this inside custom
 * `renderLine` handlers when you need inline emphasis on a special-cased line.
 */
export function renderInline(line: string): React.ReactNode[] {
  const parts = line.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} style={{ color: "var(--text-primary)", fontWeight: 600 }}>
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <React.Fragment key={i}>{part}</React.Fragment>;
  });
}

/**
 * Render a single block of text safely. Line-level special cases (badges,
 * risk-coloured lines) are handled by scanning each source line BEFORE handing
 * the text to react-markdown, so markdown rendering stays safe while we still
 * preserve the per-line page-specific styling the old code had.
 */
export function renderMarkdown(
  text: string,
  options: SafeMarkdownOptions = {}
): React.ReactNode[] {
  const lines = text.split("\n");

  // Group consecutive non-special lines into markdown blocks so that lists,
  // inline bold, and headings still parse correctly.
  const nodes: React.ReactNode[] = [];
  let buffer: string[] = [];
  let key = 0;

  const flushBuffer = () => {
    if (buffer.length === 0) return;
    const block = buffer.join("\n");
    nodes.push(
      <MarkdownBlock key={`md-${key++}`} text={block} options={options} />
    );
    buffer = [];
  };

  for (const line of lines) {
    // 1. Explicit per-line custom renderer (e.g. validate verdicts, career risk).
    let custom: React.ReactNode | null = null;
    if (options.renderLine) {
      custom = options.renderLine(line);
    }
    if (custom !== null && custom !== undefined) {
      flushBuffer();
      nodes.push(<React.Fragment key={`line-${key++}`}>{custom}</React.Fragment>);
      continue;
    }

    // 2. Exact-substring line badges (e.g. "STRONG PROCEED").
    let badgeClass: string | undefined;
    if (options.lineBadge) {
      for (const needle of Object.keys(options.lineBadge)) {
        if (line.includes(needle)) {
          badgeClass = options.lineBadge[needle];
          break;
        }
      }
    }
    if (badgeClass) {
      flushBuffer();
      nodes.push(
        <div
          key={`badge-${key++}`}
          className={badgeClass}
          style={{ margin: "8px 0", fontSize: "0.9rem", padding: "6px 16px" }}
        >
          {line}
        </div>
      );
      continue;
    }

    buffer.push(line);
  }
  flushBuffer();

  return nodes;
}

/**
 * Internal: render an arbitrary chunk of (non-special-case) markdown text
 * through react-markdown with the themed component map.
 */
function MarkdownBlock({
  text,
  options,
}: {
  text: string;
  options: SafeMarkdownOptions;
}) {
  const h3Style = { ...DEFAULT_H3, ...options.h3Style };
  const h4Style = { ...DEFAULT_H4, ...options.h4Style };
  const pStyle = { ...DEFAULT_P, ...options.pStyle };
  const liStyle = { ...DEFAULT_LI, ...options.liStyle };

  const components: Components = {
    // `## ` in the old parser -> styled h3
    h2: ({ children }) => <h3 style={h3Style}>{children}</h3>,
    // `### ` in the old parser -> styled h4
    h3: ({ children }) => <h4 style={h4Style}>{children}</h4>,
    p: ({ children }) => <p style={pStyle}>{children}</p>,
    strong: ({ children }) => (
      <strong style={{ color: "var(--text-primary)", fontWeight: 600 }}>
        {children}
      </strong>
    ),
    li: ({ children }) => {
      const marginBottom = options.liStyle?.marginBottom ?? 4;
      const fontSize = options.liStyle?.fontSize ?? "0.9rem";
      return (
        <div style={{ display: "flex", gap: 8, marginBottom }}>
          <span style={{ color: "var(--text-accent)", flexShrink: 0, fontSize }}>
            •
          </span>
          <span style={{ fontSize, ...liStyle }}>{children}</span>
        </div>
      );
    },
    // Strip raw HTML elements entirely (react-markdown escapes by default;
    // this is belt-and-suspenders so model output never injects markup).
    // react-markdown v10 already ignores raw HTML by default (no rehype-raw).
  };

  return (
    <ReactMarkdown
      components={components}
      // Explicitly do NOT pass rehype-raw — raw HTML in output stays as text.
    >
      {text}
    </ReactMarkdown>
  );
}

export default MarkdownBlock;
