"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowLeft, Search as SearchIcon, Loader2, X } from "lucide-react";
import type { SearchResult } from "@/lib/types";
import { runSearch } from "./actions";

const QUICK_SEARCHES = ["ੴ", "ਸਤਿ ਨਾਮੁ", "ਵਾਹਿਗੁਰੂ", "Japji", "Truth", "Guru Nanak"];

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const doSearch = async (term: string) => {
    if (!term.trim()) return;
    setQuery(term);
    setLoading(true);
    setSearched(true);
    const res = await runSearch(term);
    setResults(res);
    setLoading(false);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    doSearch(query);
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] transition-colors">
      <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-[var(--bg)]">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3 sm:px-6">
          <Link
            href="/"
            aria-label="Back to home"
            className="flex h-11 w-11 items-center justify-center rounded-lg text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-hover)] transition"
          >
            <ArrowLeft size={18} />
          </Link>

          <form onSubmit={handleSubmit} className="flex flex-1 items-center">
            <div className="flex flex-1 items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 focus-within:border-[var(--accent)]">
              <SearchIcon size={18} className="text-[var(--text-muted)]" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search Gurbani by Gurmukhi or English..."
                className="w-full bg-transparent text-sm text-[var(--text)] outline-none placeholder:text-[var(--text-muted)]"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    setResults([]);
                    setSearched(false);
                  }}
                  className="flex h-8 w-8 items-center justify-center text-[var(--text-muted)] hover:text-[var(--text)]"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </form>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-5 py-8 sm:px-8">
        {!searched && (
          <div className="py-8 space-y-6 text-center">
            <div>
              <h2 className="text-base font-bold text-[var(--text)]">Search Across All 1430 Angs</h2>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                Enter text in Gurmukhi script or English translation.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2">
              {QUICK_SEARCHES.map((term) => (
                <button
                  key={term}
                  onClick={() => doSearch(term)}
                  className="min-h-[40px] rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 text-xs font-semibold text-[var(--text-secondary)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-[var(--text-muted)]">
            <Loader2 size={22} className="animate-spin text-[var(--accent)]" />
            <span className="text-xs font-semibold">Searching...</span>
          </div>
        )}

        {!loading && searched && results.length === 0 && (
          <div className="py-16 text-center space-y-1">
            <p className="text-sm font-semibold text-[var(--text)]">No results for &ldquo;{query}&rdquo;</p>
            <p className="text-xs text-[var(--text-muted)]">Try a shorter search term or check spelling.</p>
          </div>
        )}

        {!loading && results.length > 0 && (
          <div className="space-y-4">
            <p className="text-xs font-semibold text-[var(--text-muted)]">
              Found {results.length} verses
            </p>

            <ul className="divide-y divide-[var(--border)] border-y border-[var(--border)]">
              {results.map((r) => (
                <li key={r.id}>
                  <Link
                    href={`/ang/${r.angNumber}#${r.id}`}
                    className="block py-4 transition hover:bg-[var(--surface-hover)]"
                  >
                    <span className="text-xs font-bold text-[var(--accent)]">Ang {r.angNumber}</span>
                    <p className="font-gurmukhi text-lg font-semibold leading-relaxed text-[var(--text)] mt-1">
                      {r.gurmukhi}
                    </p>
                    {r.translation && (
                      <p className="mt-1 text-xs text-[var(--text-muted)]">{r.translation}</p>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </main>
    </div>
  );
}
