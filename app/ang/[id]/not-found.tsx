/**
 * app/ang/[id]/not-found.tsx
 * ---------------------------------------------------------------------------
 * Custom 404 page shown when a user navigates to an invalid Ang number
 * (e.g. `/ang/0`, `/ang/1431`, or `/ang/abc`).
 *
 * Displays the Gurmukhi text for "Ang Nahi Milia" (Ang not found), echoes the
 * attempted address, and offers recovery: the nearest valid Ang (clamped into
 * 1–1430 when the attempt parses as a number), back navigation, and Ang 1.
 */

"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { MAX_ANG, MIN_ANG } from "@/lib/types";

export default function NotFound() {
  const pathname = usePathname();
  const router = useRouter();

  // The attempted id is the last path segment (e.g. "1431" from "/ang/1431").
  const attempted = pathname?.split("/").filter(Boolean).pop() ?? "";
  const parsed = parseInt(attempted, 10);
  // Clamp inline (lib/data.ts is server-only — it uses React `cache` — so the
  // shared `clampAng` helper cannot be imported into this client component).
  const nearest = Number.isNaN(parsed) ? null : Math.min(MAX_ANG, Math.max(MIN_ANG, parsed));

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-[var(--bg)] px-6 text-center text-[var(--text)]">
      <h1 className="font-gurmukhi text-2xl">ਅੰਗ ਨਹੀਂ ਮਿਲਿਆ</h1>
      <p className="text-[var(--text-muted)]">
        That Ang number is out of range. Sri Guru Granth Sahib Ji spans Ang {MIN_ANG} to {MAX_ANG}.
      </p>
      {attempted && (
        <p className="text-xs text-[var(--text-faint)]">
          You asked for <span className="font-mono">/ang/{attempted}</span>
          {nearest !== null && ` — the nearest valid Ang is ${nearest}`}.
        </p>
      )}
      <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
        {nearest !== null && (
          <Link
            href={`/ang/${nearest}`}
            className="mt-2 rounded-full bg-[var(--accent)] px-5 py-2 text-sm font-medium text-white transition hover:opacity-90"
          >
            Go to Ang {nearest}
          </Link>
        )}
        <button
          onClick={() => router.back()}
          className="mt-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-5 py-2 text-sm font-medium text-[var(--text)] transition hover:bg-[var(--surface-hover)]"
        >
          Go back
        </button>
        <Link
          href="/ang/1"
          className="mt-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-5 py-2 text-sm font-medium text-[var(--text)] transition hover:bg-[var(--surface-hover)]"
        >
          Go to Ang 1
        </Link>
      </div>
    </div>
  );
}
