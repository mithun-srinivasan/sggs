/**
 * components/ReadingHeatmap.tsx
 * ---------------------------------------------------------------------------
 * The Home-page "Reading Heatmap" card (feature 31).
 *
 * A GitHub-style activity grid built purely from the existing `visits` data
 * in `ProgressProvider` (day key → completed-Ang count) — no new storage, no
 * network.  Shows the last 20 weeks, Monday-first columns, with intensity
 * levels and a short summary.
 */

"use client";

import { useMemo } from "react";
import { CalendarDays } from "lucide-react";
import { dayKey, useReadingProgress } from "./ProgressProvider";

/** How many weeks of history the grid shows. */
const WEEKS = 20;

/** Intensity level (0–3) for a day's completed-Ang count. */
function levelFor(count: number): number {
  if (count <= 0) return 0;
  if (count === 1) return 1;
  if (count <= 3) return 2;
  return 3;
}

const LEVEL_CLASS = [
  "bg-[var(--border)] opacity-70",
  "bg-[var(--accent)] opacity-30",
  "bg-[var(--accent)] opacity-65",
  "bg-[var(--accent)]",
];

export default function ReadingHeatmap() {
  const { hydrated, visits } = useReadingProgress();

  const { columns, activeDays, totalCompletions } = useMemo(() => {
    const days: ({ date: Date; count: number } | null)[] = [];
    const today = new Date();
    today.setHours(12, 0, 0, 0);
    const total = WEEKS * 7;
    const start = new Date(today);
    start.setDate(start.getDate() - (total - 1));
    // Monday-first alignment: pad leading blanks.
    const pad = (start.getDay() + 6) % 7;
    for (let i = 0; i < pad; i++) days.push(null);
    let active = 0;
    let completions = 0;
    for (let i = 0; i < total; i++) {
      const date = new Date(start);
      date.setDate(date.getDate() + i);
      const count = visits[dayKey(date)] ?? 0;
      if (count > 0) active += 1;
      completions += count;
      days.push({ date, count });
    }
    // Pad the trailing week so the grid stays rectangular.
    while (days.length % 7 !== 0) days.push(null);
    const cols: ({ date: Date; count: number } | null)[][] = [];
    for (let c = 0; c < days.length; c += 7) cols.push(days.slice(c, c + 7));
    return { columns: cols, activeDays: active, totalCompletions: completions };
  }, [visits]);

  if (!hydrated) {
    return (
      <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/80 backdrop-blur-md p-6 sm:p-8 shadow-[var(--shadow-subtle)]">
        <div className="h-4 w-1/3 animate-pulse rounded bg-[var(--surface-hover)]" />
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/80 backdrop-blur-md p-6 sm:p-8 shadow-[var(--shadow-subtle)]">
      <h2 className="flex items-center gap-2 border-b border-[var(--border-subtle)] pb-3 text-base font-bold text-[var(--text)]">
        <CalendarDays size={18} className="text-[var(--accent)]" />
        <span>Reading Heatmap</span>
      </h2>

      <p className="mt-3 text-xs text-[var(--text-muted)]">
        {activeDays === 0
          ? "No reading days in the last 20 weeks yet — open any Ang to begin."
          : `${activeDays} active ${activeDays === 1 ? "day" : "days"} · ${totalCompletions} Ang completions in the last 20 weeks.`}
      </p>

      <div className="mt-4 overflow-x-auto pb-1">
        <div
          className="grid min-w-max grid-flow-col gap-1"
          style={{ gridTemplateRows: "repeat(7, minmax(0, 1fr))" }}
          role="img"
          aria-label={`Reading activity, ${activeDays} active days in the last 20 weeks`}
        >
          {columns.map((week, ci) =>
            week.map((cell, ri) =>
              cell === null ? (
                <span key={`${ci}-${ri}`} className="h-3 w-3" />
              ) : (
                <span
                  key={`${ci}-${ri}`}
                  title={`${cell.date.toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })} — ${cell.count} Ang${cell.count === 1 ? "" : "s"}`}
                  className={`h-3 w-3 rounded-[4px] ${LEVEL_CLASS[levelFor(cell.count)]}`}
                />
              )
            )
          )}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-end gap-1.5 text-[10px] text-[var(--text-faint)]">
        <span>Less</span>
        {LEVEL_CLASS.map((cls, i) => (
          <span key={i} className={`h-3 w-3 rounded-[4px] ${cls}`} />
        ))}
        <span>More</span>
      </div>
    </section>
  );
}
