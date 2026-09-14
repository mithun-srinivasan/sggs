/**
 * components/ProgressProvider.tsx
 * ---------------------------------------------------------------------------
 * Context + provider backing four related "reading journey" features:
 *   7. Reading progress — completed Angs (marked when the reader's end
 *      sentinel triggers, or via the home-page steer).
 *   8. Reading streaks — consecutive days with at least one Ang read.
 *   9. Reading history — the most recent Angs revisited, newest last.
 *  13. Reading playlist — a "Sehaj Paath"-style plan: start today and read
 *      N Angs/day until all 1430 are covered.
 *
 * All state lives in `localStorage` (`sgs-reader-progress`) guarded by a
 * hydration flag, and is debounced 500ms on write, mirroring the other
 * providers.
 *
 * Consume with `useReadingProgress()`.
 */

"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
  type ReactNode,
} from "react";
import type { ReadingProgress } from "@/lib/types";
import { MAX_ANG, MIN_ANG } from "@/lib/types";

/** localStorage key for the reading-progress blob. */
const STORAGE_KEY = "sgs-reader-progress";

/** Local date key such as `2026-09-14`, used for day/streak arithmetic. */
export function dayKey(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Parses a `YYYY-MM-DD` key back into a local Date at noon. */
function dateFromKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d, 12);
}

/** Empty starting state — nothing read, no plan. */
const EMPTY: ReadingProgress = { readAngs: [], visits: {}, history: [], plan: null };

/** Public context API. */
interface ProgressContextValue extends ReadingProgress {
  hydrated: boolean;
  /** Marks an Ang as completed AND records the day visit + history entry. */
  markAngRead: (ang: number) => void;
  /** Whether the given Ang's ending has been reached before. */
  isAngRead: (ang: number) => boolean;
  /** Percentage (0–100) of the Guru Granth completed. */
  progressPercent: number;
  /** Number of distinct days with at least one Ang read. */
  totalReadDays: number;
  /** Current streak (consecutive days, counting forward from today). */
  streak: number;
  /** The most recently read Ang entry (or undefined). */
  lastRead: { ang: number; at: number } | undefined;
  /** Start (or restart) a Sehaj-Paath reading plan lasting `totalDays` days. */
  startPlan: (totalDays: number) => void;
  /** Permanently remove the reading plan. */
  clearPlan: () => void;
  /** Day-of-plan index (0-based) for the plan's start date. */
  planDayIndex: number;
  /** Today's slice of the plan as [fromAng, toAng] (empty when no plan). */
  todaysPlanRange: [number, number] | null;
  /** Ang to continue from under the plan (first unread >= today's start). */
  planContinueAng: number;
}

const ProgressContext = createContext<ProgressContextValue | null>(null);

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useState<ReadingProgress>(EMPTY);
  const [hydrated, setHydrated] = useState(false);
  const ref = useRef<ReadingProgress>(EMPTY);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // -- Hydration -------------------------------------------------------------

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- deliberate SSR-safe post-mount hydration from localStorage
      if (raw) setProgress({ ...EMPTY, ...JSON.parse(raw) });
    } catch {
      // corrupt storage — fall back to empty
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    ref.current = progress;
  }, [progress, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(ref.current));
      } catch {
        // quota / private mode
      }
    }, 500);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [progress, hydrated]);

  // -- Actions ---------------------------------------------------------------

  const markAngRead = useCallback((ang: number) => {
    const now = Date.now();
    const key = dayKey();
    setProgress((p) => {
      const readAngs = p.readAngs.includes(ang) ? p.readAngs : [...p.readAngs, ang];
      const visits = { ...p.visits, [key]: (p.visits[key] ?? 0) + 1 };
      const history = [...p.history.filter((h) => h.ang !== ang), { ang, at: now }].slice(-60);
      return { ...p, readAngs, visits, history };
    });
  }, []);

  const isAngRead = useCallback((ang: number) => progress.readAngs.includes(ang), [progress.readAngs]);

  const startPlan = useCallback((totalDays: number) => {
    setProgress((p) => ({
      ...p,
      plan: { startDate: dayKey(), totalDays: Math.max(1, Math.min(1430, totalDays)) },
    }));
  }, []);

  const clearPlan = useCallback(() => {
    setProgress((p) => ({ ...p, plan: null }));
  }, []);

  const value = useMemo((): ProgressContextValue => {
    /** Consecutive days (>=1) with a read, counting forward from today. */
    const streak = (() => {
      if (!hydrated) return 0;
      let days = 0;
      const cursor = new Date();
      // If today has no read yet, allow the streak to count from yesterday.
      if (!progress.visits[dayKey(cursor)]) cursor.setDate(cursor.getDate() - 1);
      while (progress.visits[dayKey(cursor)]) {
        days += 1;
        cursor.setDate(cursor.getDate() - 1);
      }
      return days;
    })();

    /** 0-based index into the plan for the current day (-1 when no plan). */
    const planDayIndex = (() => {
      if (!hydrated || !progress.plan) return -1;
      const start = dateFromKey(progress.plan.startDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const dayMs = 86_400_000;
      const idx = Math.floor((today.getTime() - start.getTime()) / dayMs);
      return Math.max(0, Math.min(idx, progress.plan.totalDays - 1));
    })();

    /** The Ang range scheduled for today under the plan (null when no plan). */
    const todaysPlanRange: [number, number] | null = (() => {
      if (!hydrated || !progress.plan || planDayIndex < 0) return null;
      const perDay = Math.ceil(MAX_ANG / progress.plan.totalDays);
      const fromAng = planDayIndex * perDay + 1;
      const toAng = Math.min(MAX_ANG, fromAng + perDay - 1);
      return [fromAng, toAng];
    })();

    /** First unread Ang at or after today's range start. */
    const planContinueAng = (() => {
      if (!hydrated || !todaysPlanRange) return MIN_ANG;
      const [fromAng] = todaysPlanRange;
      let cursor = fromAng;
      while (cursor <= MAX_ANG && progress.readAngs.includes(cursor)) cursor += 1;
      return cursor;
    })();

    return {
      ...progress,
      hydrated,
      markAngRead,
      isAngRead,
      progressPercent: Math.round((progress.readAngs.length / MAX_ANG) * 100),
      totalReadDays: Object.keys(progress.visits).length,
      streak,
      lastRead: progress.history[progress.history.length - 1],
      startPlan,
      clearPlan,
      planDayIndex,
      todaysPlanRange,
      planContinueAng,
    };
  }, [progress, hydrated, markAngRead, isAngRead, startPlan, clearPlan]);

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useReadingProgress() {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error("useReadingProgress must be used within ProgressProvider");
  return ctx;
}