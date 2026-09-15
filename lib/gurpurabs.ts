/**
 * lib/gurpurabs.ts
 * ---------------------------------------------------------------------------
 * Major Sikh holy days (Gurpurabs) aligned to the SGPC official calendar for
 * Nanakshahi Samvat 558 (14 Mar 2026 – 13 Mar 2027).
 *
 * Sources: SGPC via SikhNet ("Sikh Gurpurab Calendar 2026-27") and Golden
 * Temple Amritsar ("Nanakshahi Calendar 558 — Key Gurpurabs").
 * Lunar-origin observances (e.g. Guru Nanak Dev Ji's Parkash, Bandi Chhor)
 * move each Gregorian year, so these month/day values are the SGPC 558
 * occurrences — not perpetual fixed dates.
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
    name: "Parkash Gurpurab — Sri Guru Tegh Bahadur Ji",
    month: 4,
    day: 7,
    ang: 631,
    description: "Birth of the Ninth Guru (25 Chet 558) — Sorath Bani of Guru Tegh Bahadur Ji.",
  },
  {
    name: "Parkash Gurpurab — Sri Guru Arjan Dev Ji",
    month: 4,
    day: 9,
    ang: 262,
    description: "Birth of the Fifth Guru (27 Chet 558) — Sukhmani Sahib, his own Bani.",
  },
  {
    name: "Khalsa Sajna — Vaisakhi",
    month: 4,
    day: 14,
    ang: 917,
    description:
      "The Khalsa Panth established in 1699 (1 Vaisakh 558) — Anand Sahib, recited at every Amrit Sanchar.",
  },
  {
    name: "Parkash Gurpurab — Sri Guru Angad Dev Ji",
    month: 4,
    day: 18,
    ang: 139,
    description: "Birth of the Second Guru (5 Vaisakh 558) — Bani of Guru Angad Dev Ji.",
  },
  {
    name: "Parkash Gurpurab — Sri Guru Amar Das Ji",
    month: 4,
    day: 30,
    ang: 917,
    description: "Birth of the Third Guru (17 Vaisakh 558) — Anand Sahib, his own composition.",
  },
  {
    name: "Shaheedi Diwas — Sri Guru Arjan Dev Ji",
    month: 6,
    day: 18,
    ang: 262,
    description: "Martyrdom of the Fifth Guru in Lahore (4 Harh 558) — Sukhmani Sahib, his own Bani.",
  },
  {
    name: "Parkash Gurpurab — Sri Guru Hargobind Sahib Ji",
    month: 6,
    day: 30,
    ang: 14,
    description:
      "Birth of the Sixth Guru (16 Harh 558) — related reading in Sri Raag.",
  },
  {
    name: "Parkash Gurpurab — Sri Guru Harkrishan Sahib Ji",
    month: 8,
    day: 7,
    ang: 262,
    description: "Birth of the Eighth Guru (23 Sawan 558) — Sukhmani Sahib, the prayer of peace.",
  },
  {
    name: "Pehla Parkash — Sri Guru Granth Sahib Ji",
    month: 9,
    day: 12,
    ang: 1,
    description:
      "First Parkash at Sri Harmandir Sahib (27 Bhadon 558) — opens with Japji Sahib.",
  },
  {
    name: "Joti Jot — Sri Guru Nanak Dev Ji",
    month: 10,
    day: 5,
    ang: 1,
    description: "Passing (Joti Jot) of the First Guru (19 Assu 558) — Japji Sahib, his own Bani.",
  },
  {
    name: "Parkash Gurpurab — Sri Guru Ram Das Ji",
    month: 10,
    day: 27,
    ang: 773,
    description:
      "Birth of the Fourth Guru, founder of Amritsar (11 Kattak 558) — Lavan (Soohi), his own composition.",
  },
  {
    name: "Bandi Chhor Divas",
    month: 11,
    day: 8,
    ang: 14,
    description:
      "Release of the Sixth Guru and 52 princes from Gwalior Fort (23 Kattak 558, lunar) — related reading in Sri Raag.",
  },
  {
    name: "Gurgaddi — Sri Guru Granth Sahib Ji",
    month: 11,
    day: 11,
    ang: 1,
    description:
      "Gurgaddi at Nanded (26 Kattak 558) — opens with Japji Sahib.",
  },
  {
    name: "Parkash Gurpurab — Sri Guru Nanak Dev Ji",
    month: 11,
    day: 24,
    ang: 1,
    description: "Birth of the First Guru (9 Magghar 558, lunar) — opens with Japji Sahib, his own Bani.",
  },
  {
    name: "Shaheedi Diwas — Sri Guru Tegh Bahadur Ji",
    month: 12,
    day: 14,
    ang: 631,
    description: "Martyrdom of the Ninth Guru in Delhi (29 Magghar 558) — Sorath Bani of Guru Tegh Bahadur Ji.",
  },
  {
    name: "Shaheedi — Sahibzade & Mata Gujri Ji",
    month: 12,
    day: 28,
    ang: 10,
    description:
      "Martyrdom of the younger Sahibzade and Mata Gujri Ji (13 Poh 558) — So Purakh from evening Rehras, part of the daily Khalsa Nitnem.",
  },
  {
    name: "Parkash Gurpurab — Sri Guru Gobind Singh Ji",
    month: 1,
    day: 15,
    ang: 10,
    description:
      "Birth of the Tenth Guru, founder of the Khalsa (2 Magh 558) — So Purakh from evening Rehras, part of the daily Khalsa Nitnem.",
  },
  {
    name: "Parkash Gurpurab — Sri Guru Har Rai Sahib Ji",
    month: 1,
    day: 31,
    ang: 217,
    description: "Birth of the Seventh Guru (18 Magh 558) — related reading in Raag Gauri.",
  },
];

/**
 * Returns the Gurpurabs whose celebration occurs within `daysAhead` days of
 * `from` (defaults to today).  Used by the Home-page "Upcoming Gurpurabs" card.
 *
 * @param from        the base date (defaults to now)
 * @param daysAhead   how far ahead to look (default 45)
 * @param list        year calendar to use (defaults to bundled SGPC 558;
 *                    pass the active `useSgpcCalendar().gurpurabs` for auto-update)
 * @returns the matches, already sorted by ascending date
 */
export function getUpcomingGurpurabs(
  from: Date = new Date(),
  daysAhead = 45,
  list: Gurpurab[] = GURPURABS
): {
  gurpurab: Gurpurab;
  date: Date;
  days: number;
}[] {
  const upcoming: { gurpurab: Gurpurab; date: Date; days: number }[] = [];

  for (const g of list) {
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