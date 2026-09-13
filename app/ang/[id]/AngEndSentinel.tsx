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
  const [triggered, setTriggered] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isLastAng || triggered) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !triggered) {
          setTriggered(true);
          // Seamless uninterrupted reading transition to next Ang
          router.push(`/ang/${nextAng}`);
        }
      },
      { threshold: 0.5 }
    );

    if (sentinelRef.current) {
      observer.observe(sentinelRef.current);
    }

    return () => observer.disconnect();
  }, [isLastAng, triggered, nextAng, router]);

  if (isLastAng) {
    return (
      <div className="mt-16 text-center text-xs text-[var(--text-muted)] py-10 border-t border-[var(--border-subtle)]">
        <CheckCircle2 size={22} className="mx-auto mb-2 text-[var(--accent)]" />
        <p className="font-semibold text-[var(--text)]">Completed Sri Guru Granth Sahib Ji</p>
        <p className="mt-1 text-[var(--text-faint)]">Ang 1430 of 1430</p>
      </div>
    );
  }

  return (
    <div
      ref={sentinelRef}
      className="mt-16 pt-8 border-t border-[var(--border-subtle)] transition-all duration-300"
    >
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 text-center space-y-3 shadow-[var(--shadow-subtle)]">
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

        <button
          onClick={() => {
            setTriggered(true);
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
