"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
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
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
  }, [bookmarks, hydrated]);

  const isBookmarked = (verseId: string) =>
    bookmarks.some((b) => b.verseId === verseId);

  const toggleBookmark = (b: Omit<Bookmark, "savedAt">) => {
    setBookmarks((prev) => {
      const exists = prev.some((x) => x.verseId === b.verseId);
      if (exists) return prev.filter((x) => x.verseId !== b.verseId);
      return [{ ...b, savedAt: Date.now() }, ...prev];
    });
  };

  const removeBookmark = (verseId: string) => {
    setBookmarks((prev) => prev.filter((x) => x.verseId !== verseId));
  };

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
