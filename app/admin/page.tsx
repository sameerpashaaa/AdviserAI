"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

// ─── Types ──────────────────────────────────────────────────────────────────

type AdminUser = {
  id: string;
  email: string;
  name: string;
  role: "user" | "admin" | "super_admin";
  subscriptionTier: "free" | "pro" | "team" | "enterprise";
  createdAt: string;
  lastActiveAt: string | null;
  deletedAt: string | null;
};

type FeatureFlag = {
  id: string;
  name: string;
  enabled: boolean;
  minimumTier: "free" | "pro" | "team" | "enterprise";
  updatedAt: string;
};

type UsageData = {
  totalUsers: number;
  queriesToday: number;
  queriesThisMonth: number;
  queriesByTier: { tier: string; total: number }[];
  topRoutes: { route: string; total: number }[];
  usersByTier: { tier: string; total: number }[];
  generatedAt: string;
};

// ─── Role/Tier badge helpers ────────────────────────────────────────────────

const ROLE_COLORS: Record<string, string> = {
  super_admin: "#a855f7",
  admin: "#f59e0b",
  user: "#6b7280",
};

const TIER_COLORS: Record<string, string> = {
  enterprise: "#a855f7",
  team: "#06b6d4",
  pro: "#10b981",
  free: "#6b7280",
};

function Badge({ label, color }: { label: string; color: string }) {
  return (
    <span
      style={{
        display: "inline-block",
        padding: "2px 10px",
        borderRadius: 999,
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: "0.04em",
        textTransform: "uppercase",
        background: `${color}22`,
        color,
        border: `1px solid ${color}55`,
      }}
    >
      {label.replace("_", " ")}
    </span>
  );
}

