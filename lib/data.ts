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

import { cache } from "react";
import type { Ang, Bani, HukamnamaInfo, SearchResult, VerseLine } from "./types";
import { MAX_ANG, MIN_ANG } from "./types";
import { NITNEM_BANIS } from "./nitnem";

/** Base URL of the public BaniDB v2 REST API. */
const BANIDB_BASE = "https://api.banidb.com/v2";

/**
 * Per-attempt network timeout (ms) for upstream API calls.
 *
 * Build-time static generation pre-renders 2870 pages, each fetching BaniDB
 * live.  A single stalled response with no timeout hangs a build worker past
 * Next.js's per-page static-generation budget (60s default) and fails the
 * entire Vercel build — so every upstream fetch must be strictly bounded.
 */
const FETCH_TIMEOUT_MS = 20000;

/** How many times a failed upstream fetch is retried before giving up. */
const FETCH_RETRIES = 2;

/**
 * `fetch()` with a hard timeout and limited retries.
 *
 * A hung upstream connection is aborted after `FETCH_TIMEOUT_MS`; transient
 * failures (timeout, 5xx, network reset) are retried with a short backoff.
 * Permanent failures (4xx) are returned immediately so the caller can fail
 * soft.  Throws only when every attempt fails.
 */
async function fetchUpstream(url: string, init?: RequestInit): Promise<Response> {
  let lastError: unknown = null;
  for (let attempt = 0; attempt <= FETCH_RETRIES; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    try {
      const res = await fetch(url, { ...init, signal: controller.signal });
      // Retry server-side errors; client errors (4xx) are permanent.
      if (res.status >= 500 && attempt < FETCH_RETRIES) {
        lastError = new Error(`Upstream ${res.status} for ${url}`);
        await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
        continue;
      }
      return res;
    } catch (err) {
      lastError = err;
      if (attempt < FETCH_RETRIES) {
        await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
      }
    } finally {
      clearTimeout(timer);
    }
  }
  throw lastError instanceof Error ? lastError : new Error(`Upstream fetch failed: ${url}`);
}

/** URL of the official SGPC daily-Hukamnama WordPress page (Amritsar). */
const SGPC_HUKAMNAMA_URL = "https://www.sgpc.net/hukamnama/";

// -------------------------------------------------------------------------
// Raw BaniDB response shapes — only the fields this app consumes.
// Kept here (not in lib/types.ts) because they are API internals, not app types.
// -------------------------------------------------------------------------

