// lib/types.ts

/** Which translation language is currently selected for display */
export type TranslationLang = "en" | "pu";

/**
 * A single line/verse (tuk) within an Ang, mapped from BaniDB's response shape.
 */
export interface VerseLine {
  id: string;              // stable unique id — BaniDB's verseId
  gurmukhi: string;        // Unicode Gurmukhi script — always verse.unicode, NEVER verse.gurmukhi (legacy ASCII font)
  transliteration: string; // Roman transliteration
  translations: {
    en?: string;            // English translation
    pu?: string;             // Punjabi translation
  };
  writer?: string;         // optional — e.g. "Guru Nanak Dev Ji" (null-guarded on fetch + render)
  pageNo?: number;
  lineNo?: number;
}

/**
 * A full Ang (page) of Sri Guru Granth Sahib Ji.
 */
export interface Ang {
  angNumber: number;       // 1–1430
  raagName?: string;       // e.g. "Japji Sahib", "Raag Aasaa"
  source?: string;         // e.g. "Guru Granth Sahib Ji"
  lines: VerseLine[];
}

/** A single search hit, mapped from BaniDB's /v2/search response */
export interface SearchResult {
  id: string;
  angNumber: number;
  gurmukhi: string;
  translation?: string;
}

/** A user-saved verse, persisted to localStorage */
export interface Bookmark {
  verseId: string;
  angNumber: number;
  gurmukhiSnippet: string;
  savedAt: number; // epoch ms
}

/** Reader display preferences, persisted to localStorage */
export type ThemeMode = "light" | "dark" | "sepia";

export interface ReaderPrefs {
  theme: ThemeMode;
  showTransliteration: boolean;
  showTranslation: boolean;
  translationLang: TranslationLang;
  fontScale: number; // multiplier, e.g. 0.8 – 1.6
  isLareevarMode: boolean;
}

export const MIN_ANG = 1;
export const MAX_ANG = 1430;
