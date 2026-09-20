/**
 * next.config.ts
 * ---------------------------------------------------------------------------
 * Next.js configuration for the SGGS Reader.
 *
 * Includes security headers (CSP, HSTS, X-Frame-Options, etc.) and
 * minimal build config.  The App Router + `generateStaticParams` in
 * `app/ang/[id]/page.tsx` handles SSG for all 1430 Ang routes.
 *
 * `staticPageGenerationTimeout` is raised because each pre-rendered page
 * fetches BaniDB live at build time (a ~51-Ang hot set + 5 banis; all other
 * Angs and all print pages are on-demand ISR to stay far under Vercel's
 * 10 GB Hobby Deployment Storage limit). On a single-worker builder (e.g.
 * Vercel) one slow upstream response must not kill the whole build.
 * Upstream fetches themselves are hard-bounded with timeouts + retries in lib/data.ts.
 */

import type { NextConfig } from "next";

const securityHeaders = [
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "X-XSS-Protection",
    value: "1; mode=block",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://va.vercel-scripts.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "font-src 'self' https://fonts.gstatic.com",
      "connect-src 'self' https://vitals.vercel-insights.com https://www.google-analytics.com",
      "media-src 'self' https://hs.sgpc.net https://www.sgpc.net https://db.banidb.com",
      "frame-ancestors 'none'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  // Seconds a single static page may take before Next.js aborts it.
  staticPageGenerationTimeout: 120,

  // Security headers applied to every response.
  headers: async () => [
    {
      source: "/(.*)",
      headers: securityHeaders,
    },
  ],
};

export default nextConfig;