"use client";

import { Bell, Search, User } from "lucide-react";

interface HeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export default function Header({ title, subtitle, actions }: HeaderProps) {
  return (
    <header className="app-header">
      <div style={{ flex: 1 }}>
        <h1 className="page-title">{title}</h1>
        {subtitle && <p className="page-subtitle">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-3">
        {actions}

        {/* Search */}
        <button
          className="btn btn-ghost btn-sm"
          style={{ gap: 6, padding: "7px 12px" }}
          aria-label="Search"
        >
          <Search size={15} />
          <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>
            Search...
          </span>
          <kbd
            style={{
              fontSize: "0.65rem",
              padding: "1px 5px",
              background: "rgba(255,255,255,0.06)",
              borderRadius: 4,
              color: "var(--text-muted)",
              border: "1px solid var(--border-subtle)",
            }}
          >
            ⌘K
          </kbd>
        </button>

        {/* Notifications */}
        <button
          className="btn btn-ghost btn-sm"
          style={{ padding: "7px 10px" }}
          aria-label="Notifications"
        >
          <Bell size={15} />
        </button>

        {/* Avatar */}
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            background: "#292524",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            flexShrink: 0,
          }}
        >
          <User size={15} color="white" />
        </div>
      </div>
    </header>
  );
}
