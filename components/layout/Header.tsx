"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { Bell, Search, User, Settings, LogOut, X, ChevronRight } from "lucide-react";

interface HeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export default function Header({ title, subtitle, actions }: HeaderProps) {
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [user, setUser] = useState<{ name?: string; email?: string; picture?: string } | null>(null);

  const avatarRef = useRef<HTMLDivElement>(null);
  const bellRef = useRef<HTMLButtonElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Fetch Auth0 profile info
    fetch("/auth/profile")
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error("Not logged in");
      })
      .then((data) => setUser(data))
      .catch(() => setUser(null));
  }, []);

  useEffect(() => {
    // Listen for Ctrl+K / Cmd+K
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      } else if (e.key === "Escape") {
        setSearchOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    // Close dropdowns on click outside
    const clickOutside = (e: MouseEvent) => {
      if (avatarRef.current && !avatarRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener("mousedown", clickOutside);
    return () => document.removeEventListener("mousedown", clickOutside);
  }, []);

  useEffect(() => {
    // Focus search input when search modal opens
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  const allSearchItems = [
    { label: "Chief Adviser", href: "/adviser", desc: "Get expert strategic advice", icon: "💬" },
    { label: "Research Engine", href: "/research", desc: "Conduct multi-source parallel research", icon: "🔬" },
    { label: "Strategy Hub", href: "/strategy", desc: "Analyze business using SWOT, PESTLE...", icon: "🎯" },
    { label: "Business Validator", href: "/validate", desc: "TAM/SAM/SOM and viability scorecard", icon: "🚀" },
    { label: "Trend Intelligence", href: "/trends", desc: "Spot emerging market opportunities", icon: "📈" },
    { label: "Career Adviser", href: "/career", desc: "Identify skills gaps and paths", icon: "🎓" },
    { label: "Reports", href: "/reports", desc: "Manage generated strategic PDFs", icon: "📋" },
    { label: "Settings", href: "/settings", desc: "Configure API keys and user details", icon: "⚙️" },
  ];

  const filteredSearchItems = allSearchItems.filter(item =>
    item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <header className="app-header">
        <div style={{ flex: 1 }}>
          <h1 className="page-title">{title}</h1>
          {subtitle && <p className="page-subtitle">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-3" style={{ position: "relative" }}>
          {actions}

          {/* Search Button */}
          <button
            className="btn btn-ghost btn-sm"
            style={{ gap: 6, padding: "7px 12px", border: "1px solid var(--border-subtle)" }}
            aria-label="Search"
            onClick={() => setSearchOpen(true)}
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

          {/* Notifications Button */}
          <button
            ref={bellRef}
            className={`btn btn-ghost btn-sm ${notificationsOpen ? "btn-active" : ""}`}
            style={{ padding: "7px 10px", position: "relative" }}
            aria-label="Notifications"
            onClick={() => setNotificationsOpen(!notificationsOpen)}
          >
            <Bell size={15} />
            <span
              style={{
                position: "absolute",
                top: 4,
                right: 4,
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "var(--brand-danger, #ef4444)",
              }}
            />
          </button>

          {/* Notifications Dropdown */}
          {notificationsOpen && (
            <div
              style={{
                position: "absolute",
                top: "100%",
                right: 45,
                marginTop: 8,
                width: 280,
                background: "rgba(23, 23, 23, 0.96)",
                backdropFilter: "blur(16px)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                borderRadius: 12,
                boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)",
                padding: 12,
                zIndex: 100,
              }}
            >
              <div className="flex justify-between items-center mb-3">
                <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-primary)" }}>
                  Notifications
                </span>
                <button
                  style={{
                    fontSize: "0.75rem",
                    background: "none",
                    border: "none",
                    color: "var(--brand-primary, #a855f7)",
                    cursor: "pointer",
                  }}
                  onClick={() => setNotificationsOpen(false)}
                >
                  Clear all
                </button>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ padding: "6px 8px", background: "rgba(255,255,255,0.03)", borderRadius: 6 }}>
                  <div style={{ fontSize: "0.75rem", fontWeight: 500, color: "var(--text-primary)" }}>
                    🚀 SWOT Analysis Complete
                  </div>
                  <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: 2 }}>
                    Your validation scorecard is ready.
                  </div>
                </div>
                <div style={{ padding: "6px 8px", background: "rgba(255,255,255,0.03)", borderRadius: 6 }}>
                  <div style={{ fontSize: "0.75rem", fontWeight: 500, color: "var(--text-primary)" }}>
                    ✨ Welcome to Adviser AI Pro
                  </div>
                  <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: 2 }}>
                    Premium strategic tools are fully active.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Avatar / Profile Dropdown */}
          <div ref={avatarRef} style={{ position: "relative" }}>
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
                overflow: "hidden",
                border: profileOpen ? "2px solid var(--brand-primary, #a855f7)" : "1px solid var(--border-subtle)",
              }}
              onClick={() => setProfileOpen(!profileOpen)}
            >
              {user?.picture ? (
                <img
                  src={user.picture}
                  alt={user.name || "User Avatar"}
                  width={32}
                  height={32}
                  style={{ objectFit: "cover" }}
                />
              ) : (
                <User size={15} color="white" />
              )}
            </div>

            {/* Profile Dropdown Menu */}
            {profileOpen && (
              <div
                style={{
                  position: "absolute",
                  top: "100%",
                  right: 0,
                  marginTop: 8,
                  width: 240,
                  background: "rgba(23, 23, 23, 0.96)",
                  backdropFilter: "blur(16px)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: 12,
                  boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)",
                  padding: 8,
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                  zIndex: 100,
                }}
              >
                {/* User Info Header */}
                <div style={{ padding: "8px 12px", display: "flex", flexDirection: "column" }}>
                  <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-primary)" }}>
                    {user?.name || "Premium User"}
                  </span>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: 2, wordBreak: "break-all" }}>
                    {user?.email || "user@adviserai.local"}
                  </span>
                </div>

                <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "4px 8px" }} />

                {/* Settings Link */}
                <Link
                  href="/settings"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "8px 12px",
                    borderRadius: 6,
                    color: "var(--text-primary)",
                    textDecoration: "none",
                    fontSize: "0.8rem",
                    transition: "background 0.2s",
                  }}
                  className="dropdown-hover"
                  onClick={() => setProfileOpen(false)}
                >
                  <Settings size={14} style={{ opacity: 0.8 }} />
                  Settings
                </Link>

                <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "4px 8px" }} />

                {/* Logout Button */}
                <a
                  href="/auth/logout"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "8px 12px",
                    borderRadius: 6,
                    color: "var(--brand-danger, #ef4444)",
                    textDecoration: "none",
                    fontSize: "0.8rem",
                    transition: "background 0.2s",
                  }}
                  className="dropdown-hover text-error"
                >
                  <LogOut size={14} />
                  Logout
                </a>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Global Search Command Palette Overlay */}
      {searchOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.65)",
            backdropFilter: "blur(8px)",
            display: "flex",
            justifyContent: "center",
            paddingTop: "12vh",
            zIndex: 999,
          }}
          onClick={() => setSearchOpen(false)}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 560,
              background: "rgba(20, 20, 20, 0.95)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: 16,
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.75)",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              height: "fit-content",
              maxHeight: "60vh",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search Input Bar */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                padding: "16px",
                borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                gap: 12,
              }}
            >
              <Search size={18} style={{ color: "var(--text-muted)" }} />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search tools and settings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  flex: 1,
                  background: "none",
                  border: "none",
                  color: "var(--text-primary)",
                  outline: "none",
                  fontSize: "0.95rem",
                }}
              />
              <button
                onClick={() => setSearchOpen(false)}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--text-muted)",
                  cursor: "pointer",
                  padding: 4,
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Results List */}
            <div style={{ overflowY: "auto", padding: 8, display: "flex", flexDirection: "column", gap: 2 }}>
              {filteredSearchItems.length > 0 ? (
                filteredSearchItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "12px",
                      borderRadius: 8,
                      color: "var(--text-primary)",
                      textDecoration: "none",
                      transition: "background 0.2s",
                    }}
                    className="dropdown-hover"
                    onClick={() => setSearchOpen(false)}
                  >
                    <span style={{ fontSize: "1.25rem", width: 24, textAlign: "center" }}>{item.icon}</span>
                    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                      <span style={{ fontSize: "0.875rem", fontWeight: 500 }}>{item.label}</span>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{item.desc}</span>
                    </div>
                    <ChevronRight size={14} style={{ opacity: 0.5 }} />
                  </Link>
                ))
              ) : (
                <div style={{ padding: "24px 16px", textAlign: "center", color: "var(--text-muted)", fontSize: "0.85rem" }}>
                  No results found for "{searchQuery}"
                </div>
              )}
            </div>

            {/* Footer */}
            <div
              style={{
                padding: "10px 16px",
                background: "rgba(255, 255, 255, 0.02)",
                borderTop: "1px solid rgba(255, 255, 255, 0.04)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                fontSize: "0.7rem",
                color: "var(--text-muted)",
              }}
            >
              <span>Use ↑↓ to navigate, Enter to select</span>
              <kbd
                style={{
                  background: "rgba(255, 255, 255, 0.08)",
                  padding: "2px 6px",
                  borderRadius: 4,
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                }}
              >
                ESC
              </kbd>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
