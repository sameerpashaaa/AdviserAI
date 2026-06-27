"use client";

import { useState } from "react";
import AppShell from "@/components/layout/AppShell";
import Header from "@/components/layout/Header";
import { Target, RefreshCw, Copy, ChevronDown } from "lucide-react";

const FRAMEWORKS = [
  { id: "SWOT", label: "SWOT Analysis", icon: "🎯", desc: "Strengths, Weaknesses, Opportunities, Threats" },
  { id: "PESTLE", label: "PESTLE Analysis", icon: "🌍", desc: "Political, Economic, Social, Tech, Legal, Environmental" },
  { id: "Porter's Five Forces", label: "Porter's Five Forces", icon: "⚔️", desc: "Competitive dynamics and industry attractiveness" },
  { id: "BCG Matrix", label: "BCG Matrix", icon: "📊", desc: "Portfolio positioning — Stars, Cash Cows, Dogs, Questions" },
  { id: "Ansoff Matrix", label: "Ansoff Matrix", icon: "🗺️", desc: "Growth strategy options — market & product expansion" },
  { id: "Blue Ocean Strategy", label: "Blue Ocean Strategy", icon: "🌊", desc: "Find uncontested market space with ERRC grid" },
  { id: "Value Chain Analysis", label: "Value Chain Analysis", icon: "🔗", desc: "Primary and support activities for competitive advantage" },
  { id: "Jobs-to-be-Done", label: "Jobs-to-be-Done", icon: "💼", desc: "Core, functional, emotional, social jobs identification" },
  { id: "", label: "Auto-Select Best", icon: "✨", desc: "Let AI choose the most relevant frameworks" },
];

