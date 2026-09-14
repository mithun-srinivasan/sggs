/**
 * components/ReaderPrefsProvider.tsx
 * ---------------------------------------------------------------------------
 * React context + provider for the reader's display preferences.
 *
 * Responsibilities:
 *   - Hydrates from `localStorage` (`sgs-reader-prefs`) on first render,
 *     merging any missing keys with `DEFAULT_PREFS`.
 *   - Persists every change back to storage with a 500ms debounce.
 *   - Applies the effective ThemeMode class (`theme-light|dark|sepia`) to
 *     <html> so the CSS custom-property palettes in `globals.css` take effect.
 *   - Handles **Auto Theme** (feature 4): when enabled, the effective theme
 *     is derived from the device clock (daylight 06:00–18:00 → light) and the
 *     system `prefers-color-scheme` preference (overrides the clock).
 *   - Handles **Custom Accent** (feature 5): an optional hex colour override is
 *     injected as `--accent` (+ derived translucent variants) on <html>.
 *   - Handles **OLED mode** (feature 5): when enabled, forces the background
 *     surfaces toward pure black for AMOLED displays.
 *   - Mirrors **Focus mode** (feature 3) onto <html data-focus-mode> so the
 *     CSS can hide the navigation bars.
 *
 * Consume with the `useReaderPrefs()` hook from any client component.
 */

"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
  type ReactNode,
} from "react";
import type { CommentarySource, ReaderPrefs, ThemeMode, TranslationLang, TranslitStyle } from "@/lib/types";

/** localStorage key where reader preferences are persisted. */
const STORAGE_KEY = "sgs-reader-prefs";

/** Sensible defaults shown before the user has ever modified anything. */
const DEFAULT_PREFS: ReaderPrefs = {
  theme: "light",
  showTransliteration: true,
  showTranslation: true,
  translationLang: "en",
  fontScale: 1,
  isLareevarMode: false,
  isContinuousMode: false,
  isFocusMode: false,
  isAutoTheme: false,
  accentHex: null,
  isOledTheme: false,
  isMemorizationMode: false,
  isParallelTranslations: false,
  showKanji: false,
  commentaryLang: "pu",
  commentarySource: "fareedkot",
  isTapToTranslit: false,
  translitStyle: "en",
};

/**
 * The context value exposed to consumers:
 * all `ReaderPrefs` fields plus their setter/toggle functions.
 */
interface ReaderPrefsContextValue extends ReaderPrefs {
  setTheme: (theme: ThemeMode) => void;
  toggleTransliteration: () => void;
  toggleTranslation: () => void;
  setTranslationLang: (lang: TranslationLang) => void;
  increaseFontSize: () => void;
  decreaseFontSize: () => void;
  toggleLareevarMode: () => void;
  // New features (see lib/types.ts for each flag's meaning)
  toggleContinuousMode: () => void;
  toggleFocusMode: () => void;
  toggleAutoTheme: () => void;
  toggleOledTheme: () => void;
  setAccentHex: (hex: string | null) => void;
  toggleMemorizationMode: () => void;
  toggleParallelTranslations: () => void;
  toggleKanji: () => void;
  setCommentaryLang: (lang: TranslationLang) => void;
  setCommentarySource: (source: CommentarySource) => void;
  toggleTapToTranslit: () => void;
  setTranslitStyle: (style: TranslitStyle) => void;
}

/** Internal context — `null` before the provider is mounted. */
const ReaderPrefsContext = createContext<ReaderPrefsContextValue | null>(null);

/** Converts a hex colour into an rgba() string with the given alpha (0–1). */
function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const num = parseInt(full, 16);
  // Guard against malformed values that parseInt silently turns into NaN.
  if (Number.isNaN(num) || full.length !== 6) return `rgba(0,0,0,${alpha})`;
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Whether the given JSON value looks like an object with the prefs' shape.
 * Every field is validated against its allowed domain so corrupted or stale
 * localStorage data can never break theming or the reader controls.
 */
const VALID_THEMES: ThemeMode[] = ["light", "dark", "sepia"];
const VALID_TRANSLATIONS: TranslationLang[] = ["en", "pu"];
const VALID_TRANSLIT_STYLES: TranslitStyle[] = ["en", "hi", "ur", "ipa"];
const VALID_COMMENTARY_SOURCES: CommentarySource[] = ["darpan", "fareedkot"];
const HEX_RE = /^#([0-9a-fA-F]{3}){1,2}$/;

