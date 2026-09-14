/**
 * next.config.ts
 * ---------------------------------------------------------------------------
 * Next.js configuration for the SGGS Reader.
 *
 * This is intentionally minimal: the App Router + `generateStaticParams` in
 * `app/ang/[id]/page.tsx` already gives us full static-site generation (SSG)
 * for all 1430 Ang routes.  No additional options are needed for the
 * prototype; add them here as the project grows (images config, headers, etc.).
 */

import type { NextConfig } from "next";

const nextConfig: NextConfig = {};

export default nextConfig;