"use client";

import { useEffect, useState } from "react";

export default function PageTransition() {
  const [active, setActive] = useState(false);

  useEffect(() => {
    const handler = () => {
      setActive(true);
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
