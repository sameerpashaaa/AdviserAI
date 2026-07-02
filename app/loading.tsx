/**
 * Root loading skeleton — shown during route transitions.
 */
export default function Loading() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        background: "var(--bg-base, #f5f5f5)",
      }}
    >
      <div
        className="typing-indicator"
        style={{
          display: "flex",
          gap: 6,
        }}
      >
        <span
          style={{
            width: 10,
            height: 10,
            borderRadius: "50%",
            background: "var(--brand-primary, #292524)",
            animation: "pulse 1.4s ease-in-out infinite",
            animationDelay: "0s",
          }}
        />
        <span
          style={{
            width: 10,
            height: 10,
            borderRadius: "50%",
            background: "var(--brand-primary, #292524)",
            animation: "pulse 1.4s ease-in-out infinite",
            animationDelay: "0.2s",
          }}
        />
        <span
          style={{
            width: 10,
            height: 10,
            borderRadius: "50%",
            background: "var(--brand-primary, #292524)",
            animation: "pulse 1.4s ease-in-out infinite",
            animationDelay: "0.4s",
          }}
        />
      </div>
    </div>
  );
}
