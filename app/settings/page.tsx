"use client";

import AppShell from "@/components/layout/AppShell";
import Header from "@/components/layout/Header";
import { Settings, Key, User, Bell, Shield, Brain, Save, Eye, EyeOff } from "lucide-react";
import { useState } from "react";

export default function SettingsPage() {
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const sections = [
    {
      title: "API Configuration",
      icon: Key,
      content: (
        <div>
          <label style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 8 }}>
            Gemini API Key
          </label>
          <div style={{ position: "relative" }}>
            <input
              className="input"
              type={showKey ? "text" : "password"}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              style={{ paddingRight: 44 }}
            />
            <button
              onClick={() => setShowKey(!showKey)}
              style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}
            >
              {showKey ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: 8 }}>
            Your API key is stored locally and used to power all 10 AI agents. Get your key at{" "}
            <a href="https://aistudio.google.com" target="_blank" rel="noopener noreferrer" style={{ color: "var(--text-accent)" }}>
              aistudio.google.com
            </a>
          </p>
          <div className="badge badge-success" style={{ marginTop: 12 }}>
            ✓ Connected to Gemini 2.5 Flash
          </div>
        </div>
      ),
    },
    {
      title: "Profile",
      icon: User,
      content: (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {[
            { label: "Full Name", placeholder: "Your name", value: "Sameer Pasha" },
            { label: "Email Address", placeholder: "your@email.com", value: "" },
            { label: "Company / Organization", placeholder: "Your company", value: "" },
            { label: "Role", placeholder: "e.g. Founder, Product Manager, Analyst", value: "" },
          ].map(({ label, placeholder, value }) => (
            <div key={label}>
              <label style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>
                {label}
              </label>
              <input className="input" placeholder={placeholder} defaultValue={value} />
            </div>
          ))}
        </div>
      ),
    },
    {
      title: "AI Preferences",
      icon: Brain,
      content: (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {[
            { label: "Default Analysis Depth", desc: "Standard or Deep for each research query", options: ["Standard", "Deep"] },
            { label: "Response Format", desc: "How AI structures its responses", options: ["Structured (Recommended)", "Narrative", "Bullet Points"] },
            { label: "Language", desc: "Output language preference", options: ["English", "Spanish", "French", "German"] },
          ].map(({ label, desc, options }) => (
            <div key={label}>
              <label style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>
                {label}
              </label>
              <p style={{ fontSize: "0.75rem", marginBottom: 8 }}>{desc}</p>
              <select className="input" style={{ cursor: "pointer" }}>
                {options.map((o) => <option key={o}>{o}</option>)}
              </select>
            </div>
          ))}
        </div>
      ),
    },
    {
      title: "Notifications",
      icon: Bell,
      content: (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {[
            { label: "Email digest", desc: "Weekly summary of your AI analyses" },
            { label: "Trend alerts", desc: "Notify when new trends match your watchlist" },
            { label: "Credit warnings", desc: "Alert when below 20% of monthly credits" },
          ].map(({ label, desc }) => (
            <div key={label} className="flex justify-between items-center" style={{ padding: "14px 16px", background: "var(--bg-elevated)", borderRadius: "var(--radius-md)" }}>
              <div>
                <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text-primary)" }}>{label}</div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{desc}</div>
              </div>
              <div
                style={{
                  width: 44, height: 24, borderRadius: 12,
                  background: "var(--gradient-brand)",
                  position: "relative", cursor: "pointer",
                }}
              >
                <div style={{ width: 18, height: 18, borderRadius: "50%", background: "white", position: "absolute", top: 3, right: 3 }} />
              </div>
            </div>
          ))}
        </div>
      ),
    },
  ];

  return (
    <AppShell>
      <Header
        title="Settings"
        subtitle="Configure your Adviser AI workspace"
        actions={
          <button className="btn btn-primary btn-sm" onClick={handleSave}>
            <Save size={14} /> {saved ? "Saved!" : "Save Changes"}
          </button>
        }
      />
      <div style={{ padding: 28, flex: 1, maxWidth: 800 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {sections.map(({ title, icon: Icon, content }) => (
            <div key={title} className="card">
              <div className="flex items-center gap-3 mb-6" style={{ paddingBottom: 16, borderBottom: "1px solid var(--border-subtle)" }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: "rgba(124,58,237,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon size={16} color="var(--text-accent)" />
                </div>
                <h3 style={{ color: "var(--text-primary)", fontSize: "1rem" }}>{title}</h3>
              </div>
              {content}
            </div>
          ))}

          {/* Danger zone */}
          <div className="card" style={{ borderColor: "rgba(239,68,68,0.2)" }}>
            <div className="flex items-center gap-3 mb-4" style={{ paddingBottom: 16, borderBottom: "1px solid var(--border-subtle)" }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: "rgba(239,68,68,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Shield size={16} color="#f87171" />
              </div>
              <h3 style={{ color: "var(--text-primary)", fontSize: "1rem" }}>Danger Zone</h3>
            </div>
            <div className="flex justify-between items-center">
              <div>
                <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text-primary)" }}>Clear All Data</div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Delete all session history and reports</div>
              </div>
              <button className="btn btn-sm" style={{ background: "rgba(239,68,68,0.1)", color: "#f87171", border: "1px solid rgba(239,68,68,0.3)" }}>
                Clear Data
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
