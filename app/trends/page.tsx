"use client";

import { useState } from "react";
import AppShell from "@/components/layout/AppShell";
import Header from "@/components/layout/Header";
import { TrendingUp, RefreshCw, Copy, Globe } from "lucide-react";
import { renderMarkdown, renderInline } from "@/lib/safeMarkdown";

const INDUSTRIES = [
  "Artificial Intelligence", "FinTech", "HealthTech", "EdTech", "CleanTech",
  "E-commerce", "SaaS / B2B Software", "Cybersecurity", "Biotech",
  "Real Estate Tech", "Legal Tech", "HR Tech", "AgriTech", "SpaceTech",
];

const REGIONS = ["Global", "North America", "Europe", "Asia Pacific", "MENA", "Latin America"];

const TIME_HORIZONS = ["6 months", "12 months", "12-24 months", "3-5 years"];

export default function TrendsPage() {
  const [industry, setIndustry] = useState("");
  const [region, setRegion] = useState("Global");
  const [timeHorizon, setTimeHorizon] = useState("12-24 months");
  const [result, setResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAnalyze = async () => {
    if (!industry.trim()) return;
    setIsLoading(true);
    setError("");
    setResult("");
    try {
      const res = await fetch("/api/trends", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ industry, region, timeHorizon }),
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

  const formatText = (text: string) =>
    renderMarkdown(text, {
      h3Style: {
        borderBottom: "1px solid var(--border-subtle)",
        paddingBottom: 8,
      },
      renderLine: (line) => {
        if (line.toLowerCase().includes("emerging")) {
          return (
            <p
              style={{
                marginBottom: 6,
                color: "var(--text-secondary)",
                borderLeft: "3px solid var(--brand-success)",
                paddingLeft: 12,
              }}
            >
              {renderInline(line)}
            </p>
          );
        }
        return null;
      },
    });

  return (
    <AppShell>
      <Header
        title="Trend Intelligence"
        subtitle="Emerging trend detection across 50,000+ sources"
      />
      <div style={{ padding: 28, flex: 1 }}>
        <div className="grid-2" style={{ gap: 24 }}>
          {/* Left: Form */}
          <div className="card" style={{ height: "fit-content" }}>
            <h3 style={{ color: "var(--text-primary)", marginBottom: 4 }}>Trend Analysis Parameters</h3>
            <p style={{ fontSize: "0.8125rem", marginBottom: 20 }}>
              Configure your trend intelligence scan
            </p>

            <label style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 8 }}>
              Industry / Sector *
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 16 }}>
              {INDUSTRIES.map((ind) => (
                <button
                  key={ind}
                  onClick={() => setIndustry(ind)}
                  style={{
                    padding: "7px 10px",
                    borderRadius: "var(--radius-sm)",
                    border: `1px solid ${industry === ind ? "var(--border-strong)" : "var(--border-subtle)"}`,
                    background: industry === ind ? "rgba(124,58,237,0.1)" : "transparent",
                    color: industry === ind ? "var(--text-accent)" : "var(--text-muted)",
                    fontSize: "0.75rem",
                    cursor: "pointer",
                    transition: "all 0.15s",
                    fontWeight: industry === ind ? 600 : 400,
                    textAlign: "left",
                  }}
                >
                  {ind}
                </button>
              ))}
            </div>

            <input
              className="input"
              placeholder="Or type a custom industry..."
              value={INDUSTRIES.includes(industry) ? "" : industry}
              onChange={(e) => setIndustry(e.target.value)}
              style={{ marginBottom: 16 }}
            />

            <label style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 8 }}>
              Region
            </label>
            <div className="tabs" style={{ marginBottom: 16 }}>
              {REGIONS.map((r) => (
                <button key={r} className={`tab ${region === r ? "active" : ""}`} onClick={() => setRegion(r)} style={{ fontSize: "0.7rem" }}>
                  {r}
                </button>
              ))}
            </div>

            <label style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 8 }}>
              Time Horizon
            </label>
            <div className="tabs" style={{ marginBottom: 24 }}>
              {TIME_HORIZONS.map((t) => (
                <button key={t} className={`tab ${timeHorizon === t ? "active" : ""}`} onClick={() => setTimeHorizon(t)} style={{ fontSize: "0.7rem" }}>
                  {t}
                </button>
              ))}
            </div>

            <button
              className="btn btn-primary w-full"
              onClick={handleAnalyze}
              disabled={!industry.trim() || isLoading}
            >
              {isLoading ? (
                <><RefreshCw size={15} className="animate-spin" /> Scanning Trends...</>
              ) : (
                <><TrendingUp size={15} /> Scan for Trends</>
              )}
            </button>
          </div>

          {/* Right: Results */}
          <div>
            {!result && !isLoading && (
              <div style={{ height: "100%", minHeight: 300, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "var(--bg-card)", border: "1px dashed var(--border-default)", borderRadius: "var(--radius-lg)", gap: 12, color: "var(--text-muted)", textAlign: "center", padding: 32 }}>
                <TrendingUp size={32} style={{ opacity: 0.3 }} />
                <p style={{ fontSize: "0.875rem" }}>
                  Select an industry and configure parameters to scan for emerging trends and opportunities.
                </p>
              </div>
            )}

            {isLoading && (
              <div className="card">
                <div className="flex items-center gap-3 mb-6">
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--gradient-brand)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Globe size={16} color="white" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: "0.875rem" }}>Trend Intelligence Active</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Scanning 50,000+ sources...</div>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {["Monitoring news signals...", "Analyzing investment flows...", "Scanning patent filings...", "Processing social signals...", "Synthesizing trend report..."].map((step, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="status-dot thinking" />
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
                  <div>
                    <div className="badge badge-success">Trend Scan Complete</div>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginLeft: 8 }}>
                      {industry} · {region} · {timeHorizon}
                    </span>
                  </div>
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
