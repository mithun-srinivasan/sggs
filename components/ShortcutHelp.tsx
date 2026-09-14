/**
 * components/ShortcutHelp.tsx
 * ---------------------------------------------------------------------------
 * The keyboard-shortcut help modal (feature 23): press `?` anywhere to open a
 * full-screen list of every shortcut the app understands.
 *
 * The global `?` key handler lives here too, so the modal works on every page
 * without wiring a handler into each screen's components.
 */

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Keyboard } from "lucide-react";
import { SHORTCUTS } from "@/lib/shortcuts";

export default function ShortcutHelp() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  // -- Global keyboard listener: `?` help + single-letter navigation ----------

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      // Never hijack keys while the user is typing in a form field.
      const target = event.target;
      const isEditable =
        target instanceof HTMLElement &&
        (target.isContentEditable ||
          ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));

      if (event.key === "Escape") {
        setOpen(false);
        return;
      }
      if (isEditable) return;
      if (event.altKey || event.ctrlKey || event.metaKey) return;

      switch (event.key) {
        case "?":
          event.preventDefault();
          setOpen((o) => !o);
          break;
        case "h":
          router.push("/");
          break;
        case "b":
          router.push("/bookmarks");
          break;
        case "s":
          router.push("/search");
          break;
        case "f":
          if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(() => {});
          } else {
            document.exitFullscreen().catch(() => {});
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [router]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={() => setOpen(false)}
      role="dialog"
      aria-modal="true"
      aria-label="Keyboard shortcuts"
    >
      <div
        className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-popover)] animate-in fade-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center gap-2">
          <Keyboard size={18} className="text-[var(--accent)]" />
          <h2 className="text-sm font-bold text-[var(--text)]">Keyboard Shortcuts</h2>
        </div>

        <ul className="space-y-3">
          {SHORTCUTS.map(({ keys, description }) => (
            <li key={keys} className="flex items-center justify-between gap-4 text-xs">
              <span className="text-[var(--text-muted)]">{description}</span>
              <kbd className="rounded-md border border-[var(--border)] bg-[var(--bg)] px-2 py-1 font-mono text-[11px] font-semibold text-[var(--accent)]">
                {keys}
              </kbd>
            </li>
          ))}
        </ul>

        <button
          onClick={() => setOpen(false)}
          autoFocus
          className="mt-6 w-full rounded-lg bg-[var(--accent)] py-2.5 text-xs font-semibold text-white transition hover:opacity-90 active:scale-[0.97]"
        >
          Close (Esc)
        </button>
      </div>
    </div>
  );
}