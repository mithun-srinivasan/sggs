/**
 * lib/gurmukhi.ts
 * ---------------------------------------------------------------------------
 * Gurmukhi akhar (letter) data for the "Learn Gurmukhi" practice page.
 *
 * Each entry pairs a Gurmukhi letter with its standard Roman transliteration.
 * The practice page asks a multiple-choice question (given the Gurmukhi, pick
 * the Roman) for a random subset of these letters.
 */

import type { GurmukhiAkhar } from "./types";

/** Consonant akhars of the Gurmukhi script with standard romanisations. */
export const AKHARS: GurmukhiAkhar[] = [
  { gurmukhi: "ਅ", roman: "a" },
  { gurmukhi: "ਆ", roman: "aa" },
  { gurmukhi: "ੲ", roman: "i" },
  { gurmukhi: "ੳ", roman: "u" },
  { gurmukhi: "ਏ", roman: "ee" },
  { gurmukhi: "ਓ", roman: "oo" },
  { gurmukhi: "ਕ", roman: "ka" },
  { gurmukhi: "ਖ", roman: "kha" },
  { gurmukhi: "ਗ", roman: "ga" },
  { gurmukhi: "ਘ", roman: "gha" },
  { gurmukhi: "ਙ", roman: "nga" },
  { gurmukhi: "ਚ", roman: "cha" },
  { gurmukhi: "ਛ", roman: "chha" },
  { gurmukhi: "ਜ", roman: "ja" },
  { gurmukhi: "ਝ", roman: "jha" },
  { gurmukhi: "ਞ", roman: "nya" },
  { gurmukhi: "ਟ", roman: "tta" },
  { gurmukhi: "ਠ", roman: "ttha" },
  { gurmukhi: "ਡ", roman: "dd" },
  { gurmukhi: "ਢ", roman: "ddha" },
  { gurmukhi: "ਣ", roman: "nna" },
  { gurmukhi: "ਤ", roman: "ta" },
  { gurmukhi: "ਥ", roman: "tha" },
  { gurmukhi: "ਦ", roman: "da" },
  { gurmukhi: "ਧ", roman: "dha" },
  { gurmukhi: "ਨ", roman: "na" },
  { gurmukhi: "ਪ", roman: "pa" },
  { gurmukhi: "ਫ", roman: "fa" },
  { gurmukhi: "ਬ", roman: "ba" },
  { gurmukhi: "ਭ", roman: "bha" },
  { gurmukhi: "ਮ", roman: "ma" },
  { gurmukhi: "ਯ", roman: "ya" },
  { gurmukhi: "ਰ", roman: "ra" },
  { gurmukhi: "ਲ", roman: "la" },
  { gurmukhi: "ਵ", roman: "va" },
  { gurmukhi: "ੜ", roman: "rha" },
  { gurmukhi: "ਸ", roman: "sa" },
  { gurmukhi: "ਹ", roman: "ha" },
];

/** A dependent vowel sign (lagan-matra) shown on the Learn chart with an example. */
export interface LaganMatra {
  /** The sign as typed after a consonant (e.g. "ਾ"). */
  sign: string;
  /** English name of the sign (e.g. "Kanna"). */
  name: string;
  /** Example syllable on ਕ (e.g. "ਕਾ"). */
  example: string;
  /** Roman transliteration of the example (e.g. "kaa"). */
  roman: string;
}

/** The ten dependent vowel signs with ਕ-based examples and romanisations. */
export const LAGAN_MATRA: LaganMatra[] = [
  { sign: "ਾ", name: "Kanna", example: "ਕਾ", roman: "kaa" },
  { sign: "ਿ", name: "Sihari", example: "ਕਿ", roman: "ki" },
  { sign: "ੀ", name: "Bihari", example: "ਕੀ", roman: "kee" },
  { sign: "ੁ", name: "Onkar", example: "ਕੁ", roman: "ku" },
  { sign: "ੂ", name: "Dulankar", example: "ਕੂ", roman: "koo" },
  { sign: "ੇ", name: "Lava", example: "ਕੇ", roman: "kay" },
  { sign: "ੈ", name: "Dulava", example: "ਕੈ", roman: "kai" },
  { sign: "ੋ", name: "Hora", example: "ਕੋ", roman: "ko" },
  { sign: "ੌ", name: "Kanaura", example: "ਕੌ", roman: "kau" },
  { sign: "ੰ", name: "Tippi", example: "ਕੰ", roman: "kan" },
];

/**
 * Roman consonants mapped to Gurmukhi, longest-match first.
 * Approximate aliases included (`q`/`c` → ਕ, `z` → ਜ, `f` → ਫ, `w` → ਵ)
 * so English-keyboard typing degrades gracefully instead of dropping letters.
 */
