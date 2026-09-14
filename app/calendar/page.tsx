/**
 * app/calendar/page.tsx
 * ---------------------------------------------------------------------------
 * Full Nanakshahi calendar (feature 33) — a Gregorian month grid annotated
 * with the overlapping Nanakshahi month(s), Sangrand markers (fixed month
 * starts), and Gurpurab markers linking to each event's verified Bani Ang.
 *
 * Fully client-side (month navigation needs no network); Gurpurab data comes
 * from the static `GURPURABS` table.
 */

"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { GURPURABS } from "@/lib/gurpurabs";
import { NANAKSHAHI_MONTHS, sangrandOn, toNanakshahi } from "@/lib/nanakshahi";

/** Monday-first weekday headers, matching the reading heatmap. */
const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

interface DayCell {
  date: Date;
  inMonth: boolean;
}

export default function CalendarPage() {
  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth()); // 0-based

  /** Step the visible month, rolling over year boundaries. */
  const stepMonth = (delta: number) => {
    const next = new Date(viewYear, viewMonth + delta, 1);
    setViewYear(next.getFullYear());
    setViewMonth(next.getMonth());
  };

  const goToday = () => {
    const today = new Date();
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
  };

  /** Monday-first grid cells covering the visible month. */
  const cells: DayCell[] = useMemo(() => {
    const first = new Date(viewYear, viewMonth, 1);
    const pad = (first.getDay() + 6) % 7;
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const list: DayCell[] = [];
    for (let i = pad - 1; i >= 0; i--) {
      list.push({ date: new Date(viewYear, viewMonth, -i), inMonth: false });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      list.push({ date: new Date(viewYear, viewMonth, d), inMonth: true });
    }
    while (list.length % 7 !== 0) {
      const last = list[list.length - 1].date;
      const next = new Date(last);
      next.setDate(next.getDate() + 1);
      list.push({ date: next, inMonth: false });
    }
    return list;
  }, [viewYear, viewMonth]);

  /** Gurpurabs falling inside the visible Gregorian month. */
  const monthEvents = useMemo(
    () =>
      GURPURABS.filter((g) => g.month === viewMonth + 1).sort((a, b) => a.day - b.day),
    [viewMonth]
  );

  /** Nanakshahi month label(s) overlapping the visible month. */
  const nanakshahiLabel = useMemo(() => {
    const first = toNanakshahi(new Date(viewYear, viewMonth, 1));
    const last = toNanakshahi(new Date(viewYear, viewMonth + 1, 0));
    const a = NANAKSHAHI_MONTHS[first.monthIndex];
    const b = NANAKSHAHI_MONTHS[last.monthIndex];
    const year = last.year;
    return first.monthIndex === last.monthIndex
      ? `${a.name} ${year} · ${a.gurmukhi}`
      : `${a.name} – ${b.name} ${year}`;
  }, [viewYear, viewMonth]);

  const todayKey = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <header className="sticky top-0 z-30 border-b bg-[var(--bg)]">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              aria-label="Back to home"
              className="flex h-11 w-11 items-center justify-center rounded-lg text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-hover)] transition"
            >
              <ArrowLeft size={18} />
            </Link>
            <div>
              <h1 className="text-sm font-bold text-[var(--text)]">Nanakshahi Calendar</h1>
              <p dir="auto" lang="pa" className="font-gurmukhi text-[11px] text-[var(--text-muted)]">
                {nanakshahiLabel}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => stepMonth(-1)}
              aria-label="Previous month"
              className="flex h-10 w-10 items-center justify-center rounded-lg text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-hover)] transition"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={goToday}
              className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text)] transition"
            >
              Today
            </button>
            <button
              onClick={() => stepMonth(1)}
              aria-label="Next month"
              className="flex h-10 w-10 items-center justify-center rounded-lg text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-hover)] transition"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-5 py-8 sm:px-8">
        <h2 className="text-center text-base font-bold text-[var(--text)]">
          {new Date(viewYear, viewMonth, 1).toLocaleDateString("en-GB", {
            month: "long",
            year: "numeric",
          })}
        </h2>

        {/* Weekday header */}
        <div className="mt-4 grid grid-cols-7 gap-1 text-center text-[10px] font-bold uppercase tracking-wider text-[var(--text-faint)]">
          {WEEKDAYS.map((d) => (
            <span key={d} className="py-1">
              {d}
            </span>
          ))}
        </div>

        {/* Day grid */}
        <div className="grid grid-cols-7 gap-1">
          {cells.map(({ date, inMonth }, i) => {
            const m = date.getMonth() + 1;
            const d = date.getDate();
            const events = inMonth ? GURPURABS.filter((g) => g.month === m && g.day === d) : [];
            const sangrand = inMonth ? sangrandOn(m, d) : undefined;
            const isToday =
              `${date.getFullYear()}-${date.getMonth()}-${d}` === todayKey && inMonth;
            return (
              <div
                key={i}
                className={`min-h-[52px] rounded-lg border p-1 text-center transition ${
                  !inMonth
                    ? "border-transparent text-[var(--text-faint)] opacity-40"
                    : isToday
                      ? "border-[var(--accent)] bg-[var(--accent-light)]"
                      : "border-[var(--border)] bg-[var(--surface)]/60"
                }`}
              >
                <span className={`text-xs font-bold ${isToday ? "text-[var(--accent)]" : "text-[var(--text)]"}`}>
                  {d}
                </span>
                <div className="mt-0.5 flex flex-col items-center gap-0.5">
                  {sangrand && (
                    <span
                      title={`Sangrand — first of ${sangrand.name}`}
                      className="rounded px-1 text-[9px] font-bold text-[var(--text-muted)]"
                    >
                      Sangrand
                    </span>
                  )}
                  {events.map((g) => (
                    <Link
                      key={g.name}
                      href={`/ang/${g.ang}`}
                      title={`${g.name} — read Ang ${g.ang}`}
                      aria-label={`${g.name} — read Ang ${g.ang}`}
                      className="block h-2 w-2 rounded-full bg-[var(--accent)] transition hover:scale-125"
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* This month's events, listed with links */}
        <div className="mt-8">
          <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--text-faint)]">
            This month
          </h3>
          {monthEvents.length === 0 ? (
            <p className="mt-2 text-xs text-[var(--text-muted)]">No Gurpurabs this month.</p>
          ) : (
            <ul className="mt-2 space-y-2">
              {monthEvents.map((g) => (
                <li key={g.name}>
                  <Link
                    href={`/ang/${g.ang}`}
                    className="group flex items-center justify-between gap-4 rounded-xl border border-[var(--border)] bg-[var(--surface)]/80 p-3 transition hover:border-[var(--accent)]"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[var(--text)] group-hover:text-[var(--accent)] transition">
                        {g.name}
                      </p>
                      <p className="mt-0.5 text-[11px] text-[var(--text-muted)]">{g.description}</p>
                    </div>
                    <span className="shrink-0 rounded-md bg-[var(--accent-light)] px-1.5 py-0.5 text-[10px] font-bold text-[var(--accent)]">
                      {g.day} · Ang {g.ang}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}
