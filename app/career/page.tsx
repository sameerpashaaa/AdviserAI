"use client";

import { useState } from "react";
import AppShell from "@/components/layout/AppShell";
import Header from "@/components/layout/Header";
import { Briefcase, RefreshCw, Copy, User } from "lucide-react";

const EXPERIENCE_LEVELS = ["0-2 years", "3-5 years", "6-10 years", "10+ years"];

export default function CareerPage() {
  const [currentRole, setCurrentRole] = useState("");
  const [skills, setSkills] = useState("");
  const [experience, setExperience] = useState("3-5 years");
  const [interests, setInterests] = useState("");
  const [goals, setGoals] = useState("");
  const [constraints, setConstraints] = useState("");
  const [result, setResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAnalyze = async () => {
    if (!currentRole.trim()) return;
    setIsLoading(true);
    setError("");
    setResult("");
    try {
      const res = await fetch("/api/career", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentRole, skills, experience, interests, goals, constraints }),
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
      if (line.startsWith("- ") || line.startsWith("• ")) {
        const formatted = line.slice(2).replace(/\*\*(.*?)\*\*/g, '<strong style="color:var(--text-primary)">$1</strong>');
        return (
          <div key={i} style={{ display: "flex", gap: 8, marginBottom: 6 }}>
            <span style={{ color: "var(--text-accent)", flexShrink: 0 }}>•</span>
            <span style={{ color: "var(--text-secondary)" }} dangerouslySetInnerHTML={{ __html: formatted }} />
          </div>
        );
      }
      if (line.toLowerCase().includes("low risk") || line.toLowerCase().includes("automation risk: low")) return <p key={i} style={{ color: "var(--brand-success)", fontWeight: 600, marginBottom: 6 }}>{line}</p>;
      if (line.toLowerCase().includes("high risk") || line.toLowerCase().includes("automation risk: high")) return <p key={i} style={{ color: "var(--brand-danger)", fontWeight: 600, marginBottom: 6 }}>{line}</p>;
      if (line.trim() === "") return <div key={i} style={{ height: 8 }} />;
      const formatted = line.replace(/\*\*(.*?)\*\*/g, '<strong style="color:var(--text-primary);font-weight:600">$1</strong>');
      return <p key={i} style={{ marginBottom: 6, color: "var(--text-secondary)" }} dangerouslySetInnerHTML={{ __html: formatted }} />;
    });
  };

  return (
    <AppShell>
      <Header
        title="Career Adviser"
        subtitle="AI-powered career path planning with market demand forecasting"
      />
      <div style={{ padding: 28, flex: 1 }}>
        <div className="grid-2" style={{ gap: 24 }}>
          {/* Left: Form */}
          <div className="card" style={{ height: "fit-content" }}>
            <div className="flex items-center gap-3 mb-4">
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: "var(--gradient-brand)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <User size={18} color="white" />
              </div>
              <div>
                <h3 style={{ color: "var(--text-primary)", fontSize: "1rem" }}>Career Profile</h3>
                <p style={{ fontSize: "0.75rem" }}>Tell us about yourself for personalized advice</p>
              </div>
            </div>

            {[
              { label: "Current Role / Title *", value: currentRole, setter: setCurrentRole, placeholder: "e.g. Senior Software Engineer at a startup" },
              { label: "Current Skills", value: skills, setter: setSkills, placeholder: "e.g. Python, React, AWS, Machine Learning, Product Management..." },
              { label: "Career Interests", value: interests, setter: setInterests, placeholder: "e.g. AI/ML, startup founding, product leadership, consulting..." },
              { label: "Career Goals", value: goals, setter: setGoals, placeholder: "e.g. Become a CTO, start my own company, work remotely in Europe..." },
              { label: "Constraints", value: constraints, setter: setConstraints, placeholder: "e.g. Can't relocate, need $150K+ salary, prefer work-life balance..." },
            ].map(({ label, value, setter, placeholder }) => (
              <div key={label} style={{ marginBottom: 14 }}>
                <label style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>
                  {label}
                </label>
                <input className="input" placeholder={placeholder} value={value} onChange={(e) => setter(e.target.value)} />
              </div>
            ))}

            <label style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 8 }}>
              Years of Experience
            </label>
            <div className="tabs" style={{ marginBottom: 24 }}>
              {EXPERIENCE_LEVELS.map((e) => (
                <button key={e} className={`tab ${experience === e ? "active" : ""}`} onClick={() => setExperience(e)} style={{ fontSize: "0.7rem" }}>
                  {e}
                </button>
              ))}
            </div>

            <button
              className="btn btn-primary w-full"
              onClick={handleAnalyze}
              disabled={!currentRole.trim() || isLoading}
            >
              {isLoading ? (
                <><RefreshCw size={15} className="animate-spin" /> Analyzing Career...</>
              ) : (
                <><Briefcase size={15} /> Build Career Strategy</>
              )}
            </button>
          </div>

          {/* Right: Results */}
          <div>
            {!result && !isLoading && (
              <div style={{ height: "100%", minHeight: 300, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "var(--bg-card)", border: "1px dashed var(--border-default)", borderRadius: "var(--radius-lg)", gap: 12, color: "var(--text-muted)", textAlign: "center", padding: 32 }}>
                <Briefcase size={32} style={{ opacity: 0.3 }} />
                <p style={{ fontSize: "0.875rem" }}>Fill in your career profile to receive a personalized career strategy with 3 paths, salary forecasts, and a learning roadmap.</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
                  {["3 Career Path Options with full analysis", "Salary trajectory forecasts", "Skills gap analysis", "Automation risk assessment", "Personalized learning roadmap"].map((f) => (
                    <div key={f} className="flex items-center gap-2">
                      <div className="status-dot idle" />
                      <span style={{ fontSize: "0.8rem" }}>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {isLoading && (
              <div className="card">
                <div className="flex items-center gap-3 mb-6">
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--gradient-brand)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Briefcase size={16} color="white" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: "0.875rem" }}>Career Intelligence Active</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Analyzing labor market data...</div>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {["Mapping career trajectories...", "Forecasting market demand...", "Identifying skill gaps...", "Calculating automation risk...", "Building learning roadmap..."].map((step, i) => (
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
                  <div className="badge badge-success">Career Strategy Ready</div>
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
