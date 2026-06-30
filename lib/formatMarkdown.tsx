import React from "react";

interface FormatMarkdownOptions {
  h3Style?: React.CSSProperties;
  h4Style?: React.CSSProperties;
  pStyle?: React.CSSProperties;
  liStyle?: React.CSSProperties;
}

/**
 * A shared utility to parse simple markdown strings into React nodes.
 * Used across Chat, Research, and Strategy pages.
 */
export function formatMarkdown(
  text: string,
  options: FormatMarkdownOptions = {}
): React.ReactNode[] {
  const defaultH3Style: React.CSSProperties = {
    color: "var(--text-primary)",
    margin: "20px 0 8px",
    ...options.h3Style,
  };

  const defaultH4Style: React.CSSProperties = {
    color: "var(--text-accent)",
    margin: "14px 0 6px",
    ...options.h4Style,
  };

  const defaultPStyle: React.CSSProperties = {
    marginBottom: 6,
    color: "var(--text-secondary)",
    ...options.pStyle,
  };

  const defaultLiStyle: React.CSSProperties = {
    color: "var(--text-secondary)",
    ...options.liStyle,
  };

  return text.split("\n").map((line, i) => {
    // Heading 2 -> h3
    if (line.startsWith("## ")) {
      const marginTop = i > 0 && options.h3Style?.marginTop === undefined ? 16 : options.h3Style?.marginTop;
      return (
        <h3 key={i} style={{ ...defaultH3Style, marginTop }}>
          {line.slice(3)}
        </h3>
      );
    }

    // Heading 3 -> h4
    if (line.startsWith("### ")) {
      return (
        <h4 key={i} style={defaultH4Style}>
          {line.slice(4)}
        </h4>
      );
    }

    // Bold paragraph block
    if (line.startsWith("**") && line.endsWith("**")) {
      return (
        <p
          key={i}
          style={{
            fontWeight: 700,
            color: "var(--text-primary)",
            marginBottom: 6,
            ...options.pStyle,
          }}
        >
          {line.slice(2, -2)}
        </p>
      );
    }

    // List item
    if (line.startsWith("- ") || line.startsWith("• ")) {
      const textContent = line.slice(2);
      const formatted = textContent.replace(
        /\*\*(.*?)\*\*/g,
        '<strong style="color:var(--text-primary);font-weight:600">$1</strong>'
      );
      const marginBottom = options.liStyle?.marginBottom ?? 4;
      const fontSize = options.liStyle?.fontSize ?? "0.9rem";
      return (
        <div key={i} style={{ display: "flex", gap: 8, marginBottom }}>
          <span style={{ color: "var(--text-accent)", flexShrink: 0 }}>•</span>
          <span
            style={{ fontSize, ...defaultLiStyle }}
            dangerouslySetInnerHTML={{ __html: formatted }}
          />
        </div>
      );
    }

    // Empty line
    if (line.trim() === "") {
      return <div key={i} style={{ height: 8 }} />;
    }

    // Standard paragraph with inline bold text
    const formatted = line.replace(
      /\*\*(.*?)\*\*/g,
      '<strong style="color:var(--text-primary);font-weight:600">$1</strong>'
    );
    return (
      <p
        key={i}
        style={defaultPStyle}
        dangerouslySetInnerHTML={{ __html: formatted }}
      />
    );
  });
}
