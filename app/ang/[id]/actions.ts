/**
 * app/ang/[id]/actions.ts
 * ---------------------------------------------------------------------------
 * Server action used by the **Continuous Reading Mode** feature.
 *
 * When the user has Continuous Mode enabled, reaching the end of an Ang must
 * load the next Ang's verses without leaving the page.  The reader component
 * calls `getAngForReader(next)` to fetch the next Ang from BaniDB server-side
 * and append the returned verses inline.
 */

"use server";

import { getAng } from "@/lib/data";
import type { Ang } from "@/lib/types";

/**
 * Loads a full Ang for the continuous reader.
 *
 * @param angNumber the Ang to load (1–1430)
 * @returns the Ang, or `null` when out of range / unreachable
 */
export async function getAngForReader(angNumber: number): Promise<Ang | null> {
  return getAng(angNumber);
}