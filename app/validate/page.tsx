"use client";

import { useState } from "react";
import AppShell from "@/components/layout/AppShell";
import Header from "@/components/layout/Header";
import { Zap, RefreshCw, Copy } from "lucide-react";

const BUSINESS_MODELS = [
  "SaaS / Subscription", "Marketplace", "E-commerce / DTC", "Freemium",
  "Platform / Ecosystem", "Transaction / Revenue Share", "Licensing",
  "Hardware + Software", "Productized Service",
];

const STAGES = ["Ideation", "MVP Building", "Early Traction", "Growth", "Scale"];

export default function ValidatePage() {
  const [idea, setIdea] = useState("");
  const [businessModel, setBusinessModel] = useState("");
  const [targetMarket, setTargetMarket] = useState("");
  const [stage, setStage] = useState("Ideation");
  const [result, setResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleValidate = async () => {
    if (!idea.trim()) return;
    setIsLoading(true);
    setError("");
    setResult("");
    try {
      const res = await fetch("/api/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea, businessModel, targetMarket, stage }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult(data.result);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Validation failed");
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
      if (line.startsWith("- ") || line.startsWith("• ")) {
        const formatted = line.slice(2).replace(/\*\*(.*?)\*\*/g, '<strong style="color:var(--text-primary)">$1</strong>');
        return (
          <div key={i} style={{ display: "flex", gap: 8, marginBottom: 6 }}>
            <span style={{ color: "var(--text-accent)", flexShrink: 0 }}>•</span>
            <span style={{ color: "var(--text-secondary)" }} dangerouslySetInnerHTML={{ __html: formatted }} />
          </div>
        );
      }
      if (line.includes("STRONG PROCEED")) return <div key={i} className="badge badge-success" style={{ margin: "8px 0", fontSize: "0.9rem", padding: "6px 16px" }}>✅ {line}</div>;
      if (line.includes("PROCEED WITH CAUTION")) return <div key={i} className="badge badge-warning" style={{ margin: "8px 0", fontSize: "0.9rem", padding: "6px 16px" }}>⚠️ {line}</div>;
      if (line.includes("PIVOT RECOMMENDED") || line.includes("DO NOT PROCEED")) return <div key={i} className="badge badge-danger" style={{ margin: "8px 0", fontSize: "0.9rem", padding: "6px 16px" }}>🚫 {line}</div>;
      if (line.trim() === "") return <div key={i} style={{ height: 8 }} />;
      const formatted = line.replace(/\*\*(.*?)\*\*/g, '<strong style="color:var(--text-primary);font-weight:600">$1</strong>');
      return <p key={i} style={{ marginBottom: 6, color: "var(--text-secondary)" }} dangerouslySetInnerHTML={{ __html: formatted }} />;
    });
  };

  return (
    <AppShell>
      <Header
        title="Business Validator"
        subtitle="VC-grade validation with TAM/SAM/SOM analysis and viability scoring"
      />
      <div style={{ padding: 28, flex: 1 }}>
        <div className="grid-2" style={{ gap: 24 }}>
          {/* Left: Form */}
          <div className="card" style={{ height: "fit-content" }}>
            <h3 style={{ color: "var(--text-primary)", marginBottom: 4 }}>Your Business Idea</h3>
            <p style={{ fontSize: "0.8125rem", marginBottom: 20 }}>
              Describe your idea in detail for the most accurate validation
            </p>

            <label style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>
              Business Idea *
            </label>
            <textarea
              className="input"
              placeholder="Describe your business idea clearly — what problem does it solve, who for, and how?"
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              rows={4}
              style={{ marginBottom: 16, resize: "vertical" }}
            />

            <label style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>
              Business Model
            </label>
            <select
              className="input"
              value={businessModel}
              onChange={(e) => setBusinessModel(e.target.value)}
              style={{ marginBottom: 16, cursor: "pointer" }}
            >
              <option value="">Select business model...</option>
              {BUSINESS_MODELS.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>

            <label style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>
              Target Market
            </label>
            <input
              className="input"
              placeholder="e.g. 'US-based small law firms with 2-20 attorneys'"
              value={targetMarket}
              onChange={(e) => setTargetMarket(e.target.value)}
              style={{ marginBottom: 16 }}
            />

            <label style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>
              Current Stage
            </label>
            <div className="tabs" style={{ marginBottom: 24 }}>
              {STAGES.map((s) => (
                <button key={s} className={`tab ${stage === s ? "active" : ""}`} onClick={() => setStage(s)}>
                  {s}
                </button>
              ))}
            </div>

            <button
              className="btn btn-primary w-full"
              onClick={handleValidate}
              disabled={!idea.trim() || isLoading}
            >
              {isLoading ? (
                <><RefreshCw size={15} className="animate-spin" /> Validating...</>
              ) : (
                <><Zap size={15} /> Validate This Idea</>
              )}
            </button>
          </div>

          {/* Right: Results */}
          <div>
            {/* Validation dimensions preview */}
            {!result && !isLoading && (
              <div className="card" style={{ marginBottom: 16 }}>
                <h4 style={{ color: "var(--text-primary)", marginBottom: 16, fontSize: "0.9rem" }}>
                  Validation Dimensions
                </h4>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {[
                    "Problem Clarity & Pain Intensity",
                    "Market Existence & Size",
                    "Solution Differentiation",
                    "Competitive Feasibility",
                    "Business Model Viability",
                    "Team & Execution Readiness",
                  ].map((d, i) => (
                    <div key={d} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: "var(--bg-elevated)", borderRadius: "var(--radius-sm)" }}>
                      <div style={{ width: 24, height: 24, borderRadius: "50%", background: "rgba(124,58,237,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 700, color: "var(--text-accent)" }}>
                        {i + 1}
                      </div>
                      <span style={{ fontSize: "0.8125rem", color: "var(--text-secondary)" }}>{d}</span>
                      <div style={{ marginLeft: "auto", width: 40, height: 4, background: "var(--border-subtle)", borderRadius: 4 }} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {isLoading && (
              <div className="card">
                <div className="flex items-center gap-3 mb-6">
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--gradient-brand)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Zap size={16} color="white" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: "0.875rem" }}>Validation Agent Running</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>VC-grade analysis in progress...</div>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {["Scoring problem clarity...", "Estimating market size (TAM/SAM/SOM)...", "Analyzing competitive landscape...", "Evaluating business model viability...", "Generating validation verdict..."].map((step, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="typing-dot" style={{ background: "var(--brand-secondary)", animation: `typing-dot 1.4s ${i * 0.3}s ease-in-out infinite` }} />
                      <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{step}</span>
                    </div>
                  ))}
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
                  <div className="badge badge-success">Validation Complete</div>
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
