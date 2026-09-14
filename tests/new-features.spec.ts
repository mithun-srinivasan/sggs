/**
 * tests/new-features.spec.ts
 * ---------------------------------------------------------------------------
 * End-to-end tests for the five additional features:
 *   25. Extra translation languages (Hindi + Spanish).
 *   26. Word-by-word meanings (pad-arth block).
 *   27. Nitnem Banis section (list + bani reader).
 *   28. Daily Sehaj Paath goal tracker.
 *
 * Run with `npm run test` (headless Chromium) or `npm run test:ui`.
 */

import { test, expect } from "@playwright/test";

test.describe("Extra translation languages", () => {
  test("translation switches to Hindi and Spanish", async ({ page }) => {
    await page.goto("/ang/1");
    await page.waitForSelector("h1");

    await page.locator('button[aria-label="Reader Settings"]').click();
    // Scope to the translation picker (the transliteration-script picker
    // also has a "Hindi" button, so anchor via the Lareevar toggle's group).
    const langGroup = page.locator('button:has-text("Lareevar")').locator("..");

    await langGroup.getByRole("button", { name: "Hindi", exact: true }).click();
    await expect(page.locator('p[lang="hi"]').first()).toBeVisible();

    await langGroup.getByRole("button", { name: "Spanish", exact: true }).click();
    await expect(page.locator('p[lang="es"]').first()).toBeVisible();

    // And back to English.
    await langGroup.getByRole("button", { name: "English", exact: true }).click();
    await expect(page.locator('p[lang="en"]').first()).toBeVisible();
  });
});

test.describe("Word meanings", () => {
  test("enabling shows the pad-arth block", async ({ page }) => {
    await page.goto("/ang/1");
    await page.waitForSelector("h1");

    await page.locator('button[aria-label="Reader Settings"]').click();
    await page.locator('button:has-text("Word Meanings")').first().click();

    // At least one verse on the Ang carries pad-arth text with its label.
    await expect(page.getByText("Word Meanings · Pad-arth").first()).toBeVisible();
  });
});

test.describe("Nitnem Banis", () => {
  test("nitnem index lists all five prayers", async ({ page }) => {
    await page.goto("/nitnem");

    for (const name of [
      "Japji Sahib",
      "Jaap Sahib",
      "Anand Sahib",
      "Rehras Sahib",
      "Kirtan Sohila",
    ]) {
      await expect(page.getByText(name, { exact: true }).first()).toBeVisible();
    }
  });

  test("sohila reader renders verses", async ({ page }) => {
    await page.goto("/nitnem/sohila");

    await expect(page.locator("h1")).toContainText("Kirtan Sohila");
    await expect(page.locator('[lang="pa"]').first()).toBeVisible();
  });
});

test.describe("Daily goal tracker", () => {
  test("setting a daily goal shows today's progress", async ({ page }) => {
    await page.goto("/");
    await page.getByText("Your Reading Journey").scrollIntoViewIfNeeded();

    await page.locator('button:has-text("Set goal")').click();
    await page.locator('button:has-text("2 / day")').click();

    await expect(page.getByText("2 Angs/day")).toBeVisible();
    await expect(page.getByText("of 2 Angs today")).toBeVisible();
  });
});
