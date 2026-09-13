"use client";

import React from "react";

interface SymbolProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
  className?: string;
}

/**
 * Ik Onkar (ੴ) — Vector SVG representation of the supreme Sikh symbol denoting One Universal Creator God.
 */
export function IkOnkarIcon({ size = 28, className = "", ...props }: SymbolProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block select-none ${className}`}
      aria-label="Ik Onkar Symbol"
      {...props}
    >
      <text
        x="50%"
        y="58%"
        dominantBaseline="central"
        textAnchor="middle"
        fontSize="68"
        fontWeight="bold"
        fill="currentColor"
        fontFamily="var(--font-gurmukhi), 'Noto Sans Gurmukhi', sans-serif"
      >
        ੴ
      </text>
    </svg>
  );
}

/**
 * Khanda (☬) — Vector SVG representation of the sacred Sikh emblem comprising the double-edged sword, Chakkar, and two Kirpans.
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

      {/* Left Kirpan (Miri) */}
      <path
        d="M48 85 C32 82 18 68 18 48 C18 36 25 24 35 18 C30 25 27 34 27 44 C27 60 38 73 48 85 Z"
        fill="currentColor"
      />
      {/* Right Kirpan (Piri) */}
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

/**
 * A minimalist circular badge framing the Ik Onkar or Khanda symbol with soft glow.
 */
export function SikhSymbolBadge({
  type = "ikonkar",
  size = 48,
  className = "",
}: {
  type?: "ikonkar" | "khanda";
  size?: number;
  className?: string;
}) {
  return (
    <div
      className={`relative flex items-center justify-center rounded-full border border-[var(--border-highlight)] bg-[var(--surface)] text-[var(--accent)] shadow-sm transition hover:scale-105 ${className}`}
      style={{ width: `${size}px`, height: `${size}px` }}
    >
      <div className="absolute inset-0 rounded-full bg-[var(--accent-glow)] blur-md opacity-60" />
      {type === "ikonkar" ? (
        <IkOnkarIcon size={size * 0.58} className="relative z-10" />
      ) : (
        <KhandaIcon size={size * 0.55} className="relative z-10" />
      )}
    </div>
  );
}

/**
 * Minimalist decorative section divider featuring Ik Onkar or Khanda motif.
 */
export function SikhMotifDivider({
  symbol = "khanda",
  className = "",
}: {
  symbol?: "khanda" | "ikonkar";
  className?: string;
}) {
  return (
    <div className={`my-8 flex items-center justify-center gap-4 text-[var(--border-highlight)] ${className}`}>
      <div className="h-[1px] max-w-[120px] flex-1 bg-gradient-to-r from-transparent via-[var(--border-highlight)] to-transparent" />
      <span className="text-[var(--accent)] opacity-80">
        {symbol === "khanda" ? <KhandaIcon size={20} /> : <IkOnkarIcon size={22} />}
      </span>
      <div className="h-[1px] max-w-[120px] flex-1 bg-gradient-to-r from-transparent via-[var(--border-highlight)] to-transparent" />
    </div>
  );
}
