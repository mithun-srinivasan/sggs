/**
 * app/learn/page.tsx
 * ---------------------------------------------------------------------------
 * "Learn Gurmukhi" practice page (feature 22).
 *
 * A lightweight multiple-choice quiz: a random Gurmukhi akhar is shown and the
 * reader picks its correct Roman transliteration from four options.  Progress
 * (rounds played, correct answers, best streak) is kept in component state —
 * no persistence needed for a quick practice session.
 */

"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, X, RotateCw, Trophy } from "lucide-react";
import { AKHARS, shuffleAkhar } from "@/lib/gurmukhi";
import { useReaderPrefs } from "@/components/ReaderPrefsProvider";

/** A single quiz round: the prompt letter + 4 shuffled answer options. */
interface Round {
  prompt: string;
  correct: string;
  options: string[];
}

/** Builds a fresh round from the akhar list. */
function buildRound(): Round {
  const target = AKHARS[Math.floor(Math.random() * AKHARS.length)];
  // Three distinct distractors plus the correct answer.
  const distractors = shuffleAkhar(AKHARS.filter((a) => a.roman !== target.roman)).slice(0, 3);
  return {
    prompt: target.gurmukhi,
    correct: target.roman,
    options: shuffleAkhar([target.roman, ...distractors.map((d) => d.roman)]),
  };
}

export default function LearnPage() {
  const prefs = useReaderPrefs();
  const [round, setRound] = useState<Round | null>(null);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);

  /** Generate the first round after mount (avoids SSR/CSR mismatch from RNG). */
  useEffect(() => {
    setRound(buildRound());
  }, []);

  /** Grades the pick and schedules the next round. */
  const choose = useCallback(
    (option: string) => {
      if (!round || picked) return;
      setPicked(option);
      setAnswered((a) => a + 1);
      if (option === round.correct) {
        setScore((s) => s + 1);
        setStreak((s) => {
          const next = s + 1;
          setBestStreak((b) => Math.max(b, next));
          return next;
        });
      } else {
        setStreak(0);
      }
      setTimeout(() => {
        setPicked(null);
        setRound(buildRound());
      }, 900);
    },
    [round, picked]
  );

  const reset = () => {
    setScore(0);
    setAnswered(0);
    setStreak(0);
    setBestStreak(0);
    setPicked(null);
    setRound(buildRound());
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <header className="sticky top-0 z-30 border-b bg-[var(--bg)]">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              aria-label="Back to home"
              className="flex h-11 w-11 items-center justify-center rounded-lg text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-hover)] transition"
            >
              <ArrowLeft size={18} />
            </Link>
            <h1 className="text-sm font-bold text-[var(--text)]">Learn Gurmukhi</h1>
          </div>
          <div className="flex items-center gap-1 rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs font-semibold text-[var(--text-muted)]">
            <Trophy size={14} className="text-[var(--accent)]" />
            <span>
              {score}/{answered}
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-5 py-10 sm:px-8">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/80 p-8 text-center shadow-[var(--shadow-subtle)]">
          <p className="text-xs font-semibold uppercase tracking-widest text-[var(--text-faint)]">
            Which transliteration matches?
          </p>

          {/* The Gurmukhi prompt */}
          <p
            className="font-gurmukhi mt-6 text-7xl font-semibold text-[var(--text)] select-none"
            style={{ fontSize: `${prefs.fontScale * 4.5}rem` }}
          >
            {round?.prompt ?? "ੴ"}
          </p>

          {/* Four answer options */}
          <div className="mt-8 grid grid-cols-2 gap-3">
            {round?.options.map((opt) => {
              const isCorrect = picked && opt === round.correct;
              const isWrongPick = picked === opt && opt !== round.correct;
              return (
                <button
                  key={opt}
                  onClick={() => choose(opt)}
                  disabled={!!picked}
                  className={`flex min-h-[52px] items-center justify-center gap-2 rounded-xl border px-4 text-sm font-semibold transition active:scale-[0.97] ${
                    isCorrect
                      ? "border-green-500 bg-green-500/15 text-green-500"
                      : isWrongPick
                        ? "border-red-500 bg-red-500/15 text-red-500"
                        : "border-[var(--border)] text-[var(--text)] hover:border-[var(--accent)] hover:bg-[var(--accent-light)]"
                  }`}
                >
                  <span>{opt}</span>
                  {isCorrect && <Check size={16} />}
                  {isWrongPick && <X size={16} />}
                </button>
              );
            })}
          </div>

          {/* Running score line */}
          <div className="mt-8 flex items-center justify-center gap-6 text-xs text-[var(--text-muted)]">
            <span>
              Streak: <strong className="text-[var(--text)]">{streak}</strong>
            </span>
            <span>
              Best: <strong className="text-[var(--text)]">{bestStreak}</strong>
            </span>
          </div>

          <button
            onClick={reset}
            className="mt-6 inline-flex items-center gap-2 rounded-lg border border-[var(--border)] px-4 py-2 text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text)] transition"
          >
            <RotateCw size={14} />
            <span>Reset Score</span>
          </button>
        </div>

        <p className="mt-8 text-center text-xs leading-relaxed text-[var(--text-muted)]">
          The Gurmukhi script has 35 primary akhars (letters) plus vowel carriers. Practise a few
          rounds daily and you will soon read the scripture directly.
        </p>
      </main>
    </div>
  );
}