"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  MessageSquare,
  Search,
  Target,
  TrendingUp,
  Briefcase,
  FileText,
  Settings,
  Zap,
  ChevronRight,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/adviser", icon: MessageSquare, label: "Chief Adviser" },
];

const toolItems = [
  { href: "/research", icon: Search, label: "Research Engine" },
  { href: "/strategy", icon: Target, label: "Strategy Hub" },
  { href: "/validate", icon: Zap, label: "Business Validator" },
  { href: "/trends", icon: TrendingUp, label: "Trend Intelligence" },
  { href: "/career", icon: Briefcase, label: "Career Adviser" },
  { href: "/reports", icon: FileText, label: "Reports" },
];

interface SidebarProps {
  open?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ open = false, onClose }: SidebarProps) {
  const pathname = usePathname();

  const handleNav = () => {
    // Close mobile drawer after navigation
    if (open) onClose?.();
  };

  return (
    <>
      <aside className={`sidebar${open ? " sidebar--open" : ""}`}>
        {/* Logo */}
        <div className="sidebar-logo">
          <Link href="/" style={{ textDecoration: "none" }} onClick={handleNav}>
            <Image
              src="/AdviserAI_logo11.png"
              alt="Adviser AI"
              width={1254}
              height={1254}
              priority
              style={{ display: "block", height: 40, width: "auto" }}
            />
          </Link>
          <div
            className="badge badge-primary mt-2"
            style={{ fontSize: "0.65rem" }}
          >
            <Zap size={10} /> Pro Plan
          </div>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          <div className="sidebar-section-label">Overview</div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-item ${isActive ? "active" : ""}`}
                onClick={handleNav}
              >
                <Icon size={16} className="nav-item-icon" />
                {item.label}
                {isActive && (
                  <ChevronRight
                    size={12}
                    style={{ marginLeft: "auto", opacity: 0.5 }}
                  />
                )}
              </Link>
            );
          })}

          <div className="sidebar-section-label">AI Tools</div>
          {toolItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-item ${isActive ? "active" : ""}`}
                onClick={handleNav}
              >
                <Icon size={16} className="nav-item-icon" />
                {item.label}
                {isActive && (
                  <ChevronRight
                    size={12}
                    style={{ marginLeft: "auto", opacity: 0.5 }}
                  />
                )}
              </Link>
            );
          })}

          <div className="sidebar-section-label">Account</div>
          <Link
            href="/settings"
            className={`nav-item ${pathname === "/settings" ? "active" : ""}`}
            onClick={handleNav}
          >
            <Settings size={16} className="nav-item-icon" />
            Settings
          </Link>
        </nav>

        {/* Usage indicator */}
        <div
          style={{
            padding: "16px",
            borderTop: "1px solid var(--border-default)",
          }}
        >
          <div
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border-default)",
              borderRadius: "var(--radius-lg)",
              padding: "12px",
            }}
          >
            <div
              className="flex justify-between items-center mb-2"
              style={{ fontSize: "0.75rem" }}
            >
              <span style={{ color: "var(--text-muted)", fontWeight: 500 }}>
                AI Credits
              </span>
              <span style={{ color: "var(--text-accent)", fontWeight: 600 }}>
                847 / 1000
              </span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: "84.7%" }} />
            </div>
            <div
              style={{
                fontSize: "0.7rem",
                color: "var(--text-muted)",
                marginTop: 6,
              }}
            >
              Resets in 12 days
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
