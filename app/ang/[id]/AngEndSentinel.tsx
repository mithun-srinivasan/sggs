/**
 * app/ang/[id]/AngEndSentinel.tsx
 * ---------------------------------------------------------------------------
 * Renders the "end of Ang" card at the bottom of every Ang reader page.
 *
 * Two modes:
 *   1. **Not the last Ang (1–1429):** An `IntersectionObserver` watches the
 *      sentinel element. When the user scrolls it into the centre of the
 *      viewport (50% threshold), the page automatically navigates to the next
 *      Ang with a cross-fade transition.  A manual "Continue to Ang N+1"
 *      button is also rendered for users who prefer tapping.
 *   2. **Last Ang (1430):** A quiet "Completed Sri Guru Granth Sahib Ji"
 *      message is displayed — no auto-advance or button.
 */

"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { KhandaIcon } from "@/components/SikhSymbols";

export default function AngEndSentinel({
  angNumber,
  maxAng,
}: {
  angNumber: number;
  maxAng: number;
}) {
  const router = useRouter();
  const nextAng = angNumber + 1;
  const isLastAng = angNumber >= maxAng;

  /** Whether auto-navigation or manual navigation has been triggered. */
  const [triggered, setTriggered] = useState(false);

  /** Ref to the DOM element the IntersectionObserver watches. */
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // -- IntersectionObserver auto-advance -------------------------------------

  useEffect(() => {
    // Never auto-advance from Ang 1430, and never fire twice.
    if (isLastAng || triggered) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !triggered) {
          setTriggered(true);
          window.dispatchEvent(new CustomEvent("crossfade-start"));
          router.push(`/ang/${nextAng}`);
        }
      },
      { threshold: 0.5 } // trigger when the sentinel is 50% visible
    );

    if (sentinelRef.current) {
      observer.observe(sentinelRef.current);
    }

    return () => observer.disconnect();
  }, [isLastAng, triggered, nextAng, router]);

  // -- Final Ang: completion message -----------------------------------------

  if (isLastAng) {
    return (
      <div className="mt-16 text-center text-xs text-[var(--text-muted)] py-10 border-t border-[var(--border-subtle)]">
        <CheckCircle2 size={22} className="mx-auto mb-2 text-[var(--accent)]" />
        <p className="font-semibold text-[var(--text)]">Completed Sri Guru Granth Sahib Ji</p>
        <p className="mt-1 text-[var(--text-faint)]">Ang 1430 of 1430</p>
      </div>
    );
  }

  // -- Intermediate Angs: auto-advance card ----------------------------------

  return (
    <div
      ref={sentinelRef}
      className="mt-16 pt-8 border-t border-[var(--border-subtle)] transition-all duration-300"
    >
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 text-center space-y-3 shadow-[var(--shadow-subtle)]">
        {/* Khanda emblem above the text */}
        <div className="flex justify-center text-[var(--accent)]">
          <KhandaIcon size={24} />
        </div>

        <div className="space-y-1">
          <p className="text-[11px] font-medium uppercase tracking-widest text-[var(--text-faint)]">
            Completed Ang {angNumber}
          </p>
          <p className="text-xs font-semibold text-[var(--text)]">
            {triggered ? `Transitioning to Ang ${nextAng}...` : `Advancing to Ang ${nextAng}`}
          </p>
        </div>

        {/* Manual continue button — fallback for users who prefer tapping */}
        <button
          onClick={() => {
            setTriggered(true);
            window.dispatchEvent(new CustomEvent("crossfade-start"));
            router.push(`/ang/${nextAng}`);
          }}
          className="group inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-[var(--accent)] px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:opacity-90 active:scale-[0.97]"
        >
          <span>Continue to Ang {nextAng}</span>
          <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>
    </div>
  );
}