/**
 * components/VerseCard.tsx
 * ---------------------------------------------------------------------------
 * Renders a single verse (tuk) from Sri Guru Granth Sahib Ji.
 *
 * Each card shows:
 *   1. The primary Gurmukhi text (dominant size)
 *   2. Optional transliteration
 *   3. Optional translation (English or Punjabi, per user preference)
 *   4. Footer with writer metadata + line number
 *   5. Hover-reveal action buttons: Copy to clipboard / Toggle bookmark
 *
 * The verse's font size, transliteration visibility, translation visibility,
 * translation language, and Lareevar mode are all driven by the reader
 * preferences context.
 */

"use client";

import { useState } from "react";
import { Bookmark, BookmarkCheck, Copy, Check } from "lucide-react";
import type { VerseLine } from "@/lib/types";
import { useReaderPrefs } from "./ReaderPrefsProvider";
import { useBookmarks } from "./BookmarksProvider";

export default function VerseCard({
  line,
  angNumber,
}: {
  line: VerseLine;
  angNumber: number;
}) {
  const prefs = useReaderPrefs();
  const { isBookmarked, toggleBookmark } = useBookmarks();

  /** Whether the "Copied!" confirmation is currently visible (resets after 2s). */
  const [copied, setCopied] = useState(false);

  /** O(1) check via the Set-backed hook. */
  const saved = isBookmarked(line.id);

  /** The active translation for the user's chosen language (may be undefined). */
  const translation = line.translations[prefs.translationLang];

  /** In Lareevar mode all whitespace is stripped to form a continuous text flow. */
  const gurmukhiText = prefs.isLareevarMode
    ? line.gurmukhi.replace(/\s+/g, "")
    : line.gurmukhi;

  /**
   * Copies the verse to the clipboard in a multi-line format:
   *   Gurmukhi
   *   Transliteration (if present)
   *   Translation (if present)
   *   — Sri Guru Granth Sahib Ji (Ang N)
   */
  const handleCopy = async () => {
    try {
      const textToCopy = [
        line.gurmukhi,
        line.transliteration ? line.transliteration : "",
        translation ? translation : "",
        `— Sri Guru Granth Sahib Ji (Ang ${angNumber})`,
      ]
        .filter(Boolean) // drop empty lines
        .join("\n");
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard access is not available in all browsers / contexts;
      // the error is silently ignored since the action is non-critical.
    }
  };

  return (
    <article
      className="group scroll-mt-20 rounded-xl border-b border-[var(--border-subtle)] p-4 transition-colors hover:bg-[var(--surface-hover)] sm:p-6"
      style={{ fontSize: `${prefs.fontScale}rem` }}
      id={line.id}
    >
      {/* Primary Scripture: Gurmukhi — dominant size, solid dignified contrast */}
      <p
        dir="auto"
        lang="pa"
        className="font-gurmukhi text-[1.8em] font-medium leading-[1.95] text-[var(--text)] tracking-normal selection:bg-[var(--accent-light)]"
      >
        {gurmukhiText}
      </p>

      {/* Secondary: Transliteration */}
      {prefs.showTransliteration && line.transliteration && (
        <p className="mt-3 text-[0.95em] italic leading-relaxed text-[var(--text-muted)]">
          {line.transliteration}
        </p>
      )}

      {/* Secondary: Translation */}
      {prefs.showTranslation && translation && (
        <p className="mt-2 text-[1.02em] leading-relaxed text-[var(--text-secondary)]">
          {translation}
        </p>
      )}

      {/* Verse Metadata & Actions */}
      <div className="mt-5 flex items-center justify-between pt-1 text-xs">
        {/* Writer and line number (left-aligned, subdued text) */}
        <div className="flex items-center gap-2 text-[11px] text-[var(--text-faint)]">
          {line.writer && <span className="font-medium">{line.writer}</span>}
          {line.writer && line.lineNo && <span>·</span>}
          {line.lineNo && <span>Line {line.lineNo}</span>}
        </div>

        {/* Action buttons — low-contrast by default; revealed on verse hover */}
        <div className="flex items-center gap-1 opacity-60 transition-opacity group-hover:opacity-100">
          {/* Copy verse text */}
          <button
            onClick={handleCopy}
            aria-label="Copy verse text"
            title={copied ? "Copied to clipboard" : "Copy verse"}
            className="flex h-11 w-11 items-center justify-center rounded-lg text-[var(--text-muted)] transition hover:bg-[var(--surface-active)] hover:text-[var(--text)] active:scale-[0.97]"
          >
            {copied ? <Check size={16} className="text-[var(--accent)]" /> : <Copy size={16} />}
          </button>

          {/* Toggle bookmark */}
          <button
            onClick={() =>
              toggleBookmark({
                verseId: line.id,
                angNumber,
                gurmukhiSnippet: line.gurmukhi.slice(0, 60),
              })
            }
            aria-label={saved ? "Remove bookmark" : "Save bookmark"}
            aria-pressed={saved}
            title={saved ? "Remove bookmark" : "Save bookmark"}
            className={`flex h-11 w-11 items-center justify-center rounded-lg transition active:scale-[0.97] ${
              saved ? "text-[var(--accent)]" : "text-[var(--text-muted)] hover:bg-[var(--surface-active)] hover:text-[var(--text)]"
            }`}
          >
            {saved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
          </button>
        </div>
      </div>
    </article>
  );
}