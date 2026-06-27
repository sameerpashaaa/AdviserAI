"use client";

import Link from "next/link";
import Image from "next/image";
import GradientBackground from "@/components/ui/GradientBackground";
import {
  Brain,
  ArrowRight,
  CheckCircle,
  Zap,
  Search,
  Target,
  TrendingUp,
  Shield,
  FileText,
  Briefcase,
  Star,
  BarChart3,
  Users,
  Globe,
} from "lucide-react";

const features = [
  {
    icon: "🔬",
    color: "rgba(124,58,237,0.15)",
    title: "Deep Research Engine",
    desc: "Multi-source parallel research with citation scoring, fact-checking, and confidence levels. Like having a PhD analyst on demand.",
  },
  {
    icon: "🎯",
    color: "rgba(6,182,212,0.15)",
    title: "Strategic Frameworks",
    desc: "SWOT, PESTLE, Porter's Five Forces, BCG Matrix, Ansoff Matrix — all automated with AI-generated, context-specific insights.",
  },
  {
    icon: "🚀",
    color: "rgba(16,185,129,0.15)",
    title: "Business Validator",
    desc: "VC-grade idea validation scorecard with TAM/SAM/SOM analysis, viability scoring, and go-to-market strategy generation.",
  },
  {
    icon: "📈",
    color: "rgba(245,158,11,0.15)",
    title: "Trend Intelligence",
    desc: "Real-time trend detection across 50,000+ sources. Spot emerging opportunities 12–24 months before they become mainstream.",
  },
  {
    icon: "⚠️",
    color: "rgba(239,68,68,0.15)",
    title: "Risk Assessment",
    desc: "Comprehensive risk registry across market, financial, regulatory, operational, and macro risk categories with mitigation playbooks.",
  },
  {
    icon: "💰",
    color: "rgba(124,58,237,0.15)",
    title: "Financial Modeling",
    desc: "Revenue projections, unit economics, LTV/CAC analysis, burn rate, and investor-ready financial summaries in minutes.",
  },
  {
    icon: "📋",
    color: "rgba(6,182,212,0.15)",
    title: "Report Generation",
    desc: "Transform AI analysis into boardroom-ready PDFs, executive presentations, and professional business documents.",
  },
  {
    icon: "🎓",
    color: "rgba(16,185,129,0.15)",
    title: "Career Intelligence",
    desc: "Personalized career path analysis with market demand forecasting, skills gap identification, and custom learning roadmaps.",
  },
];

const competitors = [
  {
    name: "ChatGPT",
    pricing: "$20/mo",
    depth: "❌",
    frameworks: "❌",
    research: "⚡",
    reports: "❌",
  },
  {
    name: "Perplexity",
    pricing: "$20/mo",
    depth: "❌",
    frameworks: "❌",
    research: "✅",
    reports: "❌",
  },
  {
    name: "IBM Consulting",
    pricing: "$500K+",
    depth: "✅",
    frameworks: "✅",
    research: "✅",
    reports: "✅",
  },
  {
    name: "Adviser AI",
    pricing: "$49/mo",
    depth: "✅✅",
    frameworks: "✅✅",
    research: "✅✅",
    reports: "✅✅",
    highlight: true,
  },
];

const pricing = [
  {
    name: "Starter",
    price: "$49",
    period: "/month",
    desc: "Perfect for entrepreneurs and freelancers",
    features: [
      "500 AI credits/month",
      "Chief Adviser chat",
      "Research Engine",
      "Strategy frameworks",
      "PDF export",
      "Email support",
    ],
    cta: "Start Free Trial",
    featured: false,
  },
  {
    name: "Professional",
    price: "$149",
    period: "/month",
    desc: "For serious strategists and product teams",
    features: [
      "2,000 AI credits/month",
      "All 10 AI agents",
      "Business Validator",
      "Trend Intelligence",
      "Career Adviser",
      "Advanced reports",
      "API access",
      "Priority support",
    ],
    cta: "Start Free Trial",
    featured: true,
  },
  {
    name: "Enterprise",
    price: "$499",
    period: "/month",
    desc: "For teams and organizations",
    features: [
      "Unlimited AI credits",
      "Team workspaces",
      "White-label reports",
      "Custom AI agents",
      "SSO & compliance",
      "Dedicated support",
      "SLA guarantee",
      "Custom integrations",
    ],
    cta: "Contact Sales",
    featured: false,
  },
];

const stats = [
  { value: "10", label: "Specialized AI Agents", icon: Brain },
  { value: "23.7%", label: "Market CAGR 2024–2032", icon: TrendingUp },
  { value: "$49B", label: "Addressable Market by 2032", icon: Globe },
  { value: "80%", label: "Time Saved vs. Consulting", icon: Zap },
];

