/**
 * components/OfflineIndicator.tsx
 * ---------------------------------------------------------------------------
 * A quiet banner shown while the browser is offline (PWA support).
 *
 * Listens to the browser's `online`/`offline` events; seeds initial state
 * from `navigator.onLine` after mount (SSR-safe).  Visited Angs keep working
 * offline thanks to the service worker's runtime cache.
 */

"use client";

import { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";

export default function OfflineIndicator() {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- seed from navigator.onLine post-mount, then subscribe
    setOnline(navigator.onLine);
    const goOffline = () => setOnline(false);
    const goOnline = () => setOnline(true);
    window.addEventListener("offline", goOffline);
    window.addEventListener("online", goOnline);
    return () => {
      window.removeEventListener("offline", goOffline);
      window.removeEventListener("online", goOnline);
    };
  }, []);

  if (online) return null;

  return (
    <div
      role="status"
      className="fixed bottom-20 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-xs font-semibold text-[var(--text)] shadow-[var(--shadow-popover)]"
    >
      <WifiOff size={14} className="text-[var(--accent)]" />
      <span>You are offline — visited pages still work</span>
    </div>
  );
}
