# Sri Guru Granth Sahib Ji Reader

A focused, verse-by-verse web reader for Sri Guru Granth Sahib Ji. The app
supports all 1,430 Angs, Unicode Gurmukhi, optional transliteration and
translations, saved verses (with JSON export/import), Gurbani search,
offline support (PWA), a daily Hukamnama sourced from the official SGPC
website, reading progress/streaks, highlights, notes, and more.

## Technology

- Next.js 16.3.5 with the App Router (statically generated for all 1430 Angs)
- React 19
- TypeScript (strict mode)
- Tailwind CSS v4 via `@tailwindcss/postcss`
- Lucide React icons
- BaniDB v2 public API for scripture data
- Official SGPC website (`sgpc.net/hukamnama/`) for the Daily Hukamnama scan

## Requirements

- Node.js 20 or newer
- npm
- Internet access for BaniDB data (fetched at build time, cached forever) and
  for the Daily Hukamnama (fetched at runtime, cached six hours)

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The home page provides the
Daily Hukamnama, resume/random/quick-jump entry points, your reading journey,
upcoming Gurpurabs, search, bookmarks, and a Learn-Gurmukhi drill.

To create and run a production build:

```bash
npm run build
npm run start
```

### Available scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the local development server |
| `npm run build` | Build and statically generate all 1430 Ang pages |
| `npm run start` | Serve the production build locally |
| `npm run typecheck` | Run the TypeScript compiler in noEmit mode |
| `npm run test` | Run the Playwright end-to-end test suite |

## Features

### Ang reader

