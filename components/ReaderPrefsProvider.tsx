"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
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
};

interface ReaderPrefsContextValue extends ReaderPrefs {
  setTheme: (theme: ThemeMode) => void;
  toggleTransliteration: () => void;
  toggleTranslation: () => void;
  setTranslationLang: (lang: TranslationLang) => void;
  increaseFontSize: () => void;
  decreaseFontSize: () => void;
}

const ReaderPrefsContext = createContext<ReaderPrefsContextValue | null>(null);

export function ReaderPrefsProvider({ children }: { children: ReactNode }) {
  const [prefs, setPrefs] = useState<ReaderPrefs>(DEFAULT_PREFS);
  const [hydrated, setHydrated] = useState(false);

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
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
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
      setPrefs((p) => ({ ...p, fontScale: Math.min(1.6, +(p.fontScale + 0.1).toFixed(2)) })),
    decreaseFontSize: () =>
      setPrefs((p) => ({ ...p, fontScale: Math.max(0.8, +(p.fontScale - 0.1).toFixed(2)) })),
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
