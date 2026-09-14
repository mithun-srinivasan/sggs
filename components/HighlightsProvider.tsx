/**
 * components/HighlightsProvider.tsx
 * ---------------------------------------------------------------------------
 * Context + provider for **multi-colour verse highlights** (feature 12).
 *
 * A user can highlight any verse in one of four colours (Saffron, Green, Blue,
 * Rose).  The chosen colour is stored per verse id under `localStorage`
 * (`sgs-reader-highlights`) with the usual hydration + 500 ms debounce so the
 * emphasised pickups persist across sessions.
 *
 * Consume with `useHighlights()`.
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
import type { HighlightColor } from "@/lib/types";

/** localStorage key under which highlights are persisted. */
const STORAGE_KEY = "sgs-reader-highlights";

/** The four pickable highlight colours. */
export const HIGHLIGHT_COLORS: HighlightColor[] = ["saffron", "green", "blue", "rose"];

/** Public context API. */
interface HighlightsContextValue {
  /** Map of verseId → highlight colour. */
  highlights: Record<string, HighlightColor>;
  /** The highlight colour for a verse, or `undefined` when unhighlighted. */
  getHighlight: (verseId: string) => HighlightColor | undefined;
  /** Toggles a colour on a verse; calling again with the same colour removes it. */
  toggleHighlight: (verseId: string, color: HighlightColor) => void;
  /** Removes every highlight (used from the home-page stats card). */
  clearAll: () => void;
}

const HighlightsContext = createContext<HighlightsContextValue | null>(null);

export function HighlightsProvider({ children }: { children: ReactNode }) {
  const [highlights, setHighlights] = useState<Record<string, HighlightColor>>({});
  const [hydrated, setHydrated] = useState(false);
  const ref = useRef<Record<string, HighlightColor>>({});
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- deliberate SSR-safe post-mount hydration from localStorage
        setHighlights(JSON.parse(raw));
      }
    } catch {
      // corrupted storage
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    ref.current = highlights;
  }, [highlights, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(ref.current));
      } catch {
        // ignore
      }
    }, 500);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [highlights, hydrated]);

  const getHighlight = useCallback(
    (verseId: string) => highlights[verseId],
    [highlights]
  );

  const toggleHighlight = useCallback((verseId: string, color: HighlightColor) => {
    setHighlights((prev) => {
      const next = { ...prev };
      if (next[verseId] === color) delete next[verseId];
      else next[verseId] = color;
      return next;
    });
  }, []);

  const clearAll = useCallback(() => setHighlights({}), []);

  const value = useMemo(
    () => ({ highlights, getHighlight, toggleHighlight, clearAll }),
    [highlights, getHighlight, toggleHighlight, clearAll]
  );

  return (
    <HighlightsContext.Provider value={value}>
      {children}
    </HighlightsContext.Provider>
  );
}

export function useHighlights() {
  const ctx = useContext(HighlightsContext);
  if (!ctx) throw new Error("useHighlights must be used within HighlightsProvider");
  return ctx;
}