/**
 * lib/data.ts
 * ---------------------------------------------------------------------------
 * Data layer: fetches Sri Guru Granth Sahib scripture from the public BaniDB
 * v2 API and maps its response into the application's clean types.
 *
 * Two public functions are exported:
 *   - getAng(angNumber)    → one Ang of scripture (SSG, cached forever)
 *   - searchGurbani(term)  → up to 40 matching verses (dynamic, uncached)
 *   - clampAng(n)          → normalises any number into the valid 1–1430 range
 *
 * Every field read from the API is null-guarded so a malformed or partial
 * response can never crash the app — missing data becomes `undefined`/`[]`.
 */

import type { Ang, SearchResult, VerseLine } from "./types";
import { MAX_ANG, MIN_ANG } from "./types";

/** Base URL of the public BaniDB v2 REST API. */
const BANIDB_BASE = "https://api.banidb.com/v2";

// -------------------------------------------------------------------------
// Raw BaniDB response shapes — only the fields this app consumes.
// Kept here (not in lib/types.ts) because they are API internals, not app types.
// -------------------------------------------------------------------------

/** One verse as returned by BaniDB's `/v2/angs/:id` and `/v2/search` endpoints. */
interface BaniDbVerseRaw {
  verseId?: number | string;
  id?: number | string;
  verse?: { gurmukhi?: string; unicode?: string };
  transliteration?: { english?: string };
  translation?: {
    en?: { bdb?: string }; // English translation
    pu?: { ss?: { unicode?: string; gurmukhi?: string } }; // Punjabi translation
  };
  writer?: { english?: string | null } | null;
  pageNo?: number;
  lineNo?: number;
}

/** Shape of the `/v2/angs/:id` response envelope. */
interface BaniDbAngResponse {
  page?: BaniDbVerseRaw[];
  baniInfo?: { unicode?: string };
  source?: { english?: string };
}

/**
 * Maps one raw BaniDB verse into the app's clean `VerseLine` shape.
 * Every field is null-guarded: absent values collapse to `undefined`.
 *
 * @param raw       the raw verse object from BaniDB
 * @param angNumber the Ang this verse belongs to (used only as a fallback id)
 * @param index     the verse position within the Ang (fallback id source)
 */
function mapVerse(raw: BaniDbVerseRaw, angNumber: number, index: number): VerseLine {
  return {
    // Prefer the canonical verseId; fall back to id, then a synthetic position id.
    id: String(raw.verseId ?? raw.id ?? `${angNumber}-${index}`),
    // ⚠️ critical: `verse.gurmukhi` is a legacy ASCII-font encoding —
    //    we must always read `verse.unicode` for the real Gurmukhi text.
    gurmukhi: raw.verse?.unicode ?? "",
    transliteration: raw.transliteration?.english ?? "",
    translations: {
      en: raw.translation?.en?.bdb ?? undefined,
      // Punjabi arrives as Gurmukhi text — try unicode first, then the fallback.
      pu: raw.translation?.pu?.ss?.unicode ?? raw.translation?.pu?.ss?.gurmukhi ?? undefined,
    },
    // `writer` may itself be null in the API, hence the double null-guard.
    writer: raw.writer?.english ?? undefined,
    pageNo: raw.pageNo,
    lineNo: raw.lineNo,
  };
}

/**
 * Fetches one Ang from BaniDB.
 *
 * This runs at BUILD TIME for all 1430 Angs via `generateStaticParams` in
 * `app/ang/[id]/page.tsx`, so it is *not* called per-request in production.
 * The result is fully static; scripture text never changes.
 *
 * @param angNumber the Ang to load (1–1430)
 * @returns the mapped Ang, or `null` when out of range / API unreachable
 */
export async function getAng(angNumber: number): Promise<Ang | null> {
  // Reject out-of-range requests up-front instead of hitting the network.
  if (angNumber < MIN_ANG || angNumber > MAX_ANG) return null;

  try {
    const res = await fetch(`${BANIDB_BASE}/angs/${angNumber}`, {
      // `revalidate: false` — scripture is immutable, cache the response forever.
      next: { revalidate: false },
    });
    if (!res.ok) return null;

    const data: BaniDbAngResponse = await res.json();
    const rows = data.page ?? [];
    if (rows.length === 0) return null;

    return {
      angNumber,
      raagName: data.baniInfo?.unicode ?? undefined,
      source: data.source?.english ?? "Sri Guru Granth Sahib Ji",
      lines: rows.map((raw, i) => mapVerse(raw, angNumber, i)),
    };
  } catch {
    // Network failure, offline, or API downtime — fail soft so the page
    // can render its not-found state gracefully instead of crashing.
    return null;
  }
}

/**
 * Full-text search across all Angs via BaniDB's search endpoint.
 * Used by `app/search/page.tsx` through the `runSearch` server action.
 *
 * Search results are inherently dynamic, so this request is never cached.
 *
 * @param term the search query (Gurmukhi or English)
 * @returns up to 40 matching verses, or an empty array on failure
 */
export async function searchGurbani(term: string): Promise<SearchResult[]> {
  const trimmed = term.trim();
  if (!trimmed) return []; // empty query → no results, no network call

  try {
    const res = await fetch(`${BANIDB_BASE}/search/${encodeURIComponent(trimmed)}`, {
      cache: "no-store", // always hit the live API — data is dynamic
    });
    if (!res.ok) return [];

    const data = await res.json();
    const rows: BaniDbVerseRaw[] = data?.verses ?? data?.page ?? [];

    // Keep the list focused: cap at 40 and only surface the fields we render.
    return rows.slice(0, 40).map((raw, i) => ({
      id: String(raw.verseId ?? raw.id ?? i),
      angNumber: raw.pageNo ?? 1,
      gurmukhi: raw.verse?.unicode ?? "",
      translation: raw.translation?.en?.bdb ?? undefined,
    }));
  } catch {
    return []; // fail soft — a broken search must not break the page
  }
}

/**
 * Normalises any number into the valid Ang range [MIN_ANG, MAX_ANG].
 * Used by every navigation site (swipes, arrow keys, controls) so a user can
 * never navigate to a non-existent page.
 *
 * @param n any number (may be NaN)
 * @returns a clamped Ang number, defaulting to MIN_ANG for NaN
 */
export function clampAng(n: number): number {
  if (Number.isNaN(n)) return MIN_ANG;
  return Math.min(MAX_ANG, Math.max(MIN_ANG, n));
}