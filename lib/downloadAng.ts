/**
 * lib/downloadAng.ts
 * ---------------------------------------------------------------------------
 * Client-side helper that builds a plain-text document for an Ang and triggers
 * a browser download.  Used by the "Download Ang as text" feature (print page).
 *
 * The generated layout follows the verse-card order:
 *   Gurmukhi
 *   Transliteration (optional)
 *   Translation    (optional)
 *   Blank line
 */

import type { VerseLine } from "./types";

/** The available translation languages to include in the download. */
export type DownloadLang = "en" | "pu";

/**
 * Renders a full Ang as readable plain text.
 *
 * @param angNumber  the Ang number (appears in the header/attribution)
 * @param lines      the ordered verses of the Ang
 * @param includeTranslit  whether to include transliteration (default true)
 * @param includes  array of translation languages to include (default ["en"])
 * @returns the complete text document
 */
export function angToText(
  angNumber: number,
  lines: VerseLine[],
  includeTranslit = true,
  includes: DownloadLang[] = ["en"],
): string {
  const parts: string[] = [
    `Sri Guru Granth Sahib Ji — Ang ${angNumber}`,
    "=".repeat(46),
    "",
  ];

  for (const line of lines) {
    parts.push(line.gurmukhi);
    if (includeTranslit && line.transliteration) parts.push(line.transliteration);
    for (const lang of includes) {
      const t = line.translations[lang === "pu" ? "pu" : "en"];
      if (t) parts.push(t);
    }
    parts.push(""); // blank separator between verses
  }

  return parts.join("\n");
}

/**
 * Triggers a client-side download of the given text as a `.txt` file.
 * Uses a temporary `<a download>` element and revokes the URL afterwards.
 *
 * @param filename  e.g. `ang-1.txt`
 * @param text      the file contents
 */
export function downloadText(filename: string, text: string): void {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}