/** One verse as returned by BaniDB's `/v2/angs/:id` and `/v2/search` endpoints. */
interface BaniDbVerseRaw {
  verseId?: number | string;
  id?: number | string;
  verse?: { gurmukhi?: string; unicode?: string };
  transliteration?: {
    english?: string;
    en?: string;
    hindi?: string;
    hi?: string;
    ur?: string;
    ipa?: string;
  };
  translation?: {
    en?: {
      bdb?: string; // English translation (Sant Singh Khalsa)
      ssk?: string; // English translation alias (Sant Singh Khalsa)
      ms?: string; // English rendering (SGPC, Bhai Manmohan Singh)
    };
    pu?: {
      ss?: { unicode?: string; gurmukhi?: string }; // Guru Granth Darpan (Prof. Sahib Singh)
      ft?: { unicode?: string; gurmukhi?: string }; // Faridkot Teeka (Sant Giani Badan Singh Ji)
      ms?: { unicode?: string; gurmukhi?: string }; // Punjabi rendering (SGPC, Bhai Manmohan Singh)
      pss?: { unicode?: string; gurmukhi?: string }; // Word-by-word meanings (pad-arth)
    };
    hi?: {
      ss?: string; // Hindi translation
      sts?: string; // Hindi rendering (alternate source)
    };
    es?: {
      sn?: string; // Spanish translation
    };
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

/** Envelope returned by BaniDB's `/v2/banis/:id` endpoint (numeric id only). */
interface BaniDbBaniResponse {
  baniInfo?: { english?: string; unicode?: string };
  verses?: { verse?: BaniDbVerseRaw }[];
}

/** Envelope returned by BaniDB's `/v2/hukamnamas/:year/:month/:day` endpoint. */
interface BaniDbHukamnamaResponse {
  date?: unknown;
  shabadIds?: number[];
  shabads?: {
    shabadInfo?: {
      pageNo?: number;
      raag?: { english?: string };
      writer?: { english?: string };
    };
    verses?: BaniDbVerseRaw[];
  }[];
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
  // BaniDB exposes the transliteration in four scripts; prefer the explicit
  // script keys and fall back to the older `english`/`hindi` aliases.
  const tr = raw.transliteration ?? {};
  const transliterations = {
    en: tr.english ?? tr.en ?? "",
    hi: tr.hindi ?? tr.hi ?? "",
    ur: tr.ur ?? "",
    ipa: tr.ipa ?? "",
  };
  return {
    // Prefer the canonical verseId; fall back to id, then a synthetic position id.
    id: String(raw.verseId ?? raw.id ?? `${angNumber}-${index}`),
    // ⚠️ critical: `verse.gurmukhi` is a legacy ASCII-font encoding —
    //    we must always read `verse.unicode` for the real Gurmukhi text.
    gurmukhi: raw.verse?.unicode ?? "",
    transliteration: transliterations.en,
    transliterations,
    translations: {
      en: raw.translation?.en?.bdb ?? undefined,
      // Punjabi arrives as Gurmukhi text — try unicode first, then the fallback.
      pu: raw.translation?.pu?.ss?.unicode ?? raw.translation?.pu?.ss?.gurmukhi ?? undefined,
      hi: raw.translation?.hi?.ss ?? raw.translation?.hi?.sts ?? undefined,
      es: raw.translation?.es?.sn ?? undefined,
    },
    // Word-by-word meanings (pad-arth); absent on some verses.
    padArth:
      raw.translation?.pu?.pss?.unicode ?? raw.translation?.pu?.pss?.gurmukhi ?? undefined,
    // Genuine commentary sources (feature 21): SGPC English rendering for the
    // English side, and both the Guru Granth Darpan + Faridkot Teeka for the
    // Punjabi side.  Each falls back gracefully when the API omits a source.
    commentary: {
      en: raw.translation?.en?.ms ?? raw.translation?.en?.bdb ?? raw.translation?.en?.ssk ?? undefined,
      pu: {
        darpan:
          raw.translation?.pu?.ss?.unicode ?? raw.translation?.pu?.ss?.gurmukhi ?? undefined,
        fareedkot:
          raw.translation?.pu?.ft?.unicode ?? raw.translation?.pu?.ft?.gurmukhi ?? undefined,
      },
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
 * Wrapped in React's `cache()` so a single route (page body + metadata) only
 * ever performs one network fetch.
 *
 * @param angNumber the Ang to load (1–1430)
 * @returns the mapped Ang, or `null` when out of range / API unreachable
 */
export const getAng = cache(
  async function getAng(angNumber: number): Promise<Ang | null> {
    // Reject out-of-range requests up-front instead of hitting the network.
    if (angNumber < MIN_ANG || angNumber > MAX_ANG) return null;

  try {
    const res = await fetchUpstream(`${BANIDB_BASE}/angs/${angNumber}`, {
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
);

/**
 * Fetches one Nitnem bani from BaniDB by numeric id.
 *
 * Runs at BUILD TIME for the five daily prayers via `generateStaticParams`
 * in `app/nitnem/[token]/page.tsx` (`next: { revalidate: false }` — bani
 * text is immutable).  Verses arrive nested under a `verse` key but are
 * otherwise shaped like Ang verses, so they map through `mapVerse` and power
 * the same translation / commentary / pad-arth blocks.
 *
 * @param id the BaniDB numeric bani id (see `NITNEM_BANIS` in lib/nitnem.ts)
 * @returns the mapped bani, or `null` when unknown / API unreachable
 */
export const getBani = cache(async function getBani(id: number): Promise<Bani | null> {
  const meta = NITNEM_BANIS.find((b) => b.id === id);
  if (!meta) return null;

  try {
    const res = await fetchUpstream(`${BANIDB_BASE}/banis/${id}`, {
      next: { revalidate: false },
    });
    if (!res.ok) return null;

    const data: BaniDbBaniResponse = await res.json();
    const rows = (data.verses ?? [])
      .map((row) => row.verse)
      .filter((v): v is BaniDbVerseRaw => !!v?.verse?.unicode);
    if (rows.length === 0) return null;

    return {
      ...meta,
      verses: rows.map((raw, i) => mapVerse(raw, id, i)),
    };
  } catch {
    return null; // fail soft — the bani page renders its not-found state
  }
});

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
    const res = await fetchUpstream(`${BANIDB_BASE}/search/${encodeURIComponent(trimmed)}`, {
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

/**
 * Fetches the Daily Hukamnama.
 *
 * The user explicitly required the Hukamnama to come from the SGPC website.
 * SGPC's official daily page (`https://www.sgpc.net/hukamnama/`) publishes the
 * day's Hukamnama as a scanned image only — it exposes no JSON/text API.  This
 * loader therefore:
 *
 *   1. Scrapes the SGPC page for its official Hukamnama image, which is shown
 *      verbatim with a link back to SGPC;
 *   2. Pairs it with the machine-readable text from BaniDB's `/hukamnamas`
 *      endpoint, which mirrors the exact daily selection made at Sri Darbar
 *      Sahib, Amritsar (BaniDB is SGPC-compatible, SGPC-ratified data).
 *
 * The result is cached for 6 hours (`revalidate: 21600`) because the
 * Hukamnama changes at Amrit Vela each morning, never more often.
 *
 * Between midnight IST and Amrit Vela the new day's Hukamnama is not
 * published yet, so the previous day's (still in effect) is served instead,
 * labelled with its own date.
 *
 * @returns the combined Hukamnama info, or `null` on any fetch failure.
 */
export async function getHukamnama(): Promise<HukamnamaInfo | null> {
  const now = new Date();

  // Compute IST date so the correct Hukamnama is fetched during the ~2.5 hour
  // UTC gap after Amrit Vela (3 AM IST ≈ 9:30 PM UTC previous day).
  const istParts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).formatToParts(now);
  const get = (type: string) => Number(istParts.find((p) => p.type === type)?.value ?? 0);
  const year = get("year");
  const month = get("month");
  const day = get("day");

  /**
   * Candidate IST dates, newest first.  Between midnight and Amrit Vela the
   * current day's Hukamnama is not published yet (BaniDB answers 404), so we
   * fall back to the previous day's — still the Hukamnama in effect.
   */
  const candidates = [new Date(year, month - 1, day), new Date(year, month - 1, day - 1)];

  /** Human-readable label (e.g. "Monday, 14 September 2026") for a date. */
  const formatDateLabel = (d: Date) =>
    d.toLocaleDateString("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  /** Scrapes the SGPC page for the day's official Hukamnama scan image. */
  const fetchSgpcScan = async (): Promise<string | undefined> => {
    try {
      const res = await fetchUpstream(SGPC_HUKAMNAMA_URL, { next: { revalidate: 21600 } });
      if (!res.ok) return undefined;
      const html = await res.text();
      const raw =
        html.match(/<img[^>]+src="([^"]*hukamnama[^"]*\.(?:jpe?g|png|webp))"[^>]*>/i) ??
        html.match(/<img[^>]+src="([^"]*(?:storage\/\d{4}\/\d{2}\/)[^"]+\.(?:jpe?g|png|webp))"[^>]*>/i);
      const src = raw?.[1];
      if (!src) return undefined;
      const normalized = src.replace(/&amp;/g, "&").replace(/^\/\//, "https://");
      return /^https?:/.test(normalized)
        ? normalized
        : `https://www.sgpc.net${normalized}`;
    } catch {
      // SGPC being unreachable must never crash the Home page — ignore failure.
      return undefined;
    }
  };

  /**
   * Fetches BaniDB's text mirror of the same SGPC daily selection.
   * Tries each candidate date newest-first so the pre-dawn gap (today's
   * Hukamnama not yet published) transparently serves yesterday's instead.
   */
  const fetchBaniText = async (): Promise<HukamnamaInfo | null> => {
    for (const candidate of candidates) {
      try {
        const y = candidate.getFullYear();
        const m = candidate.getMonth() + 1;
        const d = candidate.getDate();
        const url = `${BANIDB_BASE}/hukamnamas/${y}/${m}/${d}`;
        const res = await fetchUpstream(url, { next: { revalidate: 21600 } });
        if (!res.ok) continue;

        const data: BaniDbHukamnamaResponse = await res.json();
        const shabad = data?.shabads?.[0];
        if (!shabad) continue;

        const info = shabad.shabadInfo ?? {};
        const ang = info.pageNo ?? MIN_ANG;
        const lines = (shabad.verses ?? []).map((raw, i) => mapVerse(raw, ang, i));

        return {
          dateLabel: formatDateLabel(candidate),
          ang,
          raag: info.raag?.english ?? undefined,
          writer: info.writer?.english ?? undefined,
          lines,
          sgpcImage: undefined,
          sgpcPage: SGPC_HUKAMNAMA_URL,
          sourceNote: "Daily Hukamnama — Sri Darbar Sahib, Amritsar (via SGPC)",
        };
      } catch {
        continue; // try the older candidate before giving up
      }
    }
    return null; // fail soft: no Hukamnama is better than a broken Home page
  };

  // -- Fetch the SGPC scan and the BaniDB text mirror concurrently -----------
  const [sgpcResult, baniResult] = await Promise.allSettled([
    fetchSgpcScan(),
    fetchBaniText(),
  ]);

  if (baniResult.status === "rejected" || !baniResult.value) return null;
  return {
    ...baniResult.value,
    sgpcImage: sgpcResult.status === "fulfilled" ? sgpcResult.value : undefined,
  };
}