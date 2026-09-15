/**
 * tests/sgpc-calendar.spec.ts
 * ---------------------------------------------------------------------------
 * End-to-end tests for the hardened calendar + top-bar + Hukamnama work:
 *
 *   1. The published SGPC year JSON (`/data/sgpc-558.json`) loads with 12
 *      months and a non-empty Gurpurab table (Vaisakhi on Apr 14 spot-check).
 *   2. The calendar page navigates months with Left / Right arrow keys.
 *   3. The Ang top bar reappears when the pointer moves to the top edge,
 *      even after scroll hid it (hover-reveal on every Ang).
 *   4. The Hukamnama card always resolves — live SGPC content (text/audio)
 *      or the quiet SGPC-link fallback, never a stuck skeleton.
 *
 * Run with `npm run test` (headless Chromium) or `npm run test:ui`.
 */

import { test, expect } from "@playwright/test";

test.describe("SGPC year data", () => {
  test("sgpc-558.json loads with 12 months and dated Gurpurabs", async ({ page }) => {
    await page.goto("/");
    const data = await page.evaluate(async () => {
      const res = await fetch("/data/sgpc-558.json");
      if (!res.ok) return null;
      return res.json();
    });
    expect(data).not.toBeNull();
    expect(data.nanakshahiYear).toBe(558);
    expect(data.months).toHaveLength(12);
    expect(data.gurpurabs.length).toBeGreaterThan(0);

    // Spot-check: Vaisakhi must be 14 April per SGPC 558.
    const vaisakhi = data.gurpurabs.find((g: { name: string }) =>
      g.name.toLowerCase().includes("vaisakhi")
    );
    expect(vaisakhi).toBeDefined();
    expect(vaisakhi.month).toBe(4);
    expect(vaisakhi.day).toBe(14);
  });
});

test.describe("Calendar keyboard navigation", () => {
  test("Left / Right arrows step the visible month", async ({ page }) => {
    await page.goto("/calendar");
    await expect(page.getByText("Nanakshahi Calendar")).toBeVisible();

    const title = page.locator("main h2").first();
    const before = await title.innerText();

    // The key handler attaches on hydration — retry the keypress until the
    // month actually steps (at most 3 attempts) instead of racing mount.
    let after = before;
    for (let attempt = 0; attempt < 3 && after === before; attempt++) {
      await page.keyboard.press("ArrowRight");
      try {
        await expect(title).not.toHaveText(before, { timeout: 3000 });
      } catch {
        // Still pre-hydration — loop around and press again.
      }
      after = await title.innerText();
    }
    expect(after).not.toBe(before);

    await page.keyboard.press("ArrowLeft");
    await expect(title).toHaveText(before);
  });
});

test.describe("Top-bar hover reveal", () => {
  test("moving the pointer to the top edge reveals the bar after scroll", async ({
    page,
  }) => {
    await page.goto("/ang/1");
    await page.waitForSelector("h1");
    const bar = page.locator("header.fixed").first();

    // Scroll to the bottom so the scroll-aware behaviour hides the bar.
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await expect(bar).toHaveClass(/-translate-y-full/, { timeout: 10_000 });

    // Hover the top edge — the bar must peek back in on every Ang.
    await page.mouse.move(640, 5);
    await expect(bar).toHaveClass(/translate-y-0/, { timeout: 10_000 });
  });
});

test.describe("Hukamnama resolution", () => {
  test("card shows live content or the SGPC fallback (never a stuck skeleton)", async ({
    page,
  }) => {
    await page.goto("/");
    const card = page
      .locator("section", { has: page.getByText("Daily Hukamnama") })
      .first();
    await expect(card).toBeVisible();
    await expect(card.locator(".animate-pulse")).toHaveCount(0, { timeout: 30_000 });

    // Success path links to hs.sgpc.net ("SGPC Website"); the failure path
    // links out with "Read it on the SGPC website" — either is correct.
    const live = card.getByRole("link", { name: /SGPC Website/i });
    const fallback = card.getByRole("link", { name: /Read it on the SGPC website/i });
    await expect(live.or(fallback)).toBeVisible({ timeout: 30_000 });
  });
});
