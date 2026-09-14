/**
 * lib/gurpurabs.ts
 * ---------------------------------------------------------------------------
 * Static list of the major Sikh holy days (Gurpurabs) shown on the Home page
 * calendar card.  The Nanakshahi calendar fixes these events to specific
 * Gregorian dates, so a static month/day table is accurate for the current
 * era (Nanakshahi is fixed, unlike the Gregorian lunar calendar it replaced).
 *
 * Each entry links to a related Ang so a single tap lands on scripture.
 */

import type { Gurpurab } from "./types";

/** The major Gurpurabs celebrated through the Nanakshahi year. */
export const GURPURABS: Gurpurab[] = [
  {
    name: "Parkash Gurpurab — Sri Guru Nanak Dev Ji",
    month: 4,
    day: 15,
    ang: 1,
    description: "Birth anniversary of the founder of Sikhism; Japji Sahib is created.",
  },
  {
    name: "Parkash Gurpurab — Sri Guru Gobind Singh Ji",
    month: 1,
    day: 6,
    ang: 10, // Japji proximity; links to an early Ang
    description: "Birth anniversary of the Tenth Guru; founder of the Khalsa.",
  },
  {
    name: "Jor Mela — Sri Guru Tegh Bahaadur Ji (Shaheedi)",
    month: 6,
    day: 24,
    ang: 631, // Raag Sorath of Guru Tegh Bahaadur Ji
    description: "Martyrdom of the Ninth Guru in Delhi.",
  },
  {
    name: "Shaheedi Diwas — Sri Guru Arjan Dev Ji",
    month: 6,
    day: 16,
    ang: 262, // Sukhmani Sahib
    description: "Martyrdom of the Fifth Guru in Lahore.",
  },
  {
    name: "Khalsa Sajna — Vaisakhi",
    month: 4,
    day: 13,
    ang: 139, // Raag Gauri (Swayyie of the Gurus)
    description: "The Khalsa Panth established by Guru Gobind Singh Ji in 1699.",
  },
  {
    name: "Guru Amar Das Ji — Parkash",
    month: 5,
    day: 5,
    ang: 917, // Anand Sahib
    description: "Birth anniversary of the Third Guru; composer of Anand Sahib.",
  },
  {
    name: "Guru Hargobind Ji — Bandi Chhor Divas",
    month: 10,
    day: 27,
    ang: 14, // Sri Raag
    description: "Release of the Sixth Guru and 52 princes from Gwalior Fort.",
  },
  {
    name: "Guru Ramdas Ji — Parkash",
    month: 9,
    day: 24,
    ang: 622, // Gauri Sukhmani vicinity
    description: "Birth anniversary of the Fourth Guru; founder of Amritsar.",
  },
  {
    name: "Guru Angad Dev Ji — Parkash",
    month: 3,
    day: 31,
    ang: 14,
    description: "Birth anniversary of the Second Guru.",
  },
  {
    name: "Guru Har Rai Ji — Parkash",
    month: 1,
    day: 26,
    ang: 217,
    description: "Birth anniversary of the Seventh Guru.",
  },
  {
    name: "Guru Harkrishan Ji — Parkash",
    month: 7,
    day: 7,
    ang: 217,
    description: "Birth anniversary of the Eighth Guru, the youngest Guru.",
  },
  {
    name: "Guru Nanak Dev Ji — Jyoti Jot",
    month: 9,
    day: 22,
    ang: 1,
    description: "Passing (Jyoti Jot) of the First Guru.",
  },
];

/**
 * Returns the Gurpurabs whose celebration occurs within `daysAhead` days of
 * `from` (defaults to today).  Used by the Home-page "Upcoming Gurpurabs" card.
 *
 * @param from        the base date (defaults to now)
 * @param daysAhead   how far ahead to look (default 45)
 * @returns the matches, already sorted by ascending date
 */
export function getUpcomingGurpurabs(from: Date = new Date(), daysAhead = 45): {
  gurpurab: Gurpurab;
  date: Date;
  days: number;
}[] {
  const upcoming: { gurpurab: Gurpurab; date: Date; days: number }[] = [];

  for (const g of GURPURABS) {
    // Consider this year's occurrence, and (if already passed) next year's.
    for (const offsetYear of [0, 1]) {
      const candidate = new Date(
        from.getFullYear() + offsetYear,
        g.month - 1,
        g.day,
        12, // noon, to side-step DST edge cases
        0,
        0,
      );
      const diffDays = Math.floor((candidate.getTime() - from.getTime()) / 86_400_000);
      if (diffDays >= 0 && diffDays <= daysAhead) {
        upcoming.push({ gurpurab: g, date: candidate, days: diffDays });
        break; // only the nearest occurrence is relevant
      }
    }
  }

  return upcoming.sort((a, b) => a.date.getTime() - b.date.getTime());
}