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

const STORAGE_KEY = "sgs-reader-bookmarks";

interface BookmarksContextValue {
  bookmarks: Bookmark[];
  isBookmarked: (verseId: string) => boolean;
  toggleBookmark: (b: Omit<Bookmark, "savedAt">) => void;
  removeBookmark: (verseId: string) => void;
}

const BookmarksContext = createContext<BookmarksContextValue | null>(null);

export function BookmarksProvider({ children }: { children: ReactNode }) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const bookmarksRef = useRef<Bookmark[]>([]);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setBookmarks(JSON.parse(raw));
    } catch {
      // ignore malformed storage
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    bookmarksRef.current = bookmarks;
  }, [bookmarks, hydrated]);

  const persistBookmarks = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarksRef.current));
    } catch {
      // ignore storage errors
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

  const bookmarkSet = useRef<Set<string>>(new Set(bookmarks.map((b) => b.verseId)));

  useEffect(() => {
    bookmarkSet.current = new Set(bookmarks.map((b) => b.verseId));
  }, [bookmarks]);

  const isBookmarked = useCallback(
    (verseId: string) => bookmarkSet.current.has(verseId),
    []
  );

  const toggleBookmark = useCallback(
    (b: Omit<Bookmark, "savedAt">) => {
      setBookmarks((prev) => {
        const exists = prev.some((x) => x.verseId === b.verseId);
        const next = exists
          ? prev.filter((x) => x.verseId !== b.verseId)
          : [{ ...b, savedAt: Date.now() }, ...prev];
        bookmarkSet.current = new Set(next.map((x) => x.verseId));
        return next;
      });
    },
    []
  );

  const removeBookmark = useCallback((verseId: string) => {
    setBookmarks((prev) => {
      const next = prev.filter((x) => x.verseId !== verseId);
      bookmarkSet.current = new Set(next.map((x) => x.verseId));
      return next;
    });
  }, []);

  return (
    <BookmarksContext.Provider
      value={{ bookmarks, isBookmarked, toggleBookmark, removeBookmark }}
    >
      {children}
    </BookmarksContext.Provider>
  );
}

export function useBookmarks() {
  const ctx = useContext(BookmarksContext);
  if (!ctx) throw new Error("useBookmarks must be used within BookmarksProvider");
  return ctx;
}
