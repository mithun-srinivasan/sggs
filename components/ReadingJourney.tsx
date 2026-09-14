/**
 * components/ReadingJourney.tsx
 * ---------------------------------------------------------------------------
 * The Home-page "Your Reading Journey" card, bundling the progress-related
 * features:
 *   - Reading progress bar (feature 7)   — Angs completed out of 1430.
 *   - Reading streak (feature 8)         — consecutive days with reading.
 *   - Reading history (feature 9)        — most recently visited Angs.
 *   - Reading playlist / Sehaj Paath (13) — start an N-day plan and continue.
 *
 * All state comes from `ProgressProvider` (localStorage-backed).  A plan
 * duration is chosen from a few sensible presets (7 / 30 / 90 / 365 days).
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import { BookOpenCheck, Flame, History, CalendarClock, Play, X } from "lucide-react";
import { useReadingProgress } from "./ProgressProvider";

/** Preset reading-plan lengths, in days. */
const PLAN_PRESETS = [7, 30, 90, 365];

export default function ReadingJourney() {
  const {
    hydrated,
    readAngs,
    progressPercent,
    streak,
    totalReadDays,
    history,
    plan,
    planDayIndex,
    todaysPlanRange,
    planContinueAng,
    startPlan,
    clearPlan,
  } = useReadingProgress();

  const [planOpen, setPlanOpen] = useState(false);

  // Avoid rendering dynamic (localStorage-derived) values before hydration.
  if (!hydrated) {
    return (
      <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/80 backdrop-blur-md p-6 sm:p-8 shadow-[var(--shadow-subtle)]">
        <div className="h-4 w-1/3 animate-pulse rounded bg-[var(--surface-hover)]" />
      </section>
    );
  }

  /** The 5 most recent Angs, newest first. */
  const recent = [...history].reverse().slice(0, 5);

  return (
    <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/80 backdrop-blur-md p-6 sm:p-8 space-y-6 shadow-[var(--shadow-subtle)]">
      <div className="flex items-center justify-between gap-2 border-b border-[var(--border-subtle)] pb-3">
        <h2 className="flex items-center gap-2 text-base font-bold text-[var(--text)]">
          <BookOpenCheck size={18} className="text-[var(--accent)]" />
          <span>Your Reading Journey</span>
        </h2>
        <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--accent)]">
          <Flame size={14} />
          <span>{streak}-day streak</span>
        </div>
      </div>

      {/* Progress bar (feature 7) */}
      <div>
        <div className="mb-1.5 flex items-center justify-between text-xs">
          <span className="text-[var(--text-muted)]">
            {readAngs.length} of 1430 Angs completed
          </span>
          <span className="font-bold text-[var(--text)]">{progressPercent}%</span>
        </div>
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-[var(--border)]">
          <div
            className="h-full rounded-full bg-[var(--accent)] transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <p className="mt-1.5 text-[11px] text-[var(--text-faint)]">
          Read on {totalReadDays} {totalReadDays === 1 ? "day" : "days"} so far.
        </p>
      </div>

      {/* Reading plan / playlist (feature 13) */}
      <div className="rounded-xl border border-[var(--border)] p-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-[var(--text)]">
            <CalendarClock size={14} className="text-[var(--accent)]" />
            <span>Sehaj Paath Plan</span>
          </div>
          {plan ? (
            <button
              onClick={clearPlan}
              aria-label="Cancel reading plan"
              className="flex items-center gap-1 text-[11px] font-semibold text-[var(--text-muted)] hover:text-[var(--text)] transition"
            >
              <X size={12} />
              End plan
            </button>
          ) : (
            <button
              onClick={() => setPlanOpen((o) => !o)}
              className="flex items-center gap-1 text-[11px] font-semibold text-[var(--accent)] hover:underline"
            >
              <Play size={12} />
              Start a plan
            </button>
          )}
        </div>

        {plan ? (
          <div className="mt-3 space-y-2">
            <p className="text-xs text-[var(--text-muted)]">
              Day {planDayIndex + 1} of {plan.totalDays}
              {todaysPlanRange ? ` · today: Ang ${todaysPlanRange[0]}–${todaysPlanRange[1]}` : ""}
            </p>
            <Link
              href={`/ang/${planContinueAng}`}
              className="inline-flex min-h-[40px] items-center gap-2 rounded-lg bg-[var(--accent)] px-4 py-2 text-xs font-semibold text-white transition hover:opacity-90 active:scale-[0.97]"
            >
              <span>Continue at Ang {planContinueAng}</span>
            </Link>
          </div>
        ) : planOpen ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {PLAN_PRESETS.map((days) => (
              <button
                key={days}
                onClick={() => {
                  startPlan(days);
                  setPlanOpen(false);
                }}
                className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs font-semibold text-[var(--text-muted)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition"
              >
                {days} days
              </button>
            ))}
          </div>
        ) : (
          <p className="mt-2 text-[11px] text-[var(--text-faint)]">
            Set a gentle goal to finish all 1430 Angs in 7–365 days.
          </p>
        )}
      </div>

      {/* Reading history (feature 9) */}
      {recent.length > 0 && (
        <div>
          <h3 className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-[var(--text-muted)]">
            <History size={13} />
            <span>Recently read</span>
          </h3>
          <div className="flex flex-wrap gap-2">
            {recent.map((h) => (
              <Link
                key={h.ang}
                href={`/ang/${h.ang}`}
                className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs font-semibold text-[var(--text)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition"
              >
                Ang {h.ang}
              </Link>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}