export default function StrategyPage() {
  const [context, setContext] = useState("");
  const [selectedFramework, setSelectedFramework] = useState("");
  const [result, setResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAnalyze = async () => {
    if (!context.trim()) return;
    setIsLoading(true);
    setError("");
    setResult("");

    try {
      const res = await fetch("/api/strategy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ context, framework: selectedFramework }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult(data.result);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setIsLoading(false);
    }
  };

  const formatText = (text: string) => {
    return text.split("\n").map((line, i) => {
      if (line.startsWith("## "))
        return <h3 key={i} style={{ color: "var(--text-primary)", margin: "20px 0 8px", borderBottom: "1px solid var(--border-subtle)", paddingBottom: 8 }}>{line.slice(3)}</h3>;
      if (line.startsWith("### "))
        return <h4 key={i} style={{ color: "var(--text-accent)", margin: "14px 0 6px" }}>{line.slice(4)}</h4>;
      if (line.startsWith("**") && line.endsWith("**"))
        return <p key={i} style={{ fontWeight: 700, color: "var(--text-primary)", marginBottom: 6 }}>{line.slice(2, -2)}</p>;
      if (line.startsWith("- ") || line.startsWith("• ")) {
        const formatted = line.slice(2).replace(/\*\*(.*?)\*\*/g, '<strong style="color:var(--text-primary)">$1</strong>');
        return (
          <div key={i} style={{ display: "flex", gap: 8, marginBottom: 6 }}>
            <span style={{ color: "var(--text-accent)", flexShrink: 0 }}>•</span>
            <span style={{ color: "var(--text-secondary)" }} dangerouslySetInnerHTML={{ __html: formatted }} />
          </div>
        );
      }
      if (line.trim() === "") return <div key={i} style={{ height: 8 }} />;
      const formatted = line.replace(/\*\*(.*?)\*\*/g, '<strong style="color:var(--text-primary);font-weight:600">$1</strong>');
      return <p key={i} style={{ marginBottom: 6, color: "var(--text-secondary)" }} dangerouslySetInnerHTML={{ __html: formatted }} />;
    });
  };

  return (
    <AppShell>
      <Header
        title="Strategy Hub"
        subtitle="Automated strategic frameworks — SWOT, PESTLE, Porter's & more"
      />
      <div style={{ padding: 28, flex: 1 }}>
        <div className="grid-2" style={{ gap: 24 }}>
          {/* Left: Input */}
          <div>
            <div className="card" style={{ marginBottom: 20 }}>
              <h3 style={{ color: "var(--text-primary)", marginBottom: 4 }}>Business Context</h3>
              <p style={{ fontSize: "0.8125rem", marginBottom: 16 }}>
                Describe your company, product, market, or challenge
              </p>
              <textarea
                className="input"
                placeholder="e.g. 'We are a B2B SaaS startup building AI-powered legal document review. We target small law firms and in-house legal teams in the US. Currently pre-revenue with 3 beta customers...'"
                value={context}
                onChange={(e) => setContext(e.target.value)}
                rows={6}
                style={{ marginBottom: 16, resize: "vertical" }}
              />
              <button
                className="btn btn-primary w-full"
                onClick={handleAnalyze}
                disabled={!context.trim() || isLoading}
              >
                {isLoading ? (
                  <><RefreshCw size={15} className="animate-spin" /> Analyzing...</>
                ) : (
                  <><Target size={15} /> Run Analysis</>
                )}
              </button>
            </div>

            {/* Framework selector */}
            <div className="card">
              <h4 style={{ color: "var(--text-primary)", marginBottom: 12, fontSize: "0.9rem" }}>
                Select Framework
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {FRAMEWORKS.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setSelectedFramework(f.id)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "10px 12px",
                      borderRadius: "var(--radius-md)",
                      border: `1px solid ${selectedFramework === f.id ? "var(--border-strong)" : "var(--border-subtle)"}`,
                      background: selectedFramework === f.id ? "rgba(124,58,237,0.1)" : "transparent",
                      cursor: "pointer",
                      transition: "all 0.15s",
                      textAlign: "left",
                    }}
                  >
                    <span style={{ fontSize: "1.1rem", flexShrink: 0 }}>{f.icon}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: "0.8125rem", fontWeight: 600, color: selectedFramework === f.id ? "var(--text-accent)" : "var(--text-primary)" }}>
                        {f.label}
                      </div>
                      <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>{f.desc}</div>
                    </div>
                    {selectedFramework === f.id && (
                      <div className="status-dot active" style={{ flexShrink: 0 }} />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Results */}
          <div>
            {!result && !isLoading && (
              <div
                style={{
                  height: "100%",
                  minHeight: 300,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "var(--bg-card)",
                  border: "1px dashed var(--border-default)",
                  borderRadius: "var(--radius-lg)",
                  gap: 12,
                  color: "var(--text-muted)",
                  textAlign: "center",
                  padding: 32,
                }}
              >
                <Target size={32} style={{ opacity: 0.3 }} />
                <p style={{ fontSize: "0.875rem" }}>
                  Select a framework, enter your business context, and run the analysis to see AI-powered strategic insights here.
                </p>
              </div>
            )}

            {isLoading && (
              <div className="card" style={{ height: "100%", minHeight: 300 }}>
                <div className="flex items-center gap-3 mb-6">
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--gradient-brand)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Target size={16} color="white" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: "0.875rem" }}>Strategy Agent Active</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Applying {selectedFramework || "best-fit"} framework...</div>
                  </div>
                  <div className="typing-indicator" style={{ marginLeft: "auto" }}>
                    <div className="typing-dot" />
                    <div className="typing-dot" />
                    <div className="typing-dot" />
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="card" style={{ borderColor: "var(--brand-danger)" }}>
                <p style={{ color: "var(--brand-danger)" }}>⚠ {error}</p>
              </div>
            )}

            {result && (
              <div className="card">
                <div className="flex justify-between items-center mb-4">
                  <div className="badge badge-success">Analysis Complete</div>
                  <button className="btn btn-ghost btn-sm" onClick={() => navigator.clipboard.writeText(result)}>
                    <Copy size={13} /> Copy
                  </button>
                </div>
                <div className="ai-output">{formatText(result)}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
