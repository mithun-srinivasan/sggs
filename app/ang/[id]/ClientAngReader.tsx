/**
 * app/ang/[id]/ClientAngReader.tsx
 * ---------------------------------------------------------------------------
 * Client-side reader body that powers **Continuous Reading Mode** (feature 2).
 *
 * The server page renders the initial Ang's verses statically; this component
 * holds that list in state and — when the end sentinel says we hit the bottom
 * — appends the *next* Ang's verses inline (fetched via the `getAngForReader`
 * server action) instead of navigating to a new page.  The chain keeps growing
 * until the user reaches Ang 1430 or disables continuous mode.
 *
 * It also reports completed Angs to `ProgressProvider.markAngRead` so the
 * reading-progress/streak/history features (7/8/9/13) see every Ang the user
 * reads to the end, in both single-page and continuous modes.
 */

"use client";

import { useCallback, useState } from "react";
import type { VerseLine } from "@/lib/types";
import VerseCard from "@/components/VerseCard";
import { useReaderPrefs } from "@/components/ReaderPrefsProvider";
import { useReadingProgress } from "@/components/ProgressProvider";
import AngEndSentinel from "./AngEndSentinel";
import { getAngForReader } from "./actions";

/** One Ang's worth of verses joined together in a reading chain. */
interface ChainAng {
  ang: number;
  lines: VerseLine[];
}

export default function ClientAngReader({
  angNumber,
  initialLines,
  maxAng,
}: {
  angNumber: number;
  initialLines: VerseLine[];
  maxAng: number;
}) {
  const prefs = useReaderPrefs();
  const { markAngRead } = useReadingProgress();

  /** Accumulated verse blocks; always starts with the statically-rendered Ang. */
  const [chain, setChain] = useState<ChainAng[]>([{ ang: angNumber, lines: initialLines }]);

  /**
   * Handles "user has scrolled to the very bottom of Ang `ang`".
   *
   * Marks the Ang as read, then — if continuous mode is ON and there is a next
   * Ang — fetches and appends it, returning `true` so the sentinel stays
   * watching.  Returns `false` in all other cases, letting the sentinel fall
   * back to normal page navigation.
   */
  const handleEndReached = useCallback(
    async (ang: number): Promise<boolean> => {
      markAngRead(ang);

      if (!prefs.isContinuousMode || ang >= maxAng) return false;

      try {
        const next = await getAngForReader(ang + 1);
        if (!next) return false; // load failed — fall back to navigating
        setChain((c) => [...c, { ang: next.angNumber, lines: next.lines }]);
        return true;
      } catch {
        return false; // unreachable API — navigate as usual
      }
    },
    [prefs.isContinuousMode, maxAng, markAngRead]
  );

  return (
    <>
      <section aria-label={`Ang ${angNumber} verses`}>
        {chain.map((segment) => (
          <div key={segment.ang}>
            {segment.lines.map((line) => (
              <VerseCard key={line.id} line={line} angNumber={segment.ang} />
            ))}
          </div>
        ))}
      </section>

      <AngEndSentinel
        angNumber={chain[chain.length - 1].ang}
        maxAng={maxAng}
        onEndReached={handleEndReached}
      />
    </>
  );
}