"use client";

import { useEffect, useRef } from "react";

type Props = {
  /** The message to announce to screen readers. */
  message: string;
  /** 'polite' waits for the user to finish before announcing. 'assertive' interrupts. */
  politeness?: "polite" | "assertive";
  /** Optional className for additional styling. */
  className?: string;
};

/**
 * LiveRegion — Accessible ARIA live region component.
 *
 * Renders a visually hidden <div> with aria-live so that screen readers
 * announce updates (e.g. streaming AI output status, loading states) without
 * requiring keyboard focus.
 *
 * Usage:
 *   <LiveRegion message={isStreaming ? "AI is generating a response..." : ""} />
 *   <LiveRegion message={statusMessage} politeness="assertive" />
 */
export default function LiveRegion({
  message,
  politeness = "polite",
  className,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);

  // Force a re-render cycle so screen readers always pick up the new message,
  // even if the message string didn't change (e.g. repeated status updates).
  useEffect(() => {
    if (ref.current) {
      // Brief clear forces the AT to re-announce the same text if repeated.
      ref.current.textContent = "";
      const id = requestAnimationFrame(() => {
        if (ref.current) ref.current.textContent = message;
      });
      return () => cancelAnimationFrame(id);
    }
  }, [message]);

  return (
    <div
      ref={ref}
      role="status"
      aria-live={politeness}
      aria-atomic="true"
      className={className}
      style={{
        // Visually hidden but accessible to screen readers
        position: "absolute",
        width: 1,
        height: 1,
        margin: -1,
        padding: 0,
        overflow: "hidden",
        clip: "rect(0, 0, 0, 0)",
        whiteSpace: "nowrap",
        border: 0,
      }}
    >
      {message}
    </div>
  );
}
