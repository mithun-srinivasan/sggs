/**
 * playwright.config.ts
 * ---------------------------------------------------------------------------
 * Playwright end-to-end test configuration.
 *
 * - Tests live in `tests/` and run against a local dev server on port 3000.
 * - The dev server is started automatically by Playwright (webServer config)
 *   unless it is already running (`reuseExistingServer: true`).
 * - Chromium only — kept lightweight for CI and local dev speed.
 * - A single retry is enabled to absorb flaky network-dependent assertions.
 */

import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "tests",
  timeout: 30_000,
  retries: 1,
  use: {
    baseURL: "http://localhost:3000",
    headless: true,
    viewport: { width: 1280, height: 720 },
    actionTimeout: 10_000,
  },
  webServer: {
    command: "npm run dev",
    port: 3000,
    reuseExistingServer: true,
    timeout: 120_000, // 2 minutes — the dev server can be slow to compile on cold start
  },
  projects: [
    { name: "chromium", use: { browserName: "chromium" } },
  ],
});