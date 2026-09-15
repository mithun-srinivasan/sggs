/**
 * lib/nanakshahi.ts
 * ---------------------------------------------------------------------------
 * Nanakshahi calendar helpers, aligned to the SGPC official calendar for
 * Nanakshahi Samvat 558 (14 Mar 2026 – 13 Mar 2027).
 *
 * Source: SGPC via SikhNet / Golden Temple Amritsar (Samvat 558 month table):
 *   Chet Mar 14 (31d) · Vaisakh Apr 14 (31d) · Jeth May 15 (31d) ·
 *   Harh Jun 15 (31d) · Sawan Jul 16 (32d) · Bhadon Aug 17 (31d) ·
 *   Assu Sep 17 (30d) · Kattak Oct 17 (30d) · Magghar Nov 16 (30d) ·
 *   Poh Dec 16 (29d) · Magh Jan 14 (30d) · Phaggan Feb 13 (30d).
 *
 * The Nanakshahi year equals the Gregorian year minus 1468 once Chet has
 * begun (March 14+), else minus 1469.  Sangrand (month start) is an observed
 * day, so each fixed start doubles as this calendar's Sangrand marker.
 */

export interface NanakshahiMonth {
  /** English name, e.g. "Vaisakh" (SGPC spelling). */
  name: string;
  /** Gurmukhi name, e.g. "ਵੈਸਾਖ". */
  gurmukhi: string;
  /** Gregorian month (1–12) this Nanakshahi month starts in (SGPC 558). */
  startMonth: number;
  /** Gregorian day it starts on (SGPC 558). */
  startDay: number;
  /** Days in this month in Nanakshahi Samvat 558. */
  days: number;
}

/** The twelve months in Nanakshahi order, starting with Chet (SGPC 558). */
export const NANAKSHAHI_MONTHS: NanakshahiMonth[] = [
  { name: "Chet", gurmukhi: "ਚੇਤ", startMonth: 3, startDay: 14, days: 31 },
  { name: "Vaisakh", gurmukhi: "ਵੈਸਾਖ", startMonth: 4, startDay: 14, days: 31 },
  { name: "Jeth", gurmukhi: "ਜੇਠ", startMonth: 5, startDay: 15, days: 31 },
  { name: "Harh", gurmukhi: "ਹਾੜ", startMonth: 6, startDay: 15, days: 31 },
  { name: "Sawan", gurmukhi: "ਸਾਵਣ", startMonth: 7, startDay: 16, days: 32 },
  { name: "Bhadon", gurmukhi: "ਭਾਦੋਂ", startMonth: 8, startDay: 17, days: 31 },
  { name: "Assu", gurmukhi: "ਅੱਸੂ", startMonth: 9, startDay: 17, days: 30 },
  { name: "Kattak", gurmukhi: "ਕੱਤਕ", startMonth: 10, startDay: 17, days: 30 },
  { name: "Magghar", gurmukhi: "ਮੱਘਰ", startMonth: 11, startDay: 16, days: 30 },
  { name: "Poh", gurmukhi: "ਪੋਹ", startMonth: 12, startDay: 16, days: 29 },
  { name: "Magh", gurmukhi: "ਮਾਘ", startMonth: 1, startDay: 14, days: 30 },
  { name: "Phaggan", gurmukhi: "ਫੱਗਣ", startMonth: 2, startDay: 13, days: 30 },
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
 * Pass `months` to use a year release (SGPC auto-update); defaults to bundled 558.
 */
export function toNanakshahi(date: Date, months: NanakshahiMonth[] = NANAKSHAHI_MONTHS): NanakshahiDate {
  const m = date.getMonth() + 1;
  const d = date.getDate();
  const y = date.getFullYear();
  const md = m * 100 + d;

  // Last month-start on or before this date (starts ordered Magh→Poh so the
  // January 1–13 gap correctly resolves to Poh).
  const ordered = [...months].sort(
    (a, b) => a.startMonth * 100 + a.startDay - (b.startMonth * 100 + b.startDay)
  );
  let monthIndex = months.indexOf(ordered[ordered.length - 1]); // Poh fallback
  for (const candidate of ordered) {
    if (candidate.startMonth * 100 + candidate.startDay <= md) {
      monthIndex = months.indexOf(candidate);
    } else {
      break;
    }
  }

  const start = months[monthIndex];
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
 * Pass `months` for a year release; defaults to bundled 558.
 */
export function sangrandOn(
  month: number,
  day: number,
  months: NanakshahiMonth[] = NANAKSHAHI_MONTHS
): NanakshahiMonth | undefined {
  return months.find((nm) => nm.startMonth === month && nm.startDay === day);
}
