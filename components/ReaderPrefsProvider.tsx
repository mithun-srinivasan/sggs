/**
 * components/ReaderPrefsProvider.tsx
 * ---------------------------------------------------------------------------
 * React context + provider for the reader's display preferences.
 *
 * On first render it hydrates from `localStorage` (`sgs-reader-prefs`), merges
 * any missing keys with `DEFAULT_PREFS`, and then persists every change with a
 * 500ms debounce.  The provider also applies the current theme class (`theme-
 * light`, `theme-dark`, `theme-sepia`) to `<html>` so the CSS custom-property
 * palette in `globals.css` takes effect.
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
  useRef,
  type ReactNode,
} from "react";
import type { ReaderPrefs, ThemeMode, TranslationLang } from "@/lib/types";

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
}

/** Internal context — `null` before the provider is mounted. */
const ReaderPrefsContext = createContext<ReaderPrefsContextValue | null>(null);

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
      if (raw) setPrefs({ ...DEFAULT_PREFS, ...JSON.parse(raw) });
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

  // -- Apply theme class to <html> so CSS custom properties take effect ------

  useEffect(() => {
    if (!hydrated) return;
    const root = document.documentElement;
    root.classList.remove("theme-light", "theme-dark", "theme-sepia");
    root.classList.add(`theme-${prefs.theme}`);
  }, [prefs, hydrated]);

  // -- Context value: memoized setters compose the public API ----------------

  const value: ReaderPrefsContextValue = {
    ...prefs,
    setTheme: (theme) => setPrefs((p) => ({ ...p, theme })),
    toggleTransliteration: () =>
      setPrefs((p) => ({ ...p, showTransliteration: !p.showTransliteration })),
    toggleTranslation: () =>
      setPrefs((p) => ({ ...p, showTranslation: !p.showTranslation })),
    setTranslationLang: (translationLang) =>
      setPrefs((p) => ({ ...p, translationLang })),
    increaseFontSize: () =>
      setPrefs((p) => ({
        ...p,
        fontScale: Math.min(1.6, +(p.fontScale + 0.1).toFixed(2)),
      })),
    decreaseFontSize: () =>
      setPrefs((p) => ({
        ...p,
        fontScale: Math.max(0.8, +(p.fontScale - 0.1).toFixed(2)),
      })),
    toggleLareevarMode: () =>
      setPrefs((p) => ({ ...p, isLareevarMode: !p.isLareevarMode })),
  };

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