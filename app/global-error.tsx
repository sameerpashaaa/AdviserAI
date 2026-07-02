"use client";

/**
 * Global error boundary — catches errors in the root layout itself.
 * Must define its own <html> and <body> (Next.js 16 requirement).
 * Uses the `unstable_retry` signature.
 */
export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          margin: 0,
          padding: 40,
          textAlign: "center",
          fontFamily: "Inter, sans-serif",
          color: "#0c0a09",
          background: "#f5f5f5",
        }}
      >
        <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
        <h2
          style={{
            fontSize: "1.5rem",
            fontWeight: 600,
            margin: "0 0 8px",
            fontFamily: "EB Garamond, serif",
          }}
        >
          Application Error
        </h2>
        <p
          style={{
            color: "#4e4e4e",
            maxWidth: 400,
            marginBottom: 24,
            fontSize: "0.9375rem",
          }}
        >
          A critical error occurred and the application could not recover.
          Please refresh the page or try again later.
        </p>
        <button
          onClick={() => unstable_retry()}
          style={{
            padding: "10px 24px",
            borderRadius: 8,
            fontWeight: 500,
            cursor: "pointer",
            background: "#292524",
            color: "#fff",
            border: "none",
          }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