export default function LandingPage() {
  return (
    <div style={{ position: "relative" }}>
      <GradientBackground />
      {/* ── Navigation ── */}
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 200,
          padding: "0 32px",
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "rgba(245,245,245,0.85)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid var(--border-default)",
        }}
      >
        <Image
          src="/adviser_ai_logo.svg"
          alt="Adviser AI"
          width={230}
          height={79}
          priority
          style={{ display: "block", height: 40, width: "auto" }}
        />
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <Link
            href="/dashboard"
            className="btn btn-ghost btn-sm"
          >
            Sign In
          </Link>
          <Link href="/dashboard" className="btn btn-primary btn-sm">
            Get Started <ArrowRight size={14} />
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="hero-section" style={{ paddingTop: 64 }}>
        <div
          className="container"
          style={{ position: "relative", textAlign: "center" }}
        >
          <div className="animate-fade-in-up">
            <div
              className="badge badge-primary"
              style={{ marginBottom: 24, fontSize: "0.8rem", padding: "4px 14px" }}
            >
              <Zap size={12} /> 10 Specialized AI Agents · Enterprise Intelligence at $49/mo
            </div>
            <h1
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
                letterSpacing: "-0.04em",
                lineHeight: 1.05,
                marginBottom: 24,
              }}
            >
              <span style={{ fontWeight: 700 }}>Your Personal </span>
              <span className="gradient-text">McKinsey Partner</span>
              <br />
              <span style={{ fontWeight: 700 }}>Powered by AI</span>
            </h1>
            <p
              style={{
                fontSize: "clamp(1rem, 2vw, 1.25rem)",
                color: "var(--text-secondary)",
                maxWidth: 620,
                margin: "0 auto 40px",
                lineHeight: 1.7,
              }}
            >
              Adviser AI deploys 10 specialized agents to deliver boardroom-grade
              strategy, deep research, market intelligence, and expert analysis
              — in minutes, not months.
            </p>
            <div
              style={{
                display: "flex",
                gap: 16,
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              <Link href="/dashboard" className="btn btn-primary btn-xl">
                Start for Free <ArrowRight size={18} />
              </Link>
              <Link href="/adviser" className="btn btn-ghost btn-xl">
                <Brain size={18} /> See Live Demo
              </Link>
            </div>
            <div
              style={{
                display: "flex",
                gap: 24,
                justifyContent: "center",
                marginTop: 32,
                flexWrap: "wrap",
              }}
            >
              {["No credit card required", "14-day free trial", "Cancel anytime"].map(
                (t) => (
                  <div
                    key={t}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      color: "var(--text-muted)",
                      fontSize: "0.875rem",
                    }}
                  >
                    <CheckCircle size={14} color="var(--brand-success)" />
                    {t}
                  </div>
                )
              )}
            </div>
          </div>

          {/* Preview Card */}
          <div
            className="animate-fade-in-up delay-300"
            style={{
              marginTop: 64,
              background: "var(--bg-card)",
              border: "1px solid var(--border-strong)",
              borderRadius: "var(--radius-xl)",
              padding: 24,
              maxWidth: 860,
              margin: "64px auto 0",
              boxShadow: "var(--shadow-glow), var(--shadow-lg)",
              textAlign: "left",
            }}
          >
            {/* Mock header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 20,
                paddingBottom: 16,
                borderBottom: "1px solid var(--border-subtle)",
              }}
            >
              <div style={{ display: "flex", gap: 6 }}>
                {["#ef4444", "#f59e0b", "#10b981"].map((c) => (
                  <div
                    key={c}
                    style={{ width: 10, height: 10, borderRadius: "50%", background: c }}
                  />
                ))}
              </div>
              <span style={{ color: "var(--text-muted)", fontSize: "0.8rem", marginLeft: 8 }}>
                adviser-ai.app — Chief Adviser
              </span>
            </div>

            {/* Mock agent activity */}
            <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
              {["🎯 Chief Adviser", "🔬 Research", "📊 Market Intel", "⚠️ Risk"].map(
                (a, i) => (
                  <div key={a} className={`agent-chip ${i < 3 ? "done" : "active"}`}>
                    <span className={`status-dot ${i < 3 ? "active" : "thinking"}`} />
                    {a}
                  </div>
                )
              )}
            </div>

            {/* Mock chat */}
            <div
              style={{
                background: "rgba(124,58,237,0.08)",
                border: "1px solid rgba(124,58,237,0.2)",
                borderRadius: 12,
                padding: 16,
                marginBottom: 16,
                fontSize: "0.9rem",
                color: "var(--text-primary)",
              }}
            >
              <strong>You:</strong> Analyze the AI consulting market opportunity for a new entrant. Give me market sizing, competitive dynamics, and go-to-market strategy.
            </div>
            <div
              style={{
                background: "var(--bg-elevated)",
                border: "1px solid var(--border-subtle)",
                borderRadius: 12,
                padding: 16,
                fontSize: "0.875rem",
                color: "var(--text-secondary)",
                lineHeight: 1.7,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    background: "var(--gradient-brand)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Brain size={12} color="white" />
                </div>
                <span style={{ color: "var(--text-accent)", fontWeight: 600 }}>Chief Adviser</span>
                <span className="badge badge-success" style={{ fontSize: "0.65rem" }}>
                  Expert Analysis
                </span>
              </div>
              <p style={{ marginBottom: 8, color: "var(--text-primary)", fontWeight: 600 }}>
                📊 Executive Summary
              </p>
              <p style={{ marginBottom: 8 }}>
                The AI consulting market represents a{" "}
                <strong style={{ color: "var(--text-accent)" }}>$49.1B opportunity by 2032</strong>{" "}
                (24.1% CAGR), driven by enterprise AI adoption and critical talent gaps. New entrants
                face a clear white space: productized AI advisory at SMB price points ($49–499/mo)
                where no dominant player exists.
              </p>
              <p>
                <strong style={{ color: "var(--brand-success)" }}>Strategic Verdict:</strong>{" "}
                High opportunity, defensible positioning via multi-agent architecture and framework
                automation. Recommended go-to-market: PLG motion targeting startup founders → expand
                to corporate strategists → enterprise contracts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="section-sm">
        <div className="container">
          <div className="grid-4">
            {stats.map(({ value, label, icon: Icon }) => (
              <div
                key={label}
                style={{
                  textAlign: "center",
                  padding: "24px 16px",
                  background: "var(--bg-card)",
                  borderRadius: "var(--radius-lg)",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    background: "rgba(124,58,237,0.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 12px",
                  }}
                >
                  <Icon size={18} color="var(--text-accent)" />
                </div>
                <div
                  style={{
                    fontSize: "1.75rem",
                    fontWeight: 300,
                    fontFamily: "var(--font-display)",
                    color: "var(--text-primary)",
                  }}
                >
                  {value}
                </div>
                <div style={{ fontSize: "0.8125rem", color: "var(--text-muted)", marginTop: 4 }}>
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="section">
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <div className="badge badge-primary" style={{ marginBottom: 16 }}>
              Platform Capabilities
            </div>
            <h2 style={{ marginBottom: 16 }}>
              Everything you need to{" "}
              <span className="gradient-text">think like a strategist</span>
            </h2>
            <p style={{ maxWidth: 540, margin: "0 auto", fontSize: "1rem" }}>
              Built on a 10-agent architecture, Adviser AI delivers the full stack of
              strategic intelligence — research, analysis, validation, and reporting.
            </p>
          </div>
          <div className="grid-4">
            {features.map((f) => (
              <div key={f.title} className="feature-card">
                <div
                  className="feature-icon"
                  style={{ background: f.color, fontSize: "1.5rem" }}
                >
                  {f.icon}
                </div>
                <h4 style={{ marginBottom: 8, color: "var(--text-primary)" }}>{f.title}</h4>
                <p style={{ fontSize: "0.875rem", lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Competitor Matrix ── */}
      <section className="section">
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <div className="badge badge-cyan" style={{ marginBottom: 16 }}>
              Competitive Advantage
            </div>
            <h2 style={{ marginBottom: 16 }}>
              <span className="gradient-text">10x more capability</span> at 1/100th the cost
            </h2>
            <p style={{ maxWidth: 500, margin: "0 auto" }}>
              Compare Adviser AI against the alternatives. The difference is clear.
            </p>
          </div>
          <div
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-xl)",
              overflow: "hidden",
            }}
          >
            <table className="comp-table">
              <thead>
                <tr>
                  <th>Platform</th>
                  <th>Pricing</th>
                  <th>Strategic Depth</th>
                  <th>Frameworks</th>
                  <th>Research</th>
                  <th>Reports</th>
                </tr>
              </thead>
              <tbody>
                {competitors.map((c) => (
                  <tr key={c.name} className={c.highlight ? "highlight-row" : ""}>
                    <td>
                      <strong>{c.highlight ? `⭐ ${c.name}` : c.name}</strong>
                    </td>
                    <td>
                      <span
                        style={{
                          color: c.highlight ? "var(--brand-success)" : "var(--text-secondary)",
                          fontWeight: c.highlight ? 700 : 400,
                        }}
                      >
                        {c.pricing}
                      </span>
                    </td>
                    <td className={c.depth.includes("✅") ? "check" : c.depth === "❌" ? "cross" : "partial"}>
                      {c.depth}
                    </td>
                    <td className={c.frameworks.includes("✅") ? "check" : c.frameworks === "❌" ? "cross" : "partial"}>
                      {c.frameworks}
                    </td>
                    <td className={c.research.includes("✅") ? "check" : c.research === "❌" ? "cross" : "partial"}>
                      {c.research}
                    </td>
                    <td className={c.reports.includes("✅") ? "check" : c.reports === "❌" ? "cross" : "partial"}>
                      {c.reports}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section className="section" id="pricing">
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <div className="badge badge-warning" style={{ marginBottom: 16 }}>
              Simple Pricing
            </div>
            <h2 style={{ marginBottom: 16 }}>
              Start free,{" "}
              <span className="gradient-text">scale as you grow</span>
            </h2>
            <p style={{ maxWidth: 480, margin: "0 auto" }}>
              All plans include a 14-day free trial. No credit card required.
            </p>
          </div>
          <div className="grid-3" style={{ alignItems: "stretch" }}>
            {pricing.map((plan) => (
              <div
                key={plan.name}
                className={`pricing-card ${plan.featured ? "featured" : ""}`}
              >
                {plan.featured && (
                  <div
                    style={{
                      position: "absolute",
                      top: -1,
                      left: "50%",
                      transform: "translateX(-50%)",
                    }}
                  >
                    <div
                      className="badge badge-primary"
                      style={{ borderRadius: "0 0 8px 8px", fontSize: "0.7rem" }}
                    >
                      <Star size={10} /> Most Popular
                    </div>
                  </div>
                )}
                <div style={{ marginTop: plan.featured ? 16 : 0 }}>
                  <h4 style={{ color: "var(--text-primary)", marginBottom: 4 }}>{plan.name}</h4>
                  <p style={{ fontSize: "0.8125rem", marginBottom: 20 }}>{plan.desc}</p>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 24 }}>
                    <span
                      style={{
                        fontSize: "2.5rem",
                        fontWeight: 300,
                        fontFamily: "var(--font-display)",
                        color: "var(--text-primary)",
                      }}
                    >
                      {plan.price}
                    </span>
                    <span style={{ color: "var(--text-muted)" }}>{plan.period}</span>
                  </div>
                  <Link
                    href="/dashboard"
                    className={`btn w-full ${plan.featured ? "btn-primary" : "btn-secondary"}`}
                    style={{ marginBottom: 24 }}
                  >
                    {plan.cta} <ArrowRight size={14} />
                  </Link>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {plan.features.map((f) => (
                      <div
                        key={f}
                        style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.875rem" }}
                      >
                        <CheckCircle size={14} color="var(--brand-success)" style={{ flexShrink: 0 }} />
                        <span style={{ color: "var(--text-secondary)" }}>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section
        className="section"
        style={{
          textAlign: "center",
        }}
      >
        <div className="container">
          <div
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border-strong)",
              borderRadius: "var(--radius-xl)",
              padding: "64px 48px",
              boxShadow: "var(--shadow-glow)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "var(--gradient-brand-soft)",
                pointerEvents: "none",
              }}
            />
            <div style={{ position: "relative" }}>
              <h2 style={{ marginBottom: 16 }}>
                Ready to think like the{" "}
                <span className="gradient-text">world&apos;s best strategist?</span>
              </h2>
              <p style={{ maxWidth: 480, margin: "0 auto 32px", fontSize: "1rem" }}>
                Join thousands of entrepreneurs, strategists, and executives who use
                Adviser AI to make better decisions, faster.
              </p>
              <Link href="/dashboard" className="btn btn-primary btn-xl">
                Start Your Free Trial <ArrowRight size={18} />
              </Link>
              <p style={{ marginTop: 16, fontSize: "0.8rem", color: "var(--text-muted)" }}>
                14-day free trial · No credit card · Cancel anytime
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer
        style={{
          padding: "32px 0",
          borderTop: "1px solid var(--border-subtle)",
          textAlign: "center",
        }}
      >
        <div className="container">
          <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center", marginBottom: 12 }}>
          <Image
            src="/adviser_ai_logo.svg"
            alt="Adviser AI"
            width={150}
            height={52}
            style={{ display: "block", height: 32, width: "auto" }}
          />
          </div>
          <p style={{ fontSize: "0.8125rem" }}>
            © 2026 Adviser AI. Democratizing world-class strategic advisory.
          </p>
        </div>
      </footer>
    </div>
  );
}
