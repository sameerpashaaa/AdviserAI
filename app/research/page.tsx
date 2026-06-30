"use client";

import { useState } from "react";
import AppShell from "@/components/layout/AppShell";
import Header from "@/components/layout/Header";
import { Search, RefreshCw, Copy, BookOpen, Lightbulb } from "lucide-react";
import { formatMarkdown } from "@/lib/formatMarkdown";

const RESEARCH_EXAMPLES = [
  "AI consulting market size and growth projections 2024-2032",
  "Top competitors in the B2B SaaS productivity space",
  "Venture capital investment trends in climate tech 2025",
  "Impact of AI on the legal services industry",
  "Emerging market opportunities in Southeast Asia fintech",
];

export default function ResearchPage() {
  const [query, setQuery] = useState("");
  const [depth, setDepth] = useState<"standard" | "deep">("standard");
  const [result, setResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleResearch = async () => {
    if (!query.trim()) return;
    setIsLoading(true);
    setError("");
    setResult("");

    try {
      const res = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, depth }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult(data.result);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Research failed");
    } finally {
      setIsLoading(false);
    }
  };



  return (
    <AppShell>
      <Header
        title="Research Engine"
        subtitle="AI-powered deep research with citations and confidence scoring"
      />
      <div style={{ padding: 28, flex: 1 }}>
        {/* Input card */}
        <div className="card" style={{ marginBottom: 24 }}>
          <h3 style={{ color: "var(--text-primary)", marginBottom: 4 }}>Research Query</h3>
          <p style={{ fontSize: "0.875rem", marginBottom: 20 }}>
            Enter any topic, market, company, or question for deep AI research
          </p>

          <textarea
            className="input"
            placeholder="e.g. 'AI consulting market size and key players 2025', 'Competitive landscape in B2B SaaS'..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            rows={3}
            style={{ marginBottom: 16, resize: "vertical" }}
          />

          <div className="flex gap-3 items-center" style={{ marginBottom: 20 }}>
            <span style={{ fontSize: "0.875rem", color: "var(--text-secondary)", fontWeight: 500 }}>
              Research Depth:
            </span>
            <div className="tabs" style={{ width: 240 }}>
              <button
                className={`tab ${depth === "standard" ? "active" : ""}`}
                onClick={() => setDepth("standard")}
              >
                Standard
              </button>
              <button
                className={`tab ${depth === "deep" ? "active" : ""}`}
                onClick={() => setDepth("deep")}
              >
                Deep
              </button>
            </div>
          </div>

          <button
            className="btn btn-primary"
            onClick={handleResearch}
            disabled={!query.trim() || isLoading}
          >
            {isLoading ? (
              <><RefreshCw size={15} className="animate-spin" /> Researching...</>
            ) : (
              <><Search size={15} /> Run Research</>
            )}
          </button>
        </div>

        {/* Example prompts */}
        {!result && !isLoading && (
          <div className="card" style={{ marginBottom: 24 }}>
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb size={15} color="var(--text-accent)" />
              <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text-primary)" }}>
                Example Research Topics
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {RESEARCH_EXAMPLES.map((ex) => (
                <button
                  key={ex}
                  className="btn btn-ghost btn-sm"
                  onClick={() => setQuery(ex)}
                  style={{ justifyContent: "flex-start", textAlign: "left" }}
                >
                  <Search size={12} />
                  {ex}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Loading state */}
        {isLoading && (
          <div className="card">
            <div className="flex items-center gap-12 mb-20" style={{ gap: 12, marginBottom: 20 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: "var(--gradient-brand)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <BookOpen size={16} color="white" />
              </div>
              <div>
                <div style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: "0.875rem" }}>
                  Research Agent Active
                </div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                  Synthesizing multi-source research...
                </div>
              </div>
              <div className="typing-indicator" style={{ marginLeft: "auto" }}>
                <div className="typing-dot" />
                <div className="typing-dot" />
                <div className="typing-dot" />
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {["Querying primary sources...", "Extracting key findings...", "Scoring source credibility...", "Synthesizing research summary..."].map((step, i) => (
                <div key={i} className="flex items-center gap-3" style={{ opacity: 1 - i * 0.15 }}>
                  <div className="status-dot thinking" />
                  <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{step}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="card" style={{ borderColor: "var(--brand-danger)" }}>
            <p style={{ color: "var(--brand-danger)" }}>⚠ {error}</p>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="card">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <div className="badge badge-success">Research Complete</div>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                  {depth === "deep" ? "Deep" : "Standard"} analysis
                </span>
              </div>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => navigator.clipboard.writeText(result)}
              >
                <Copy size={13} /> Copy
              </button>
            </div>
            <div className="ai-output">
              {formatMarkdown(result, {
                liStyle: { marginBottom: 6, fontSize: "0.9375rem" },
              })}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
