/**
 * components/ReadingJourney.tsx
 * ---------------------------------------------------------------------------
 * The Home-page "Your Reading Journey" card, bundling the progress-related
 * features:
 *   - Reading progress bar (feature 7)   — Angs completed out of 1430.
 *   - Reading streak (feature 8)         — consecutive days with reading.
 *   - Reading history (feature 9)        — most recently visited Angs.
 *   - Reading playlist / Sehaj Paath (13) — start an N-day plan and continue.
 *   - Daily goal tracker — set an Angs-per-day goal and watch today's bar.
 *
 * All state comes from `ProgressProvider` (localStorage-backed).  A plan
 * duration is chosen from a few sensible presets (7 / 30 / 90 / 365 days).
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import { BookOpenCheck, Flame, History, CalendarClock, Play, X, Target, Minus, Plus } from "lucide-react";
import { useReadingProgress } from "./ProgressProvider";

/** Preset reading-plan lengths, in days. */
const PLAN_PRESETS = [7, 30, 90, 365];

/** Preset daily Sehaj Paath goals, in Angs. */
const GOAL_PRESETS = [1, 2, 5, 10];

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
    dailyGoal,
    todaysAngCount,
    setDailyGoal,
  } = useReadingProgress();

  const [planOpen, setPlanOpen] = useState(false);
  const [goalOpen, setGoalOpen] = useState(false);

  /** Today's goal progress, capped at 100% for the bar. */
  const goalMet = dailyGoal > 0 && todaysAngCount >= dailyGoal;
  const goalWidth = dailyGoal > 0 ? Math.min(100, Math.round((todaysAngCount / dailyGoal) * 100)) : 0;

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

      {/* Daily Sehaj Paath goal tracker */}
      <div className="rounded-xl border border-[var(--border)] p-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-[var(--text)]">
            <Target size={14} className="text-[var(--accent)]" />
            <span>Today&apos;s Goal</span>
          </div>
          <button
            onClick={() => setGoalOpen((o) => !o)}
            aria-label="Set daily reading goal"
            className="text-[11px] font-semibold text-[var(--accent)] hover:underline"
          >
            {dailyGoal > 0 ? `${dailyGoal} Angs/day` : "Set goal"}
          </button>
        </div>

        {dailyGoal > 0 ? (
          <div className="mt-3">
            <div className="mb-1.5 flex items-center justify-between text-xs">
              <span className="text-[var(--text-muted)]">
                {goalMet ? (
                  <span className="font-semibold text-[var(--accent)]">
                    Goal complete — Vaheguru! ({todaysAngCount}/{dailyGoal})
                  </span>
                ) : (
                  `${todaysAngCount} of ${dailyGoal} Angs today`
                )}
              </span>
              <span className="font-bold text-[var(--text)]">{goalWidth}%</span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-[var(--border)]">
              <div
                className="h-full rounded-full bg-[var(--accent)] transition-all duration-500"
                style={{ width: `${goalWidth}%` }}
              />
            </div>
          </div>
        ) : goalOpen ? null : (
          <p className="mt-2 text-[11px] text-[var(--text-faint)]">
            Set a gentle daily goal — e.g. 2 Angs a day finishes the Granth in about 2 years.
          </p>
        )}

        {goalOpen && (
          <div className="mt-3 space-y-2">
            <div className="flex flex-wrap gap-2">
              {GOAL_PRESETS.map((n) => (
                <button
                  key={n}
                  onClick={() => {
                    setDailyGoal(n);
                    setGoalOpen(false);
                  }}
                  aria-pressed={dailyGoal === n}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                    dailyGoal === n
                      ? "border-[var(--accent)] text-[var(--accent)]"
                      : "border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
                  }`}
                >
                  {n} / day
                </button>
              ))}
              {dailyGoal > 0 && (
                <button
                  onClick={() => {
                    setDailyGoal(0);
                    setGoalOpen(false);
                  }}
                  className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text)] transition"
                >
                  Clear
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setDailyGoal(dailyGoal - 1)}
                aria-label="Decrease daily goal"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] transition"
              >
                <Minus size={14} />
              </button>
              <span className="min-w-[72px] text-center text-xs font-bold text-[var(--text)]">
                {dailyGoal} / day
              </span>
              <button
                onClick={() => setDailyGoal(dailyGoal + 1)}
                aria-label="Increase daily goal"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] transition"
              >
                <Plus size={14} />
              </button>
            </div>
          </div>
        )}
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