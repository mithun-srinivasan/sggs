/**
 * components/GurpurabCalendar.tsx
 * ---------------------------------------------------------------------------
 * The Home-page "Upcoming Gurpurabs" card (feature 20).
 *
 * Computes the next holy days within a 60-day window using the static
 * Nanakshahi table in `lib/gurpurabs.ts`.  Because the calculation depends on
 * "today", it runs inside a `useEffect` to avoid a server/client hydration
 * mismatch, showing a quiet skeleton until the client resolves the dates.
 */

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CalendarDays, ArrowRight } from "lucide-react";
import { getUpcomingGurpurabs } from "@/lib/gurpurabs";
import type { Gurpurab } from "@/lib/types";

interface Upcoming {
  gurpurab: Gurpurab;
  date: Date;
  days: number;
}

export default function GurpurabCalendar() {
  const [upcoming, setUpcoming] = useState<Upcoming[] | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- compute next Gurpurabs after mount (matches date on client only)
    setUpcoming(getUpcomingGurpurabs(new Date(), 60));
  }, []);

  if (upcoming === null) {
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
        <span>Upcoming Gurpurabs</span>
      </h2>

      {upcoming.length === 0 ? (
        <p className="mt-3 text-xs text-[var(--text-muted)]">
          No major Gurpurabs in the next 60 days.
        </p>
      ) : (
        <ul className="mt-4 space-y-3">
          {upcoming.map(({ gurpurab, date, days }) => (
            <li key={gurpurab.name}>
              <Link
                href={`/ang/${gurpurab.ang}`}
                className="group flex items-center justify-between gap-4 rounded-xl border border-[var(--border)] p-3 transition hover:border-[var(--accent)] hover:bg-[var(--surface-hover)]"
              >
                <div className="min-w-0">
                  <p className="text-xs font-bold text-[var(--text)] group-hover:text-[var(--accent)] transition">
                    {gurpurab.name}
                  </p>
                  <p className="mt-0.5 truncate text-[11px] text-[var(--text-muted)]">
                    {gurpurab.description}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <div className="text-right">
                    <p className="text-[11px] font-semibold text-[var(--text)]">
                      {date.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                    </p>
                    <p className="text-[10px] text-[var(--text-faint)]">
                      {days === 0 ? "today" : `in ${days}d`}
                    </p>
                    {/* Target Ang chip — makes the link destination explicit. */}
                    <p className="mt-1 inline-block rounded-md bg-[var(--accent-light)] px-1.5 py-0.5 text-[10px] font-bold text-[var(--accent)]">
                      Ang {gurpurab.ang}
                    </p>
                  </div>
                  <ArrowRight size={13} className="text-[var(--accent)]" />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}