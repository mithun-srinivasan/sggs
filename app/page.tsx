"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useReaderPrefs } from "@/components/ReaderPrefsProvider";
import {
  BookOpen,
  Search,
  Bookmark,
  Shuffle,
  Compass,
  ArrowRight,
  Maximize2,
  Minimize2,
  RefreshCw,
  Sparkles,
  Sun,
  Moon,
  Coffee,
} from "lucide-react";
import { MAX_ANG, MIN_ANG } from "@/lib/types";

const SACRED_VERSES = [
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
    title: "Raag Asa — Divine Father & Mother",
    gurmukhi: "ਤੂ ਮੇਰਾ ਪਿਤਾ ਤੂਹੈ ਮੇਰਾ ਮਾਤਾ ॥ ਤੂ ਮੇਰਾ ਬੰਧਪੁ ਤੂ ਮੇਰਾ ਭ੍ਰਾਤਾ ॥",
    transliteration: "too meraa pitaa toohai meraa maataa || too meraa bandhap too meraa bhraataa ||",
    translation: "You are my Father, and You are my Mother. You are my Relative, and You are my Brother.",
    ang: 385,
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
    title: "Raag Sorath — Praise of the Divine",
    gurmukhi: "ਜਿਨਿ ਸੇਵਿਆ ਤਿਨਿ ਪਾਇਆ ਮਾਨੁ ॥ ਨਾਨਕ ਰਾਮ ਨਾਮੁ ਗੁਣ ਗਾਨੁ ॥",
    transliteration: "jin seviaa tin paaiaa maan || naanak raam naam gun gaan ||",
    translation: "Those who serve Him obtain honor. O Nanak, sing the Glorious Praises of the Divine Name.",
    ang: 611,
    writer: "Guru Nanak Dev Ji",
  },
];

