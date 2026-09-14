/**
 * app/actions.ts
 * ---------------------------------------------------------------------------
 * Top-level server actions.  Server actions must live in module-scope files
 * marked `"use server"` — running these fetches on the server keeps external
 * API calls (SGPC, BaniDB) out of the client's network stack.
 *
 * Contains:
 *   - `getTodaysHukamnama()` — the Daily Hukamnama (SGPC website + BaniDB text)
 *   - `getDailyShabad()` — a random shabad for the Shabad of the Day card
 */

"use server";

import { getHukamnama, getShabadOfDay } from "@/lib/data";
import type { DailyShabad, HukamnamaInfo } from "@/lib/types";

/**
 * Returns today's Daily Hukamnama for the Home page.
 * The Home page is a client component, so it calls this via `useEffect`.
 */
export async function getTodaysHukamnama(): Promise<HukamnamaInfo | null> {
  return getHukamnama();
}

/**
 * Returns a random shabad for the Shabad of the Day card.
 * Day-stability is handled client-side (localStorage date-keyed cache).
 */
export async function getDailyShabad(): Promise<DailyShabad | null> {
  return getShabadOfDay();
}