/**
 * components/VerseCard.tsx
 * ---------------------------------------------------------------------------
 * Renders a single verse (tuk) from Sri Guru Granth Sahib Ji.
 *
 * Beyond the base layers (Gurmukhi → transliteration → translation → footer
 * with copy / bookmark actions), this card powers the following reader
 * features (see `lib/types.ts` for each flag):
 *
 *   3.  Focus mode — transliteration/translation/actions carry the
 *       `verse-extra` class, hidden when `html[data-focus-mode=on]`.
 *   6.  Memorisation mode — Gurmukhi is blurred; "Tap to reveal" clears it.
 *  12.  Highlights — one of four colours, toggled from the footer.
 *  10.  Verse notes — an expandable textarea saved via `NotesProvider`.
 *  14.  Share — renders the verse to a 1080×1350 canvas and downloads a
 *       share card PNG; long verses auto-fit (wrapped, shrinking fonts,
 *       ellipsis last resort) so text never clips off-canvas.
 *  17.  (Hukamnama uses this same component on the Home page.)
 *  18.  Parallel translations — English + Punjabi side-by-side.
 *  19.  Tap-to-transliterate — tap a Gurmukhi word to see its Romanisation.
 *  21.  Text & commentary — a genuine, attributable teeka block (English:
 *       SGPC Bhai Manmohan Singh, or Punjabi: Guru Granth Darpan +
 *       Faridkot Teeka), switchable via ReaderControls.  Labels always name
 *       the source actually shown, never the fallback's author.
 *  25.  Extra translation languages — Hindi + Spanish alongside en/pu.
 *  26.  Word meanings — per-verse pad-arth block served by BaniDB.
 *  27.  Nitnem banis — optional `baniToken`/`baniName` re-target bookmark,
 *       copy and share attribution to the bani page.
 *  29.  Visraam pauses — Santhya pause marks interleaved in the Gurmukhi.
 *  24.  Transliteration script — English / Hindi / Urdu / IPA variants.
 */

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Bookmark,
  BookmarkCheck,
  Copy,
  Check,
  Share2,
  Highlighter,
  StickyNote,
  X,
} from "lucide-react";
import type { HighlightColor, TranslationLang, VerseLine } from "@/lib/types";
import { useReaderPrefs } from "./ReaderPrefsProvider";
import { useBookmarks } from "./BookmarksProvider";
import { useHighlights, HIGHLIGHT_COLORS } from "./HighlightsProvider";
import { useVerseNotes } from "./NotesProvider";

/** The four highlight colours → translucent background tints. */
const HIGHLIGHT_TINTS: Record<HighlightColor, string> = {
  saffron: "rgba(245, 158, 11, 0.14)",
  green: "rgba(34, 197, 94, 0.13)",
  blue: "rgba(59, 130, 246, 0.14)",
  rose: "rgba(244, 63, 94, 0.13)",
};

/** Display labels for the highlight colour picker buttons. */
const HIGHLIGHT_LABELS: Record<HighlightColor, string> = {
  saffron: "Saffron",
  green: "Green",
  blue: "Blue",
  rose: "Rose",
};

/** Fallback font stack used when drawing the share card onto a canvas. */
const SHARE_FONT_STACK = `"Noto Sans Gurmukhi", "Nirmala UI", "Raavi", sans-serif`;

/** HTML lang attribute + Gurmukhi font flag per translation language. */
const TRANSLATION_ATTRS: Record<TranslationLang, { lang: string; gurmukhi: boolean }> = {
  en: { lang: "en", gurmukhi: false },
  pu: { lang: "pa", gurmukhi: true },
  hi: { lang: "hi", gurmukhi: false },
  es: { lang: "es", gurmukhi: false },
};

