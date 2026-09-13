"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useEffect, type FormEvent } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Settings2,
  Search,
  Bookmark,
  Home,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { MAX_ANG, MIN_ANG } from "@/lib/types";
import { clampAng } from "@/lib/data";
import ReaderControls from "./ReaderControls";

export default function NavigationBar({ angNumber }: { angNumber: number }) {
  const router = useRouter();
  const [inputValue, setInputValue] = useState(String(angNumber));
  const [controlsOpen, setControlsOpen] = useState(false);
  const [visible, setVisible] = useState(true);
  const [prevScrollY, setPrevScrollY] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    setInputValue(String(angNumber));
    try {
      localStorage.setItem("sggs_last_ang", String(angNumber));
    } catch {
      // Storage fallback
    }
  }, [angNumber]);

  // Full Screen change listener
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  // Scroll-aware auto hide/show for distraction-free reading
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (controlsOpen) {
        setVisible(true);
        return;
      }
      if (currentScrollY < 40) {
        setVisible(true);
      } else if (currentScrollY > prevScrollY + 5) {
        setVisible(false);
      } else if (currentScrollY < prevScrollY - 5) {
        setVisible(true);
      }
      setPrevScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [prevScrollY, controlsOpen]);

  const goTo = (n: number) => {
    const clamped = clampAng(n);
    router.push(`/ang/${clamped}`);
  };

  const handleGoSubmit = (e: FormEvent) => {
    e.preventDefault();
    const n = parseInt(inputValue, 10);
    goTo(Number.isNaN(n) ? angNumber : n);
  };

  return (
    <header
      className={`fixed top-0 inset-x-0 z-30 transition-transform duration-300 ease-out ${
        visible ? "translate-y-0" : "-translate-y-full"
      } glass-nav-pinned border-b border-[var(--border)]`}
    >
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-2 px-3 py-2.5 sm:px-6">
        {/* Left: Home & Prev */}
        <div className="flex items-center gap-1">
          <Link
            href="/"
            aria-label="Home"
            title="Home"
            className="flex h-11 w-11 items-center justify-center rounded-xl text-[var(--text-muted)] transition-colors hover:text-[var(--text)] hover:bg-[var(--surface-hover)] active:scale-[0.97]"
          >
            <Home size={18} />
          </Link>

          <button
            onClick={() => goTo(angNumber - 1)}
            disabled={angNumber <= MIN_ANG}
            aria-label="Previous Ang"
            title="Previous Ang"
            className="flex h-11 w-11 items-center justify-center rounded-xl text-[var(--text-muted)] transition-colors hover:text-[var(--text)] hover:bg-[var(--surface-hover)] disabled:opacity-20 active:scale-[0.97]"
          >
            <ChevronLeft size={20} />
          </button>
        </div>

        {/* Center: Slim Ang Input */}
        <form onSubmit={handleGoSubmit} className="flex items-center gap-1.5">
          <span className="text-xs font-medium text-[var(--text-muted)]">Ang</span>
          <input
            type="number"
            min={MIN_ANG}
            max={MAX_ANG}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onBlur={() => setInputValue(String(angNumber))}
            className="h-9 w-14 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-center text-xs font-semibold text-[var(--text)] outline-none focus:border-[var(--accent)]"
            aria-label="Go to Ang number"
          />
          <span className="text-xs text-[var(--text-faint)]">/ {MAX_ANG}</span>
        </form>

        {/* Right Tools */}
        <div className="flex items-center gap-0.5 sm:gap-1">
          {/* Full Screen Toggle */}
          <button
            onClick={toggleFullscreen}
            aria-label={isFullscreen ? "Exit Full Screen" : "Full Screen Mode"}
            title={isFullscreen ? "Exit Full Screen" : "Full Screen Mode"}
            className="flex h-11 w-11 items-center justify-center rounded-xl text-[var(--text-muted)] transition-colors hover:text-[var(--text)] hover:bg-[var(--surface-hover)] active:scale-[0.97]"
          >
            {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>

          <Link
            href="/search"
            aria-label="Search"
            title="Search Gurbani"
            className="flex h-11 w-11 items-center justify-center rounded-xl text-[var(--text-muted)] transition-colors hover:text-[var(--text)] hover:bg-[var(--surface-hover)] active:scale-[0.97]"
          >
            <Search size={18} />
          </Link>

          <Link
            href="/bookmarks"
            aria-label="Bookmarks"
            title="Saved Bookmarks"
            className="flex h-11 w-11 items-center justify-center rounded-xl text-[var(--text-muted)] transition-colors hover:text-[var(--text)] hover:bg-[var(--surface-hover)] active:scale-[0.97]"
          >
            <Bookmark size={18} />
          </Link>

          <button
            onClick={() => setControlsOpen((o) => !o)}
            aria-label="Reader Settings"
            aria-expanded={controlsOpen}
            title="Settings & Display"
            className={`flex h-11 w-11 items-center justify-center rounded-xl transition-all active:scale-[0.97] ${
              controlsOpen
                ? "bg-[var(--accent)] text-white"
                : "text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-hover)]"
            }`}
          >
            <Settings2 size={18} />
          </button>

          <button
            onClick={() => goTo(angNumber + 1)}
            disabled={angNumber >= MAX_ANG}
            aria-label="Next Ang"
            title="Next Ang"
            className="flex h-11 w-11 items-center justify-center rounded-xl text-[var(--text-muted)] transition-colors hover:text-[var(--text)] hover:bg-[var(--surface-hover)] disabled:opacity-20 active:scale-[0.97]"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Popover Settings Panel */}
      {controlsOpen && (
        <div className="mx-auto max-w-3xl px-4 pb-3">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-popover)] transition-all animate-in fade-in slide-in-from-top-2">
            <ReaderControls />
          </div>
        </div>
      )}
    </header>
  );
}
