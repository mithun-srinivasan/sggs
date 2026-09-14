"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, Bookmark as BookmarkIcon, BookmarkX, ArrowRight, Sun, Moon, Download, Upload } from "lucide-react";
import { useBookmarks } from "@/components/BookmarksProvider";
import { useReaderPrefs } from "@/components/ReaderPrefsProvider";

export default function BookmarksPage() {
  const { bookmarks, removeBookmark, exportBookmarks, importBookmarks } = useBookmarks();
  const prefs = useReaderPrefs();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<"idle" | "success" | "error">("idle");

  const handleExport = () => {
    exportBookmarks();
  };

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
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] transition-colors">
      <header className="sticky top-0 z-30 border-b bg-[var(--bg)]">
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
            <button
              onClick={handleExport}
              aria-label="Export bookmarks"
              title="Export bookmarks to JSON"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border)] bg-transparent text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--surface-hover)] transition"
            >
              <Download size={16} />
            </button>
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
            <button
              onClick={() => prefs.setTheme(
                prefs.theme === "light" ? "dark" : "light"
              )}
              aria-label={prefs.theme === "light" ? "Switch to dark theme" : "Switch to light theme"}
              title={prefs.theme === "light" ? "Switch to dark theme" : "Switch to light theme"}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border)] bg-transparent text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--surface-hover)] transition"
            >
              <Sun size={16} className={prefs.theme === "light" ? "" : "hidden"} />
              <Moon size={16} className={prefs.theme === "dark" ? "" : "hidden"} />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-5 py-8 sm:px-8">
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
        ) : (
          <ul className="divide-y divide-[var(--border)] border-y border-[var(--border)] space-y-4">
            {bookmarks.map((b) => (
              <li key={b.verseId} className="flex items-center justify-between gap-4 py-4">
                <Link
                  href={`/ang/${b.angNumber}#${b.verseId}`}
                  className="min-w-0 flex-1 transition hover:opacity-80"
                >
                  <span className="text-xs font-bold text-[var(--accent)]">
                    Ang {b.angNumber} · {new Date(b.savedAt).toLocaleDateString()}
                  </span>
                  <p className="font-gurmukhi text-lg font-semibold leading-relaxed text-[var(--text)] truncate mt-1">
                    {b.gurmukhiSnippet}
                  </p>
                </Link>

                <button
                  onClick={() => removeBookmark(b.verseId)}
                  aria-label="Remove bookmark"
                  title="Remove Bookmark"
                  className="flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--border)] bg-transparent text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--surface-hover)] transition"
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
