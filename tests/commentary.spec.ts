/**
 * tests/commentary.spec.ts
 * ---------------------------------------------------------------------------
 * End-to-end tests for the Text & Commentary (teeka) block (feature 21).
 *
 * Suite coverage:
 *   1. Enabling "Text & Commentary" shows a genuine, attributed Faridkot
 *      Teeka commentary under the first verse.
 *   2. The Punjabi commentary can be switched between the Faridkot Teeka and
 *      the Guru Granth Darpan.
 *   3. The commentary language can be switched to English (SGPC rendering).
 *
 * Run with `npm run test` (headless Chromium) or `npm run test:ui`.
 */

import { test, expect } from "@playwright/test";

test.describe("Text & Commentary", () => {
  test("enabling commentary shows a genuine, distinct Punjabi teeka", async ({ page }) => {
    await page.goto("/ang/1");
    await page.waitForSelector("h1");

    // Enable the commentary block from the settings panel.
    await page.locator('button[aria-label="Reader Settings"]').click();
    const commentaryToggle = page.locator('button:has-text("Text & Commentary")').first();
    await expect(commentaryToggle).toBeVisible();
    await commentaryToggle.click();

    // The first verse's commentary attribution must be the Faridkot Teeka
    // (the default Punjabi teeka) — a genuine commentary, not the translation.
    const firstLabel = page.locator('[id="1"] p.text-\\[10px\\]');
    await expect(firstLabel).toContainText("Faridkot Teeka");
    await expect(firstLabel).toContainText("Sant Giani Badan Singh Ji");
  });

  test("commentary can switch between Faridkot Teeka and Guru Granth Darpan", async ({ page }) => {
    await page.goto("/ang/1");
    await page.waitForSelector("h1");

    // Enable the commentary (defaults to the Faridkot Teeka).
    await page.locator('button[aria-label="Reader Settings"]').click();
    await page.locator('button:has-text("Text & Commentary")').first().click();
    const firstLabel = page.locator('[id="1"] p.text-\\[10px\\]');
    await expect(firstLabel).toContainText("Faridkot Teeka");

    // Switch the Punjabi teeka source to the Guru Granth Darpan.
    await page.locator('button', { hasText: "Guru Granth Darpan" }).click();
    await expect(firstLabel).toContainText("Guru Granth Darpan");
    await expect(firstLabel).toContainText("Prof. Sahib Singh");

    // And switch back to the default Faridkot Teeka.
    await page.locator('button', { hasText: "Faridkot Teeka" }).click();
    await expect(firstLabel).toContainText("Faridkot Teeka");
  });

  test("commentary language switches to English (SGPC rendering)", async ({ page }) => {
    await page.goto("/ang/1");
    await page.waitForSelector("h1");

    // Enable the commentary block.
    await page.locator('button[aria-label="Reader Settings"]').click();
    await page.locator('button:has-text("Text & Commentary")').first().click();

    // Switch the commentary language to English using the dedicated selector.
    await page
      .locator('span:text("Commentary Language")')
      .locator("..")
      .getByRole("button", { name: "English" })
      .click();

    // The attribution must reflect the SGPC English source.
    const firstLabel = page.locator('[id="1"] p.text-\\[10px\\]');
    await expect(firstLabel).toContainText("English");
    await expect(firstLabel).toContainText("Bhai Manmohan Singh");
  });
});