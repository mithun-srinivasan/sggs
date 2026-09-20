/**
 * lib/homeConstants.ts
 * ---------------------------------------------------------------------------
 * Static data arrays used by the home page (`app/page.tsx`).
 * Extracted to keep the page component focused on layout and interaction,
 * and to allow these arrays to be imported elsewhere if needed.
 */

export interface SacredVerse {
  title: string;
  gurmukhi: string;
  transliteration: string;
  translation: string;
  ang: number;
  writer: string;
}

export interface RaagSection {
  name: string;
  gurmukhi: string;
  ang: number;
}

/** Featured sacred verses shown in the "Sacred Wisdom" carousel section. */
export const SACRED_VERSES: SacredVerse[] = [
  {
    title: "Mool Mantar — Opening Scripture",
    gurmukhi: "ੴ ਸਤਿ ਨਾਮੁ ਕਰਤਾ ਪੁਰਖੁ ਨਿਰਭਉ ਨਿਰਵੈਰੁ ਅਕਾਲ ਮੂਰਤਿ ਅਜੂਨੀ ਸੈਭੰ ਗੁਰ ਪ੍ਰਸਾਦਿ ॥",
    transliteration: "ikOankaar sat naam karataa purakh nirabhau niravair akaal moorat ajoonee saibha(n) gur prasaadh ||",
    translation: "One Universal Creator God. Truth Is The Name. Creative Being Personified. No Fear. No Hatred. Image Of The Undying, Beyond Birth, Self-Existent. By Guru's Grace.",
    ang: 1,
    writer: "Guru Nanak Dev Ji",
  },
  {
    title: "Japji Sahib — Sacred Slok",
    gurmukhi: "ਪਵਣੁ ਗੁਰੂ ਪਾਣੀ ਪਿਤਾ ਮਾਤਾ ਧਰਤਿ ਮਹਤੁ ॥ ਦਿਵਸੁ ਰਾਤਿ ਦੁਇ ਦਾਈ ਦਾਇਆ ਖੇਲੈ ਸਗਲ ਜਗਤੁ ॥",
    transliteration: "pavan guroo paanee pitaa maataa dharat mahat || dhivas raat dhue dhaaee dhaaiaa khelai sagal jagat ||",
    translation: "Air is the Guru, Water is the Father, and Earth is the Great Mother of all. Day and night are the two nurses, in whose lap the whole world plays.",
    ang: 8,
    writer: "Guru Nanak Dev Ji",
  },
  {
    title: "Sukhmani Sahib — Sacred Salutation",
    gurmukhi: "ਆਦਿ ਗੁਰਏ ਨਮਹ ॥ ਜੁਗਾਦਿ ਗੁਰਏ ਨਮਹ ॥ ਸਤਿਗੁਰਏ ਨਮਹ ॥ ਸ੍ਰੀ ਗੁਰਦੇਵਏ ਨਮਹ ॥",
    transliteration: "aad gur e namah || jugaad gur e namah || satgur e namah || sree gurdev e namah ||",
    translation: "I bow to the Primal Guru. I bow to the Guru of the Ages. I bow to the True Guru. I bow to the Great Divine Guru.",
    ang: 262,
    writer: "Guru Arjan Dev Ji",
  },
  {
    title: "Bhairao — Thou Art My Father",
    gurmukhi: "ਤੂ ਮੇਰਾ ਪਿਤਾ ਤੂਹੈ ਮੇਰਾ ਮਾਤਾ ॥ ਤੂ ਮੇਰਾ ਬੰਧਪੁ ਤੂ ਮੇਰਾ ਭ੍ਰਾਤਾ ॥",
    transliteration: "too meraa pitaa toohai meraa maataa || too meraa bandhap too meraa bhraataa ||",
    translation: "You are my Father, and You are my Mother. You are my Relative, and You are my Brother.",
    ang: 1144,
    writer: "Guru Arjan Dev Ji",
  },
  {
    title: "Anand Sahib — Eternal Bliss",
    gurmukhi: "ਅਨੰਦੁ ਭਇਆ ਮੇਰੀ ਮਾਏ ਸਤਿਗੁਰੂ ਮੈ ਪਾਇਆ ॥",
    transliteration: "anand bhaiaa meree maae satguroo mai paaiaa ||",
    translation: "I am in ecstasy, O my mother, for I have found my True Guru.",
    ang: 917,
    writer: "Guru Amar Das Ji",
  },
  {
    title: "Japji Sahib — Those Who Serve",
    gurmukhi: "ਜਿਨਿ ਸੇਵਿਆ ਤਿਨਿ ਪਾਇਆ ਮਾਨੁ ॥ ਨਾਨਕ ਰਾਮ ਨਾਮੁ ਗੁਣ ਗਾਨੁ ॥",
    transliteration: "jin seviaa tin paaiaa maan || naanak raam naam gun gaan ||",
    translation: "Those who serve Him obtain honor. O Nanak, sing the Glorious Praises of the Divine Name.",
    ang: 2,
    writer: "Guru Nanak Dev Ji",
  },
];

