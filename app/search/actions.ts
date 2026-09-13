"use server";

import { searchGurbani } from "@/lib/data";
import type { SearchResult } from "@/lib/types";

export async function runSearch(term: string): Promise<SearchResult[]> {
  return searchGurbani(term);
}
