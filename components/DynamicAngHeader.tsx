/**
 * components/DynamicAngHeader.tsx
 * ---------------------------------------------------------------------------
 * Reusable, data-driven header for every Ang page in Sri Guru Granth Sahib Ji.
 *
 * Instead of relying on the BaniDB per-verse `raag` field (which can be
 * incomplete, e.g. just "ਜਪ" for Japji Sahib), this component resolves the
 * canonical scriptural section from `lib/angMetadata.ts` — covering all 1,430
 * Angs with accurate Gurmukhi/English section names, composition types, and
 * author attributions.
 *
 * Layout (mobile-first, OLED-safe):
 *   ┌────────────────────────────────────────┐
 *   │  SRI GURU GRANTH SAHIB JI  (source)    │
 *   │  ┌──────────────────────────────┐      │
 *   │  │  ਜਪੁਜੀ ਸਾਹਿਬ  (Gurmukhi)    │      │
 *   │  │  Japji Sahib · Shabad         │      │
 *   │  └──────────────────────────────┘      │
 *   │  by Guru Nanak Dev Ji  (author)        │
 *   │  Ang 1 of 1430                         │
 *   └────────────────────────────────────────┘
 */

import { MAX_ANG } from "@/lib/types";
import { getAngMetadata } from "@/lib/angMetadata";

export interface DynamicAngHeaderProps {
  currentAngId: number;
  /** Override the source label (defaults to "Sri Guru Granth Sahib Ji"). */
  source?: string;
}

export default function DynamicAngHeader({
  currentAngId,
  source = "Sri Guru Granth Sahib Ji",
}: DynamicAngHeaderProps) {
  const section = getAngMetadata(currentAngId);

  return (
    <header className="mb-12 border-b border-[var(--border-subtle)] pb-8 text-center space-y-3">
      {/* Source label — tiny uppercase tracking */}
      <p className="text-[11px] uppercase tracking-widest text-[var(--text-faint)] font-medium">
        {source}
      </p>

      {/* Gurmukhi section badge — the hero of the header */}
      <div className="inline-flex flex-col items-center gap-1.5">
        <h1 className="font-gurmukhi text-2xl sm:text-3xl font-medium text-[var(--text)] leading-tight">
          {section.realmGurmukhi}
        </h1>

        {/* English name + composition type — muted subtitle */}
        <div className="flex items-center gap-1.5 text-sm text-[var(--text-muted)]">
          <span>{section.realmEnglish}</span>
          <span className="text-[var(--text-faint)]">·</span>
          <span>{section.composition}</span>
        </div>
      </div>

      {/* Author attribution — faint, scannable */}
      <p className="text-xs text-[var(--text-muted)] font-normal">
        {section.author}
      </p>

      {/* Pagination footer */}
      <p className="text-xs text-[var(--text-muted)] font-normal">
        Ang {currentAngId} of {MAX_ANG}
      </p>
    </header>
  );
}