const RAAG_SECTIONS = [
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
  { name: "Raag Jaitsri", gurmukhi: "ਜੈਤਸਰੀ", ang: 705 },
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

function getRaagForAng(angNum: number): string {
  let matched = "Japji Sahib";
  for (const item of RAAG_SECTIONS) {
    if (angNum >= item.ang) {
      matched = `${item.name} (${item.gurmukhi})`;
    }
  }
  return matched;
}

export default function HomePage() {
  const router = useRouter();
  const prefs = useReaderPrefs();
  const [targetAng, setTargetAng] = useState<number>(1);
  const [lastReadAng, setLastReadAng] = useState<number | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [verseIndex, setVerseIndex] = useState<number>(0);
  const [isRotating, setIsRotating] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("sggs_last_ang");
      if (saved) {
        const parsed = parseInt(saved, 10);
        if (!isNaN(parsed) && parsed >= MIN_ANG && parsed <= MAX_ANG) {
          setLastReadAng(parsed);
        }
      }
    } catch {
      // Storage fallback
    }
  }, []);

  useEffect(() => {
    const handleFs = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handleFs);
    return () => document.removeEventListener("fullscreenchange", handleFs);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const handleRandomAng = () => {
    const random = Math.floor(Math.random() * (MAX_ANG - MIN_ANG + 1)) + MIN_ANG;
    router.push(`/ang/${random}`);
  };

  const nextSacredVerse = () => {
    setIsRotating(true);
    setTimeout(() => {
      setVerseIndex((prev) => (prev + 1) % SACRED_VERSES.length);
      setIsRotating(false);
    }, 150);
  };

  const currentVerse = SACRED_VERSES[verseIndex];
  const nextTheme = prefs.theme === "light" ? "dark" : prefs.theme === "dark" ? "sepia" : "light";
  const ThemeIcon = prefs.theme === "light" ? Sun : prefs.theme === "dark" ? Moon : Coffee;

  return (
    <div className="relative min-h-screen text-[var(--text)] transition-colors overflow-hidden icon-border">
      {/* Background Image — Sri Harmandir Sahib Night */}
      <div className="fixed inset-0 z-0">
        <Image
          src="/golden-temple-night.png"
          alt="Sri Harmandir Sahib (Golden Temple) at night"
          fill
          priority
          quality={90}
          sizes="100vw"
          className="object-cover object-center pointer-events-none"
        />
        <div className="absolute inset-0 bg-[var(--bg)]/80 backdrop-blur-[2px] transition-colors" />
      </div>

      {/* Foreground Content */}
      <div className="relative z-10 min-h-screen">
        {/* Pinned Glass Header */}
        <header className="sticky top-0 z-30 glass-nav-pinned">
          <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3 sm:px-6">
            <Link href="/" className="flex items-center gap-2">
              <span className="font-gurmukhi text-lg font-bold text-[var(--accent)]">ੴ</span>
              <h1 className="text-sm font-bold tracking-tight text-[var(--text)]">
                Sri Guru Granth Sahib Ji
              </h1>
            </Link>

            <nav className="flex items-center gap-1">
              <button
                onClick={toggleFullscreen}
                aria-label={isFullscreen ? "Exit Fullscreen" : "Fullscreen Mode"}
                title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Mode"}
                className="flex h-10 w-10 items-center justify-center rounded-lg text-[var(--text-muted)] transition hover:text-[var(--text)] hover:bg-[var(--surface-hover)] active:scale-[0.97]"
              >
                {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
              </button>

              <Link
                href="/search"
                aria-label="Search Gurbani"
                title="Search Gurbani"
                className="flex h-10 w-10 items-center justify-center rounded-lg text-[var(--text-muted)] transition hover:text-[var(--text)] hover:bg-[var(--surface-hover)] active:scale-[0.97]"
              >
                <Search size={18} />
              </Link>

<Link
              href="/bookmarks"
              aria-label="Saved Bookmarks"
              title="Saved Bookmarks"
              className="flex h-10 w-10 items-center justify-center rounded-lg text-[var(--text-muted)] transition hover:text-[var(--text)] hover:bg-[var(--surface-hover)] active:scale-[0.97]"
            >
              <Bookmark size={18} />
            </Link>

            <button
              onClick={() => prefs.setTheme(nextTheme)}
              aria-label={`Switch to ${nextTheme} theme`}
              title={`Switch to ${nextTheme} theme`}
              className="flex h-10 w-10 items-center justify-center rounded-lg text-[var(--text-muted)] transition hover:text-[var(--text)] hover:bg-[var(--surface-hover)] bg-[var(--surface)]/80"
            >
              <ThemeIcon size={18} />
            </button>

              <Link
                href={`/ang/${lastReadAng || 1}`}
                className="hidden sm:inline-flex items-center gap-2 rounded-lg bg-[var(--accent)] px-4 py-2 text-xs font-semibold text-white transition hover:opacity-90 active:scale-[0.97]"
              >
                <BookOpen size={15} />
                <span>Read Ang</span>
              </Link>
            </nav>
          </div>
        </header>

        <main className="mx-auto max-w-4xl px-5 py-12 sm:px-8 sm:py-16 space-y-16 animate-in fade-in duration-300">
          {/* Hero Section */}
          <section className="text-center space-y-6">
            <p className="font-gurmukhi text-3xl sm:text-4xl text-[var(--accent)] font-semibold tracking-wide">
              ੴ ਸਤਿ ਨਾਮੁ ਕਰਤਾ ਪੁਰਖੁ
            </p>

            <div className="space-y-2">
              <h1 className="text-3xl font-extrabold tracking-tight text-[var(--text)] sm:text-5xl">
                Sri Guru Granth Sahib Ji
              </h1>
              <p className="mx-auto max-w-lg text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
                A distraction-free, quiet digital sanctuary for contemplating sacred Gurbani verse-by-verse across all 1430 Angs.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Link
                href={`/ang/${lastReadAng || 1}`}
                className="flex min-h-[44px] items-center gap-2 rounded-xl bg-[var(--accent)] px-6 py-3 text-xs font-semibold text-white transition hover:opacity-90 active:scale-[0.97]"
              >
                <BookOpen size={16} />
                <span>{lastReadAng ? `Resume Ang ${lastReadAng}` : "Begin Reading (Ang 1)"}</span>
              </Link>

              <button
                onClick={handleRandomAng}
                className="flex min-h-[44px] items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)]/80 backdrop-blur-md px-5 py-3 text-xs font-semibold text-[var(--text)] transition hover:bg-[var(--surface-hover)] active:scale-[0.97]"
              >
                <Shuffle size={16} className="text-[var(--accent)]" />
                <span>Random Ang</span>
              </button>
            </div>
          </section>

          {/* Smooth, Tactile & Usable Quick Ang Navigation Slider */}
          <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/80 backdrop-blur-md p-6 sm:p-8 space-y-6 shadow-[var(--shadow-subtle)]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="flex items-center gap-2 text-base font-bold text-[var(--text)]">
                  <Compass size={18} className="text-[var(--accent)]" />
                  <span>Go to Ang (1–1430)</span>
                </h2>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  Drag the smooth slider or use quick jump markers.
                </p>
              </div>
              <div className="text-right text-xs">
                <span className="font-semibold text-[var(--text-muted)]">Selected: </span>
                <span className="font-bold text-[var(--accent)] text-sm">Ang {targetAng}</span>
                <span className="font-gurmukhi block text-[var(--text-faint)] mt-0.5">{getRaagForAng(targetAng)}</span>
              </div>
            </div>

            {/* Smooth Slider with Filled Progress Highlight */}
            <div className="space-y-4">
              <div className="relative flex items-center py-2">
                <div className="absolute h-2.5 w-full rounded-full bg-[var(--border)]" />
                <div
                  className="absolute h-2.5 rounded-full bg-[var(--accent)] transition-all duration-75"
                  style={{ width: `${((targetAng - 1) / (MAX_ANG - 1)) * 100}%` }}
                />
                <input
                  type="range"
                  min={MIN_ANG}
                  max={MAX_ANG}
                  value={targetAng}
                  onChange={(e) => setTargetAng(parseInt(e.target.value, 10))}
                  className="relative z-10 h-2.5 w-full cursor-pointer opacity-0"
                  aria-label="Ang number selection slider"
                />
                <div
                  className="absolute z-20 h-5 w-5 rounded-full bg-[var(--accent)] shadow-md border-2 border-[var(--surface)] pointer-events-none transition-transform active:scale-125"
                  style={{ left: `calc(${((targetAng - 1) / (MAX_ANG - 1)) * 100}% - 10px)` }}
                />
              </div>

              {/* Quick Jump Landmark Shortcuts */}
              <div className="flex flex-wrap items-center justify-between gap-1.5 pt-1 text-[11px]">
                <span className="text-[var(--text-faint)]">Quick Jumps:</span>
                <div className="flex flex-wrap gap-1.5">
                  {[1, 14, 262, 462, 917, 1430].map((angNum) => (
                    <button
                      key={angNum}
                      onClick={() => setTargetAng(angNum)}
                      className={`rounded-md px-2 py-0.5 font-semibold transition ${
                        targetAng === angNum
                          ? "bg-[var(--accent)] text-white"
                          : "bg-[var(--surface-hover)] text-[var(--text-muted)] hover:text-[var(--text)]"
                      }`}
                    >
                      Ang {angNum}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[var(--text-muted)]">Ang:</span>
                  <input
                    type="number"
                    min={MIN_ANG}
                    max={MAX_ANG}
                    value={targetAng}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      if (!isNaN(val)) setTargetAng(Math.min(MAX_ANG, Math.max(MIN_ANG, val)));
                    }}
                    className="h-10 w-20 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-center text-sm font-bold text-[var(--text)] outline-none focus:border-[var(--accent)]"
                  />
                </div>

                <Link
                  href={`/ang/${targetAng}`}
                  className="flex min-h-[44px] items-center gap-2 rounded-xl bg-[var(--accent)] px-5 py-2 text-xs font-semibold text-white transition hover:opacity-90 active:scale-[0.97]"
                >
                  <span>Open Ang {targetAng}</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </section>

          {/* Dynamic Sacred Wisdom & Contemplation Section */}
          <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/80 backdrop-blur-md p-6 sm:p-8 text-center space-y-5 shadow-[var(--shadow-subtle)]">
            <div className="flex items-center justify-between gap-2 border-b border-[var(--border-subtle)] pb-3">
              <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[var(--accent)]">
                <Sparkles size={14} />
                <span>{currentVerse.title}</span>
              </div>

              <button
                onClick={nextSacredVerse}
                aria-label="Refresh contemplation verse"
                title="Explore another sacred verse"
                className="flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-1 text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text)] hover:border-[var(--accent)] transition active:scale-[0.97]"
              >
                <RefreshCw size={13} className={isRotating ? "animate-spin" : ""} />
                <span>Next Verse</span>
              </button>
            </div>

            <div className={`space-y-3 max-w-2xl mx-auto transition-opacity duration-150 ${isRotating ? "opacity-30" : "opacity-100"}`}>
              <p className="font-gurmukhi text-xl sm:text-2xl leading-relaxed text-[var(--text)] font-semibold">
                {currentVerse.gurmukhi}
              </p>
              <p className="text-xs italic text-[var(--text-muted)]">
                {currentVerse.transliteration}
              </p>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                {currentVerse.translation}
              </p>
              {currentVerse.writer && (
                <p className="text-[11px] font-medium text-[var(--text-faint)] pt-1">
                  — {currentVerse.writer}
                </p>
              )}
            </div>

            <div className="pt-2">
              <Link
                href={`/ang/${currentVerse.ang}`}
                className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--accent)] hover:underline"
              >
                <span>Read in Context (Ang {currentVerse.ang})</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </section>

          {/* 31 Main Raags & Major Sections */}
          <section className="space-y-6">
            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold text-[var(--text)]">31 Main Raags & Major Sections</h3>
              <p className="text-xs text-[var(--text-muted)]">Jump directly to the starting Ang of any major section.</p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {RAAG_SECTIONS.map((r) => (
                <Link
                  key={r.name + r.ang}
                  href={`/ang/${r.ang}`}
                  className="group flex flex-col justify-between rounded-xl border border-[var(--border)] bg-[var(--surface)]/80 backdrop-blur-md p-4 transition hover:border-[var(--accent)] hover:bg-[var(--surface-hover)] active:scale-[0.97]"
                >
                  <div>
                    <span className="text-[10px] font-bold text-[var(--accent)]">Ang {r.ang}</span>
                    <h4 className="text-xs font-bold text-[var(--text)] group-hover:text-[var(--accent)] transition">
                      {r.name}
                    </h4>
                  </div>
                  <p className="mt-2 font-gurmukhi text-xs text-[var(--text-muted)] truncate">
                    {r.gurmukhi}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        </main>

        <footer className="mt-16 border-t border-[var(--border-subtle)] bg-[var(--surface)]/80 backdrop-blur-md py-8 text-center text-xs text-[var(--text-muted)]">
          <p>Sri Guru Granth Sahib Ji — Ang Reader</p>
        </footer>
      </div>
    </div>
  );
}
