"use client";

import { createContext, useContext, useState, useCallback, useEffect, useRef, ReactNode } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────

export type ToastType = "success" | "error" | "warning" | "info";

export type Toast = {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  durationMs?: number;
};

type ToastContextValue = {
  toasts: Toast[];
  toast: (options: Omit<Toast, "id">) => string;
  dismiss: (id: string) => void;
};

// ─── Context ─────────────────────────────────────────────────────────────────

const ToastContext = createContext<ToastContextValue | null>(null);

// ─── Provider ────────────────────────────────────────────────────────────────

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (options: Omit<Toast, "id">): string => {
      const id = Math.random().toString(36).slice(2);
      const newToast: Toast = { id, durationMs: 5000, ...options };
      setToasts((prev) => [...prev.slice(-4), newToast]); // max 5 toasts
      return id;
    },
    []
  );

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss }}>
      {children}
      <ToastContainer toasts={toasts} dismiss={dismiss} />
    </ToastContext.Provider>
  );
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useToast(): Omit<ToastContextValue, "toasts"> {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return { toast: ctx.toast, dismiss: ctx.dismiss };
}

// ─── Toast Item ──────────────────────────────────────────────────────────────

const TYPE_STYLES: Record<ToastType, { bg: string; border: string; icon: string; iconColor: string }> = {
  success: { bg: "rgba(16,185,129,0.12)", border: "rgba(16,185,129,0.3)", icon: "✓", iconColor: "#10b981" },
  error:   { bg: "rgba(239,68,68,0.12)",  border: "rgba(239,68,68,0.3)",  icon: "✕", iconColor: "#ef4444" },
  warning: { bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.3)", icon: "⚠", iconColor: "#f59e0b" },
  info:    { bg: "rgba(99,102,241,0.12)", border: "rgba(99,102,241,0.3)", icon: "ℹ", iconColor: "#818cf8" },
};

function ToastItem({ toast: t, dismiss }: { toast: Toast; dismiss: (id: string) => void }) {
  const styles = TYPE_STYLES[t.type];
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    // Animate in
    requestAnimationFrame(() => setVisible(true));

    if (t.durationMs && t.durationMs > 0) {
      timerRef.current = setTimeout(() => {
        setVisible(false);
        setTimeout(() => dismiss(t.id), 300);
      }, t.durationMs);
    }

    return () => clearTimeout(timerRef.current);
  }, [t.id, t.durationMs, dismiss]);

  return (
    <div
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
        background: styles.bg,
        border: `1px solid ${styles.border}`,
        borderRadius: 12,
        padding: "14px 16px",
        backdropFilter: "blur(12px)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
        minWidth: 280,
        maxWidth: 400,
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0) scale(1)" : "translateY(8px) scale(0.97)",
        transition: "opacity 0.25s ease, transform 0.25s ease",
        cursor: "pointer",
      }}
      onClick={() => dismiss(t.id)}
    >
      {/* Icon */}
      <div style={{
        width: 24, height: 24, borderRadius: "50%",
        background: `${styles.iconColor}22`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 13, color: styles.iconColor, flexShrink: 0, fontWeight: 700,
      }}>
        {styles.icon}
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 14, color: "#f9fafb", lineHeight: 1.3 }}>
          {t.title}
        </div>
        {t.message && (
          <div style={{ fontSize: 13, color: "#9ca3af", marginTop: 3, lineHeight: 1.4 }}>
            {t.message}
          </div>
        )}
      </div>

      {/* Close button */}
      <button
        onClick={(e) => { e.stopPropagation(); dismiss(t.id); }}
        aria-label="Dismiss notification"
        style={{
          background: "none", border: "none", color: "#6b7280",
          cursor: "pointer", fontSize: 16, padding: 0, lineHeight: 1, flexShrink: 0,
        }}
      >
        ×
      </button>
    </div>
  );
}

// ─── Container ───────────────────────────────────────────────────────────────

function ToastContainer({ toasts, dismiss }: { toasts: Toast[]; dismiss: (id: string) => void }) {
  if (toasts.length === 0) return null;

  return (
    <div
      aria-label="Notifications"
      style={{
        position: "fixed",
        bottom: 24,
        right: 24,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        gap: 10,
        alignItems: "flex-end",
        pointerEvents: "none",
      }}
    >
      {toasts.map((t) => (
        <div key={t.id} style={{ pointerEvents: "auto" }}>
          <ToastItem toast={t} dismiss={dismiss} />
        </div>
      ))}
    </div>
  );
}
