/**
 * app/search/actions.ts
 * ---------------------------------------------------------------------------
 * A thin server action wrapper around `searchGurbani()`.
 *
 * Runs on the server (marked "use server") so the full-text search request
 * to BaniDB is never exposed to the browser's network stack directly.
 * The client component (`app/search/page.tsx`) calls `runSearch(term)`.
 */

"use server";

import { searchGurbani } from "@/lib/data";
import type { SearchResult } from "@/lib/types";

/**
 * Delegates the search to the data layer, preserving which side of the text
 * to match (`pa` → full-word Gurmukhi, `en` → English translations).
 * Kept in a separate file to comply with Next.js server-action conventions
 * (server actions must live in their own modules).
 */
export async function runSearch(term: string, lang: "pa" | "en" = "pa"): Promise<SearchResult[]> {
  return searchGurbani(term, lang);
}