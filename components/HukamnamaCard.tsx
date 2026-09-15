/**
 * components/HukamnamaCard.tsx
 * ---------------------------------------------------------------------------
 * The Daily Hukamnama card on the Home page (feature 17).
 *
 * The user required the Hukamnama to be sourced from the **SGPC website**, so
 * this card:
 *   - calls the `getTodaysHukamnama` server action (which reads SGPC's live
 *     `hs.sgpc.net` page for the day's official audio and pairs it with
 *     BaniDB's text mirror of the same SGPC daily selection);
 *   - shows the verse text, its Ang / Raag / writer, the official SGPC audio
 *     players when available, and a prominent link back to the SGPC page.
 *
 * It fetches after mount (it lives inside a client component Home page) and
 * renders a quiet skeleton while loading.
 */

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Sunrise, ExternalLink } from "lucide-react";
import type { HukamnamaInfo } from "@/lib/types";
import { getTodaysHukamnama } from "@/app/actions";

export default function HukamnamaCard() {
  const [hukamnama, setHukamnama] = useState<HukamnamaInfo | null>(null);
  const [loading, setLoading] = useState(true);
  /** Hides the SGPC image slot when the remote file 403s/404s (deployed hotlink). */
  const [imgFailed, setImgFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getTodaysHukamnama()
      .then((h) => {
        if (!cancelled) setHukamnama(h);
      })
      .catch(() => {
        if (!cancelled) setHukamnama(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // -- Loading skeleton ------------------------------------------------------

  if (loading) {
    return (
      <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/80 backdrop-blur-md p-6 sm:p-8 shadow-[var(--shadow-subtle)]">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--accent)]">
          <Sunrise size={14} />
          <span>Daily Hukamnama</span>
        </div>
        <div className="mt-4 h-4 w-2/3 animate-pulse rounded bg-[var(--surface-hover)]" />
        <div className="mt-2 h-4 w-1/2 animate-pulse rounded bg-[var(--surface-hover)]" />
      </section>
    );
  }

  // -- Unavailable fallback --------------------------------------------------

  if (!hukamnama || hukamnama.lines.length === 0) {
    return (
      <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/80 backdrop-blur-md p-6 sm:p-8 shadow-[var(--shadow-subtle)]">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--accent)]">
          <Sunrise size={14} />
          <span>Daily Hukamnama</span>
        </div>
        <p className="mt-3 text-xs text-[var(--text-muted)]">
          The Hukamnama could not be loaded right now.{" "}
          <a
            href="https://hs.sgpc.net/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-[var(--accent)] hover:underline"
          >
            Read it on the SGPC website
          </a>
          .
        </p>
      </section>
    );
  }

  const showMedia = Boolean(
    (hukamnama.sgpcImage && !imgFailed) || hukamnama.sgpcAudio || hukamnama.sgpcKathaAudio
  );

  return (
    <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/80 backdrop-blur-md p-6 sm:p-8 shadow-[var(--shadow-subtle)]">
      {/* Card heading + date */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border-subtle)] pb-3">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--accent)]">
          <Sunrise size={14} />
          <span>Daily Hukamnama</span>
        </div>
        <span className="text-[11px] font-medium text-[var(--text-muted)]">
          {hukamnama.dateLabel}
        </span>
      </div>

      <div className={`mt-4 grid gap-5 ${showMedia ? "sm:grid-cols-[minmax(0,1fr)_180px]" : ""}`}>
        {/* Verse text */}
        <div className="space-y-2">
          <p className="text-[11px] font-semibold text-[var(--text-faint)]">
            {hukamnama.raag ?? ""}
            {hukamnama.raag && hukamnama.writer ? " · " : ""}
            {hukamnama.writer ?? ""}
          </p>
          <p dir="auto" lang="pa" className="font-gurmukhi text-lg leading-loose text-[var(--text)]">
            {hukamnama.lines.slice(0, 4).map((l) => l.gurmukhi).join(" ")}
          </p>
          {hukamnama.lines[0]?.translations.en && (
            <p className="text-xs leading-relaxed text-[var(--text-secondary)]">
              {hukamnama.lines[0].translations.en}
            </p>
          )}
          {/* Official SGPC audio — the actual daily media hs.sgpc.net publishes */}
          {(hukamnama.sgpcAudio || hukamnama.sgpcKathaAudio) && (
            <div className="space-y-2 pt-2">
              {hukamnama.sgpcAudio && (
                <div>
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-[var(--text-faint)]">
                    Hukamnama Audio (SGPC)
                  </p>
                  <audio controls preload="none" src={hukamnama.sgpcAudio} className="w-full" />
                </div>
              )}
              {hukamnama.sgpcKathaAudio && (
                <div>
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-[var(--text-faint)]">
                    Katha Audio (SGPC)
                  </p>
                  <audio controls preload="none" src={hukamnama.sgpcKathaAudio} className="w-full" />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Official SGPC image (legacy) — hidden automatically on load failure
            so a blocked hotlink never leaves a broken-image icon when deployed */}
        {hukamnama.sgpcImage && !imgFailed && (
          <a
            href={hukamnama.sgpcPage}
            target="_blank"
            rel="noopener noreferrer"
            className="relative mx-auto block w-[180px] overflow-hidden rounded-lg border border-[var(--border)]"
            title="Official SGPC Hukamnama"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={hukamnama.sgpcImage}
              alt="Official SGPC Daily Hukamnama"
              loading="lazy"
              decoding="async"
              width={180}
              height={240}
              onError={() => setImgFailed(true)}
              className="h-auto w-full object-cover"
            />
          </a>
        )}
      </div>

      {/* Attribution + source links */}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border-subtle)] pt-3">
        <p className="text-[11px] text-[var(--text-faint)]">Source: {hukamnama.sourceNote}</p>
        <div className="flex items-center gap-3">
          <a
            href={hukamnama.sgpcPage}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--accent)] hover:underline"
          >
            <span>SGPC Website</span>
            <ExternalLink size={12} />
          </a>
          <Link
            href={`/ang/${hukamnama.ang}`}
            className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--accent)] hover:underline"
          >
            <span>Read Ang {hukamnama.ang}</span>
            <ArrowRight size={12} />
          </Link>
        </div>
      </div>
    </section>
  );
}