function sanitizePrefs(raw: unknown): ReaderPrefs {
  if (typeof raw !== "object" || raw === null) return DEFAULT_PREFS;

  const prefs: ReaderPrefs = { ...DEFAULT_PREFS };
  const candidate = raw as Partial<ReaderPrefs>;

  if (typeof candidate.theme === "string" && (VALID_THEMES as string[]).includes(candidate.theme)) {
    prefs.theme = candidate.theme;
  }
  if (
    typeof candidate.translationLang === "string" &&
    (VALID_TRANSLATIONS as string[]).includes(candidate.translationLang)
  ) {
    prefs.translationLang = candidate.translationLang;
  }
  if (
    typeof candidate.translitStyle === "string" &&
    (VALID_TRANSLIT_STYLES as string[]).includes(candidate.translitStyle)
  ) {
    prefs.translitStyle = candidate.translitStyle;
  }
  if (
    typeof candidate.commentaryLang === "string" &&
    (VALID_TRANSLATIONS as string[]).includes(candidate.commentaryLang)
  ) {
    prefs.commentaryLang = candidate.commentaryLang as TranslationLang;
  }
  if (
    typeof candidate.commentarySource === "string" &&
    (VALID_COMMENTARY_SOURCES as string[]).includes(candidate.commentarySource)
  ) {
    prefs.commentarySource = candidate.commentarySource as CommentarySource;
  }
  if (candidate.accentHex === null || (typeof candidate.accentHex === "string" && HEX_RE.test(candidate.accentHex))) {
    prefs.accentHex = candidate.accentHex as string | null;
  }
  if (typeof candidate.fontScale === "number" && !Number.isNaN(candidate.fontScale)) {
    prefs.fontScale = Math.min(1.6, Math.max(0.8, candidate.fontScale));
  }

  const boolKeys: Array<keyof ReaderPrefs> = [
    "showTransliteration",
    "showTranslation",
    "isLareevarMode",
    "isContinuousMode",
    "isFocusMode",
    "isAutoTheme",
    "isOledTheme",
    "isMemorizationMode",
    "isParallelTranslations",
    "showKanji",
    "isTapToTranslit",
  ];
  for (const key of boolKeys) {
    if (typeof candidate[key] === "boolean") {
      (prefs as unknown as Record<string, unknown>)[key] = candidate[key];
    }
  }

  return prefs;
}

