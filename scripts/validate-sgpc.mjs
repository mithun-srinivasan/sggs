/**
 * scripts/validate-sgpc.mjs
 * ---------------------------------------------------------------------------
 * Build-time validator for SGPC year calendars (`public/data/sgpc-*.json`).
 *
 * Why this exists: the calendar auto-update mechanism (`lib/sgpc.ts`) adopts
 * any `/data/sgpc-<year>.json` file with no code change — so a malformed
 * yearly release would silently corrupt Sangrand markers and Gurpurab dates.
 * Run `npm run validate:sgpc` locally and in CI before merging a new year.
 *
 * Checks per file:
 *   - filename year matches `nanakshahiYear`
 *   - exactly 12 months with valid Gregorian starts + positive day counts
 *   - month starts flow into each other (start[i] + days[i] == start[i+1]);
 *     the final month is exempt — Nanakshahi leap drift lets Phaggan overlap
 *     the next Chet by a day at the year boundary (SGPC-published tables do)
 *   - every Gurpurab has a name, a valid month/day, and an Ang in 1–1430
 *   - no duplicate Gurpurab names within the year
 *
 * Exit code: 0 when every file is valid, 1 otherwise (fails CI).
 */

import { readdirSync, readFileSync } from "node:fs";
import { join, basename } from "node:path";

const DATA_DIR = join(process.cwd(), "public", "data");

let failures = 0;

/** Logs a validation failure and marks the run as failed. */
function fail(file, message) {
  failures += 1;
  console.error(`[sgpc-validate] ${file}: ${message}`);
}

/** Validates one `sgpc-<year>.json` file. Returns true when valid. */
function validateFile(file) {
  const path = join(DATA_DIR, file);
  let json;
  try {
    json = JSON.parse(readFileSync(path, "utf8"));
  } catch {
    fail(file, "not valid JSON");
    return false;
  }

  const yearMatch = file.match(/^sgpc-(\d+)\.json$/);
  if (!yearMatch) {
    fail(file, "filename must be sgpc-<nanakshahiYear>.json");
    return false;
  }
  if (json.nanakshahiYear !== Number(yearMatch[1])) {
    fail(file, `nanakshahiYear ${json.nanakshahiYear} does not match filename year ${yearMatch[1]}`);
  }

  if (!Array.isArray(json.months) || json.months.length !== 12) {
    fail(file, `expected 12 months, found ${json.months?.length ?? 0}`);
    return false;
  }
  for (const [i, m] of json.months.entries()) {
    if (typeof m.name !== "string" || !m.name) fail(file, `months[${i}].name missing`);
    if (typeof m.gurmukhi !== "string" || !m.gurmukhi) fail(file, `months[${i}].gurmukhi missing`);
    if (!Number.isInteger(m.startMonth) || m.startMonth < 1 || m.startMonth > 12) {
      fail(file, `months[${i}].startMonth (${m.startMonth}) must be 1–12`);
    }
    if (!Number.isInteger(m.startDay) || m.startDay < 1 || m.startDay > 31) {
      fail(file, `months[${i}].startDay (${m.startDay}) must be 1–31`);
    }
    if (!Number.isInteger(m.days) || m.days < 28 || m.days > 32) {
      fail(file, `months[${i}].days (${m.days}) must be 28–32`);
    }
  }

  // Continuity: month[i]'s start + days must land exactly on month[i+1]'s
  // start, so calendar grids never gap or overlap mid-year. The base
  // Gregorian year comes from `gregorianSpan` (Feb length is leap-sensitive);
  // the final month is exempt per the header note.
  const spanYear = Number(String(json.gregorianSpan ?? "").match(/\d{4}/)?.[0] ?? 2026);
  const startDate = (m, year) => new Date(year, m.startMonth - 1, m.startDay);
  for (let i = 0; i < json.months.length - 1; i++) {
    const cur = json.months[i];
    const next = json.months[i + 1];
    // Months Jan–Feb belong to the next Gregorian year of the Nanakshahi span.
    const curYear = cur.startMonth >= 3 ? spanYear : spanYear + 1;
    const expected = new Date(startDate(cur, curYear).getTime() + cur.days * 86_400_000);
    const nextYear = next.startMonth >= 3 ? spanYear : spanYear + 1;
    const actual = startDate(next, nextYear);
    if (expected.getTime() !== actual.getTime()) {
      fail(
        file,
        `months[${i}] (${cur.name}) + ${cur.days}d does not reach months[${i + 1}] (${next.name})`
      );
    }
  }

  if (!Array.isArray(json.gurpurabs) || json.gurpurabs.length === 0) {
    fail(file, "gurpurabs must be a non-empty array");
    return false;
  }
  const seen = new Set();
  for (const [i, g] of json.gurpurabs.entries()) {
    if (typeof g.name !== "string" || !g.name) fail(file, `gurpurabs[${i}].name missing`);
    if (seen.has(g.name)) fail(file, `duplicate gurpurab name: ${g.name}`);
    seen.add(g.name);
    if (!Number.isInteger(g.month) || g.month < 1 || g.month > 12) {
      fail(file, `gurpurabs[${i}] (${g.name}) month must be 1–12`);
    }
    if (!Number.isInteger(g.day) || g.day < 1 || g.day > 31) {
      fail(file, `gurpurabs[${i}] (${g.name}) day must be 1–31`);
    }
    if (!Number.isInteger(g.ang) || g.ang < 1 || g.ang > 1430) {
      fail(file, `gurpurabs[${i}] (${g.name}) ang must be 1–1430`);
    }
    if (typeof g.description !== "string" || !g.description) {
      fail(file, `gurpurabs[${i}] (${g.name}) description missing`);
    }
  }
  return true;
}

let files;
try {
  files = readdirSync(DATA_DIR).filter((f) => /^sgpc-\d+\.json$/.test(f));
} catch {
  console.error("[sgpc-validate] public/data/ directory missing — nothing to validate");
  process.exit(1);
}

if (files.length === 0) {
  console.error("[sgpc-validate] no sgpc-<year>.json files found in public/data/");
  process.exit(1);
}

let validCount = 0;
for (const file of files) {
  const before = failures;
  validateFile(file);
  if (failures === before) {
    validCount += 1;
    console.log(`[sgpc-validate] ${basename(file)} OK`);
  }
}

console.log(`[sgpc-validate] ${validCount}/${files.length} year file(s) valid`);
process.exit(failures === 0 ? 0 : 1);