export default function VerseCard({
  line,
  angNumber,
  baniToken,
  baniName,
}: {
  line: VerseLine;
  angNumber: number;
  /** Nitnem bani token (e.g. "japji") when rendered on a bani page. */
  baniToken?: string;
  /** Display name used for copy/share attribution on a bani page. */
  baniName?: string;
}) {
  /** Attribution used by copy + share ("Ang N" or the bani name). */
  const sourceLabel = baniName ?? `Sri Guru Granth Sahib Ji (Ang ${angNumber})`;
  const prefs = useReaderPrefs();
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const { getHighlight, toggleHighlight } = useHighlights();
  const { getNote, setNote, removeNote } = useVerseNotes();

  /** "Copied!" confirmation flag (resets after 2s). */
  const [copied, setCopied] = useState(false);
  /** Whether the note editor is expanded for this verse. */
  const [notesOpen, setNotesOpen] = useState(false);
  /** Whether the highlight colour picker is open. */
  const [highlightOpen, setHighlightOpen] = useState(false);
  /** Memorisation reveal state — `true` once the user taps to unblur. */
  const [revealed, setRevealed] = useState(false);
  /** Tap-to-transliterate: index of the currently revealed word (`null` = none). */
  const [wordRevealed, setWordRevealed] = useState<number | null>(null);
  /** "Shared!" confirmation flag. */
  const [shared, setShared] = useState(false);

  /** Shared timer handle so confirmation flags never update after unmount. */
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    []
  );

  const saved = isBookmarked(line.id);
  const highlight = getHighlight(line.id);
  const note = getNote(line.id);

  // -- Transliteration ------------------------------------------------------------------

  /** The transliteration for the user's chosen script (falls back to English). */
  const translit =
    line.transliterations[prefs.translitStyle] || line.transliteration;

  /** Word-aligned pairs [gurmukhiWord, translitWord]; empty when lengths differ. */
  const wordPairs = useMemo(() => {
    const gk = line.gurmukhi.split(/\s+/).filter(Boolean);
    const tr = translit.split(/\s+/).filter(Boolean);
    return gk.length === tr.length ? gk.map((g, i) => [g, tr[i]]) : [];
  }, [line.gurmukhi, translit]);

  // -- Translations ---------------------------------------------------------------------

  /**
   * Primary translation for the preferred language (used in the normal,
   * non-parallel layout).  Parallel mode shows both columns regardless.
   */
  const primaryTranslation = line.translations[prefs.translationLang];
  const punjabiTranslation = line.translations["pu"];
  const translationAttrs = TRANSLATION_ATTRS[prefs.translationLang];

  // -- Commentary / teeka (feature 21) ------------------------------------------

  /** Which Punjabi teeka is actually displayed (selection, or its fallback). */
  const puShownSource: "darpan" | "fareedkot" =
    prefs.commentarySource === "fareedkot"
      ? line.commentary?.pu?.fareedkot
        ? "fareedkot"
        : "darpan"
      : line.commentary?.pu?.darpan
        ? "darpan"
        : "fareedkot";

  /**
   * The genuine commentary text for the user's selected language and teeka.
   * `line.commentary` is populated directly from BaniDB's dedicated teeka
   * sources (SGPC English rendering / Guru Granth Darpan / Faridkot Teeka) —
   * never the plain translation.  Falls back gracefully when a source is
   * absent for a particular verse, and the label always names the source
   * actually shown — a fallback must never wear another author's name.
   */
  const commentaryText =
    prefs.commentaryLang === "en"
      ? line.commentary?.en
      : puShownSource === "fareedkot"
        ? line.commentary?.pu?.fareedkot
        : line.commentary?.pu?.darpan;

  /** Attribution line for the commentary block — reflects the actual source. */
  const commentaryLabel =
    prefs.commentaryLang === "en"
      ? line.commentary?.enSource === "khalsa"
        ? "Commentary · English (Dr. Sant Singh Khalsa)"
        : "Commentary · English (SGPC · Bhai Manmohan Singh)"
      : puShownSource === "fareedkot"
        ? "Commentary · Faridkot Teeka (Sant Giani Badan Singh Ji)"
        : "Commentary · Guru Granth Darpan (Prof. Sahib Singh)";

  // -- Gurmukhi display -----------------------------------------------------------------

  /** Lareevar blends word spacing; never applied in word-tap or memorisation mode. */
  const isLareevar =
    prefs.isLareevarMode && !prefs.isTapToTranslit && !prefs.isMemorizationMode;
  const gurmukhiText = isLareevar ? line.gurmukhi.replace(/\s+/g, "") : line.gurmukhi;

  /**
   * Gurmukhi line with Santhya pause (visraam) markers interleaved after the
   * marked words — "," short pause, ";" long pause (feature 29).  Hidden in
   * Lareevar (continuous flow) and tap-to-transliterate (word alignment)
   * modes, where inline marks would corrupt the layout.
   */
  const gurmukhiWithVisraam = useMemo(() => {
    const markers = line.visraam;
    if (
      !prefs.showVisraam ||
      isLareevar ||
      prefs.isTapToTranslit ||
      !markers ||
      markers.length === 0
    ) {
      return null;
    }
    const words = line.gurmukhi.split(/\s+/).filter(Boolean);
    const byPos = new Map<number, boolean>();
    for (const m of markers) {
      if (m.pos < words.length) byPos.set(m.pos, (byPos.get(m.pos) ?? false) || m.long);
    }
    if (byPos.size === 0) return null;
    return words.map((w, i) => {
      const pause = byPos.get(i);
      return (
        <span key={i}>
          {w}
          {pause !== undefined && (
            <span
              title={pause ? "Long pause (visraam)" : "Short pause (visraam)"}
              className="font-bold text-[var(--accent)]"
            >
              {pause ? ";" : ","}
            </span>
          )}
          {i < words.length - 1 ? " " : ""}
        </span>
      );
    });
  }, [line.gurmukhi, line.visraam, prefs.showVisraam, prefs.isTapToTranslit, isLareevar]);

  /** True when the Gurmukhi should currently appear blurred (memorisation). */
  const hiddenMemorize = prefs.isMemorizationMode && !revealed;

  // -- Copy -----------------------------------------------------------------------------

  const handleCopy = async () => {
    try {
      const textToCopy = [
        line.gurmukhi,
        translit ? translit : "",
        primaryTranslation ? primaryTranslation : "",
        `— ${sourceLabel}`,
      ]
        .filter(Boolean)
        .join("\n");
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      // Non-critical: clipboard may be blocked in some contexts.
    }
  };

  // -- Share as card image (feature 14) -------------------------------------------------

  /**
   * Renders the verse onto a 1080×1350 (4:5 portrait) canvas and triggers a
   * PNG download.  Long verses always fit: every block is word-wrapped, the
   * layout tries roomy font sizes first and shrinks step-wise until the whole
   * stack fits above the footer, and only as a last resort truncates the
   * translation with an ellipsis.  Nothing is ever clipped or drawn
   * off-canvas.
   */
  const handleShare = () => {
    try {
      const W = 1080;
      const H = 1350;
      const PAD_X = 110;
      const usable = W - PAD_X * 2;
      const canvas = document.createElement("canvas");
      canvas.width = W;
      canvas.height = H;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      /** Word-wraps text to the card width for the given font. */
      const wrap = (text: string, font: string): string[] => {
        ctx.font = font;
        const out: string[] = [];
        let current = "";
        for (const w of text.split(/\s+/).filter(Boolean)) {
          const test = current ? `${current} ${w}` : w;
          if (ctx.measureText(test).width <= usable) {
            current = test;
          } else {
            if (current) out.push(current);
            current = w;
          }
        }
        if (current) out.push(current);
        return out;
      };

      /** Truncates wrapped lines to `max` rows, ellipsising the last one. */
      const fitLines = (wrapped: string[], font: string, max: number): string[] => {
        if (wrapped.length <= max) return wrapped;
        const kept = wrapped.slice(0, max);
        ctx.font = font;
        let last = kept[max - 1];
        while (last.length > 1 && ctx.measureText(`${last}…`).width > usable) {
          last = last.slice(0, -1).trimEnd();
        }
        kept[max - 1] = `${last}…`;
        return kept;
      };

      const translation = primaryTranslation || punjabiTranslation || "";
      const trText = translit || line.transliteration || "";

      // Roomy-first font configs; the first one whose stack fits wins.
      const configs = [
        { g: 56, tr: 32, tl: 30 },
        { g: 48, tr: 28, tl: 26 },
        { g: 42, tr: 25, tl: 23 },
        { g: 36, tr: 22, tl: 20 },
      ];
      const gFont = (s: number) => `600 ${s}px ${SHARE_FONT_STACK}`;
      const trFont = (s: number) => `italic 400 ${s}px Inter, sans-serif`;
      const tlFont = (s: number) => `400 ${s}px Inter, sans-serif`;

      const CONTENT_TOP = 400;
      const CONTENT_BOTTOM = H - 200;
      const GAP = 44;

      let picked = configs[configs.length - 1];
      let gLines: string[] = [];
      let trLines: string[] = [];
      let tlLines: string[] = [];
      for (const cfg of configs) {
        const g = wrap(line.gurmukhi, gFont(cfg.g));
        const tr = trText ? wrap(trText, trFont(cfg.tr)) : [];
        const tl = translation ? wrap(translation, tlFont(cfg.tl)) : [];
        const need =
          g.length * cfg.g * 1.65 +
          (tr.length ? GAP * 0.7 + tr.length * cfg.tr * 1.5 : 0) +
          (tl.length ? GAP + tl.length * cfg.tl * 1.5 : 0);
        gLines = g;
        trLines = tr;
        tlLines = tl;
        picked = cfg;
        if (need <= CONTENT_BOTTOM - CONTENT_TOP) break;
      }

      // Last resort: cap the stack so it ends above the footer.
      const maxGLines = Math.max(
        2,
        Math.floor((CONTENT_BOTTOM - CONTENT_TOP) / (picked.g * 1.65))
      );
      gLines = fitLines(gLines, gFont(picked.g), Math.min(gLines.length, maxGLines));
      let used =
        CONTENT_TOP + gLines.length * picked.g * 1.65;
      const trBudget =
        trLines.length && used + GAP * 0.7 < CONTENT_BOTTOM
          ? Math.max(
              1,
              Math.floor((CONTENT_BOTTOM - used - GAP * 0.7) / (picked.tr * 1.5))
            )
          : 0;
      trLines = trBudget ? fitLines(trLines, trFont(picked.tr), Math.min(trLines.length, trBudget)) : [];
      used += trLines.length ? GAP * 0.7 + trLines.length * picked.tr * 1.5 : 0;
      const tlBudget =
        tlLines.length && used + GAP < CONTENT_BOTTOM
          ? Math.max(1, Math.floor((CONTENT_BOTTOM - used - GAP) / (picked.tl * 1.5)))
          : 0;
      tlLines = tlBudget ? fitLines(tlLines, tlFont(picked.tl), Math.min(tlLines.length, tlBudget)) : [];

      const totalH =
        gLines.length * picked.g * 1.65 +
        (trLines.length ? GAP * 0.7 + trLines.length * picked.tr * 1.5 : 0) +
        (tlLines.length ? GAP + tlLines.length * picked.tl * 1.5 : 0);
      // Vertically centre the stack between the header mark and the footer.
      let y = CONTENT_TOP + Math.max(0, (CONTENT_BOTTOM - CONTENT_TOP - totalH) / 2);

      // -- Backdrop: deep base + warm radial glow + hairline frame -------------
      ctx.fillStyle = "#0B0C12";
      ctx.fillRect(0, 0, W, H);
      const glow = ctx.createRadialGradient(W / 2, H * 0.32, 60, W / 2, H * 0.32, 720);
      glow.addColorStop(0, "rgba(245, 158, 11, 0.12)");
      glow.addColorStop(1, "rgba(245, 158, 11, 0)");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = "rgba(245, 158, 11, 0.35)";
      ctx.lineWidth = 2;
      ctx.strokeRect(44, 44, W - 88, H - 88);

      // -- Header mark ----------------------------------------------------------
      ctx.textAlign = "center";
      ctx.textBaseline = "alphabetic";
      ctx.fillStyle = "#F59E0B";
      ctx.font = `600 92px ${SHARE_FONT_STACK}`;
      ctx.fillText("ੴ", W / 2, 208);
      ctx.fillRect(W / 2 - 80, 258, 160, 4);

      // -- Body: top-baseline stacking so wrapped rows never overlap -----------
      ctx.textBaseline = "top";

      // -- Gurmukhi ---------------------------------------------------------------
      ctx.fillStyle = "#FAFAFA";
      ctx.font = gFont(picked.g);
      for (const l of gLines) {
        ctx.fillText(l, W / 2, y);
        y += picked.g * 1.65;
      }

      // -- Transliteration ----------------------------------------------------------
      if (trLines.length) {
        y += GAP * 0.7;
        ctx.fillStyle = "#94A3B8";
        ctx.font = trFont(picked.tr);
        for (const l of trLines) {
          ctx.fillText(l, W / 2, y);
          y += picked.tr * 1.5;
        }
      }

      // -- Translation ----------------------------------------------------------------
      if (tlLines.length) {
        y += GAP;
        ctx.fillStyle = "#E2E8F0";
        ctx.font = tlFont(picked.tl);
        for (const l of tlLines) {
          ctx.fillText(l, W / 2, y);
          y += picked.tl * 1.5;
        }
      }

      // -- Footer attribution -----------------------------------------------------------
      ctx.textBaseline = "alphabetic";
      ctx.fillStyle = "#F59E0B";
      ctx.fillRect(W / 2 - 60, H - 168, 120, 3);
      ctx.fillStyle = "#64748B";
      ctx.font = `400 26px Inter, sans-serif`;
      ctx.fillText(
        baniName ?? `Sri Guru Granth Sahib Ji · Ang ${angNumber}`,
        W / 2,
        H - 108
      );

      // Download.
      const url = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = url;
      a.download = baniToken
        ? `sggs-${baniToken}-verse-${line.id}.png`
        : `sggs-ang-${angNumber}-verse-${line.id}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      setShared(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setShared(false), 2000);
    } catch {
      // Canvas rendering is best-effort; failure is silently ignored.
    }
  };

  return (
    <article
      className={`group scroll-mt-20 rounded-xl border-b border-[var(--border-subtle)] p-4 transition-colors sm:p-6 hover:bg-[var(--surface-hover)]`}
      style={{
        fontSize: `${prefs.fontScale}rem`,
        ...(highlight ? { backgroundColor: HIGHLIGHT_TINTS[highlight] } : {}),
      }}
      id={line.id}
    >
      {/* Primary Scripture: Gurmukhi */}
      <p
        dir="auto"
        lang="pa"
        onClick={() => {
          if (hiddenMemorize) setRevealed(true);
          if (prefs.isTapToTranslit) setWordRevealed(null);
        }}
        className={`font-gurmukhi text-[1.8em] font-medium leading-[1.95] text-[var(--text)] tracking-normal selection:bg-[var(--accent-light)] ${
          hiddenMemorize
            ? "memorize-hidden cursor-pointer select-none"
            : ""
        } ${prefs.isTapToTranslit && !hiddenMemorize ? "cursor-pointer" : ""}`}
      >
        {hiddenMemorize ? (
          <span dir="auto" lang="pa">
            {line.gurmukhi.split(/\s+/).filter(Boolean).map(() => "—").join(" ")}
          </span>
        ) : (
          gurmukhiWithVisraam ?? gurmukhiText
        )}
      </p>

      {/* Memorisation reveal hint */}
      {hiddenMemorize && (
        <button
          onClick={() => setRevealed(true)}
          className={`verse-extra mt-3 rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs font-semibold text-[var(--text-muted)] transition hover:text-[var(--text)] hover:border-[var(--accent)]`}
        >
          Tap to reveal verse
        </button>
      )}

      {/* Tap-to-transliterate word bar (feature 19) */}
      {prefs.isTapToTranslit && !hiddenMemorize && (
        <div className={`verse-extra mt-3 ${wordPairs.length ? "" : "hidden"}`}>
          <div className="flex flex-wrap gap-1.5" lang="pa">
            {wordPairs.map(([gk, tr], i) => (
              <span key={i} className="relative">
                <button
                  onClick={() => setWordRevealed((prev) => (prev === i ? null : i))}
                  lang="pa"
                  aria-pressed={wordRevealed === i}
                  className={`rounded-md px-1.5 py-0.5 transition ${
                    wordRevealed === i
                      ? "bg-[var(--accent-light)] text-[var(--accent)]"
                      : "hover:bg-[var(--surface-hover)] text-[var(--text)]"
                  }`}
                >
                  {gk}
                </button>
                {wordRevealed === i && (
                  <span className="mb-1 block text-center text-[0.62em] italic leading-none text-[var(--accent)]">
                    {tr}
                  </span>
                )}
              </span>
            ))}
          </div>
          {wordPairs.length === 0 && (
            <button
              onClick={() => setWordRevealed((prev) => (prev === -1 ? null : -1))}
              className="text-xs italic text-[var(--text-muted)] hover:text-[var(--text)] transition"
            >
              Tap to reveal transliteration
            </button>
          )}
        </div>
      )}

      {/* Secondary: Transliteration (feature 24 — script follows preference) */}
      {prefs.showTransliteration && !prefs.isTapToTranslit && translit && (
        <p className={`verse-extra mt-3 text-[0.95em] italic leading-relaxed text-[var(--text-muted)] ${hiddenMemorize ? "blur-sm select-none" : ""}`}>
          {translit}
        </p>
      )}

      {/* Secondary: Translation — normal OR parallel layout (feature 18).
          Parallel always pairs English with Punjabi (never the same text
          twice when the preferred language is already Punjabi). */}
      {prefs.showTranslation && !prefs.isTapToTranslit && (
        prefs.isParallelTranslations ? (
          <div className={`verse-extra mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 ${hiddenMemorize ? "blur-sm select-none" : ""}`}>
            {line.translations.en && (
              <p className="text-[0.92em] leading-relaxed text-[var(--text-secondary)]">
                {line.translations.en}
              </p>
            )}
            {punjabiTranslation && (
              <p dir="auto" lang="pa" className="font-gurmukhi text-[0.92em] leading-relaxed text-[var(--text-secondary)]">
                {punjabiTranslation}
              </p>
            )}
          </div>
        ) : (
          prefs.showTranslation && primaryTranslation && (
            <p
              dir="auto"
              lang={translationAttrs.lang}
              className={`verse-extra mt-2 text-[1.02em] leading-relaxed text-[var(--text-secondary)] ${translationAttrs.gurmukhi ? "font-gurmukhi" : ""} ${hiddenMemorize ? "blur-sm select-none" : ""}`}
            >
              {primaryTranslation}
            </p>
          )
        )
      )}

      {/* Word-by-word meanings (pad-arth), served by BaniDB per verse. */}
      {prefs.showWordMeanings && line.padArth && (
        <div className={`verse-extra mt-4 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 ${hiddenMemorize ? "blur-sm select-none" : ""}`}>
          <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
            Word Meanings · Pad-arth
          </p>
          <p dir="auto" lang="pa" className="font-gurmukhi mt-1 text-[0.9em] leading-relaxed text-[var(--text-secondary)]">
            {line.padArth}
          </p>
        </div>
      )}

      {/* Text & commentary block (feature 21) — genuine teeka from BaniDB's
      dedicated commentary sources, attributable and switchable between the
      SGPC English rendering and the Punjabi teekas (Guru Granth Darpan ↑
      Darpan, Faridkot Teeka). */}
      {prefs.showKanji && commentaryText && (
        <div className={`verse-extra mt-4 rounded-lg border-l-2 border-[var(--accent)] bg-[var(--accent-light)]/40 px-3 py-2 ${hiddenMemorize ? "blur-sm select-none" : ""}`}>
          <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--accent)]">
            {commentaryLabel}
          </p>
          <p dir="auto" lang={prefs.commentaryLang === "pu" ? "pa" : "en"} className="font-gurmukhi mt-1 text-[0.9em] leading-relaxed text-[var(--text-secondary)]">
            {commentaryText}
          </p>
        </div>
      )}

      {/* Verse notes (feature 10) */}
      {notesOpen && (
        <div className="verse-extra mt-4 space-y-2">
          <textarea
            value={note?.text ?? ""}
            onChange={(e) => setNote(line.id, e.target.value)}
            placeholder="Write a brief reflection on this verse…"
            aria-label="Verse note"
            rows={2}
            lang="en"
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] p-2 text-xs text-[var(--text)] outline-none focus:border-[var(--accent)]"
          />
          {note && (
            <button
              onClick={() => removeNote(line.id)}
              className="text-[11px] font-semibold text-[var(--text-muted)] hover:text-[var(--text)] transition"
            >
              Delete note
            </button>
          )}
        </div>
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
        <div className="verse-extra flex items-center gap-1 opacity-60 transition-opacity group-hover:opacity-100">
          {/* Copy verse text */}
          <button
            onClick={handleCopy}
            aria-label="Copy verse text"
            title={copied ? "Copied to clipboard" : "Copy verse"}
            className="flex h-11 w-11 items-center justify-center rounded-lg text-[var(--text-muted)] transition hover:bg-[var(--surface-active)] hover:text-[var(--text)] active:scale-[0.97]"
          >
            {copied ? <Check size={16} className="text-[var(--accent)]" /> : <Copy size={16} />}
          </button>

          {/* Share as card image */}
          <button
            onClick={handleShare}
            aria-label="Share verse as image"
            title={shared ? "Image downloaded" : "Share as image"}
            className="flex h-11 w-11 items-center justify-center rounded-lg text-[var(--text-muted)] transition hover:bg-[var(--surface-active)] hover:text-[var(--text)] active:scale-[0.97]"
          >
            {shared ? <Check size={16} className="text-[var(--accent)]" /> : <Share2 size={16} />}
          </button>

          {/* Highlights — colour picker popover */}
          <div className="relative">
            <button
              onClick={() => setHighlightOpen((o) => !o)}
              aria-label="Highlight verse"
              aria-expanded={highlightOpen}
              title="Highlight with colour"
              className={`flex h-11 w-11 items-center justify-center rounded-lg transition active:scale-[0.97] ${
                highlight
                  ? "text-[var(--accent)]"
                  : "text-[var(--text-muted)] hover:bg-[var(--surface-active)] hover:text-[var(--text)]"
              }`}
            >
              <Highlighter size={16} />
            </button>
            {highlightOpen && (
              <div className="absolute bottom-12 right-0 z-20 flex gap-1.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-2 shadow-[var(--shadow-popover)] animate-in fade-in zoom-in-95">
                {HIGHLIGHT_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => {
                      toggleHighlight(line.id, c);
                      setHighlightOpen(false);
                    }}
                    aria-label={`${HIGHLIGHT_LABELS[c]} highlight`}
                    title={HIGHLIGHT_LABELS[c]}
                    style={{ backgroundColor: HIGHLIGHT_TINTS[c] }}
                    className="h-7 w-7 rounded-full border border-[var(--border)] transition hover:scale-110"
                  />
                ))}
              </div>
            )}
          </div>

          {/* Verse notes toggle */}
          <button
            onClick={() => setNotesOpen((o) => !o)}
            aria-label="Add note to verse"
            aria-expanded={notesOpen}
            title={note ? "Edit verse note" : "Add verse note"}
            className={`flex h-11 w-11 items-center justify-center rounded-lg transition active:scale-[0.97] ${
              note
                ? "text-[var(--accent)]"
                : "text-[var(--text-muted)] hover:bg-[var(--surface-active)] hover:text-[var(--text)]"
            }`}
          >
            {notesOpen ? <X size={16} /> : <StickyNote size={16} />}
          </button>

          {/* Toggle bookmark */}
          <button
            onClick={() =>
              toggleBookmark({
                verseId: line.id,
                angNumber,
                gurmukhiSnippet: line.gurmukhi.slice(0, 60),
                ...(baniToken ? { bani: baniToken } : {}),
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