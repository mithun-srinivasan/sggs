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
    navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => {
        // Check for a new SW version every page load.
        reg.addEventListener("updatefound", () => {
          const sw = reg.installing;
          if (!sw) return;
          sw.addEventListener("statechange", () => {
            // When the new SW is installed and idle, activate it immediately
            // so the user gets the latest CSS/JS without a manual SW purge.
            if (sw.state === "installed" && navigator.serviceWorker.controller) {
              sw.postMessage({ type: "SKIP_WAITING" });
            }
          });
        });
      })
      .catch(() => {
        // Registration failure (e.g. offline-first install) is non-fatal.
      });
  }, []);

  return null;
}