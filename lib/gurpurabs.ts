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

/**
 * The major Gurpurabs celebrated through the Nanakshahi year.
 *
 * Each `ang` was verified against the live BaniDB text (raag + writer +
 * opening lines) so every card lands on that event's own Bani where it
 * exists in Sri Guru Granth Sahib Ji:
 *   - Ang 1   → Japji Sahib (Guru Nanak Dev Ji)
 *   - Ang 139 → Bani of Guru Angad Dev Ji
 *   - Ang 773 → Lavan, Soohi Chhant (Guru Ram Das Ji)
 *   - Ang 917 → Anand Sahib, Raamkali (Guru Amar Das Ji)
 *   - Ang 262 → Sukhmani Sahib, Gauri (Guru Arjan Dev Ji)
 *   - Ang 631 → Sorath Bani of Guru Tegh Bahaadur Ji
 *   - Ang 10  → Sodar / So Purakh from evening Rehras (daily Nitnem)
 *
 * Gurus with no Bani in Sri Guru Granth Sahib Ji (their compositions live in
 * the Dasam Granth, outside this reader's scope) link to a thematically
 * related Ang instead, and their descriptions say so honestly.
 */
export const GURPURABS: Gurpurab[] = [
  {
    name: "Parkash Gurpurab — Sri Guru Nanak Dev Ji",
    month: 4,
    day: 15,
    ang: 1,
    description: "Birth of the First Guru — opens with Japji Sahib, his own Bani.",
  },
  {
    name: "Parkash Gurpurab — Sri Guru Gobind Singh Ji",
    month: 1,
    day: 6,
    ang: 10,
    description:
      "Birth of the Tenth Guru, founder of the Khalsa — So Purakh from evening Rehras, part of the daily Khalsa Nitnem.",
  },
  {
    name: "Jor Mela — Sri Guru Tegh Bahaadur Ji (Shaheedi)",
    month: 6,
    day: 24,
    ang: 631,
    description: "Martyrdom of the Ninth Guru in Delhi — Sorath Bani of Guru Tegh Bahaadur Ji.",
  },
  {
    name: "Shaheedi Diwas — Sri Guru Arjan Dev Ji",
    month: 6,
    day: 16,
    ang: 262,
    description: "Martyrdom of the Fifth Guru in Lahore — Sukhmani Sahib, his own Bani.",
  },
  {
    name: "Khalsa Sajna — Vaisakhi",
    month: 4,
    day: 13,
    ang: 917,
    description:
      "The Khalsa Panth established in 1699 — Anand Sahib, recited at every Amrit Sanchar.",
  },
  {
    name: "Guru Amar Das Ji — Parkash",
    month: 5,
    day: 5,
    ang: 917,
    description: "Birth of the Third Guru — Anand Sahib, his own composition.",
  },
  {
    name: "Guru Hargobind Ji — Bandi Chhor Divas",
    month: 10,
    day: 27,
    ang: 14,
    description:
      "Release of the Sixth Guru and 52 princes from Gwalior Fort — related reading in Sri Raag.",
  },
  {
    name: "Guru Ramdas Ji — Parkash",
    month: 9,
    day: 24,
    ang: 773,
    description:
      "Birth of the Fourth Guru, founder of Amritsar — Lavan (Soohi), his own composition.",
  },
  {
    name: "Guru Angad Dev Ji — Parkash",
    month: 3,
    day: 31,
    ang: 139,
    description: "Birth of the Second Guru — Bani of Guru Angad Dev Ji.",
  },
  {
    name: "Guru Har Rai Ji — Parkash",
    month: 1,
    day: 26,
    ang: 217,
    description: "Birth of the Seventh Guru — related reading in Raag Gauri.",
  },
  {
    name: "Guru Harkrishan Ji — Parkash",
    month: 7,
    day: 7,
    ang: 262,
    description: "Birth of the Eighth Guru — Sukhmani Sahib, the prayer of peace.",
  },
  {
    name: "Guru Nanak Dev Ji — Jyoti Jot",
    month: 9,
    day: 22,
    ang: 1,
    description: "Passing (Jyoti Jot) of the First Guru — Japji Sahib, his own Bani.",
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