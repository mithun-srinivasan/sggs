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

const STORAGE_KEY = "sgs-reader-prefs";

const DEFAULT_PREFS: ReaderPrefs = {
  theme: "light",
  showTransliteration: true,
  showTranslation: true,
  translationLang: "en",
  fontScale: 1,
  isLareevarMode: false,
};

interface ReaderPrefsContextValue extends ReaderPrefs {
  setTheme: (theme: ThemeMode) => void;
  toggleTransliteration: () => void;
  toggleTranslation: () => void;
  setTranslationLang: (lang: TranslationLang) => void;
  increaseFontSize: () => void;
  decreaseFontSize: () => void;
  toggleLareevarMode: () => void;
}

const ReaderPrefsContext = createContext<ReaderPrefsContextValue | null>(null);

export function ReaderPrefsProvider({ children }: { children: ReactNode }) {
  const [prefs, setPrefs] = useState<ReaderPrefs>(DEFAULT_PREFS);
  const [hydrated, setHydrated] = useState(false);
  const prefsRef = useRef<ReaderPrefs>(DEFAULT_PREFS);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setPrefs({ ...DEFAULT_PREFS, ...JSON.parse(raw) });
    } catch {
      // ignore malformed storage
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    prefsRef.current = prefs;
  }, [prefs, hydrated]);

  const persistPrefs = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prefsRef.current));
    } catch {
      // ignore storage errors
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(persistPrefs, 500);
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [prefs, hydrated, persistPrefs]);

  useEffect(() => {
    if (!hydrated) return;
    const root = document.documentElement;
    root.classList.remove("theme-light", "theme-dark", "theme-sepia");
    root.classList.add(`theme-${prefs.theme}`);
  }, [prefs, hydrated]);

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

export function useReaderPrefs() {
  const ctx = useContext(ReaderPrefsContext);
  if (!ctx) {
    throw new Error("useReaderPrefs must be used within ReaderPrefsProvider");
  }
  return ctx;
}
