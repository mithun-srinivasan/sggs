/**
 * lib/gurmukhi.ts
 * ---------------------------------------------------------------------------
 * Gurmukhi akhar (letter) data for the "Learn Gurmukhi" practice page.
 *
 * Each entry pairs a Gurmukhi letter with its standard Roman transliteration.
 * The practice page asks a multiple-choice question (given the Gurmukhi, pick
 * the Roman) for a random subset of these letters.
 */

import type { GurmukhiAkhar } from "./types";

/** Consonant akhars of the Gurmukhi script with standard romanisations. */
export const AKHARS: GurmukhiAkhar[] = [
  { gurmukhi: "ਅ", roman: "a" },
  { gurmukhi: "ਆ", roman: "aa" },
  { gurmukhi: "ੲ", roman: "i" },
  { gurmukhi: "ੳ", roman: "u" },
  { gurmukhi: "ਏ", roman: "ee" },
  { gurmukhi: "ਓ", roman: "oo" },
  { gurmukhi: "ਕ", roman: "ka" },
  { gurmukhi: "ਖ", roman: "kha" },
  { gurmukhi: "ਗ", roman: "ga" },
  { gurmukhi: "ਘ", roman: "gha" },
  { gurmukhi: "ਙ", roman: "nga" },
  { gurmukhi: "ਚ", roman: "cha" },
  { gurmukhi: "ਛ", roman: "chha" },
  { gurmukhi: "ਜ", roman: "ja" },
  { gurmukhi: "ਝ", roman: "jha" },
  { gurmukhi: "ਞ", roman: "nya" },
  { gurmukhi: "ਟ", roman: "tta" },
  { gurmukhi: "ਠ", roman: "ttha" },
  { gurmukhi: "ਡ", roman: "dd" },
  { gurmukhi: "ਢ", roman: "ddha" },
  { gurmukhi: "ਣ", roman: "nna" },
  { gurmukhi: "ਤ", roman: "ta" },
  { gurmukhi: "ਥ", roman: "tha" },
  { gurmukhi: "ਦ", roman: "da" },
  { gurmukhi: "ਧ", roman: "dha" },
  { gurmukhi: "ਨ", roman: "na" },
  { gurmukhi: "ਪ", roman: "pa" },
  { gurmukhi: "ਫ", roman: "fa" },
  { gurmukhi: "ਬ", roman: "ba" },
  { gurmukhi: "ਭ", roman: "bha" },
  { gurmukhi: "ਮ", roman: "ma" },
  { gurmukhi: "ਯ", roman: "ya" },
  { gurmukhi: "ਰ", roman: "ra" },
  { gurmukhi: "ਲ", roman: "la" },
  { gurmukhi: "ਵ", roman: "va" },
  { gurmukhi: "ੜ", roman: "rha" },
  { gurmukhi: "ਸ", roman: "sa" },
  { gurmukhi: "ਹ", roman: "ha" },
];

/** Populates a multiple-choice question round; shuffled by the component. */
export function shuffleAkhar<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}