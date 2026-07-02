import Link from "next/link";

/**
 * Custom 404 page — branded, with a link back to the app.
 */
export default function NotFound() {
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
          fontSize: 72,
          fontWeight: 300,
          fontFamily: "var(--font-display, EB Garamond, serif)",
          color: "var(--brand-primary, #292524)",
          lineHeight: 1,
          marginBottom: 8,
        }}
      >
        404
      </div>
      <h2
        style={{
          fontSize: "1.25rem",
          fontWeight: 500,
          margin: "0 0 8px",
        }}
      >
        Page not found
      </h2>
      <p
        style={{
          color: "var(--text-secondary, #4e4e4e)",
          maxWidth: 360,
          marginBottom: 24,
          fontSize: "0.9375rem",
        }}
      >
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link
        href="/dashboard"
        className="btn btn-primary"
        style={{
          padding: "10px 24px",
          borderRadius: "var(--radius-md, 8px)",
          fontWeight: 500,
          textDecoration: "none",
        }}
      >
        Go to Dashboard
      </Link>
    </div>
  );
}
