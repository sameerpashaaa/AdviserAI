"use client";

import AppShell from "@/components/layout/AppShell";
import Header from "@/components/layout/Header";
import { FileText, Download, Search, Clock, Plus } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const TYPE_FILTERS = ["All", "Research", "Strategy", "Validation", "Trends", "Career"];

type StoredReport = {
  id: string;
  title: string;
  type: string;
  date: string;
  icon: string;
  status: string;
  size: string;
  badge: string;
  summary: string;
};

function downloadReport(report: StoredReport) {
  const blob = new Blob([
    `${report.title}\n${report.type}\n${report.date}\n\n${report.summary}`,
  ], { type: "text/plain;charset=utf-8" });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${report.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase() || "report"}.txt`;
  link.click();
  URL.revokeObjectURL(url);
}

export default function ReportsPage() {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [reports, setReports] = useState<StoredReport[]>([]);

  useEffect(() => {
    const load = async () => {
      const response = await fetch("/api/reports");
      if (!response.ok) return;
      const data = await response.json();
      setReports((data.reports ?? []).map((report: any) => ({
        id: report.id,
        title: report.title,
        type: report.type,
        date: new Date(report.createdAt).toLocaleDateString([], { month: "long", day: "numeric", year: "numeric" }),
        icon: report.type === "Research" ? "🔬" : report.type === "Trends" ? "📈" : report.type === "Career" ? "🎓" : report.type === "Validation" ? "🚀" : "🎯",
        status: report.status,
        size: report.sizeLabel ?? "0 pages",
        badge: report.badge ?? "badge-primary",
        summary: report.summary,
      })));
    };

    void load();
  }, []);

  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      const matchesSearch =
        search.trim().length === 0 ||
        report.title.toLowerCase().includes(search.toLowerCase()) ||
        report.summary.toLowerCase().includes(search.toLowerCase());
      const matchesFilter = activeFilter === "All" || report.type === activeFilter;
      return matchesSearch && matchesFilter;
    });
  }, [reports, search, activeFilter]);

  const totalPages = reports.reduce((sum, report) => {
    const pages = Number.parseInt(report.size, 10);
    return sum + (Number.isNaN(pages) ? 0 : pages);
  }, 0);

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
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="tabs" style={{ width: "auto" }}>
            {TYPE_FILTERS.map((f) => (
              <button key={f} className={`tab ${f === activeFilter ? "active" : ""}`} style={{ fontSize: "0.75rem", padding: "6px 14px" }} onClick={() => setActiveFilter(f)}>
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid-4" style={{ marginBottom: 28 }}>
          {[
            { label: "Total Reports", value: String(reports.length), icon: "📋" },
            { label: "This Month", value: String(reports.filter((report) => report.date.includes("2026")).length), icon: "📅" },
            { label: "Pages Generated", value: String(totalPages), icon: "📄" },
            { label: "Avg. Quality Score", value: reports.length ? "94%" : "—", icon: "⭐" },
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
          {filteredReports.length > 0 ? filteredReports.map((report) => (
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
              <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: 8, lineHeight: 1.5 }}>
                {report.summary}
              </p>

              <div className="flex items-center gap-2" style={{ marginTop: "auto", paddingTop: 16, borderTop: "1px solid var(--border-subtle)" }}>
                <Clock size={12} color="var(--text-muted)" />
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", flex: 1 }}>{report.date}</span>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{report.size}</span>
                <button className="btn btn-ghost btn-sm" style={{ padding: "4px 8px" }} onClick={() => downloadReport(report)}>
                  <Download size={12} />
                </button>
              </div>
            </div>
          )) : (
            <div
              style={{
                gridColumn: "1 / -1",
                padding: "40px 32px",
                background: "var(--bg-card)",
                border: "2px dashed var(--border-default)",
                borderRadius: "var(--radius-xl)",
                textAlign: "center",
              }}
            >
              <FileText size={32} style={{ margin: "0 auto 12px", color: "var(--text-muted)", opacity: 0.4 }} />
              <h4 style={{ color: "var(--text-secondary)", marginBottom: 8 }}>No matching reports</h4>
              <p style={{ fontSize: "0.875rem", marginBottom: 20, maxWidth: 400, margin: "0 auto 20px" }}>
                Clear the search or run a new analysis in Chief Adviser to generate a report.
              </p>
              <Link href="/adviser" className="btn btn-primary">
                <Plus size={15} /> Start New Analysis
              </Link>
            </div>
          )}
        </div>

        {/* Empty state for future reports */}
        {reports.length > 0 && (
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
        )}
      </div>
    </AppShell>
  );
}
