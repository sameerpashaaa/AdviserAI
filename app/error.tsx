"use client";

import { useEffect } from "react";

/**
 * Route-level error boundary (Next.js 16 signature).
 * Uses `unstable_retry` instead of the legacy `reset()` prop.
 * Covers uncaught render errors in any page component.
 */
export default function ErrorPage({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error("[ErrorBoundary]", error);
  }, [error]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        padding: 40,
        textAlign: "center",
        fontFamily: "var(--font-sans, Inter, sans-serif)",
        color: "var(--text-primary, #0c0a09)",
        background: "var(--bg-base, #f5f5f5)",
      }}
    >
      <div
        style={{
          fontSize: 48,
          marginBottom: 16,
          lineHeight: 1,
        }}
      >
        ⚠️
      </div>
      <h2
        style={{
          fontSize: "1.5rem",
          fontWeight: 600,
          margin: "0 0 8px",
          fontFamily: "var(--font-display, EB Garamond, serif)",
        }}
      >
        Something went wrong
      </h2>
      <p
        style={{
          color: "var(--text-secondary, #4e4e4e)",
          maxWidth: 400,
          marginBottom: 24,
          fontSize: "0.9375rem",
        }}
      >
        An unexpected error occurred. This has been logged — please try again.
      </p>
      <button
        onClick={() => unstable_retry()}
        className="btn btn-primary"
        style={{
          padding: "10px 24px",
          borderRadius: "var(--radius-md, 8px)",
          fontWeight: 500,
          cursor: "pointer",
        }}
      >
        Try again
      </button>
    </div>
  );
}
