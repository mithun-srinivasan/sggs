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
 * Which transliteration script is displayed under each verse.
 * BaniDB supplies all four variants (English, Hindi, Urdu, IPA).
 */
export type TranslitStyle = "en" | "hi" | "ur" | "ipa";

/** The four available verse-highlight colours (feature: multi-colour highlight). */
export type HighlightColor = "saffron" | "green" | "blue" | "rose";

/**
 * A single line/verse (tuk) within an Ang, mapped from BaniDB's response shape.
 * `gurmukhi` is always the Unicode text — never the legacy ASCII font encoding.
 */
export interface VerseLine {
  /** Stable unique verse id — mirrors BaniDB's `verseId`. */
  id: string;
  /** Unicode Gurmukhi script text of the verse. */
  gurmukhi: string;
  /** Default (English) Roman-script transliteration — the legacy field name. */
  transliteration: string;
  /** Full transliteration set per script (English, Hindi, Urdu, IPA). */
  transliterations: Record<TranslitStyle, string>;
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
  /** Optional user-defined tags/folders for organising bookmarks (feature: folders). */
  tags?: string[];
}

/**
 * Reading progress metadata persisted under `sgs-reader-progress`.
 * Backs the Reading Progress, Streak, History, and Reading-Playlist features.
 */
export interface ReadingProgress {
  /** Ang numbers whose end was reached (completed) — unique, insertion order. */
  readAngs: number[];
  /** Visits per local calendar day, keyed `YYYY-MM-DD` — seed for streak counts. */
  visits: Record<string, number>;
  /** Most recent Ang visits (newest last), deduped per Ang. */
  history: { ang: number; at: number }[];
  /** Active reading plan (playlist), if any — `null` when not started. */
  plan: { startDate: string; totalDays: number } | null;
}

/** A user annotation on a single verse, persisted under `sgs-reader-notes`. */
export interface VerseNote {
  verseId: string;
  text: string;
  updatedAt: number;
}

/** Daily Hukamnama, sourced from the official SGPC website + BaniDB text mirror. */
export interface HukamnamaInfo {
  /** Human-readable date label (e.g. "Monday, 14 September 2026"). */
  dateLabel: string;
  /** The Ang number the Hukamnama is taken from. */
  ang: number;
  /** Raag name (e.g. "Raag Sorath"), when the API provides it. */
  raag?: string;
  /** Writer attribution (e.g. "Guru Tegh Bahaadur Ji"). */
  writer?: string;
  /** The Hukamnama verses as normal `VerseLine` items. */
  lines: VerseLine[];
  /** URL of SGPC's official scanned Hukamnama image (may be absent). */
  sgpcImage?: string;
  /** URL of the SGPC official daily Hukamnama page. */
  sgpcPage: string;
  /** Human-readable source note to show to the user. */
  sourceNote: string;
}

/** A single Gurmukhi akhar (letter) used by the Learn-Gurmukhi practice page. */
export interface GurmukhiAkhar {
  /** Gurmukhi character (e.g. "ਅ"). */
  gurmukhi: string;
  /** Roman transliteration used in the quiz (e.g. "a"). */
  roman: string;
}

/** A major Sikh holy day used by the Gurpurab calendar feature. */
export interface Gurpurab {
  /** Display name (e.g. "Guru Nanak Gurpurab"). */
  name: string;
  /** Gregorian month (1–12) of the celebration — fixed dates used for a typical year. */
  month: number;
  /** Gregorian day (1–31) of the celebration. */
  day: number;
  /** Ang to link to for related reading. */
  ang: number;
  /** Short description shown in the calendar card. */
  description: string;
}

/** A keyboard shortcut definition listed in the help modal. */
export interface Shortcut {
  keys: string;      // e.g. "Left / Right"
  description: string; // what the shortcut does
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

  // -- continuous reading (feature 2) ----------------------------------------
  /** When true, reaching the end of an Ang appends the next Ang inline instead of navigating. */
  isContinuousMode: boolean;
  // -- focus / distraction-free mode (feature 3) -----------------------------
  /** Hides transliteration, translation, and nav bars; only Gurmukhi remains. */
  isFocusMode: boolean;
  // -- auto-theme by time/system (feature 4) ---------------------------------
  /** Derives the active ThemeMode from the device clock + system preference. */
  isAutoTheme: boolean;
  // -- custom accent colour (feature 5) --------------------------------------
  /** Custom hex accent override, or null for the theme default. */
  accentHex: string | null;
  // -- OLED pure-black mode (feature 5) --------------------------------------
  /** Swaps `--bg` to #000 in dark/sepia for AMOLED displays. */
  isOledTheme: boolean;
  // -- verse memorisation mode (feature 6) -----------------------------------
  /** Blurs Gurmukhi text; tapping the verse reveals it. */
  isMemorizationMode: boolean;
  // -- parallel translations (feature 18) ------------------------------------
  /** Shows both English and Punjabi translations side-by-side. */
  isParallelTranslations: boolean;
  // -- Kanji / Guru Granth Darpan commentary (feature 21) --------------------
  /** Displays the Punjabi commentary block (Prof. Sahib Singh) under each verse. */
  showKanji: boolean;
  // -- tap-to-transliterate words (feature 19) --------------------------------
  /** Tap a Gurmukhi word to show its transliteration in a small tooltip. */
  isTapToTranslit: boolean;
  // -- transliteration script (feature 24) -----------------------------------
  /** Which transliteration script to display (English, Hindi, Urdu, IPA). */
  translitStyle: TranslitStyle;
}

/** Lower bound of valid Ang numbers (inclusive). */
export const MIN_ANG = 1;
/** Upper bound of valid Ang numbers (inclusive). */
export const MAX_ANG = 1430;