/**
 * app/nitnem/page.tsx
 * ---------------------------------------------------------------------------
 * Nitnem index (feature 27) — the five daily prayers in traditional
 * recitation order.  Static list linking to each bani's reader page.
 */

import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight, MoonStar } from "lucide-react";
import { NITNEM_BANIS } from "@/lib/nitnem";

export const metadata: Metadata = {
  title: "Daily Nitnem Banis | Sri Guru Granth Sahib Ji",
  description:
    "The five daily Sikh prayers — Japji Sahib, Jaap Sahib, Anand Sahib, Rehras Sahib and Kirtan Sohila — with translations and commentary.",
};

export default function NitnemPage() {
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <header className="sticky top-0 z-30 border-b bg-[var(--bg)]">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-3 sm:px-6">
          <Link
            href="/"
            aria-label="Back to home"
            className="flex h-11 w-11 items-center justify-center rounded-lg text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-hover)] transition"
          >
            <ArrowLeft size={18} />
          </Link>
          <h1 className="text-sm font-bold text-[var(--text)]">Daily Nitnem</h1>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-5 py-10 sm:px-8">
        <p className="text-center text-xs leading-relaxed text-[var(--text-muted)]">
          The five daily prayers, in traditional order — with the same translations,
          commentary and word meanings as the Ang reader.
        </p>

        <ul className="mt-6 space-y-3">
          {NITNEM_BANIS.map((bani) => (
            <li key={bani.token}>
              <Link
                href={`/nitnem/${bani.token}`}
                className="group flex items-center justify-between gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)]/80 p-4 transition hover:border-[var(--accent)] sm:p-5"
              >
                <div className="min-w-0">
                  <p className="text-sm font-bold text-[var(--text)] group-hover:text-[var(--accent)] transition">
                    {bani.name}
                  </p>
                  <p dir="auto" lang="pa" className="font-gurmukhi mt-0.5 text-sm text-[var(--text-muted)]">
                    {bani.punjabiName}
                  </p>
                  <p className="mt-1 text-[11px] leading-relaxed text-[var(--text-faint)]">
                    {bani.description}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-md bg-[var(--accent-light)] px-1.5 py-0.5 text-[10px] font-bold text-[var(--accent)]">
                    <MoonStar size={10} />
                    {bani.time}
                  </span>
                  <ArrowRight size={14} className="text-[var(--accent)]" />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