export function ReaderPrefsProvider({ children }: { children: ReactNode }) {
  /** Current preference state. Starts as defaults; hydrated from localStorage once. */
  const [prefs, setPrefs] = useState<ReaderPrefs>(DEFAULT_PREFS);

  /**
   * `hydrated` guards against writing the defaults TO localStorage before
   * we've had a chance to READ the stored values — without this, the stored
   * data would be instantly overwritten on first paint.
   */
  const [hydrated, setHydrated] = useState(false);

  /** Ref mirror of `prefs` so the debounced persist callback always reads the latest. */
  const prefsRef = useRef<ReaderPrefs>(DEFAULT_PREFS);

  /** Debounce timer handle — cancelled on every prefs change. */
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // -- Hydration: read once from localStorage on mount -----------------------

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- deliberate SSR-safe post-mount hydration from localStorage
      if (raw) setPrefs(sanitizePrefs(JSON.parse(raw)));
    } catch {
      // Malformed localStorage data is ignored; defaults are used instead.
    } finally {
      setHydrated(true);
    }
  }, []);

  // -- Keep the ref mirror current with every state change -------------------

  useEffect(() => {
    if (!hydrated) return;
    prefsRef.current = prefs;
  }, [prefs, hydrated]);

  // -- Debounced persistence: write to localStorage after 500ms of inactivity

  const persistPrefs = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prefsRef.current));
    } catch {
      // Storage quota exceeded or unavailable (e.g. private browsing edge cases)
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return; // don't write defaults before hydration
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(persistPrefs, 500);
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [prefs, hydrated, persistPrefs]);

  // -- Auto-theme: track the system colour-scheme when Auto Theme is on ------

  /** Whether the OS is currently requesting dark UI. */
  const [systemDark, setSystemDark] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    // eslint-disable-next-line react-hooks/set-state-in-effect -- seed state from matchMedia, then subscribe to its changes
    setSystemDark(mq.matches);
    const handler = (e: MediaQueryListEvent) => setSystemDark(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // -- Effective theme resolution --------------------------------------------

  /**
   * If Auto Theme is enabled the *displayed* theme is derived rather than the
   * user's manual pick: system preference wins, then the device clock
   * (06:00–18:00 → light, otherwise dark).
   */
  const effectiveTheme: ThemeMode = prefs.isAutoTheme
    ? systemDark
      ? "dark"
      : (() => {
          const hour = new Date().getHours();
          return hour >= 6 && hour < 18 ? "light" : "dark";
        })()
    : prefs.theme;

  // -- Apply theme class + styling overrides to <html> -----------------------

  useEffect(() => {
    if (!hydrated) return;
    const root = document.documentElement;
    root.classList.remove("theme-light", "theme-dark", "theme-sepia");
    root.classList.add(`theme-${effectiveTheme}`);

    // Custom accent override (feature 5): replace the accent CSS variables.
    const style = root.style;
    if (prefs.accentHex && /^#([0-9a-fA-F]{3}){1,2}$/.test(prefs.accentHex)) {
      const hex = prefs.accentHex;
      style.setProperty("--accent", hex);
      style.setProperty("--accent-light", hexToRgba(hex, 0.12));
      style.setProperty("--accent-glow", hexToRgba(hex, 0.2));
    } else {
      style.removeProperty("--accent");
      style.removeProperty("--accent-light");
      style.removeProperty("--accent-glow");
    }

    // OLED mode (feature 5): pure-black backgrounds in dark themes.
    if (prefs.isOledTheme && effectiveTheme !== "light") {
      style.setProperty("--bg", "#000");
      style.setProperty("--bg-glass", "rgba(0, 0, 0, 0.88)");
      style.setProperty("--surface", "#000");
    } else {
      style.removeProperty("--bg");
      style.removeProperty("--bg-glass");
      style.removeProperty("--surface");
    }

    // Focus mode (feature 3): flag on <html> so CSS hides the nav chrome.
    root.dataset.focusMode = prefs.isFocusMode ? "on" : "";
  }, [prefs, effectiveTheme, hydrated]);

  // -- Context value: memoized setters compose the public API ----------------

  const value = useMemo((): ReaderPrefsContextValue => {
    const setTheme = (theme: ThemeMode) => setPrefs((p) => ({ ...p, theme }));
    const toggleTransliteration = () =>
      setPrefs((p) => ({ ...p, showTransliteration: !p.showTransliteration }));
    const toggleTranslation = () =>
      setPrefs((p) => ({ ...p, showTranslation: !p.showTranslation }));
    const setTranslationLang = (translationLang: TranslationLang) =>
      setPrefs((p) => ({ ...p, translationLang }));
    const increaseFontSize = () =>
      setPrefs((p) => ({
        ...p,
        fontScale: Math.min(1.6, +(p.fontScale + 0.1).toFixed(2)),
      }));
    const decreaseFontSize = () =>
      setPrefs((p) => ({
        ...p,
        fontScale: Math.max(0.8, +(p.fontScale - 0.1).toFixed(2)),
      }));
    const toggleLareevarMode = () =>
      setPrefs((p) => ({ ...p, isLareevarMode: !p.isLareevarMode }));
    const toggleContinuousMode = () =>
      setPrefs((p) => ({ ...p, isContinuousMode: !p.isContinuousMode }));
    const toggleFocusMode = () =>
      setPrefs((p) => ({ ...p, isFocusMode: !p.isFocusMode }));
    const toggleAutoTheme = () =>
      setPrefs((p) => ({ ...p, isAutoTheme: !p.isAutoTheme }));
    const toggleOledTheme = () =>
      setPrefs((p) => ({ ...p, isOledTheme: !p.isOledTheme }));
    const setAccentHex = (accentHex: string | null) => setPrefs((p) => ({ ...p, accentHex }));
    const toggleMemorizationMode = () =>
      setPrefs((p) => ({ ...p, isMemorizationMode: !p.isMemorizationMode }));
    const toggleParallelTranslations = () =>
      setPrefs((p) => ({ ...p, isParallelTranslations: !p.isParallelTranslations }));
    const toggleKanji = () => setPrefs((p) => ({ ...p, showKanji: !p.showKanji }));
    const setCommentaryLang = (commentaryLang: TranslationLang) =>
      setPrefs((p) => ({ ...p, commentaryLang }));
    const setCommentarySource = (commentarySource: CommentarySource) =>
      setPrefs((p) => ({ ...p, commentarySource }));
    const toggleTapToTranslit = () =>
      setPrefs((p) => ({ ...p, isTapToTranslit: !p.isTapToTranslit }));
    const setTranslitStyle = (translitStyle: TranslitStyle) =>
      setPrefs((p) => ({ ...p, translitStyle }));

    return {
      ...prefs,
      setTheme,
      toggleTransliteration,
      toggleTranslation,
      setTranslationLang,
      increaseFontSize,
      decreaseFontSize,
      toggleLareevarMode,
      toggleContinuousMode,
      toggleFocusMode,
      toggleAutoTheme,
      toggleOledTheme,
      setAccentHex,
      toggleMemorizationMode,
      toggleParallelTranslations,
      toggleKanji,
      setCommentaryLang,
      setCommentarySource,
      toggleTapToTranslit,
      setTranslitStyle,
    };
  }, [prefs]);

  return (
    <ReaderPrefsContext.Provider value={value}>
      {children}
    </ReaderPrefsContext.Provider>
  );
}

/**
 * Accessor hook for the reader-prefs context.
 * Throws if called outside a `<ReaderPrefsProvider>` tree.
 */
export function useReaderPrefs() {
  const ctx = useContext(ReaderPrefsContext);
  if (!ctx) {
    throw new Error("useReaderPrefs must be used within ReaderPrefsProvider");
  }
  return ctx;
}