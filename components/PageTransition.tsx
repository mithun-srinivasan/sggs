/**
 * components/PageTransition.tsx
 * ---------------------------------------------------------------------------
 * A hidden, always-mounted overlay that fades the page in when a "crossfade-start"
 * CustomEvent is fired by `AngStartSentinel` or `AngEndSentinel`.
 *
 * The overlay animates from fully opaque to transparent (300 ms), giving the
 * cross-fade illusion that the previous Ang's content gently dissolves into
 * the next.  The overlay is purely cosmetic and carries `aria-hidden="true"`.
 */

"use client";

import { useEffect, useState } from "react";

export default function PageTransition() {
  /** Whether the overlay is currently fully opaque and fading out. */
  const [active, setActive] = useState(false);

  useEffect(() => {
    const handler = () => {
      setActive(true); // overlay covers the screen
      // After 300ms the CSS transition is complete — hide the overlay.
      setTimeout(() => setActive(false), 300);
    };

    window.addEventListener("crossfade-start", handler);
    return () => window.removeEventListener("crossfade-start", handler);
  }, []);

  return (
    <div
      className={`page-crossfade-overlay ${active ? "active" : ""}`}
      aria-hidden="true"
    />
  );
}