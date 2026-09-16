/**
 * app/ang/[id]/page.tsx
 * ---------------------------------------------------------------------------
 * The main Ang reader page — the heart of the application.
 *
 * This is a **statically generated** page: `generateStaticParams` tells
 * Next.js to pre-render all 1430 Angs at build time by calling `getAng()`
 * (which in turn fetches from BaniDB and caches the result forever).
 *
 * `revalidate` (ISR, daily) is load-bearing resilience, not freshness —
 * scripture never changes, but a single transient BaniDB failure at build
 * time once baked a permanent 404 for `/ang/1430` (print/1430 built fine
 * from its own fetch seconds apart). Daily background regeneration means a
 * page stranded that way heals itself instead of waiting for a redeploy.
 * The build itself is unaffected: all pages are still pre-rendered up front.
 *
 * Invalid numbers render `not-found.tsx`; a valid number whose scripture fails
 * to load renders `AngUnavailable` (retry card) instead of the 404.
 *
 * Layout:
 *   - `NavigationBar` (fixed top, scroll-aware auto-hide)
 *   - `SwipeContainer` (wraps content, adds horizontal-swipe navigation)
 *     - Ang start sentinel (scroll-to-top → previous Ang)
 *     - Header (source label, Raag name, "Ang N of 1430")
 *     - Verse list (one `VerseCard` per line)
 *     - Ang end sentinel (scroll-to-bottom → next Ang)
 *   - `BottomNav` (fixed bottom, scroll-aware auto-hide)
 */

import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAng } from "@/lib/data";
import { MAX_ANG, MIN_ANG } from "@/lib/types";
import NavigationBar from "@/components/NavigationBar";
import SwipeContainer from "@/components/SwipeContainer";
import BottomNav from "./BottomNav";
import AngStartSentinel from "./AngStartSentinel";
import AngUnavailable from "./AngUnavailable";
import ClientAngReader from "./ClientAngReader";

interface PageProps {
  params: Promise<{ id: string }>;
}

/** Daily background regeneration — self-heals pages stranded by a transient
 *  build-time upstream failure (see header). Users always get instant cached
 *  pages; regeneration never blocks a visit. */
export const revalidate = 86400;

/**
 * Generates static parameters for all 1430 valid Angs.
 * Next.js calls this once at build time to pre-render every Ang page.
 */
export function generateStaticParams() {
  return Array.from({ length: MAX_ANG - MIN_ANG + 1 }, (_, i) => ({
    id: String(i + MIN_ANG),
  }));
}

/**
 * SEO metadata for each Ang page — includes the Ang number, optional Raag
 * name, and a snippet from the first translation (if available).
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const parsed = parseInt(id, 10);
  // Never clamp here: an invalid id renders the 404, so its metadata must
  // not masquerade as a neighbouring valid Ang.
  if (Number.isNaN(parsed) || parsed < MIN_ANG || parsed > MAX_ANG) {
    return { title: "Ang not found | Sri Guru Granth Sahib Ji" };
  }
  const angNumber = parsed;
  const ang = await getAng(angNumber);

  return {
    title: `Ang ${angNumber}${ang?.raagName ? ` — ${ang.raagName}` : ""} | Sri Guru Granth Sahib Ji`,
    description: ang?.lines?.[0]?.translations?.en ?? `Read Ang ${angNumber} of Sri Guru Granth Sahib Ji.`,
  };
}

export default async function AngPage({ params }: PageProps) {
  const { id } = await params;
  const parsed = parseInt(id, 10);

  // Validate the Ang number; if invalid, render the custom not-found page.
  if (Number.isNaN(parsed) || parsed < MIN_ANG || parsed > MAX_ANG) {
    notFound();
  }

  const angNumber = parsed;
  const ang = await getAng(angNumber);
  // The number is valid but the scripture failed to load (offline / API
  // down) — show the retry card, NOT the "out of range" 404 (that message is
  // reserved for genuinely invalid numbers handled above).
  if (!ang) {
    return (
      <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] transition-colors icon-border">
        <NavigationBar angNumber={angNumber} />
        <main className="mx-auto max-w-3xl px-5 pt-20 pb-28 sm:px-8 sm:pt-24">
          <AngUnavailable angNumber={angNumber} />
        </main>
        <BottomNav angNumber={angNumber} maxAng={MAX_ANG} minAng={MIN_ANG} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] transition-colors icon-border">
      {/* Fixed top navigation bar */}
      <NavigationBar angNumber={angNumber} />

      {/* Swipeable content wrapper */}
      <SwipeContainer angNumber={angNumber}>
        <main className="mx-auto max-w-3xl px-5 pt-20 pb-28 sm:px-8 sm:pt-24 animate-in fade-in duration-300">
          {/* Scroll-to-top sentinel — detects "scroll back up" → previous Ang */}
          <AngStartSentinel angNumber={angNumber} minAng={MIN_ANG} />

          {/* Ang header: source, Raag name, and position indicator */}
          <header className="mb-12 text-center space-y-2 border-b border-[var(--border-subtle)] pb-8">
            <p className="text-[11px] uppercase tracking-widest text-[var(--text-faint)] font-medium">
              {ang.source ?? "Sri Guru Granth Sahib Ji"}
            </p>
            <h1 className="font-gurmukhi text-2xl sm:text-3xl font-medium text-[var(--text)]">
              {ang.raagName ?? `Ang ${ang.angNumber}`}
            </h1>
            <p className="text-xs text-[var(--text-muted)] font-normal">
              Ang {ang.angNumber} of {MAX_ANG}
            </p>
          </header>

          {/* Verse list — rendered and chained by the continuous-mode reader */}
          <ClientAngReader
            angNumber={angNumber}
            initialLines={ang.lines}
            maxAng={MAX_ANG}
          />
        </main>
      </SwipeContainer>

      {/* Fixed bottom navigation bar */}
      <BottomNav angNumber={angNumber} maxAng={MAX_ANG} minAng={MIN_ANG} />
    </div>
  );
}