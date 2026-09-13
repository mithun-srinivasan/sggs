// lib/data.ts
import type { Ang, SearchResult, VerseLine } from "./types";
import { MAX_ANG, MIN_ANG } from "./types";

const BANIDB_BASE = "https://api.banidb.com/v2";

// --- Raw BaniDB response shapes (only the fields we use) -----------------
interface BaniDbVerseRaw {
  verseId?: number | string;
  id?: number | string;
  verse?: { gurmukhi?: string; unicode?: string };
  transliteration?: { english?: string };
  translation?: {
    en?: { bdb?: string };
    pu?: { ss?: { unicode?: string; gurmukhi?: string } };
    es?: { sn?: string };
  };
  writer?: { english?: string | null } | null;
  pageNo?: number;
  lineNo?: number;
}

interface BaniDbAngResponse {
  page?: BaniDbVerseRaw[];
  baniInfo?: { unicode?: string };
  source?: { english?: string };
}

/** Maps one raw BaniDB verse into our clean VerseLine shape, with null-guards throughout. */
function mapVerse(raw: BaniDbVerseRaw, angNumber: number, index: number): VerseLine {
  return {
    id: String(raw.verseId ?? raw.id ?? `${angNumber}-${index}`),
    // ⚠️ critical: verse.gurmukhi is legacy ASCII-font encoding — always use verse.unicode
    gurmukhi: raw.verse?.unicode ?? "",
    transliteration: raw.transliteration?.english ?? "",
    translations: {
      en: raw.translation?.en?.bdb ?? undefined,
      // Punjabi translation path — verified against live API response shape
      pu: raw.translation?.pu?.ss?.unicode ?? raw.translation?.pu?.ss?.gurmukhi ?? undefined,
      es: raw.translation?.es?.sn ?? undefined,
    },
    // null-guard: writer object or its english field may be null/absent
    writer: raw.writer?.english ?? undefined,
    pageNo: raw.pageNo,
    lineNo: raw.lineNo,
  };
}

/**
 * Fetches one Ang from BaniDB. Statically cached at build time via
 * generateStaticParams in app/ang/[id]/page.tsx — this never runs
 * per-request in production, only at build (or on-demand ISR if configured).
 */
export async function getAng(angNumber: number): Promise<Ang | null> {
  if (angNumber < MIN_ANG || angNumber > MAX_ANG) return null;

  try {
    const res = await fetch(`${BANIDB_BASE}/angs/${angNumber}`, {
      next: { revalidate: false }, // scripture text doesn't change — cache forever
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
    // Network failure, offline, or API downtime — fail soft so the page can 404 gracefully
    return null;
  }
}

/**
 * Full-text search across all Angs via BaniDB's search endpoint.
 * Used by app/search/page.tsx.
 */
export async function searchGurbani(term: string): Promise<SearchResult[]> {
  const trimmed = term.trim();
  if (!trimmed) return [];

  try {
    const res = await fetch(`${BANIDB_BASE}/search/${encodeURIComponent(trimmed)}`, {
      cache: "no-store",
    });
    if (!res.ok) return [];

    const data = await res.json();
    const rows: BaniDbVerseRaw[] = data?.verses ?? data?.page ?? [];

    return rows.slice(0, 40).map((raw, i) => ({
      id: String(raw.verseId ?? raw.id ?? i),
      angNumber: raw.pageNo ?? 1,
      gurmukhi: raw.verse?.unicode ?? "",
      translation: raw.translation?.en?.bdb ?? undefined,
    }));
  } catch {
    return [];
  }
}

export function clampAng(n: number): number {
  if (Number.isNaN(n)) return MIN_ANG;
  return Math.min(MAX_ANG, Math.max(MIN_ANG, n));
}
