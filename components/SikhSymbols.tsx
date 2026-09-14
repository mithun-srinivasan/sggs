/**
 * components/SikhSymbols.tsx
 * ---------------------------------------------------------------------------
 * Reusable SVG icons of Sikh sacred symbols used throughout the app.
 *
 * Currently contains only the Khanda emblem, which is used by
 * `app/ang/[id]/AngEndSentinel.tsx` in the "continue reading" card at the
 * bottom of each Ang.
 *
 * Each component wraps an SVG in an accessible, size-responsive shell.
 * The `React` default import is required for the `SVGProps` generic used below.
 */

"use client";

import React from "react";

/**
 * Shared props for all Sikh SVG icons: an optional pixel/string size,
 * a className for external styling, and native SVG attributes.
 */
interface SymbolProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
  className?: string;
}

/**
 * Khanda (☬) — the sacred Sikh emblem.
 * Consists of three parts:
 *   - The central **Khanda** (double-edged sword)
 *   - The **Chakkar** (circular ring, representing eternity)
 *   - Two **Kirpans** (curved swords: Miri–temporal power and Piri–spiritual authority)
 *
 * Drawn in SVG using simple path data; reads `currentColor` for easy theming.
 */
export function KhandaIcon({ size = 28, className = "", ...props }: SymbolProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block select-none ${className}`}
      aria-label="Khanda Emblem"
      {...props}
    >
      {/* Central Double-edged Sword (Khanda) */}
      <path
        d="M50 5 L53 38 L54 62 L50 95 L46 62 L47 38 Z"
        fill="currentColor"
      />
      <circle cx="50" cy="10" r="3" fill="currentColor" />

      {/* Central Ring (Chakkar) */}
      <circle
        cx="50"
        cy="50"
        r="22"
        stroke="currentColor"
        strokeWidth="6"
        fill="none"
      />

      {/* Left Kirpan (Miri — temporal / political power) */}
      <path
        d="M48 85 C32 82 18 68 18 48 C18 36 25 24 35 18 C30 25 27 34 27 44 C27 60 38 73 48 85 Z"
        fill="currentColor"
      />

      {/* Right Kirpan (Piri — spiritual authority) */}
      <path
        d="M52 85 C68 82 82 68 82 48 C82 36 75 24 65 18 C70 25 73 34 73 44 C73 60 62 73 52 85 Z"
        fill="currentColor"
      />

      {/* Sword Handles / Crossguards */}
      <path d="M28 72 L36 78" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
      <path d="M72 72 L64 78" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}