/**
 * components/BookmarksProvider.tsx
 * ---------------------------------------------------------------------------
 * React context + provider for user-saved verse bookmarks.
 *
 * On mount it hydrates from `localStorage` (`sgs-reader-bookmarks`) and then
 * debounces writes (500 ms) back to storage on every change.  A `Set` ref
 * of verse ids is kept in lock-step with the array state so that `isBookmarked`
 * lookups are O(1) on every render.
 *
 * Consume with the `useBookmarks()` hook from any client component.
 */

"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import type { Bookmark } from "@/lib/types";

/** localStorage key where bookmarks are persisted. */
const STORAGE_KEY = "sgs-reader-bookmarks";

/** The public API of this context: bookmark state + actions + import/export. */
interface BookmarksContextValue {
  bookmarks: Bookmark[];
  isBookmarked: (verseId: string) => boolean;
  toggleBookmark: (b: Omit<Bookmark, "savedAt">) => void;
  removeBookmark: (verseId: string) => void;
  exportBookmarks: () => void;
  importBookmarks: (json: string) => boolean;
}

/** Internal context — `null` before the provider is mounted. */
const BookmarksContext = createContext<BookmarksContextValue | null>(null);

export function BookmarksProvider({ children }: { children: ReactNode }) {
  /** Ordered list of bookmarks (newest first). */
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);

  /** Guards against writing defaults TO localStorage before hydration. */
  const [hydrated, setHydrated] = useState(false);

  /** Ref mirror — always points to the latest bookmarks for persist callbacks. */
  const bookmarksRef = useRef<Bookmark[]>([]);

  /** Debounce timer handle. */
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // -- Hydration: read once from localStorage on mount -----------------------

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setBookmarks(JSON.parse(raw));
    } catch {
      // Malformed storage is silently ignored.
    } finally {
      setHydrated(true);
    }
  }, []);

  // -- Keep ref mirror current so persist callbacks read latest data ----------

  useEffect(() => {
    if (!hydrated) return;
    bookmarksRef.current = bookmarks;
  }, [bookmarks, hydrated]);

  // -- Debounced persistence -------------------------------------------------

  const persistBookmarks = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarksRef.current));
    } catch {
      // Storage quota exceeded or unavailable.
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(persistBookmarks, 500);
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [bookmarks, hydrated, persistBookmarks]);

  // -- Set ref for O(1) isBookmarked checks ---------------------------------

  /** Maintains a `Set` of verse ids that stays in sync with `bookmarks`. */
  const bookmarkSet = useRef<Set<string>>(new Set(bookmarks.map((b) => b.verseId)));

  useEffect(() => {
    bookmarkSet.current = new Set(bookmarks.map((b) => b.verseId));
  }, [bookmarks]);

  /** Returns `true` if the given verse id is currently bookmarked. */
  const isBookmarked = useCallback(
    (verseId: string) => bookmarkSet.current.has(verseId),
    []
  );

  /**
   * Toggles a bookmark: if it already exists it is removed; if not, it is
   * prepended (newest-first) with `savedAt` stamped to `Date.now()`.
   */
  const toggleBookmark = useCallback(
    (b: Omit<Bookmark, "savedAt">) => {
      setBookmarks((prev) => {
        const exists = prev.some((x) => x.verseId === b.verseId);
        const next = exists
          ? prev.filter((x) => x.verseId !== b.verseId)
          : [{ ...b, savedAt: Date.now() }, ...prev];
        // Update the Set ref synchronously so the next render is consistent.
        bookmarkSet.current = new Set(next.map((x) => x.verseId));
        return next;
      });
    },
    []
  );

  /** Removes a single bookmark by its verse id. */
  const removeBookmark = useCallback((verseId: string) => {
    setBookmarks((prev) => {
      const next = prev.filter((x) => x.verseId !== verseId);
      bookmarkSet.current = new Set(next.map((x) => x.verseId));
      return next;
    });
  }, []);

  // -- JSON export / import --------------------------------------------------

  /**
   * Exports all bookmarks as a timestamped JSON file download.
   * Creates a temporary `<a>` element, clicks it, then revokes the object URL.
   */
  const exportBookmarks = useCallback(() => {
    const data = JSON.stringify(bookmarksRef.current, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `sggs-reader-bookmarks-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  }, []);

  /**
   * Imports bookmarks from a raw JSON string.
   * Validates that the input is an array of objects with the required fields,
   * then merges any new verses (by verseId) with the existing list.
   *
   * @returns `true` on success, `false` on any validation/parse error.
   */
  const importBookmarks = useCallback((json: string): boolean => {
    try {
      const parsed = JSON.parse(json);
      if (!Array.isArray(parsed)) return false;

      // Validate the shape of every item in the array.
      const valid = parsed.every(
        (item: unknown) =>
          typeof item === "object" &&
          item !== null &&
          "verseId" in item &&
          "angNumber" in item &&
          "gurmukhiSnippet" in item
      );
      if (!valid) return false;

      const imported = parsed as Bookmark[];
      setBookmarks((prev) => {
        const existingIds = new Set(prev.map((b) => b.verseId));
        const merged = [
          // Imported items that are not already present, with safe defaults.
          ...imported
            .filter((b) => !existingIds.has(b.verseId))
            .map((b) => ({ ...b, savedAt: b.savedAt ?? Date.now() })),
          ...prev,
        ];
        bookmarkSet.current = new Set(merged.map((b) => b.verseId));
        return merged;
      });
      return true;
    } catch {
      return false; // malformed JSON
    }
  }, []);

  return (
    <BookmarksContext.Provider
      value={{ bookmarks, isBookmarked, toggleBookmark, removeBookmark, exportBookmarks, importBookmarks }}
    >
      {children}
    </BookmarksContext.Provider>
  );
}

/**
 * Accessor hook for the bookmarks context.
 * Throws if called outside a `<BookmarksProvider>` tree.
 */
export function useBookmarks() {
  const ctx = useContext(BookmarksContext);
  if (!ctx) throw new Error("useBookmarks must be used within BookmarksProvider");
  return ctx;
}