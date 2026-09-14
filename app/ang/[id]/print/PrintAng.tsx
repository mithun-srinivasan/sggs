/**
 * app/ang/[id]/PrintAng.tsx
 * ---------------------------------------------------------------------------
 * Client-side actions for the print/PDF page (feature 15): a "Print / Save PDF"
 * button (triggers the browser print dialog) and a "Download .txt" button
 * (feature 16) that writes the whole Ang as a plain-text file via
 * `lib/downloadAng.ts`.
 */

"use client";

import { useState } from "react";
import { Printer, FileDown, Check, ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { VerseLine } from "@/lib/types";
import { angToText, downloadText } from "@/lib/downloadAng";

export default function PrintAng({
  angNumber,
  lines,
}: {
  angNumber: number;
  lines: VerseLine[];
}) {
  const [downloaded, setDownloaded] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const text = angToText(angNumber, lines, true, ["en", "pu"]);
    downloadText(`sggs-ang-${angNumber}.txt`, text);
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2500);
  };

  return (
    <header className="print-hide border-b border-[var(--border)] bg-[var(--bg)]">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3 sm:px-6">
        <span className="text-xs font-semibold text-[var(--text-muted)]">
          Print Preview — Ang {angNumber}
        </span>
        <div className="flex items-center gap-2">
          <Link
            href={`/ang/${angNumber}`}
            className="flex h-9 items-center gap-1.5 rounded-lg border border-[var(--border)] px-3 text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text)] transition"
          >
            <ArrowLeft size={14} />
            <span>Back</span>
          </Link>
          <button
            onClick={handleDownload}
            aria-label="Download Ang as text"
            title="Download as .txt"
            className="flex h-9 items-center gap-1.5 rounded-lg border border-[var(--border)] px-3 text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--accent)] transition"
          >
            {downloaded ? <Check size={14} /> : <FileDown size={14} />}
            <span>{downloaded ? "Saved" : ".txt"}</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex h-9 items-center gap-1.5 rounded-lg bg-[var(--accent)] px-4 text-xs font-semibold text-white transition hover:opacity-90 active:scale-[0.97]"
          >
            <Printer size={14} />
            <span>Print / Save PDF</span>
          </button>
        </div>
      </div>
    </header>
  );
}