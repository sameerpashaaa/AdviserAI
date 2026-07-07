"use client";

import React from "react";

export default function GridPattern() {
  return (
    <svg
      className="grid-pattern-svg"
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        userSelect: "none",
        zIndex: 0,
        color: "var(--border-default)", // uses the card's border color token
      }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern
          id="grid-pattern"
          width="24"
          height="24"
          patternUnits="userSpaceOnUse"
          x="-1"
          y="-1"
        >
          <path
            d="M 24 0 L 0 0 0 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
          />
        </pattern>
        <radialGradient id="grid-fade" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="white" stopOpacity="1" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </radialGradient>
        <mask id="grid-mask">
          <rect width="100%" height="100%" fill="url(#grid-fade)" />
        </mask>
      </defs>
      <rect
        width="100%"
        height="100%"
        fill="url(#grid-pattern)"
        mask="url(#grid-mask)"
        style={{
          opacity: "var(--grid-pattern-opacity, 0.15)",
        }}
      />
    </svg>
  );
}
