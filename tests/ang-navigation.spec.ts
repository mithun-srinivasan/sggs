import { test, expect } from "@playwright/test";

test.describe("Ang Navigation", () => {
  test("navigating to /ang/1 displays correct content", async ({ page }) => {
    await page.goto("/ang/1");
    await expect(page).toHaveTitle(/Ang 1/);

    const header = page.locator("h1");
    await expect(header).toBeVisible();
    await expect(header).toContainText("Ang 1");

    const sourceText = page.locator("text=Sri Guru Granth Sahib Ji").first();
    await expect(sourceText).toBeVisible();

    const angInfo = page.locator("text=Ang 1 of 1430");
    await expect(angInfo).toBeVisible();

    const firstVerse = page.locator('[lang="pa"]').first();
    await expect(firstVerse).toBeVisible();
  });

  test("clicking next Ang navigation advances to /ang/2", async ({ page }) => {
    await page.goto("/ang/1");
    await page.waitForSelector("h1");

    const nextButton = page.locator('button[aria-label="Next Ang"]');
    await expect(nextButton).toBeVisible();
    await expect(nextButton).toBeEnabled();

    await nextButton.click();
    await page.waitForURL("**/ang/2", { timeout: 10_000 });
    expect(page.url()).toContain("/ang/2");

    await expect(page).toHaveTitle(/Ang 2/);
  });

  test("theme toggle updates sggs-reader-prefs localStorage", async ({ page }) => {
    await page.goto("/ang/1");
    await page.waitForSelector("h1");

    const settingsButton = page.locator('button[aria-label="Reader Settings"]');
    await expect(settingsButton).toBeVisible();
    await settingsButton.click();

    const darkThemeButton = page.locator('button[aria-label="Dark theme"]');
    await expect(darkThemeButton).toBeVisible();
    await darkThemeButton.click();

    await page.waitForFunction(() => {
      const raw = localStorage.getItem("sgs-reader-prefs");
      if (!raw) return false;
      const prefs = JSON.parse(raw);
      return prefs.theme === "dark";
    }, undefined, { timeout: 5_000 });

    const prefs = await page.evaluate(() => {
      const raw = localStorage.getItem("sgs-reader-prefs");
      return raw ? JSON.parse(raw) : null;
    });
    expect(prefs).not.toBeNull();
    expect(prefs.theme).toBe("dark");

    const sepiaThemeButton = page.locator('button[aria-label="Sepia theme"]');
    await expect(sepiaThemeButton).toBeVisible();
    await sepiaThemeButton.click();

    await page.waitForFunction(() => {
      const raw = localStorage.getItem("sgs-reader-prefs");
      if (!raw) return false;
      const prefs = JSON.parse(raw);
      return prefs.theme === "sepia";
    }, undefined, { timeout: 5_000 });

    const prefsSepia = await page.evaluate(() => {
      const raw = localStorage.getItem("sgs-reader-prefs");
      return raw ? JSON.parse(raw) : null;
    });
    expect(prefsSepia.theme).toBe("sepia");
  });
});