// ─── Stats Card ─────────────────────────────────────────────────────────────

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.04)",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 16,
      padding: "20px 24px",
      flex: "1 1 180px",
      minWidth: 160,
    }}>
      <div style={{ color: "#6b7280", fontSize: 12, fontWeight: 500, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>
        {label}
      </div>
      <div style={{ fontSize: 32, fontWeight: 700, color: "#fff", lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ color: "#6b7280", fontSize: 12, marginTop: 6 }}>{sub}</div>}
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function AdminPage() {
  const router = useRouter();
  const [tab, setTab] = useState<"users" | "flags" | "usage">("users");

  // Users
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState("");

  // Flags
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [flagsLoading, setFlagsLoading] = useState(false);
  const [flagsError, setFlagsError] = useState("");

  // Usage
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [usageLoading, setUsageLoading] = useState(false);
  const [usageError, setUsageError] = useState("");

  const [actionMsg, setActionMsg] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // ── Fetch users ──────────────────────────────────────────────────────────
  const fetchUsers = useCallback(async () => {
    setUsersLoading(true);
    setUsersError("");
    try {
      const res = await fetch("/api/admin/users?limit=50");
      if (res.status === 403) { router.replace("/dashboard"); return; }
      if (!res.ok) throw new Error("Failed to load users");
      const data = await res.json();
      setAdminUsers(data.users ?? []);
    } catch (e) {
      setUsersError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setUsersLoading(false);
    }
  }, [router]);

  // ── Fetch flags ──────────────────────────────────────────────────────────
  const fetchFlags = useCallback(async () => {
    setFlagsLoading(true);
    setFlagsError("");
    try {
      const res = await fetch("/api/admin/flags");
      if (!res.ok) throw new Error("Failed to load flags");
      const data = await res.json();
      setFlags(data.flags ?? []);
    } catch (e) {
      setFlagsError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setFlagsLoading(false);
    }
  }, []);

  // ── Fetch usage ──────────────────────────────────────────────────────────
  const fetchUsage = useCallback(async () => {
    setUsageLoading(true);
    setUsageError("");
    try {
      const res = await fetch("/api/admin/usage");
      if (!res.ok) throw new Error("Failed to load usage");
      const data = await res.json();
      setUsage(data);
    } catch (e) {
      setUsageError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setUsageLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);
  useEffect(() => { if (tab === "flags") fetchFlags(); }, [tab, fetchFlags]);
  useEffect(() => { if (tab === "usage") fetchUsage(); }, [tab, fetchUsage]);

  // ── User actions ─────────────────────────────────────────────────────────
  async function updateUser(userId: string, updates: { role?: string; subscriptionTier?: string }) {
    setActionMsg("");
    const res = await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, ...updates }),
    });
    const data = await res.json();
    if (res.ok) {
      setActionMsg("User updated successfully");
      fetchUsers();
    } else {
      setActionMsg(`Error: ${data.error}`);
    }
  }

  async function deleteUser(userId: string) {
    if (!confirm("Soft-delete this user? They will lose access immediately.")) return;
    setActionMsg("");
    const res = await fetch("/api/admin/users", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    const data = await res.json();
    if (res.ok) { setActionMsg("User deleted"); fetchUsers(); }
    else setActionMsg(`Error: ${data.error}`);
  }

  // ── Flag actions ─────────────────────────────────────────────────────────
  async function toggleFlag(flag: FeatureFlag) {
    const res = await fetch("/api/admin/flags", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: flag.name, enabled: !flag.enabled }),
    });
    if (res.ok) fetchFlags();
  }

  const filteredUsers = adminUsers.filter(
    (u) =>
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", color: "#fff", fontFamily: "Inter, sans-serif" }}>
      {/* Header */}
      <div style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "20px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#fff" }}>Admin Panel</h1>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "#6b7280" }}>AdviserAI — Internal Operations</p>
        </div>
        <button
          onClick={() => router.push("/dashboard")}
          style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "8px 16px", color: "#d1d5db", cursor: "pointer", fontSize: 13 }}
        >
          ← Back to App
        </button>
      </div>

      {/* Tabs */}
      <div style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "0 32px", display: "flex", gap: 4 }}>
        {(["users", "flags", "usage"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "14px 20px",
              fontSize: 14,
              fontWeight: tab === t ? 600 : 400,
              color: tab === t ? "#fff" : "#6b7280",
              borderBottom: tab === t ? "2px solid #a855f7" : "2px solid transparent",
              marginBottom: -1,
              textTransform: "capitalize",
              transition: "color 0.15s",
            }}
          >
            {t === "flags" ? "Feature Flags" : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Action message */}
      {actionMsg && (
        <div style={{ margin: "16px 32px 0", padding: "10px 16px", borderRadius: 8, background: actionMsg.startsWith("Error") ? "rgba(239,68,68,0.1)" : "rgba(16,185,129,0.1)", border: `1px solid ${actionMsg.startsWith("Error") ? "rgba(239,68,68,0.3)" : "rgba(16,185,129,0.3)"}`, color: actionMsg.startsWith("Error") ? "#f87171" : "#34d399", fontSize: 13 }}>
          {actionMsg}
        </div>
      )}

      <div style={{ padding: "24px 32px" }}>

        {/* ── USERS TAB ─────────────────────────────────────────────────── */}
        {tab === "users" && (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name or email…"
                style={{ flex: 1, maxWidth: 360, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "9px 14px", color: "#fff", fontSize: 13, outline: "none" }}
              />
              <span style={{ color: "#6b7280", fontSize: 13 }}>{filteredUsers.length} users</span>
            </div>

            {usersLoading ? (
              <div style={{ color: "#6b7280", fontSize: 14 }}>Loading users…</div>
            ) : usersError ? (
              <div style={{ color: "#f87171", fontSize: 14 }}>{usersError}</div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                      {["Name / Email", "Role", "Tier", "Joined", "Status", "Actions"].map((h) => (
                        <th key={h} style={{ padding: "10px 14px", textAlign: "left", color: "#6b7280", fontWeight: 500, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((u) => (
                      <tr key={u.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", opacity: u.deletedAt ? 0.4 : 1 }}>
                        <td style={{ padding: "12px 14px" }}>
                          <div style={{ fontWeight: 500, color: "#fff" }}>{u.name}</div>
                          <div style={{ color: "#6b7280", fontSize: 12 }}>{u.email}</div>
                        </td>
                        <td style={{ padding: "12px 14px" }}>
                          <Badge label={u.role} color={ROLE_COLORS[u.role] ?? "#6b7280"} />
                        </td>
                        <td style={{ padding: "12px 14px" }}>
                          <Badge label={u.subscriptionTier} color={TIER_COLORS[u.subscriptionTier] ?? "#6b7280"} />
                        </td>
                        <td style={{ padding: "12px 14px", color: "#6b7280" }}>
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>
                        <td style={{ padding: "12px 14px" }}>
                          {u.deletedAt
                            ? <Badge label="deleted" color="#ef4444" />
                            : <Badge label="active" color="#10b981" />}
                        </td>
                        <td style={{ padding: "12px 14px" }}>
                          {!u.deletedAt && (
                            <div style={{ display: "flex", gap: 6 }}>
                              <select
                                defaultValue={u.role}
                                onChange={(e) => updateUser(u.id, { role: e.target.value })}
                                style={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, padding: "4px 8px", color: "#d1d5db", fontSize: 12, cursor: "pointer" }}
                              >
                                {["user", "admin", "super_admin"].map((r) => (
                                  <option key={r} value={r}>{r.replace("_", " ")}</option>
                                ))}
                              </select>
                              <button
                                onClick={() => deleteUser(u.id)}
                                style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 6, padding: "4px 10px", color: "#f87171", fontSize: 12, cursor: "pointer" }}
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* ── FLAGS TAB ─────────────────────────────────────────────────── */}
        {tab === "flags" && (
          <>
            {flagsLoading ? (
              <div style={{ color: "#6b7280", fontSize: 14 }}>Loading flags…</div>
            ) : flagsError ? (
              <div style={{ color: "#f87171", fontSize: 14 }}>{flagsError}</div>
            ) : flags.length === 0 ? (
              <div style={{ color: "#6b7280", fontSize: 14 }}>No feature flags configured. Use the API to create them.</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {flags.map((flag) => (
                  <div
                    key={flag.id}
                    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, color: "#fff", fontSize: 14, fontFamily: "monospace" }}>{flag.name}</div>
                      <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                        <Badge label={`min: ${flag.minimumTier}`} color={TIER_COLORS[flag.minimumTier] ?? "#6b7280"} />
                        <span style={{ color: "#6b7280", fontSize: 12 }}>Updated {new Date(flag.updatedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{ color: flag.enabled ? "#10b981" : "#6b7280", fontSize: 13 }}>
                        {flag.enabled ? "Enabled" : "Disabled"}
                      </span>
                      <div
                        onClick={() => toggleFlag(flag)}
                        role="switch"
                        aria-checked={flag.enabled}
                        tabIndex={0}
                        onKeyDown={(e) => e.key === "Enter" && toggleFlag(flag)}
                        style={{
                          width: 44,
                          height: 24,
                          borderRadius: 12,
                          background: flag.enabled ? "#10b981" : "rgba(255,255,255,0.1)",
                          cursor: "pointer",
                          position: "relative",
                          transition: "background 0.2s",
                        }}
                      >
                        <div style={{
                          position: "absolute",
                          top: 3,
                          left: flag.enabled ? 23 : 3,
                          width: 18,
                          height: 18,
                          borderRadius: "50%",
                          background: "#fff",
                          transition: "left 0.2s",
                        }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ── USAGE TAB ─────────────────────────────────────────────────── */}
        {tab === "usage" && (
          <>
            {usageLoading ? (
              <div style={{ color: "#6b7280", fontSize: 14 }}>Loading analytics…</div>
            ) : usageError ? (
              <div style={{ color: "#f87171", fontSize: 14 }}>{usageError}</div>
            ) : usage && (
              <>
                {/* Top stats */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 16, marginBottom: 32 }}>
                  <StatCard label="Total Users" value={usage.totalUsers.toLocaleString()} />
                  <StatCard label="Queries Today" value={usage.queriesToday.toLocaleString()} />
                  <StatCard label="Queries This Month" value={usage.queriesThisMonth.toLocaleString()} />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 20 }}>
                  {/* Users by tier */}
                  <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: 20 }}>
                    <h3 style={{ margin: "0 0 16px", fontSize: 14, fontWeight: 600, color: "#d1d5db" }}>Users by Tier</h3>
                    {usage.usersByTier.map((row) => (
                      <div key={row.tier} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                        <Badge label={row.tier} color={TIER_COLORS[row.tier] ?? "#6b7280"} />
                        <span style={{ fontWeight: 600, color: "#fff" }}>{row.total}</span>
                      </div>
                    ))}
                  </div>

                  {/* Top routes */}
                  <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: 20 }}>
                    <h3 style={{ margin: "0 0 16px", fontSize: 14, fontWeight: 600, color: "#d1d5db" }}>Top API Routes (this month)</h3>
                    {usage.topRoutes.map((row, i) => (
                      <div key={row.route} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                        <span style={{ color: "#9ca3af", fontSize: 12, fontFamily: "monospace" }}>
                          <span style={{ color: "#6b7280", marginRight: 8 }}>#{i + 1}</span>
                          {row.route}
                        </span>
                        <span style={{ fontWeight: 600, color: "#fff" }}>{row.total}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <p style={{ color: "#4b5563", fontSize: 11, marginTop: 20 }}>
                  Generated at {new Date(usage.generatedAt).toLocaleString()}
                </p>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
