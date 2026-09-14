/**
 * lib/types.ts
 * ---------------------------------------------------------------------------
 * Shared TypeScript types used across the whole application, plus the
 * canonical Ang range constants (1–1430).
 *
 * These types are the single source of truth for the shape of every piece of
 * data the app reads or writes:
 *   - scripture verses fetched from BaniDB    (VerseLine, Ang)
 *   - the user's search results               (SearchResult)
 *   - the user's saved verses                 (Bookmark)
 *   - the reader's display preferences        (ReaderPrefs)
 *
 * Whenever you map a raw API response into the app (see lib/data.ts), or add a
 * new local-storage feature, define / extend the matching interface here.
 */

/** Which translation language is currently selected for display. */
export type TranslationLang = "en" | "pu";

/**
 * A single line/verse (tuk) within an Ang, mapped from BaniDB's response shape.
 * `gurmukhi` is always the Unicode text — never the legacy ASCII font encoding.
 */
export interface VerseLine {
  /** Stable unique verse id — mirrors BaniDB's `verseId`. */
  id: string;
  /** Unicode Gurmukhi script text of the verse. */
  gurmukhi: string;
  /** Roman-script transliteration of the verse (may be empty). */
  transliteration: string;
  /** Optional translations by language; each value is undefined when absent. */
  translations: {
    /** English translation (BaniDB `translation.en.bdb`). */
    en?: string;
    /** Punjabi translation (BaniDB `translation.pu.ss.unicode/gurmukhi`). */
    pu?: string;
  };
  /** Writer/metadata (e.g. "Guru Nanak Dev Ji"); may be missing. */
  writer?: string;
  /** Page (Ang) number the verse belongs to, when provided by the API. */
  pageNo?: number;
  /** Line number *within* the Ang, when provided by the API. */
  lineNo?: number;
}

/**
 * A full Ang (page) of Sri Guru Granth Sahib Ji.
 * `angNumber` is 1–1430; `lines` is the ordered collection of verses.
 */
export interface Ang {
  angNumber: number; // 1–1430
  raagName?: string; // e.g. "Japji Sahib" / "Raag Aasaa"
  source?: string; // e.g. "Guru Granth Sahib Ji"
  lines: VerseLine[];
}

/** A single search hit, mapped from BaniDB's `/v2/search` response. */
export interface SearchResult {
  id: string;
  angNumber: number;
  gurmukhi: string;
  translation?: string;
}

/** A user-saved verse, persisted to localStorage under `sgs-reader-bookmarks`. */
export interface Bookmark {
  verseId: string;
  angNumber: number;
  gurmukhiSnippet: string; // first ~60 chars of Gurmukhi, shown in the list
  savedAt: number; // epoch milliseconds; `Date.now()` when created
}

/** Reader display preferences, persisted to localStorage. */
export type ThemeMode = "light" | "dark" | "sepia";

export interface ReaderPrefs {
  theme: ThemeMode;
  showTransliteration: boolean;
  showTranslation: boolean;
  translationLang: TranslationLang;
  fontScale: number; // multiplier, clamped to 0.8 – 1.6
  isLareevarMode: boolean; // blend words continuously (traditional reading)
}

/** Lower bound of valid Ang numbers (inclusive). */
export const MIN_ANG = 1;
/** Upper bound of valid Ang numbers (inclusive). */
export const MAX_ANG = 1430;