"use client";

import { Minus, Plus, Sun, Moon, Coffee } from "lucide-react";
import { useReaderPrefs } from "./ReaderPrefsProvider";
import type { ThemeMode, TranslationLang } from "@/lib/types";

const THEMES: { id: ThemeMode; label: string; icon: typeof Sun }[] = [
  { id: "light", label: "Light", icon: Sun },
  { id: "dark", label: "Dark", icon: Moon },
  { id: "sepia", label: "Sepia", icon: Coffee },
];

const LANGS: { id: TranslationLang; label: string }[] = [
  { id: "en", label: "English" },
  { id: "pu", label: "Punjabi" },
  { id: "es", label: "Spanish" },
];

export default function ReaderControls() {
  const prefs = useReaderPrefs();

  return (
    <div className="flex flex-col gap-6 py-2 sm:flex-row sm:items-center sm:justify-between">
      {/* Visibility Toggles */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={prefs.toggleTransliteration}
          aria-pressed={prefs.showTransliteration}
          className={`min-h-[44px] rounded-lg border px-4 text-xs font-semibold transition ${
            prefs.showTransliteration
              ? "border-[var(--accent)] text-[var(--accent)]"
              : "border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)]"
          }`}
        >
          Transliteration
        </button>

        <button
          onClick={prefs.toggleTranslation}
          aria-pressed={prefs.showTranslation}
          className={`min-h-[44px] rounded-lg border px-4 text-xs font-semibold transition ${
            prefs.showTranslation
              ? "border-[var(--accent)] text-[var(--accent)]"
              : "border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)]"
          }`}
        >
          Translation
        </button>

        <button
          onClick={prefs.toggleLareevarMode}
          aria-pressed={prefs.isLareevarMode}
          title="Blend words continuously for traditional Lareevar reading"
          className={`min-h-[44px] rounded-lg border px-4 text-xs font-semibold transition ${
            prefs.isLareevarMode
              ? "border-[var(--accent)] text-[var(--accent)]"
              : "border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)]"
          }`}
        >
          Lareevar
        </button>

        {prefs.showTranslation && (
          <div className="flex items-center rounded-lg border border-[var(--border)] p-0.5">
            {LANGS.map(({ id, label }) => (
              <button
                key={id}
                onClick={() => prefs.setTranslationLang(id)}
                aria-pressed={prefs.translationLang === id}
                className={`min-h-[40px] px-3 text-xs font-semibold transition rounded ${
                  prefs.translationLang === id
                    ? "bg-[var(--accent)] text-white"
                    : "text-[var(--text-muted)] hover:text-[var(--text)]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Font Size & Theme controls */}
      <div className="flex flex-wrap items-center gap-6">
        {/* Obvious, accessible Font Size Stepper */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-[var(--text-muted)]">Text Size</span>
          <div className="flex items-center rounded-lg border border-[var(--border)]">
            <button
              onClick={prefs.decreaseFontSize}
              aria-label="Decrease text size"
              title="Smaller text"
              className="flex h-11 w-11 items-center justify-center text-[var(--text-muted)] hover:text-[var(--text)] transition"
            >
              <Minus size={16} />
            </button>
            <span className="min-w-[48px] text-center text-xs font-bold text-[var(--text)]">
              {Math.round(prefs.fontScale * 100)}%
            </span>
            <button
              onClick={prefs.increaseFontSize}
              aria-label="Increase text size"
              title="Larger text"
              className="flex h-11 w-11 items-center justify-center text-[var(--text-muted)] hover:text-[var(--text)] transition"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>

        {/* Theme Picker */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-[var(--text-muted)]">Theme</span>
          <div className="flex items-center rounded-lg border border-[var(--border)]">
            {THEMES.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => prefs.setTheme(id)}
                aria-label={`${label} theme`}
                title={`${label} theme`}
                aria-pressed={prefs.theme === id}
                className={`flex h-11 w-11 items-center justify-center transition ${
                  prefs.theme === id
                    ? "bg-[var(--accent)] text-white"
                    : "text-[var(--text-muted)] hover:text-[var(--text)]"
                }`}
              >
                <Icon size={16} />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
