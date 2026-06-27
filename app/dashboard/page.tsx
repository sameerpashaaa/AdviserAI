"use client";

import AppShell from "@/components/layout/AppShell";
import Header from "@/components/layout/Header";
import Link from "next/link";
import {
  Brain,
  Search,
  Target,
  TrendingUp,
  Zap,
  Briefcase,
  FileText,
  ArrowRight,
  Activity,
  Clock,
  Star,
} from "lucide-react";

const stats = [
  { label: "Analyses Run", value: "24", change: "+8 this week", up: true, icon: Activity },
  { label: "Reports Generated", value: "7", change: "+3 this week", up: true, icon: FileText },
  { label: "Avg. Response Time", value: "12s", change: "-3s vs. last week", up: true, icon: Clock },
  { label: "Insights Saved", value: "41", change: "+12 this week", up: true, icon: Star },
];

const quickActions = [
  {
    href: "/adviser",
    icon: "🎯",
    color: "rgba(124,58,237,0.15)",
    border: "rgba(124,58,237,0.2)",
    title: "Chief Adviser",
    desc: "Get expert strategic advice on any business question",
    badge: "AI Chat",
  },
  {
    href: "/research",
    icon: "🔬",
    color: "rgba(6,182,212,0.12)",
    border: "rgba(6,182,212,0.2)",
    title: "Deep Research",
    desc: "Research any market, company, or topic with AI",
    badge: "Research",
  },
  {
    href: "/strategy",
    icon: "🎯",
    color: "rgba(16,185,129,0.12)",
    border: "rgba(16,185,129,0.2)",
    title: "Strategy Hub",
    desc: "SWOT, PESTLE, Porter's & 6 more frameworks",
    badge: "Strategy",
  },
  {
    href: "/validate",
    icon: "🚀",
    color: "rgba(245,158,11,0.12)",
    border: "rgba(245,158,11,0.2)",
    title: "Validate an Idea",
    desc: "Score your business idea with VC-grade analysis",
    badge: "Validation",
  },
  {
    href: "/trends",
    icon: "📈",
    color: "rgba(239,68,68,0.12)",
    border: "rgba(239,68,68,0.2)",
    title: "Trend Intelligence",
    desc: "Identify emerging opportunities in your market",
    badge: "Trends",
  },
  {
    href: "/career",
    icon: "🎓",
    color: "rgba(124,58,237,0.12)",
    border: "rgba(124,58,237,0.2)",
    title: "Career Adviser",
    desc: "Map your career path with market demand data",
    badge: "Career",
  },
];

const recentSessions = [
  { type: "research", title: "AI Consulting Market Analysis", time: "2h ago", icon: "🔬", result: "Completed" },
  { type: "strategy", title: "SWOT Analysis — SaaS Platform", time: "5h ago", icon: "🎯", result: "Completed" },
  { type: "validate", title: "EdTech Startup Validation", time: "Yesterday", icon: "🚀", result: "Score: 72/100" },
  { type: "trends", title: "Healthcare AI Trends", time: "2 days ago", icon: "📈", result: "8 trends found" },
];

export default function DashboardPage() {
  return (
    <AppShell>
      <Header
        title="Dashboard"
        subtitle="Welcome back — your strategic intelligence hub"
      />

      <div style={{ padding: "28px", flex: 1 }}>
        {/* Stats Row */}
        <div className="grid-4" style={{ marginBottom: 28 }}>
          {stats.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="stat-card">
                <div className="flex justify-between items-center mb-2">
                  <div className="stat-label">{s.label}</div>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      background: "rgba(124,58,237,0.12)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Icon size={15} color="var(--text-accent)" />
                  </div>
                </div>
                <div className="stat-value gradient-text">{s.value}</div>
                <div className={`stat-change ${s.up ? "up" : "down"}`}>
                  {s.up ? "↑" : "↓"} {s.change}
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <h3
          style={{
            fontSize: "1rem",
            fontWeight: 500,
            fontFamily: "var(--font-sans)",
            marginBottom: 16,
            color: "var(--text-primary)",
          }}
        >
          Quick Start
        </h3>
        <div className="grid-3" style={{ marginBottom: 32 }}>
          {quickActions.map((a) => (
            <Link
              key={a.href}
              href={a.href}
              style={{ textDecoration: "none" }}
            >
              <div
                className="card"
                style={{
                  height: "100%",
                  cursor: "pointer",
                  padding: "24px",
                }}
              >
                <div className="flex justify-between items-center mb-2">
                  <span style={{ fontSize: "1.5rem" }}>{a.icon}</span>
                  <span className="badge badge-neutral" style={{ fontSize: "0.7rem" }}>
                    {a.badge}
                  </span>
                </div>
                <h4 style={{ color: "var(--text-primary)", fontSize: "0.95rem", marginBottom: 6 }}>
                  {a.title}
                </h4>
                <p style={{ fontSize: "0.8125rem", lineHeight: 1.5 }}>{a.desc}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Recent Sessions */}
        <div className="grid-2">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 style={{ fontSize: "1rem", fontWeight: 500, fontFamily: "var(--font-sans)", color: "var(--text-primary)" }}>
                Recent Sessions
              </h3>
              <Link
                href="/reports"
                className="btn btn-ghost btn-sm"
                style={{ fontSize: "0.8rem" }}
              >
                View All <ArrowRight size={12} />
              </Link>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {recentSessions.map((s, i) => (
                <div
                  key={i}
                  style={{
                    background: "var(--bg-card)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "var(--radius-md)",
                    padding: "14px 16px",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLElement).style.borderColor = "var(--glass-border)")
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLElement).style.borderColor = "var(--border-subtle)")
                  }
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 8,
                      background: "var(--bg-elevated)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1.1rem",
                      flexShrink: 0,
                    }}
                  >
                    {s.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      className="truncate"
                      style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text-primary)" }}
                    >
                      {s.title}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: 2 }}>
                      {s.time} · {s.result}
                    </div>
                  </div>
                  <ArrowRight size={14} color="var(--text-muted)" />
                </div>
              ))}
            </div>
          </div>

          {/* Agent Status Panel */}
          <div>
            <h3
              style={{
                fontSize: "1rem",
                fontWeight: 500,
                fontFamily: "var(--font-sans)",
                color: "var(--text-primary)",
                marginBottom: 16,
              }}
            >
              AI Agents
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {[
                { name: "Chief Adviser", icon: "🎯", status: "active" },
                { name: "Research Agent", icon: "🔬", status: "active" },
                { name: "Market Intelligence", icon: "📊", status: "active" },
                { name: "Trend Analysis", icon: "📈", status: "active" },
                { name: "Financial Analyst", icon: "💰", status: "active" },
                { name: "Startup Consultant", icon: "🚀", status: "active" },
                { name: "Tech Architect", icon: "🏗️", status: "active" },
                { name: "Risk Assessment", icon: "⚠️", status: "active" },
                { name: "Report Generator", icon: "📋", status: "active" },
                { name: "Fact Verifier", icon: "✅", status: "active" },
              ].map((agent) => (
                <div
                  key={agent.name}
                  style={{
                    background: "var(--bg-card)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "var(--radius-sm)",
                    padding: "10px 14px",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <span style={{ fontSize: "1rem" }}>{agent.icon}</span>
                  <span style={{ flex: 1, fontSize: "0.8125rem", color: "var(--text-secondary)" }}>
                    {agent.name}
                  </span>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span className="status-dot active" />
                    <span style={{ fontSize: "0.7rem", color: "var(--brand-success)" }}>Online</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
