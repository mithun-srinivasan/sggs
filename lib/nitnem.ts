/**
 * lib/nitnem.ts
 * ---------------------------------------------------------------------------
 * Client-safe metadata for the daily Nitnem Banis (feature 27).
 *
 * The seven morning-to-night banis plus the Ardas follow the Sikh Rehat
 * Maryada order: Japji Sahib, Jaap Sahib and Tav-Prasad Savaiye every
 * morning at Amrit Vela (with Chaupai Sahib and Anand Sahib in the
 * panthic five-bani morning practice), Rehras Sahib at sunset, Kirtan
 * Sohila before sleep — and the Ardas after the morning and evening
 * recitations.
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

/** The daily prayers, in traditional recitation order (Rehat Maryada). */
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
    id: 6,
    token: "svaiye",
    name: "Tav-Prasad Savaiye",
    punjabiName: "ਤਵ ਪ੍ਰਸਾਦਿ ਸਵੱਯੇ",
    description: "Ten stanzas on the Timeless One — recited at dawn.",
    time: "Morning",
  },
  {
    id: 9,
    token: "chaupai",
    name: "Chaupai Sahib",
    punjabiName: "ਬੇਨਤੀ ਚੌਪਈ ਸਾਹਿਬ",
    description: "The prayer of protection and surrender — recited in the morning.",
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
  {
    id: 24,
    token: "ardas",
    name: "Ardas",
    punjabiName: "ਅਰਦਾਸ",
    description: "The supplication offered after the morning and evening recitations.",
    time: "Morning & Evening",
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
