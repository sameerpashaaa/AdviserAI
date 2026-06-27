"use client";

import DotField from "./DotField";

export default function GradientBackground() {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: -1,
        pointerEvents: "none",
        overflow: "hidden",
        backgroundColor: "#f5f5f5",
      }}
    >
      <DotField
        dotRadius={2.5}
        dotSpacing={16}
        bulgeStrength={65}
        glowRadius={200}
        sparkle={false}
        waveAmplitude={0}
        gradientFrom="rgba(41, 37, 36, 0.4)"
        gradientTo="rgba(78, 78, 78, 0.3)"
        glowColor="rgba(41, 37, 36, 0.12)"
      />
    </div>
  );
}
