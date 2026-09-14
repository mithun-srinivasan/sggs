/**
 * app/layout.tsx
 * ---------------------------------------------------------------------------
 * Root layout for the entire application.
 *
 * Responsibilities:
 *   - Loads the two Google fonts: `Noto Sans Gurmukhi` (for scripture text)
 *     and `Inter` (for UI / body text), injecting their CSS variable classes.
 *   - Provides global metadata (title, description) used by Next.js <head>.
 *   - Mounts three providers that wrap every page:
 *       1. `ReaderPrefsProvider` — manages theme, font-size, and display prefs
 *       2. `BookmarksProvider`   — manages the user's saved verses
 *       3. `PageTransition`      — listens for crossfade events and renders the overlay
 *   - Includes Vercel Analytics and Speed Insights for production telemetry.
 */

import type { Metadata } from "next";
import { Noto_Sans_Gurmukhi, Inter } from "next/font/google";
import { ReaderPrefsProvider } from "@/components/ReaderPrefsProvider";
import { BookmarksProvider } from "@/components/BookmarksProvider";
import PageTransition from "@/components/PageTransition";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

/**
 * Noto Sans Gurmukhi — loaded for the `gurmukhi` subset only.
 * `display: "swap"` ensures the system font is used while the webfont loads,
 * preventing invisible/overlapping scripture text on fast connections.
 */
const gurmukhi = Noto_Sans_Gurmukhi({
  subsets: ["gurmukhi"],
  weight: ["400", "500", "600"],
  variable: "--font-gurmukhi",
  display: "swap",
});

/** Inter — the primary UI font for English text and navigation. */
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

/** Global SEO metadata applied to every page unless overridden. */
export const metadata: Metadata = {
  title: "Sri Guru Granth Sahib Ji — Ang Reader",
  description: "A radically minimalist, verse-by-verse digital reader for Sri Guru Granth Sahib Ji.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="theme-light" suppressHydrationWarning>
      <body className={`${gurmukhi.variable} ${inter.variable} font-sans antialiased`}>
        <ReaderPrefsProvider>
          <BookmarksProvider>
            <PageTransition />
            {children}
          </BookmarksProvider>
        </ReaderPrefsProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}