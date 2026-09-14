/**
 * app/bookmarks/page.tsx
 * ---------------------------------------------------------------------------
 * Displays all user-saved verse bookmarks in a scrollable list.
 *
 * Features:
 *   - Each bookmark shows its Ang number, Gurmukhi snippet, and saved date.
 *   - Tapping a bookmark deep-links to `/ang/N#verseId` in the reader.
 *   - A remove button (BookmarkX icon) deletes the bookmark.
 *   - **Folders/tags (feature 11):** assign tags to any bookmark, filter the
 *     list by tag, and see a tag chip row at the top.
 *   - **Print (feature 15):** `print` button renders a clean printed list;
 *     `@media print` CSS hides the interactive chrome.
 *   - Export / Import bookmarks as timestamped JSON.
 *   - A theme toggle cycles through Light → Dark → Sepia (3-way cycle).
 *
 * Data is managed entirely by `BookmarksProvider` (localStorage-backed).
 */

"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Bookmark as BookmarkIcon,
  BookmarkX,
  ArrowRight,
  Sun,
  Moon,
  Coffee,
  Download,
  Upload,
  Printer,
  Tag,
  X,
} from "lucide-react";
import { useBookmarks } from "@/components/BookmarksProvider";
import { useReaderPrefs } from "@/components/ReaderPrefsProvider";

