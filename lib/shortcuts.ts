/**
 * lib/shortcuts.ts
 * ---------------------------------------------------------------------------
 * The canonical list of keyboard shortcuts shown in the help modal (press `?`
 * anywhere in the app).  Keeping them in one module means the help dialog and
 * the components that act on them can never drift apart.
 */

import type { Shortcut } from "./types";

/** Every shortcut the app reacts to, with human-readable descriptions. */
export const SHORTCUTS: Shortcut[] = [
  { keys: "← / →", description: "Previous / next Ang (reader)" },
  { keys: "?", description: "Open this keyboard-shortcut help" },
  { keys: "h", description: "Go to the Home page" },
  { keys: "b", description: "Open Saved Bookmarks" },
  { keys: "s", description: "Open Gurbani Search" },
  { keys: "f", description: "Toggle fullscreen (reader)" },
  { keys: "Esc", description: "Close menus & fullscreen" },
];