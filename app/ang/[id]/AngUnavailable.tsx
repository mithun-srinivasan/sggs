/**
 * app/ang/[id]/AngUnavailable.tsx
 * ---------------------------------------------------------------------------
 * Fallback shown when a VALID Ang number (1–1430) cannot be loaded — the
 * scripture API is unreachable, offline, or returned nothing.
 *
 * Why this exists: the page used to call `notFound()` here too, so a network
 * outage showed "That Ang number is out of range" for a perfectly good Ang.
 * That message is now reserved for genuinely out-of-range numbers; load
 * failures get this retry-oriented card instead.
 */

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { RefreshCw, Home } from "lucide-react";

export default function AngUnavailable({ angNumber }: { angNumber: number }) {
  const router = useRouter();

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 px-6 text-center">
      <h1 className="font-gurmukhi text-2xl">ਅੰਗ ਲੋਡ ਨਹੀਂ ਹੋਇਆ</h1>
      <p className="max-w-md text-sm text-[var(--text-muted)]">
        Ang {angNumber} could not be loaded right now — the scripture library
        may be unreachable or you may be offline. Your Ang number is valid;
        please try again.
      </p>
      <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
        <button
          onClick={() => router.refresh()}
          className="flex min-h-[44px] items-center gap-2 rounded-full bg-[var(--accent)] px-5 py-2 text-sm font-medium text-white transition hover:opacity-90 active:scale-[0.97]"
        >
          <RefreshCw size={15} />
          <span>Try again</span>
        </button>
        <Link
          href="/ang/1"
          className="flex min-h-[44px] items-center rounded-full border border-[var(--border)] bg-[var(--surface)] px-5 py-2 text-sm font-medium text-[var(--text)] transition hover:bg-[var(--surface-hover)] active:scale-[0.97]"
        >
          Go to Ang 1
        </Link>
        <Link
          href="/"
          aria-label="Home"
          title="Home"
          className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] transition hover:text-[var(--text)] hover:bg-[var(--surface-hover)] active:scale-[0.97]"
        >
          <Home size={16} />
        </Link>
      </div>
    </div>
  );
}