export default function BookmarksPage() {
  const { bookmarks, removeBookmark, addTag, removeTag, allTags, exportBookmarks, importBookmarks } =
    useBookmarks();
  const prefs = useReaderPrefs();

  /** Hidden file input ref — clicked programmatically via the Upload button. */
  const fileInputRef = useRef<HTMLInputElement>(null);

  /** Import feedback state: "idle" → "success"/"error" → "idle" (after 3s). */
  const [importStatus, setImportStatus] = useState<"idle" | "success" | "error">("idle");

  /** Currently active tag filter (`null` = show everything). */
  const [activeTag, setActiveTag] = useState<string | null>(null);

  /** Which bookmark's tag editor is open. */
  const [tagEditorId, setTagEditorId] = useState<string | null>(null);

  /** Per-editor draft tag text. */
  const [tagDraft, setTagDraft] = useState("");

  /** Unique tags in use (already sorted by the provider). */
  const tags = allTags;

  /** Bookmarks after applying the tag filter. */
  const visible = activeTag
    ? bookmarks.filter((b) => (b.tags ?? []).includes(activeTag))
    : bookmarks;

  // -- Export handler: triggers the BookmarksProvider's download --------------

  const handleExport = () => exportBookmarks();

  // -- Import handler: reads a user-selected JSON file ------------------------

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const success = importBookmarks(text);
      setImportStatus(success ? "success" : "error");
      setTimeout(() => setImportStatus("idle"), 3000);
    };
    reader.readAsText(file);

    // Reset the input so the same file can be re-imported if needed.
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  /** Commits the draft tag to the bookmark whose editor is open. */
  const commitTag = (verseId: string) => {
    addTag(verseId, tagDraft);
    setTagDraft("");
  };

  // -- Theme cycle: Light → Dark → Sepia → Light ----------------------------

  const nextTheme = prefs.theme === "light" ? "dark" : prefs.theme === "dark" ? "sepia" : "light";
  const ThemeIcon = prefs.theme === "light" ? Sun : prefs.theme === "dark" ? Moon : Coffee;

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] transition-colors">
      {/* Sticky header with back link, title, export/import, and theme toggle */}
      <header className="print-hide sticky top-0 z-30 border-b bg-[var(--bg)]">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              aria-label="Back to home"
              className="flex h-11 w-11 items-center justify-center rounded-lg text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-hover)] transition"
            >
              <ArrowLeft size={18} />
            </Link>
            <h1 className="text-sm font-bold text-[var(--text)]">
              Saved Verses ({bookmarks.length})
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {/* Print button — opens the browser print dialog */}
            <button
              onClick={() => window.print()}
              aria-label="Print bookmarks"
              title="Print bookmarks"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border)] bg-transparent text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--surface-hover)] transition"
            >
              <Printer size={16} />
            </button>

            {/* Export button — downloads all bookmarks as a JSON file */}
            <button
              onClick={handleExport}
              aria-label="Export bookmarks"
              title="Export bookmarks to JSON"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border)] bg-transparent text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--surface-hover)] transition"
            >
              <Download size={16} />
            </button>

            {/* Import button — opens a file picker for a .json file */}
            <button
              onClick={() => fileInputRef.current?.click()}
              aria-label="Import bookmarks"
              title="Import bookmarks from JSON"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border)] bg-transparent text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--surface-hover)] transition"
            >
              <Upload size={16} />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />

            {/* 3-way theme toggle: Light → Dark → Sepia → Light */}
            <button
              onClick={() => prefs.setTheme(nextTheme)}
              aria-label={`Switch to ${nextTheme} theme`}
              title={`Switch to ${nextTheme} theme`}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border)] bg-transparent text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--surface-hover)] transition"
            >
              <ThemeIcon size={16} />
            </button>
          </div>
        </div>

        {/* Tag filter row (feature 11) */}
        {tags.length > 0 && (
          <div className="mx-auto flex max-w-3xl flex-wrap items-center gap-2 px-4 pb-3 sm:px-6">
            <button
              onClick={() => setActiveTag(null)}
              className={`rounded-full px-3 py-1 text-[11px] font-semibold transition ${
                activeTag === null
                  ? "bg-[var(--accent)] text-white"
                  : "border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)]"
              }`}
            >
              All
            </button>
            {tags.map((t) => (
              <button
                key={t}
                onClick={() => setActiveTag((cur) => (cur === t ? null : t))}
                className={`rounded-full px-3 py-1 text-[11px] font-semibold transition ${
                  activeTag === t
                    ? "bg-[var(--accent)] text-white"
                    : "border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)]"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        )}
      </header>

      <main className="mx-auto max-w-3xl px-5 py-8 sm:px-8">
        {/* Import success / error banners */}
        {importStatus === "success" && (
          <div className="mb-4 rounded-lg bg-green-600/20 px-4 py-2 text-xs font-medium text-green-400">
            Bookmarks imported successfully!
          </div>
        )}
        {importStatus === "error" && (
          <div className="mb-4 rounded-lg bg-red-600/20 px-4 py-2 text-xs font-medium text-red-400">
            Invalid file format. Please upload a valid JSON file.
          </div>
        )}

        {/* Empty state */}
        {bookmarks.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--surface-hover)] text-[var(--text-muted)]">
              <BookmarkIcon size={24} />
            </div>
            <div className="space-y-1">
              <h2 className="text-sm font-bold text-[var(--text)]">No Bookmarks Saved Yet</h2>
              <p className="max-w-xs text-xs text-[var(--text-muted)] leading-relaxed">
                Tap the bookmark icon under any verse while reading to save it here.
              </p>
            </div>
            <Link
              href="/ang/1"
              className="mt-2 flex min-h-[44px] items-center gap-2 rounded-lg bg-[var(--accent)] px-5 py-2 text-xs font-semibold text-white transition hover:opacity-90"
            >
              <span>Read Ang 1</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        ) : visible.length === 0 ? (
          <p className="py-16 text-center text-xs text-[var(--text-muted)]">
            No bookmarks tagged “{activeTag}”.
          </p>
        ) : (
          /* Bookmarks list */
          <ul className="divide-y divide-[var(--border)] border-y border-[var(--border)]">
            {visible.map((b) => (
              <li key={b.verseId} className="flex items-start justify-between gap-4 py-4">
                <div className="min-w-0 flex-1">
                  {/* Tapping navigates directly to the verse in the reader */}
                  <Link
                    href={`/ang/${b.angNumber}#${b.verseId}`}
                    className="block transition hover:opacity-80"
                  >
                    <span className="text-xs font-bold text-[var(--accent)]">
                      Ang {b.angNumber} · {new Date(b.savedAt).toLocaleDateString()}
                    </span>
                    <p className="font-gurmukhi text-lg font-semibold leading-relaxed text-[var(--text)] truncate mt-1">
                      {b.gurmukhiSnippet}
                    </p>
                  </Link>

                  {/* Tag chips + editor (hidden when printing) */}
                  <div className="print-hide mt-2 flex flex-wrap items-center gap-1.5">
                    {(b.tags ?? []).map((t) => (
                      <span
                        key={t}
                        className="flex items-center gap-1 rounded-full bg-[var(--accent-light)] px-2 py-0.5 text-[10px] font-semibold text-[var(--accent)]"
                      >
                        {t}
                        <button
                          onClick={() => removeTag(b.verseId, t)}
                          aria-label={`Remove tag ${t}`}
                          className="hover:text-[var(--text)]"
                        >
                          <X size={10} />
                        </button>
                      </span>
                    ))}

                    {tagEditorId === b.verseId ? (
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          commitTag(b.verseId);
                        }}
                        className="flex items-center gap-1"
                      >
                        <input
                          value={tagDraft}
                          onChange={(e) => setTagDraft(e.target.value)}
                          placeholder="Add tag…"
                          autoFocus
                          className="h-6 w-24 rounded border border-[var(--border)] bg-[var(--bg)] px-1.5 text-[10px] text-[var(--text)] outline-none focus:border-[var(--accent)]"
                        />
                        <button
                          type="submit"
                          className="text-[10px] font-semibold text-[var(--accent)]"
                        >
                          Add
                        </button>
                      </form>
                    ) : (
                      <button
                        onClick={() => {
                          setTagEditorId(b.verseId);
                          setTagDraft("");
                        }}
                        className="flex items-center gap-1 rounded-full border border-dashed border-[var(--border)] px-2 py-0.5 text-[10px] font-semibold text-[var(--text-muted)] hover:text-[var(--accent)] transition"
                      >
                        <Tag size={10} />
                        Tag
                      </button>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => removeBookmark(b.verseId)}
                  aria-label="Remove bookmark"
                  title="Remove Bookmark"
                  className="print-hide flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[var(--border)] bg-transparent text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--surface-hover)] transition"
                >
                  <BookmarkX size={16} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}