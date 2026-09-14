/**
 * tests/learn-gurpurab.spec.ts
 * ---------------------------------------------------------------------------
 * End-to-end tests for:
 *   1. The full Gurmukhi chart on `/learn` (all akhars + lagan-matra with
 *      English transliterations, rendered above the quiz).
 *   2. The Upcoming Gurpurabs card on `/` showing an explicit target-Ang chip
 *      on every event link (when events fall inside the 60-day window).
 *
 * Run with `npm run test` (headless Chromium) or `npm run test:ui`.
 */

import { test, expect } from "@playwright/test";

test.describe("Learn Gurmukhi chart", () => {
  test("chart renders all groups with transliterations above the quiz", async ({ page }) => {
    await page.goto("/learn");

    // The chart section is present with its heading.
    await expect(page.locator('section[aria-label="Full Gurmukhi chart"]')).toBeVisible();
    await expect(page.getByText("Full Gurmukhi Chart")).toBeVisible();

    // All seven traditional groups are labelled.
    for (const group of [
      "Vowels",
      "Ka Varga",
      "Cha Varga",
      "Tta Varga",
      "Ta Varga",
      "Pa Varga",
      "Antim Akhar",
    ]) {
      await expect(
        page.locator('section[aria-label="Full Gurmukhi chart"]').getByText(group, { exact: true })
      ).toBeVisible();
    }

    // Spot-check transliterations from the same AKHARS source the quiz uses.
    const chart = page.locator('section[aria-label="Full Gurmukhi chart"]');
    await expect(chart.getByText("kha", { exact: true })).toBeVisible();
    await expect(chart.getByText("nna", { exact: true })).toBeVisible();

    // The lagan-matra strip shows examples with names.
    await expect(chart.getByText("Vowel Signs · Lagan-Matra")).toBeVisible();
    await expect(chart.getByText("Kanna")).toBeVisible();
    await expect(chart.getByText("kaa", { exact: true })).toBeVisible();

    // The quiz still renders below the chart.
    await expect(page.getByText("Which transliteration matches?")).toBeVisible();
  });
});

test.describe("Gurpurab target Ang", () => {
  test("every gurpurab link shows its destination Ang", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Upcoming Gurpurabs")).toBeVisible();

    // Scope to the Gurpurab card — the home page has other /ang/ links.
    const card = page.locator("section", { has: page.getByText("Upcoming Gurpurabs") });

    // The 60-day window can legitimately be empty on some dates — in that
    // case the empty-state text is the correct behaviour.
    const count = await card.locator('a[href^="/ang/"]').count();
    if (count === 0) {
      await expect(card.getByText("No major Gurpurabs in the next 60 days.")).toBeVisible();
      return;
    }

    // Each dated event row links to an Ang page and displays the Ang chip.
    const rows = card.locator("li", { has: page.locator('a[href^="/ang/"]') });
    const rowCount = await rows.count();
    expect(rowCount).toBeGreaterThan(0);
    for (let i = 0; i < rowCount; i++) {
      const href = await rows.nth(i).locator('a[href^="/ang/"]').getAttribute("href");
      expect(href).toMatch(/^\/ang\/\d+$/);
      const angNum = href!.split("/ang/")[1];
      await expect(rows.nth(i).getByText(`Ang ${angNum}`, { exact: true })).toBeVisible();
    }
  });
});
