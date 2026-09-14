/**
 * components/NotesProvider.tsx
 * ---------------------------------------------------------------------------
 * Context + provider for **verse notes** (feature 10): users can attach a short
 * reflection/annotation to any verse.  Notes are stored per verse id under
 * `localStorage` (`sgs-reader-notes`), hydrated on mount, and persisted with a
 * 500 ms debounce — the same pattern as the bookmarks provider.
 *
 * Consume with `useVerseNotes()`.
 */

"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
  type ReactNode,
} from "react";
import type { VerseNote } from "@/lib/types";

/** localStorage key under which verse notes are persisted. */
const STORAGE_KEY = "sgs-reader-notes";

/** Public context API. */
interface NotesContextValue {
  notes: VerseNote[];
  /** Returns the note attached to a verse, or `undefined`. */
  getNote: (verseId: string) => VerseNote | undefined;
  /** Saves a note (replaces any existing note for that verse). */
  setNote: (verseId: string, text: string) => void;
  /** Deletes the note for a verse, if any. */
  removeNote: (verseId: string) => void;
}

const NotesContext = createContext<NotesContextValue | null>(null);

export function NotesProvider({ children }: { children: ReactNode }) {
  const [notes, setNotes] = useState<VerseNote[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const notesRef = useRef<VerseNote[]>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // -- Hydration -------------------------------------------------------------

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- deliberate SSR-safe post-mount hydration from localStorage
        setNotes(parsed);
      }
      }
    } catch {
      // corrupted storage is ignored
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    notesRef.current = notes;
  }, [notes, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(notesRef.current));
      } catch {
        // quota / private mode
      }
    }, 500);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [notes, hydrated]);

  const getNote = useCallback(
    (verseId: string) => notes.find((n) => n.verseId === verseId),
    [notes]
  );

  const setNote = useCallback((verseId: string, text: string) => {
    const trimmed = text.trim();
    setNotes((prev) => {
      if (!trimmed) return prev.filter((n) => n.verseId !== verseId);
      const existing = prev.find((n) => n.verseId === verseId);
      if (existing) {
        return prev.map((n) =>
          n.verseId === verseId ? { ...n, text: trimmed, updatedAt: Date.now() } : n
        );
      }
      return [{ verseId, text: trimmed, updatedAt: Date.now() }, ...prev];
    });
  }, []);

  const removeNote = useCallback((verseId: string) => {
    setNotes((prev) => prev.filter((n) => n.verseId !== verseId));
  }, []);

  const value = useMemo(
    () => ({ notes, getNote, setNote, removeNote }),
    [notes, getNote, setNote, removeNote]
  );

  return (
    <NotesContext.Provider value={value}>
      {children}
    </NotesContext.Provider>
  );
}

export function useVerseNotes() {
  const ctx = useContext(NotesContext);
  if (!ctx) throw new Error("useVerseNotes must be used within NotesProvider");
  return ctx;
}