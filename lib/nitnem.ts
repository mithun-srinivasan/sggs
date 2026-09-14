/**
 * lib/nitnem.ts
 * ---------------------------------------------------------------------------
 * Client-safe metadata for the five daily Nitnem Banis (feature 27).
 *
 * Kept free of server-only imports so both server components (the `/nitnem`
 * pages, via `lib/data.ts`) and client components (bookmarks list) can use
 * it.  Numeric BaniDB ids are used because the token-based `/v2/banis/:token`
 * lookup is unreliable (HTTP 500); `/v2/banis/:id` works.
 */

export interface NitnemBaniMeta {
  id: number;
  token: string;
  name: string;
  punjabiName: string;
  description: string;
  time: string;
}

/** The five daily prayers, in traditional recitation order. */
export const NITNEM_BANIS: NitnemBaniMeta[] = [
  {
    id: 2,
    token: "japji",
    name: "Japji Sahib",
    punjabiName: "ਜਪੁਜੀ ਸਾਹਿਬ",
    description: "The opening bani of Guru Nanak Dev Ji — recited at dawn.",
    time: "Morning",
  },
  {
    id: 4,
    token: "jaap",
    name: "Jaap Sahib",
    punjabiName: "ਜਾਪੁ ਸਾਹਿਬ",
    description: "Guru Gobind Singh Ji's praise of the Timeless One.",
    time: "Morning",
  },
  {
    id: 10,
    token: "anand",
    name: "Anand Sahib",
    punjabiName: "ਅਨੰਦੁ ਸਾਹਿਬ",
    description: "The Song of Bliss — recited morning and evening.",
    time: "Morning & Evening",
  },
  {
    id: 21,
    token: "rehras",
    name: "Rehras Sahib",
    punjabiName: "ਰਹਿਰਾਸਿ ਸਾਹਿਬ",
    description: "The evening prayer — recited at sunset.",
    time: "Evening",
  },
  {
    id: 23,
    token: "sohila",
    name: "Kirtan Sohila",
    punjabiName: "ਸੋਹਿਲਾ ਸਾਹਿਬ",
    description: "The night prayer — recited before sleep.",
    time: "Night",
  },
];

/** Looks up Nitnem metadata by URL token (undefined for unknown tokens). */
export function getNitnemMeta(token: string): NitnemBaniMeta | undefined {
  return NITNEM_BANIS.find((b) => b.token === token);
}

/** Looks up the display name for a bookmarked bani token. */
export function getBaniName(token: string): string {
  return getNitnemMeta(token)?.name ?? token;
}