/** The 31 main Raags plus major scripture sections. */
export const RAAG_SECTIONS: RaagSection[] = [
  { name: "Japji Sahib", gurmukhi: "ਜਪੁਜੀ ਸਾਹਿਬ", ang: 1 },
  { name: "Sodhar Rehras", gurmukhi: "ਸੋ ਦਰੁ ਰਹਿਰਾਸਿ", ang: 8 },
  { name: "Sohila Sahib", gurmukhi: "ਸੋਹਿਲਾ ਸਾਹਿਬ", ang: 12 },
  { name: "Sri Raag", gurmukhi: "ਸ੍ਰੀ ਰਾਗੁ", ang: 14 },
  { name: "Raag Majh", gurmukhi: "ਮਾਝ", ang: 94 },
  { name: "Raag Gauri", gurmukhi: "ਗਉੜੀ", ang: 151 },
  { name: "Sukhmani Sahib", gurmukhi: "ਸੁਖਮਨੀ ਸਾਹਿਬ", ang: 262 },
  { name: "Raag Aasaa", gurmukhi: "ਆਸਾ", ang: 347 },
  { name: "Asa Di Var", gurmukhi: "ਆਸਾ ਦੀ ਵਾਰ", ang: 462 },
  { name: "Raag Gujri", gurmukhi: "ਗੂਜਰੀ", ang: 489 },
  { name: "Raag Devgandhari", gurmukhi: "ਦੇਵਗੰਧਾਰੀ", ang: 527 },
  { name: "Raag Bihagra", gurmukhi: "ਬਿਹਾਗੜਾ", ang: 537 },
  { name: "Raag Sorath", gurmukhi: "ਸੋਰਠਿ", ang: 595 },
  { name: "Raag Dhanasri", gurmukhi: "ਧਨਾਸਰੀ", ang: 660 },
  { name: "Raag Jaitsri", gurmukhi: "ਜੈਤਸਰੀ", ang: 696 },
  { name: "Raag Todi", gurmukhi: "ਤੋਡੀ", ang: 711 },
  { name: "Raag Bairari", gurmukhi: "ਬੈਰਾੜੀ", ang: 719 },
  { name: "Raag Tilang", gurmukhi: "ਤਿਲੰਗ", ang: 721 },
  { name: "Raag Suhi", gurmukhi: "ਸੂਹੀ", ang: 728 },
  { name: "Raag Bilaval", gurmukhi: "ਬਿਲਾਵਲੁ", ang: 795 },
  { name: "Raag Gond", gurmukhi: "ਗੋਂਡ", ang: 859 },
  { name: "Raag Ramkali", gurmukhi: "ਰਾਮਕਲੀ", ang: 885 },
  { name: "Anand Sahib", gurmukhi: "ਅਨੰਦੁ ਸਾਹਿਬ", ang: 917 },
  { name: "Raag Nat Narain", gurmukhi: "ਨਟ ਨਾਰਾਇਨ", ang: 975 },
  { name: "Raag Mali Gaura", gurmukhi: "ਮਾਲੀ ਗਉੜਾ", ang: 984 },
  { name: "Raag Maru", gurmukhi: "ਮਾਰੂ", ang: 989 },
  { name: "Raag Tukhari", gurmukhi: "ਤੁਖਾਰੀ", ang: 1107 },
  { name: "Raag Kedara", gurmukhi: "ਕੇਦਾਰਾ", ang: 1118 },
  { name: "Raag Bhairav", gurmukhi: "ਭੈਰਉ", ang: 1125 },
  { name: "Raag Basant", gurmukhi: "ਬਸੰਤੁ", ang: 1168 },
  { name: "Raag Sarang", gurmukhi: "ਸਾਰੰਗ", ang: 1197 },
  { name: "Raag Malar", gurmukhi: "ਮਲਾਰ", ang: 1254 },
  { name: "Raag Kanara", gurmukhi: "ਕਾਨੜਾ", ang: 1294 },
  { name: "Raag Kalyan", gurmukhi: "ਕਲਿਆਨ", ang: 1319 },
  { name: "Raag Prabhati", gurmukhi: "ਪ੍ਰਭਾਤੀ", ang: 1327 },
  { name: "Raag Jaijavanti", gurmukhi: "ਜੈਜਾਵੰਤੀ", ang: 1352 },
  { name: "Slok Sahskriti & Bhagat Bani", gurmukhi: "ਸਲੋਕ ਸਹਸਕ੍ਰਿਤੀ", ang: 1353 },
];

/**
 * Returns the display name (with Gurmukhi) of the Raag/section that
 * an Ang number falls within.
 */
export function getRaagForAng(angNum: number): string {
  let matched = "Japji Sahib";
  for (const item of RAAG_SECTIONS) {
    if (angNum >= item.ang) {
      matched = `${item.name} (${item.gurmukhi})`;
    }
  }
  return matched;
}
