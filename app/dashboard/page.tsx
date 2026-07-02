"use client";

import AppShell from "@/components/layout/AppShell";
import Header from "@/components/layout/Header";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Activity,
  Clock,
  Star,
  FileText,
} from "lucide-react";
import { AGENTS } from "@/lib/agents/types";

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

export default function DashboardPage() {
  const [reports, setReports] = useState<Array<{ title: string; date: string; icon: string; status: string; summary: string }>>([]);
  const [metrics, setMetrics] = useState<{ conversationCount: number; reportCount: number; usageCount: number } | null>(null);

  const toReportCard = (report: any) => ({
    title: report.title,
    date: new Date(report.createdAt).toLocaleDateString([], { month: "long", day: "numeric", year: "numeric" }),
    icon:
      report.type === "Research"
        ? "🔬"
        : report.type === "Trends"
          ? "📈"
          : report.type === "Career"
            ? "🎓"
            : report.type === "Validation"
              ? "🚀"
              : "🎯",
    status: report.status,
    summary: report.summary,
  });

  useEffect(() => {
    const load = async () => {
      const [reportsResponse, metricsResponse] = await Promise.all([
        fetch("/api/reports"),
        fetch("/api/dashboard"),
      ]);

      if (reportsResponse.ok) {
        const reportsData = await reportsResponse.json();
        setReports((reportsData.reports ?? []).map(toReportCard));
      }

      if (metricsResponse.ok) {
        const metricsData = await metricsResponse.json();
        setMetrics(metricsData.metrics ?? null);
      }
    };

    void load();
  }, []);

  const stats = useMemo(() => {
    const analysesRun = Math.max(metrics?.conversationCount ?? reports.length, 1);
    const reportsGenerated = metrics?.reportCount ?? reports.length;
    const insightsSaved = reports.reduce((sum, report) => sum + Math.max(1, Math.ceil(report.summary.length / 180)), 0);

    return [
      { label: "Analyses Run", value: String(analysesRun), change: reports.length ? "Saved in your workspace" : "Run your first analysis", up: true, icon: Activity },
      { label: "Reports Generated", value: String(reportsGenerated), change: reports.length ? "Persisted in Postgres" : "No reports yet", up: true, icon: FileText },
      { label: "Avg. Response Time", value: "12s", change: metrics?.usageCount ? "Usage tracked server-side" : "Telemetry not wired yet", up: true, icon: Clock },
      { label: "Insights Saved", value: String(insightsSaved), change: reports.length ? "Derived from saved reports" : "No saved insights yet", up: true, icon: Star },
    ];
  }, [metrics, reports]);

  const recentSessions = reports.slice(0, 4).map((report) => ({
    title: report.title,
    time: report.date,
    icon: report.icon,
    result: report.status,
  }));

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
              {recentSessions.length > 0 ? recentSessions.map((s, i) => (
                <div
                  key={i}
                  className="session-item"
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
              )) : (
                <div className="card" style={{ padding: 20 }}>
                  <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
                    No saved analyses yet. Run your first query in Chief Adviser to populate this area.
                  </p>
                </div>
              )}
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
              {AGENTS.map((agent) => (
                <div
                  key={agent.id}
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
