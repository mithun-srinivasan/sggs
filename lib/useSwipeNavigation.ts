"use client";

import { useRef, type TouchEvent } from "react";

interface SwipeHandlers {
  onTouchStart: (e: TouchEvent) => void;
  onTouchMove: (e: TouchEvent) => void;
  onTouchEnd: () => void;
}

/**
 * Horizontal swipe detector for Prev/Next Ang navigation on touch devices.
 * Ignores swipes that are more vertical than horizontal (so page scrolling
 * is never hijacked), and requires a minimum distance + speed to avoid
 * accidental triggers while reading.
 */
export function useSwipeNavigation(onSwipeLeft: () => void, onSwipeRight: () => void): SwipeHandlers {
  const startX = useRef(0);
  const startY = useRef(0);
  const startTime = useRef(0);
  const deltaX = useRef(0);
  const deltaY = useRef(0);

  const onTouchStart = (e: TouchEvent) => {
    const t = e.touches[0];
    startX.current = t.clientX;
    startY.current = t.clientY;
    startTime.current = Date.now();
    deltaX.current = 0;
    deltaY.current = 0;
  };

  const onTouchMove = (e: TouchEvent) => {
    const t = e.touches[0];
    deltaX.current = t.clientX - startX.current;
    deltaY.current = t.clientY - startY.current;
  };

  const onTouchEnd = () => {
    const elapsed = Date.now() - startTime.current;
    const absX = Math.abs(deltaX.current);
    const absY = Math.abs(deltaY.current);

    const isHorizontal = absX > absY * 1.5;
    const isFarEnough = absX > 60;
    const isFastEnough = elapsed < 600;

    if (isHorizontal && isFarEnough && isFastEnough) {
      if (deltaX.current < 0) onSwipeLeft();
      else onSwipeRight();
    }
  };

  return { onTouchStart, onTouchMove, onTouchEnd };
}
