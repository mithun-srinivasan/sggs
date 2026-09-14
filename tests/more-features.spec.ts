/**
 * tests/more-features.spec.ts
 * ---------------------------------------------------------------------------
 * End-to-end tests for the second feature batch:
 *   29. Visraam pause markers in the Gurmukhi line.
 *   30. Shabad of the Day card (heading + loaded state).
 *   31. Reading heatmap card.
 *   32. Phonetic Gurmukhi search (converter preview; assertions use Unicode
 *       codepoints so the spec stays ASCII-safe).
 *   33. Nanakshahi calendar page.
 *
 * Run with `npm run test` (headless Chromium) or `npm run test:ui`.
 */

import { test, expect, type Page } from "@playwright/test";

/** Codepoints of the expected conversion in order, space-separated hex. */
async function previewCodepoints(page: Page, selector: string): Promise<string> {
  const text = await page.locator(selector).innerText();
  return [...text].map((c) => (c.codePointAt(0) ?? 0).toString(16)).join(" ");
}

test.describe("Visraam pauses", () => {
  test("enabling shows pause markers in the Gurmukhi line", async ({ page }) => {
    await page.goto("/ang/1");
    await page.waitForSelector("h1");

    await page.locator('button[aria-label="Reader Settings"]').click();
    await page.locator('button:has-text("Visraam Pauses")').first().click();

    // Ang 1 carries STTM visraam data — short-pause markers must appear.
    await expect(
      page.locator('span[title="Short pause (visraam)"]').first()
    ).toBeVisible();
  });
});

test.describe("Shabad of the Day", () => {
  test("card resolves to content or fallback (never a stuck skeleton)", async ({ page }) => {
    await page.goto("/");
    const card = page
      .locator("section", { has: page.getByText("Shabad of the Day") })
      .first();
    await expect(card).toBeVisible();
    await expect(card.locator(".animate-pulse")).toHaveCount(0, { timeout: 30000 });
    const hasLink = await card.getByText(/Read full shabad/).count();
    const hasFallback = await card.getByText(/could not be loaded/).count();
    expect(hasLink + hasFallback).toBe(1);
  });
});

test.describe("Reading heatmap", () => {
  test("heatmap card renders grid and legend", async ({ page }) => {
    await page.goto("/");
    const card = page
      .locator("section", { has: page.getByText("Reading Heatmap") })
      .first();
    await expect(card).toBeVisible();
    await expect(card.getByText("Less")).toBeVisible();
    await expect(card.getByText("More")).toBeVisible();
  });
});

test.describe("Phonetic search", () => {
  test("roman input previews the Gurmukhi conversion", async ({ page }) => {
    await page.goto("/search");

    // Gurmukhi mode is the default.
    await page.locator('input[placeholder*="Roman"]').fill("satinaam");

    // satinaam -> U+0A38 U+0A24 U+0A3F U+0A28 U+0A3E U+0A2E
    await expect(page.getByText("Will search:")).toBeVisible();
    const cps = await previewCodepoints(page, "p:has-text('Will search:')");
    expect(cps).toContain("a38 a24 a3f a28 a3e a2e");
  });

  test("mode toggle switches the input placeholder", async ({ page }) => {
    await page.goto("/search");
    await page.getByRole("button", { name: "ABC" }).click();
    await expect(page.locator('input[placeholder*="English"]')).toBeVisible();
  });
});

test.describe("Nanakshahi calendar", () => {
  test("calendar page renders month grid and navigation", async ({ page }) => {
    await page.goto("/calendar");
    await expect(page.getByText("Nanakshahi Calendar")).toBeVisible();

    const before = await page.locator("main h2").first().innerText();
    await page.getByRole("button", { name: "Next month" }).click();
    const after = await page.locator("main h2").first().innerText();
    expect(after).not.toBe(before);

    await page.getByRole("button", { name: "Today" }).click();
    await expect(page.locator("main h2").first()).toHaveText(before);
  });

  test("home gurpurab card links to the full calendar", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: "Full calendar" })).toBeVisible();
  });
});