const ROMAN_CONSONANTS: Record<string, string> = {
  kh: "ਖ",
  gh: "ਘ",
  ch: "ਚ",
  chh: "ਛ",
  jh: "ਝ",
  tth: "ਠ",
  ddh: "ਢ",
  th: "ਥ",
  dh: "ਧ",
  ph: "ਫ",
  bh: "ਭ",
  rh: "ੜ",
  sh: "ਸ਼",
  ng: "ਙ",
  ny: "ਞ",
  nn: "ਣ",
  tt: "ਟ",
  dd: "ਡ",
  k: "ਕ",
  g: "ਗ",
  j: "ਜ",
  t: "ਤ",
  d: "ਦ",
  n: "ਨ",
  p: "ਪ",
  f: "ਫ",
  b: "ਬ",
  m: "ਮ",
  y: "ਯ",
  r: "ਰ",
  l: "ਲ",
  v: "ਵ",
  w: "ਵ",
  s: "ਸ",
  h: "ਹ",
  q: "ਕ",
  z: "ਜ",
  c: "ਕ",
};

/** Roman vowels: standalone form (word start) and dependent sign (after a consonant). */
const ROMAN_VOWELS: Record<string, { alone: string; sign: string | null }> = {
  aa: { alone: "ਆ", sign: "ਾ" },
  ai: { alone: "ਐ", sign: "ੈ" },
  au: { alone: "ਔ", sign: "ੌ" },
  ee: { alone: "ਈ", sign: "ੀ" },
  oo: { alone: "ਊ", sign: "ੂ" },
  a: { alone: "ਅ", sign: null }, // inherent vowel — nothing written
  e: { alone: "ਏ", sign: "ੇ" },
  i: { alone: "ਇ", sign: "ਿ" },
  o: { alone: "ਓ", sign: "ੋ" },
  u: { alone: "ਉ", sign: "ੁ" },
};

/**
 * Consonants before which a preceding `n` takes bindi (ੰ) rather than a
 * dental ਨ — e.g. santokh → ਸੰਤੋਖ, anand → ਅਨੰਦ, singh → ਸਿੰਘ.
 * Nasals, semivowels and `h` keep the plain ਨ (manmohan → ਮਨਮੋਹਨ).
 */
const BINDI_NEXT =
  /^(kh|gh|ch|chh|jh|tt|tth|dd|ddh|t|th|d|dh|p|ph|b|bh|k|g|j|s|sh|f)/;

/** True for characters inside the Gurmukhi Unicode block. */
export function isGurmukhiChar(ch: string): boolean {
  const code = ch.charCodeAt(0);
  return code >= 0x0a00 && code <= 0x0a7f;
}

/**
 * Transliterates English-keyboard Roman text into Gurmukhi (feature 32).
 *
 * Same scheme as the Learn-quiz romanisations (`aa` → ਆ/ਾ, `ee` → ਈ/ੀ …),
 * longest-match tokenising, standard phonetic-keyboard behaviour:
 *   - a vowel after a consonant becomes its dependent sign
 *     (`satinaam` → ਸਤਿਨਾਮ, `prasaad` → ਪਰਸਾਦ);
 *   - `n` before stops/sibilants becomes bindi (`anand` → ਅਨੰਦ);
 *   - existing Gurmukhi, digits, spaces and punctuation pass through;
 *   - unmapped Latin letters pass through untouched.
 *
 * Like any phonetic keyboard, spelling matters: `vaahiguroo` → ਵਾਹਿਗੁਰੂ
 * but `waheguru` gives ਵਾਹੇਗੁਰੁ — the search box previews the conversion
 * so the user can adjust before submitting.
 */
export function romanToGurmukhi(input: string): string {
  const text = input.toLowerCase();
  const keys = [...Object.keys(ROMAN_CONSONANTS), ...Object.keys(ROMAN_VOWELS)].sort(
    (a, b) => b.length - a.length
  );
  let out = "";
  let consonantPending = false;
  let i = 0;
  while (i < text.length) {
    const ch = text[i];
    // Pass through anything that is not a convertible Latin letter.
    if (!/[a-z]/.test(ch)) {
      out += input[i];
      consonantPending = false;
      i += 1;
      continue;
    }
    let token: string | null = null;
    for (const key of keys) {
      if (text.startsWith(key, i)) {
        token = key;
        break;
      }
    }
    if (token === null) {
      out += input[i]; // unmapped letter (x, …) — keep verbatim
      consonantPending = false;
      i += 1;
      continue;
    }
    // Bindi rule: `n` before a stop/sibilant nasalises the syllable.
    if (token === "n" && BINDI_NEXT.test(text.slice(i + 1))) {
      out += "ੰ";
      consonantPending = false;
      i += 1;
      continue;
    }
    const consonant = ROMAN_CONSONANTS[token];
    if (consonant !== undefined) {
      out += consonant;
      consonantPending = true;
      i += token.length;
      continue;
    }
    // Vowel token.
    const vowel = ROMAN_VOWELS[token];
    if (consonantPending && vowel.sign !== undefined) {
      if (vowel.sign !== null) out += vowel.sign;
      consonantPending = false;
    } else {
      out += vowel.alone;
      consonantPending = false;
    }
    i += token.length;
  }
  return out;
}

/** Populates a multiple-choice question round; shuffled by the component. */
export function shuffleAkhar<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}