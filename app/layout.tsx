/**
 * app/layout.tsx
 * ---------------------------------------------------------------------------
 * Root layout for the entire application.
 *
 * Responsibilities:
 *   - Loads the two Google fonts: `Noto Sans Gurmukhi` (for scripture text)
 *     and `Inter` (for UI / body text), injecting their CSS variable classes.
 *   - Provides global metadata (title, description) used by Next.js <head>.
 *   - Mounts the app-wide providers that wrap every page (reader prefs,
 *     bookmarks, reading progress/streaks/history, notes, and highlights),
 *     plus the shortcut-help modal, the crossfade transition overlay, and
 *     the PWA service-worker registrar.
 *   - Includes Vercel Analytics and Speed Insights for production telemetry.
 */

import type { Metadata, Viewport } from "next";
import { Noto_Sans_Gurmukhi, Inter } from "next/font/google";
import { ReaderPrefsProvider } from "@/components/ReaderPrefsProvider";
import { BookmarksProvider } from "@/components/BookmarksProvider";
import { ProgressProvider } from "@/components/ProgressProvider";
import { NotesProvider } from "@/components/NotesProvider";
import { HighlightsProvider } from "@/components/HighlightsProvider";
import PageTransition from "@/components/PageTransition";
import ShortcutHelp from "@/components/ShortcutHelp";
import ServiceWorkerRegistrar from "@/components/ServiceWorkerRegistrar";
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
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  },
  appleWebApp: {
    capable: true,
    title: "SGGS Reader",
    statusBarStyle: "black-translucent",
  },
};

/** Mobile-viewport metadata (safe-area + theme colour for installed PWAs). */
export const viewport: Viewport = {
  themeColor: "#F59E0B",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="theme-light" suppressHydrationWarning>
      <body className={`${gurmukhi.variable} ${inter.variable} font-sans antialiased`}>
        <ReaderPrefsProvider>
          <BookmarksProvider>
            <ProgressProvider>
              <NotesProvider>
                <HighlightsProvider>
                  <PageTransition />
                  <ShortcutHelp />
                  <ServiceWorkerRegistrar />
                  {children}
                </HighlightsProvider>
              </NotesProvider>
            </ProgressProvider>
          </BookmarksProvider>
        </ReaderPrefsProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}