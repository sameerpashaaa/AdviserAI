"use client";

import AppShell from "@/components/layout/AppShell";
import Header from "@/components/layout/Header";
import { FileText, Download, Search, Clock, Plus } from "lucide-react";
import Link from "next/link";

const MOCK_REPORTS = [
  { id: "1", title: "AI Consulting Market Analysis", type: "Research", date: "June 27, 2026", icon: "🔬", status: "Complete", size: "12 pages", badge: "badge-cyan" },
  { id: "2", title: "SWOT Analysis — B2B SaaS Platform", type: "Strategy", date: "June 26, 2026", icon: "🎯", status: "Complete", size: "8 pages", badge: "badge-primary" },
  { id: "3", title: "EdTech Startup Validation Report", type: "Validation", date: "June 25, 2026", icon: "🚀", status: "Complete", size: "15 pages", badge: "badge-success" },
  { id: "4", title: "Healthcare AI Trends 2026", type: "Trends", date: "June 24, 2026", icon: "📈", status: "Complete", size: "10 pages", badge: "badge-warning" },
  { id: "5", title: "SaaS Engineer Career Strategy", type: "Career", date: "June 23, 2026", icon: "🎓", status: "Complete", size: "7 pages", badge: "badge-neutral" },
  { id: "6", title: "FinTech Market Entry Strategy", type: "Strategy", date: "June 22, 2026", icon: "💰", status: "Complete", size: "18 pages", badge: "badge-primary" },
];

const TYPE_FILTERS = ["All", "Research", "Strategy", "Validation", "Trends", "Career"];

export default function ReportsPage() {
  return (
    <AppShell>
      <Header
        title="Reports Library"
        subtitle="All your AI-generated strategic intelligence reports"
        actions={
          <Link href="/adviser" className="btn btn-primary btn-sm">
            <Plus size={14} /> New Analysis
          </Link>
        }
      />
      <div style={{ padding: 28, flex: 1 }}>
        {/* Search + filter bar */}
        <div className="flex gap-3 items-center mb-6">
          <div style={{ position: "relative", flex: 1, maxWidth: 360 }}>
            <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
            <input
              className="input"
              placeholder="Search reports..."
              style={{ paddingLeft: 36 }}
            />
          </div>
          <div className="tabs" style={{ width: "auto" }}>
            {TYPE_FILTERS.map((f) => (
              <button key={f} className={`tab ${f === "All" ? "active" : ""}`} style={{ fontSize: "0.75rem", padding: "6px 14px" }}>
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid-4" style={{ marginBottom: 28 }}>
          {[
            { label: "Total Reports", value: "24", icon: "📋" },
            { label: "This Month", value: "8", icon: "📅" },
            { label: "Pages Generated", value: "312", icon: "📄" },
            { label: "Avg. Quality Score", value: "94%", icon: "⭐" },
          ].map((s) => (
            <div key={s.label} className="stat-card">
              <div className="flex justify-between items-center">
                <div>
                  <div className="stat-label">{s.label}</div>
                  <div className="stat-value gradient-text">{s.value}</div>
                </div>
                <span style={{ fontSize: "1.5rem" }}>{s.icon}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Reports grid */}
        <div className="grid-3">
          {MOCK_REPORTS.map((report) => (
            <div
              key={report.id}
              className="card card-glow"
              style={{ cursor: "pointer", display: "flex", flexDirection: "column", gap: 0 }}
            >
              <div className="flex justify-between items-start mb-4">
                <div
                  style={{ width: 44, height: 44, borderRadius: 10, background: "var(--bg-elevated)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.3rem" }}
                >
                  {report.icon}
                </div>
                <div className={`badge ${report.badge}`} style={{ fontSize: "0.7rem" }}>
                  {report.type}
                </div>
              </div>

              <h4 style={{ color: "var(--text-primary)", fontSize: "0.9375rem", marginBottom: 8, lineHeight: 1.4 }}>
                {report.title}
              </h4>

              <div className="flex items-center gap-2" style={{ marginTop: "auto", paddingTop: 16, borderTop: "1px solid var(--border-subtle)" }}>
                <Clock size={12} color="var(--text-muted)" />
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", flex: 1 }}>{report.date}</span>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{report.size}</span>
                <button className="btn btn-ghost btn-sm" style={{ padding: "4px 8px" }}>
                  <Download size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty state for future reports */}
        <div
          style={{
            marginTop: 32,
            padding: "40px 32px",
            background: "var(--bg-card)",
            border: "2px dashed var(--border-default)",
            borderRadius: "var(--radius-xl)",
            textAlign: "center",
          }}
        >
          <FileText size={32} style={{ margin: "0 auto 12px", color: "var(--text-muted)", opacity: 0.4 }} />
          <h4 style={{ color: "var(--text-secondary)", marginBottom: 8 }}>Generate More Reports</h4>
          <p style={{ fontSize: "0.875rem", marginBottom: 20, maxWidth: 400, margin: "0 auto 20px" }}>
            Run any analysis — research, strategy, validation, trends, or career planning — to generate a new report.
          </p>
          <Link href="/adviser" className="btn btn-primary">
            <Plus size={15} /> Start New Analysis
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
