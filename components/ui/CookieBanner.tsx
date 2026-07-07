"use client";

import { useState, useEffect } from "react";

const CONSENT_KEY = "cookie_consent";

type ConsentState = "accepted" | "declined" | null;

/**
 * CookieBanner — GDPR/CCPA-compliant cookie consent banner.
 *
 * Displays a fixed bottom bar on first visit. Stores consent decision
 * in localStorage so it only shows once. Does not render on subsequent
 * visits or during SSR (uses client-only state).
 *
 * Usage: Drop <CookieBanner /> into your root layout body.
 */
export default function CookieBanner() {
  const [consent, setConsent] = useState<ConsentState | "loading">("loading");

  useEffect(() => {
    try {
      const stored = localStorage.getItem(CONSENT_KEY) as ConsentState | null;
      setConsent(stored ?? null);
    } catch {
      // localStorage may be unavailable in some environments
      setConsent("accepted");
    }
  }, []);

  function handleAccept() {
    try {
      localStorage.setItem(CONSENT_KEY, "accepted");
    } catch {}
    setConsent("accepted");
  }

  function handleDecline() {
    try {
      localStorage.setItem(CONSENT_KEY, "declined");
    } catch {}
    setConsent("declined");
  }

  // Don't render until we know the consent state, or if already decided
  if (consent !== null) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      aria-describedby="cookie-banner-desc"
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 9998,
        background: "rgba(10,10,10,0.95)",
        borderTop: "1px solid rgba(255,255,255,0.08)",
        backdropFilter: "blur(16px)",
        padding: "16px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 16,
      }}
    >
      {/* Message */}
      <p
        id="cookie-banner-desc"
        style={{
          margin: 0,
          fontSize: 14,
          color: "#9ca3af",
          flex: "1 1 300px",
          lineHeight: 1.5,
        }}
      >
        We use cookies to improve your experience and analyze site usage.{" "}
        <a
          href="/privacy"
          style={{ color: "#a855f7", textDecoration: "underline" }}
        >
          Privacy Policy
        </a>
      </p>

      {/* Actions */}
      <div style={{ display: "flex", gap: 10, flexShrink: 0 }}>
        <button
          onClick={handleDecline}
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 8,
            padding: "9px 20px",
            color: "#9ca3af",
            fontSize: 14,
            cursor: "pointer",
            fontFamily: "inherit",
            transition: "background 0.15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.08)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
        >
          Decline
        </button>
        <button
          onClick={handleAccept}
          style={{
            background: "#7c3aed",
            border: "none",
            borderRadius: 8,
            padding: "9px 20px",
            color: "#fff",
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "inherit",
            transition: "background 0.15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#6d28d9")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "#7c3aed")}
        >
          Accept All
        </button>
      </div>
    </div>
  );
}
