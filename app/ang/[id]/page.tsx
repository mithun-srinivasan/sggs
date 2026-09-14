import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAng, clampAng } from "@/lib/data";
import { MAX_ANG, MIN_ANG } from "@/lib/types";
import NavigationBar from "@/components/NavigationBar";
import VerseCard from "@/components/VerseCard";
import SwipeContainer from "@/components/SwipeContainer";
import BottomNav from "./BottomNav";
import AngStartSentinel from "./AngStartSentinel";
import AngEndSentinel from "./AngEndSentinel";

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
  const ang = await getAng(angNumber);

  return {
    title: `Ang ${angNumber}${ang?.raagName ? ` — ${ang.raagName}` : ""} | Sri Guru Granth Sahib Ji`,
    description: ang?.lines?.[0]?.translations?.en ?? `Read Ang ${angNumber} of Sri Guru Granth Sahib Ji.`,
  };
}

export default async function AngPage({ params }: PageProps) {
  const { id } = await params;
  const parsed = parseInt(id, 10);

  if (Number.isNaN(parsed) || parsed < MIN_ANG || parsed > MAX_ANG) {
    notFound();
  }

  const angNumber = parsed;
  const ang = await getAng(angNumber);
  if (!ang) notFound();

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] transition-colors icon-border">
      <NavigationBar angNumber={angNumber} />

      <SwipeContainer angNumber={angNumber}>
        <main className="mx-auto max-w-3xl px-5 pt-20 pb-28 sm:px-8 sm:pt-24 animate-in fade-in duration-300">
          <AngStartSentinel angNumber={angNumber} minAng={MIN_ANG} />

          {/* Quiet, Dignified Header — Maximum breathing room */}
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

          {/* Scripture Verse List */}
          <section aria-label={`Ang ${angNumber} verses`}>
            {ang.lines.map((line) => (
              <VerseCard key={line.id} line={line} angNumber={angNumber} />
            ))}
          </section>

          {/* End of Ang Sentinel & Auto-Advance Transition to Next Ang */}
          <AngEndSentinel angNumber={angNumber} maxAng={MAX_ANG} />
        </main>
      </SwipeContainer>

      {/* Scroll-aware Bottom Bar */}
      <BottomNav angNumber={angNumber} maxAng={MAX_ANG} minAng={MIN_ANG} />
    </div>
  );
}
