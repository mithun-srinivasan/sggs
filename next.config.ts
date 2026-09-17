/**
 * next.config.ts
 * ---------------------------------------------------------------------------
 * Next.js configuration for the SGGS Reader.
 *
 * This is intentionally minimal: the App Router + `generateStaticParams` in
 * `app/ang/[id]/page.tsx` already gives us full static-site generation (SSG)
 * for all 1430 Ang routes.  No additional options are needed for the
 * prototype; add them here as the project grows (images config, headers, etc.).
 *
 * `staticPageGenerationTimeout` is raised because each pre-rendered page
 * fetches BaniDB live at build time (a ~51-Ang hot set + 5 banis; all other
 * Angs and all print pages are on-demand ISR to stay far under Vercel's
 * 10 GB Hobby Deployment Storage limit). On a single-worker builder (e.g.
 * Vercel) one slow upstream response must not kill the whole build.
 * Upstream fetches themselves are hard-bounded with timeouts + retries in lib/data.ts.
 */

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Seconds a single static page may take before Next.js aborts it.
  staticPageGenerationTimeout: 120,
};

export default nextConfig;