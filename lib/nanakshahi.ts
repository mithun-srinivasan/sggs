/**
 * lib/nanakshahi.ts
 * ---------------------------------------------------------------------------
 * Nanakshahi calendar helpers (feature 33).
 *
 * The Nanakshahi calendar fixes every month start to a Gregorian date, so
 * month lengths and conversions are exact arithmetic — no lunar tables:
 *   Chet Mar 14 · Vaisakh Apr 14 · Jeth May 15 · Harh Jun 15 ·
 *   Sawan Jul 17 · Bhadon Aug 16 · Assu Sep 15 · Katik Oct 15 ·
 *   Maghar Nov 14 · Poh Dec 14 · Magh Jan 13 · Phagun Feb 12.
 *
 * The Nanakshahi year equals the Gregorian year minus 1468 once Chet has
 * begun (March 14+), else minus 1469.  Sangrand (month start) is an observed
 * day, so each fixed start doubles as this calendar's Sangrand marker.
 */

export interface NanakshahiMonth {
  /** English name, e.g. "Vaisakh". */
  name: string;
  /** Gurmukhi name, e.g. "ਵੈਸਾਖ". */
  gurmukhi: string;
  /** Gregorian month (1–12) this Nanakshahi month starts in. */
  startMonth: number;
  /** Gregorian day it starts on. */
  startDay: number;
}

/** The twelve months in Nanakshahi order, starting with Chet. */
export const NANAKSHAHI_MONTHS: NanakshahiMonth[] = [
  { name: "Chet", gurmukhi: "ਚੇਤ", startMonth: 3, startDay: 14 },
  { name: "Vaisakh", gurmukhi: "ਵੈਸਾਖ", startMonth: 4, startDay: 14 },
  { name: "Jeth", gurmukhi: "ਜੇਠ", startMonth: 5, startDay: 15 },
  { name: "Harh", gurmukhi: "ਹਾੜ", startMonth: 6, startDay: 15 },
  { name: "Sawan", gurmukhi: "ਸਾਵਣ", startMonth: 7, startDay: 17 },
  { name: "Bhadon", gurmukhi: "ਭਾਦੋਂ", startMonth: 8, startDay: 16 },
  { name: "Assu", gurmukhi: "ਅੱਸੂ", startMonth: 9, startDay: 15 },
  { name: "Katik", gurmukhi: "ਕੱਤਕ", startMonth: 10, startDay: 15 },
  { name: "Maghar", gurmukhi: "ਮੱਘਰ", startMonth: 11, startDay: 14 },
  { name: "Poh", gurmukhi: "ਪੋਹ", startMonth: 12, startDay: 14 },
  { name: "Magh", gurmukhi: "ਮਾਘ", startMonth: 1, startDay: 13 },
  { name: "Phagun", gurmukhi: "ਫੱਗਣ", startMonth: 2, startDay: 12 },
];

/** A resolved Nanakshahi date. */
export interface NanakshahiDate {
  year: number;
  /** Index into `NANAKSHAHI_MONTHS` (0 = Chet). */
  monthIndex: number;
  /** Day of the Nanakshahi month (1-based). */
  day: number;
}

/**
 * Converts a Gregorian date to its Nanakshahi equivalent.
 * Uses local calendar fields of `date` (time-of-day ignored).
 */
export function toNanakshahi(date: Date): NanakshahiDate {
  const m = date.getMonth() + 1;
  const d = date.getDate();
  const y = date.getFullYear();
  const md = m * 100 + d;

  // Last month-start on or before this date (starts ordered Magh→Poh so the
  // January 1–12 gap correctly resolves to Poh).
  const ordered = [...NANAKSHAHI_MONTHS].sort(
    (a, b) => a.startMonth * 100 + a.startDay - (b.startMonth * 100 + b.startDay)
  );
  let monthIndex = NANAKSHAHI_MONTHS.indexOf(ordered[ordered.length - 1]); // Poh fallback
  for (const candidate of ordered) {
    if (candidate.startMonth * 100 + candidate.startDay <= md) {
      monthIndex = NANAKSHAHI_MONTHS.indexOf(candidate);
    } else {
      break;
    }
  }

  const start = NANAKSHAHI_MONTHS[monthIndex];
  const startYear = start.startMonth > m ? y - 1 : y;
  const startDate = new Date(startYear, start.startMonth - 1, start.startDay, 12);
  const atNoon = new Date(y, m - 1, d, 12);
  const day = Math.round((atNoon.getTime() - startDate.getTime()) / 86_400_000) + 1;
  const year = md >= 314 ? y - 1468 : y - 1469;

  return { year, monthIndex, day };
}

/**
 * Returns the Nanakshahi month starting on the given Gregorian month/day
 * (i.e. whether the day is a Sangrand), or undefined.
 */
export function sangrandOn(month: number, day: number): NanakshahiMonth | undefined {
  return NANAKSHAHI_MONTHS.find((nm) => nm.startMonth === month && nm.startDay === day);
}