- Reads Ang 1 through Ang 1430 at `/ang/[id]`.
- Fetches Ang data from BaniDB's `/v2/angs/:id` endpoint at build time.
- Displays Unicode Gurmukhi, transliteration, writer metadata, and line numbers.
- Shows English, Punjabi, or parallel English + Punjabi translations.
- Optional Kanji/commentary block (Prof. Sahib Singh's *Guru Granth Darpan*).
- Copies a verse (with attribution) to the clipboard.
- Shares a verse as a downloadable PNG share card.
- Saves individual verses as bookmarks; highlights verses in four colours.
- Attaches private notes/reflections to any verse.
- Lareevar reading mode — blends Gurmukhi words into a continuous flow.
- Continuous reading — the next Ang is appended inline at the bottom.
- Focus mode — hides everything except the Gurmukhi scripture.
- Memorisation mode — blurs the verse until tapped to reveal.
- Tap-to-transliterate — tap a Gurmukhi word to reveal its Romanisation.
- Transliteration script selection (English / Hindi / Urdu / IPA).
- Previous/Next controls in top and bottom navigation bars.
- Horizontal touch swipes for previous/next Ang on touch devices.
- Auto-scroll to previous Ang (scroll to top) and next Ang (scroll to bottom).
- Print / Save-as-PDF view at `/ang/[id]/print`, plus a `.txt` download.

### Reader preferences

The settings panel supports:

- Showing or hiding transliteration / translations
- Selecting English or Punjabi translations, or parallel mode
- Increasing or decreasing text size (80%–160%)
- Light, dark, and sepia themes
- Auto theme (follows system preference and time of day)
- OLED pure-black mode and a custom accent colour
- Continuous, focus, and memorisation reading modes
- Kanji commentary and tap-to-transliterate toggles
- Transliteration script selection

Preferences are stored in `localStorage` under `sgs-reader-prefs`.

### Daily Hukamnama

- Fetched server-side via a server action (`app/actions.ts`).
- The official SGPC Hukamnama scan image and page link are scraped from
  `https://www.sgpc.net/hukamnama/`, satisfying the "source from SGPC" rule.
- The verse text is paired from BaniDB's `/v2/hukamnamas/:y/:m/:d` endpoint,
  which mirrors the same SGPC daily selection made at Sri Darbar Sahib.
- Cached for six hours (`revalidate: 21600`).

### Reading journey

- Reading-progress bar tracking completed Angs out of 1,430.
- Daily reading streak and total days read.
- Recently-read history.
- A Sehaj-Paath reading plan (7 / 30 / 90 / 365 days) with a daily Ang range.
- All stored in `localStorage` under `sgs-reader-progress`.

### Search and bookmarks

- `/search` searches BaniDB by Gurmukhi or English text.
- Quick-search suggestion chips for common terms.
- Search results link directly to the matching Ang and verse fragment.
- `/bookmarks` lists saved verses with date stamps and deep links.
- Folder/tag support with a tag filter and a print view.
- JSON export and import for backup and transfer between devices.
- Bookmarks are stored locally under `sgs-reader-bookmarks`.

### Home page

The home page at `/` includes:

- The Daily Hukamnama card (SGPC scan + text)
- Your reading journey (progress, streak, history, plan)
- Upcoming Gurpurabs (Nanakshahi calendar)
- Resume the last Ang opened in the browser, random Ang, and quick-jump slider
- Quick links to major scripture sections (31 Raags)
- A rotating selection of featured sacred verses
- A Learn-Gurmukhi call to action

### Other pages and features

- `/learn` — a multiple-choice Gurmukhi akhar practice drill.
- `/ang/[id]/print` — print/PDF layout with a `.txt` download.
- Keyboard shortcuts (press `?`): `←/→`, `h`, `b`, `s`, `f`, `Esc`.
- PWA install + offline support via `app/manifest.ts` and `public/sw.js`.

## Data and caching

The BaniDB integration lives in [`lib/data.ts`](lib/data.ts). It maps the API
response into the application's `Ang` and `VerseLine` types with null-guards
for missing writers, translations, and transliterations, and exposes
`getHukamnama()` for the Daily Hukamnama.

`app/ang/[id]/page.tsx` defines static parameters for all 1,430 Angs via
`generateStaticParams`. The Ang data is fetched during `npm run build` and
cached indefinitely. The build can therefore take longer than a typical
small Next.js build.

The search endpoint uses uncached requests because results are dynamic.

## Project structure

```text
app/
  layout.tsx                     Root layout, fonts, metadata, and providers
  page.tsx                       Home page
  manifest.ts                    PWA web-app manifest
  actions.ts                     Server action: getTodaysHukamnama
  globals.css                    Global styles, theme tokens, focus/print CSS
  ang/[id]/
    page.tsx                     Ang reader page and static route generation
    actions.ts                   Server action: getAngForReader (continuous mode)
    ClientAngReader.tsx          Client reader chaining Angs (continuous mode)
    AngStartSentinel.tsx         Scroll-to-top → previous Ang detection
    AngEndSentinel.tsx           Scroll-to-bottom → next Ang / load more
    BottomNav.tsx                Scroll-aware fixed bottom navigation
    not-found.tsx                Custom 404 for out-of-range Ang numbers
    print/
      page.tsx                   Print / PDF layout for an Ang
      PrintAng.tsx               Print + download .txt controls
  bookmarks/page.tsx             Saved verses list with tags, print, import/export
  learn/page.tsx                 Learn-Gurmukhi practice drill
  search/
    page.tsx                     Search interface
    actions.ts                   Server action wrapping BaniDB search
components/
  NavigationBar.tsx              Top navigation bar (scroll-aware, auto-hide)
  ReaderControls.tsx             Display, mode, language, size, and theme controls
  ReaderPrefsProvider.tsx        Reader preferences context (localStorage)
  BookmarksProvider.tsx          Bookmark context incl. tags (localStorage)
  ProgressProvider.tsx           Progress, streaks, history, and plan context
  NotesProvider.tsx              Verse-notes context (localStorage)
  HighlightsProvider.tsx         Multi-colour highlight context (localStorage)
  VerseCard.tsx                  Single verse: text, translation, notes, share
  HukamnamaCard.tsx              Daily Hukamnama card (SGPC + BaniDB)
  ReadingJourney.tsx             Progress/streak/history/plan card
  GurpurabCalendar.tsx           Upcoming Gurpurabs card
  SwipeContainer.tsx             Touch-swipe wrapper for Ang navigation
  PageTransition.tsx             Crossfade overlay for page transitions
  ShortcutHelp.tsx               `?` keyboard-shortcut modal + global shortcuts
  ServiceWorkerRegistrar.tsx     Registers the PWA service worker (prod only)
  SikhSymbols.tsx                SVG icons (Khanda emblem)
lib/
  data.ts                        BaniDB fetching, mapping, search, Hukamnama
  types.ts                       Shared TypeScript types and Ang constants
  gurpurabs.ts                   Static Nanakshahi Gurpurab table + helpers
  gurmukhi.ts                    Gurmukhi akhar data for the practice drill
  shortcuts.ts                   Keyboard-shortcut definitions
  downloadAng.ts                 Plain-text rendering + browser download
  useSwipeNavigation.ts          Horizontal swipe detection hook
public/
  sw.js                          Service worker (offline caching)
  icon-192.png, icon-512.png     PWA icons
tests/
  ang-navigation.spec.ts         Playwright tests (navigation + theme)
```

## Routes

| Route | Description |
| --- | --- |
| `/` | Reader home page |
| `/ang/1` through `/ang/1430` | Individual Ang reader pages |
| `/ang/[id]/print` | Print / Save-as-PDF layout |
| `/learn` | Learn-Gurmukhi practice drill |
| `/search` | Gurbani search |
| `/bookmarks` | Saved verses (localStorage) |

Invalid Ang numbers show a custom not-found page linking back to Ang 1.

## Testing

```bash
npm run test        # headless Playwright run (uses Chromium)
npm run test:ui     # Playwright interactive UI mode
```

Tests verify Ang navigation, next-Ang button behaviour, and theme persistence.

## Current limitations

- Bookmarks, preferences, progress, notes, and highlights are browser-local
  and have no account or sync.
- Search depends on the BaniDB service and network availability.
- The Ang data is fetched once at build time and does not update if BaniDB
  corrects an error (a full rebuild is required).
- SGPC publishes the Daily Hukamnama only as an image, so its text is mirrored
  from BaniDB rather than parsed from SGPC directly.

## License and attribution

This project uses the BaniDB API for scripture data and links to the official
SGPC Hukamnama page. Review both providers' current terms and attribution
requirements before deploying the application publicly.
