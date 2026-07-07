"use client";

import React from "react";
import { Plus } from "lucide-react";

interface CornerIconProps {
  position: "top-left" | "top-right" | "bottom-left" | "bottom-right";
}

export default function CornerIcon({ position }: CornerIconProps) {
  const styles: React.CSSProperties = {
    position: "absolute",
    width: "12px",
    height: "12px",
    zIndex: 10,
    pointerEvents: "none",
  };

  switch (position) {
    case "top-left":
      styles.top = "-6px";
      styles.left = "-6px";
      break;
    case "top-right":
      styles.top = "-6px";
      styles.right = "-6px";
      break;
    case "bottom-left":
      styles.bottom = "-6px";
      styles.left = "-6px";
      break;
    case "bottom-right":
      styles.bottom = "-6px";
      styles.right = "-6px";
      break;
  }

  return (
    <div style={styles} className="corner-accent-icon">
      <Plus size={12} strokeWidth={1.5} style={{ display: "block" }} />
    </div>
  );
}
