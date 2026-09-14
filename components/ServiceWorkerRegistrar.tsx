/**
 * components/ServiceWorkerRegistrar.tsx
 * ---------------------------------------------------------------------------
 * Registers the PWA service worker (feature 1) for offline support.
 *
 * The service worker is deliberately registered **only in production**:
 *   - During `next dev` the SW would cache in-flight module chunks and stale
 *     HMR payloads, breaking hot reload.
 *   - `navigator.serviceWorker` is only available in secure contexts.
 *
 * Registration is best-effort: any failure is silently ignored so the app
 * still works perfectly for users/contexts where the SW is unavailable.
 */

"use client";

import { useEffect } from "react";

export default function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Registration failure (e.g. offline-first install) is non-fatal.
    });
  }, []);

  return null;
}