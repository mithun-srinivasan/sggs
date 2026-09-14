/**
 * app/ang/[id]/print/page.tsx
 * ---------------------------------------------------------------------------
 * A static, print-optimised view of a whole Ang (feature 15: Print / PDF).
 *
 * Statically generated for every Ang via `generateStaticParams`, each print
 * layout mirrors the reader's verse order:
 *   Gurmukhi          (always, large & solid — the scripture itself)
 *   Transliteration   (Latin script)
 *   English translation
 *   Punjabi translation
 * separated by a quiet divider between verses.
 *
 * The browser's native print dialog (→ Save as PDF) is triggered from the
 * header; the `print:` CSS in `globals.css` strips all chrome and the screen
 * header for a clean printed page.
 */

import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAng, clampAng } from "@/lib/data";
import { MIN_ANG, MAX_ANG } from "@/lib/types";
import PrintAng from "./PrintAng";

interface PageProps {
  params: Promise<{ id: string }>;
}

export function generateStaticParams() {
  return Array.from({ length: MAX_ANG - MIN_ANG + 1 }, (_, i) => ({
    id: String(i + MIN_ANG),
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const angNumber = clampAng(parseInt(id, 10));
  return {
    title: `Print Ang ${angNumber} | Sri Guru Granth Sahib Ji`,
    description: `Print-ready view of Ang ${angNumber} of Sri Guru Granth Sahib Ji.`,
    robots: { index: false },
  };
}

export default async function PrintAngPage({ params }: PageProps) {
  const { id } = await params;
  const parsed = parseInt(id, 10);
  if (Number.isNaN(parsed) || parsed < MIN_ANG || parsed > MAX_ANG) notFound();

  const angNumber = parsed;
  const ang = await getAng(angNumber);
  if (!ang) notFound();

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <PrintAng angNumber={angNumber} lines={ang.lines} />

      <main className="mx-auto max-w-3xl px-6 py-8 sm:py-10">
        <div className="text-center border-b border-[var(--border)] pb-6">
          <p className="text-xs uppercase tracking-widest text-[var(--text-muted)]">
            {ang.source ?? "Sri Guru Granth Sahib Ji"}
          </p>
          <h1 className="mt-1 text-xl font-bold">{ang.raagName ?? `Ang ${angNumber}`}</h1>
          <p className="text-sm text-[var(--text-muted)]">Ang {angNumber} of {MAX_ANG}</p>
        </div>

        <article className="mt-8 space-y-7">
          {ang.lines.map((line) => (
            <section key={line.id} className="break-inside-avoid border-b border-[var(--border-subtle)] pb-6">
              <p dir="auto" lang="pa" className="font-gurmukhi text-xl leading-[1.9] text-[var(--text)]">
                {line.gurmukhi}
              </p>
              {line.transliteration && (
                <p className="mt-2 text-xs italic text-[var(--text-muted)]">
                  {line.transliteration}
                </p>
              )}
              {line.translations.en && (
                <p className="mt-2 text-sm text-[var(--text-secondary)]">{line.translations.en}</p>
              )}
              {line.translations.pu && (
                <p dir="auto" lang="pa" className="font-gurmukhi mt-1 text-sm text-[var(--text-secondary)]">
                  {line.translations.pu}
                </p>
              )}
              {line.translations.hi && (
                <p dir="auto" lang="hi" className="mt-1 text-sm text-[var(--text-secondary)]">
                  {line.translations.hi}
                </p>
              )}
              {line.translations.es && (
                <p dir="auto" lang="es" className="mt-1 text-sm text-[var(--text-secondary)]">
                  {line.translations.es}
                </p>
              )}
            </section>
          ))}
        </article>

        <footer className="mt-12 border-t border-[var(--border)] pt-6 text-center text-xs text-[var(--text-muted)]">
          Sri Guru Granth Sahib Ji — {angNumber} of {MAX_ANG}
        </footer>
      </main>
    </div>
  );
}