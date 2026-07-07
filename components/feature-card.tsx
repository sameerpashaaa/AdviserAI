"use client";

import React, { useState, useRef, ReactNode, MouseEvent } from "react";
import { motion, useMotionValue, useSpring, useMotionTemplate, useReducedMotion } from "framer-motion";
import GridPattern from "./ui/grid-pattern";
import CornerIcon from "./ui/corner-icon";

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  iconBgColor?: string;
}

export default function FeatureCard({ icon, title, description, iconBgColor }: FeatureCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  // Mouse coordinate values for spotlight tracking
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth springs for tracking coordinates
  const springConfig = { stiffness: 300, damping: 25 };
  const spotlightX = useSpring(mouseX, springConfig);
  const spotlightY = useSpring(mouseY, springConfig);

  // Parse color string to extract rgb numbers for the dynamic spotlight/glow theme
  const getRGBColor = (colorStr?: string) => {
    if (!colorStr) return { rgb: "124, 58, 237", accent: "rgb(124, 58, 237)" };
    const match = colorStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (match) {
      const rgb = `${match[1]}, ${match[2]}, ${match[3]}`;
      return {
        rgb,
        accent: `rgb(${rgb})`,
      };
    }
    return { rgb: "124, 58, 237", accent: "rgb(124, 58, 237)" };
  };

  const colorTheme = getRGBColor(iconBgColor);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || shouldReduceMotion) return;
    const rect = containerRef.current.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };

  // Motion template for cursor spotlight
  const spotlightBg = useMotionTemplate`radial-gradient(
    180px circle at ${spotlightX}px ${spotlightY}px,
    rgba(${colorTheme.rgb}, 0.15),
    transparent 80%
  )`;

  return (
    <motion.div
      ref={containerRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseMove={handleMouseMove}
      whileHover={shouldReduceMotion ? {} : { y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      animate={{
        borderColor: isHovered
          ? `rgba(${colorTheme.rgb}, 0.35)`
          : "var(--border-default)",
        boxShadow: isHovered
          ? "0 12px 24px -8px rgba(0, 0, 0, 0.12)"
          : "var(--shadow-sm)",
      }}
      className="feature-card-wrapper"
      style={{
        position: "relative",
        borderRadius: "var(--radius-xl)",
        borderWidth: "1px",
        borderStyle: "solid",
        backgroundColor: "var(--bg-card)",
        padding: "28px", // matches existing card padding
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        alignItems: "flex-start",
        width: "100%",
        height: "100%",
        // Pass the hover color variable down to children (like corner icons)
        // so that they can transition to the card's accent color on hover
        "--card-accent-hover": colorTheme.accent,
      } as React.CSSProperties}
    >
      {/* Grid Pattern Background */}
      <GridPattern />

      {/* Spotlight Glow Effect */}
      {!shouldReduceMotion && (
        <motion.div
          style={{
            position: "absolute",
            inset: 0,
            background: spotlightBg,
            pointerEvents: "none",
            zIndex: 0,
          }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.2 }}
        />
      )}

      {/* Corner Accent Icons */}
      <CornerIcon position="top-left" />
      <CornerIcon position="top-right" />
      <CornerIcon position="bottom-left" />
      <CornerIcon position="bottom-right" />

      {/* Content Layer */}
      <div style={{ zIndex: 2, position: "relative", width: "100%" }}>
        {/* Animated Icon Badge */}
        <motion.div
          className="feature-icon"
          style={{
            background: iconBgColor || "rgba(124, 58, 237, 0.15)",
            fontSize: "1.5rem",
            marginBottom: "16px",
            width: "44px",
            height: "44px",
            borderRadius: "var(--radius-full)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          animate={{
            scale: isHovered && !shouldReduceMotion ? 1.08 : 1,
            rotate: isHovered && !shouldReduceMotion ? -4 : 0,
          }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 20,
          }}
        >
          {icon}
        </motion.div>

        {/* Title */}
        <h3
          style={{
            fontSize: "1.25rem",
            fontWeight: 400,
            fontFamily: "var(--font-display)",
            color: "var(--text-primary)",
            marginBottom: "8px",
          }}
        >
          {title}
        </h3>

        {/* Description */}
        <p
          style={{
            fontSize: "0.875rem",
            lineHeight: 1.6,
            color: "var(--text-secondary)",
          }}
        >
          {description}
        </p>
      </div>
    </motion.div>
  );
}
