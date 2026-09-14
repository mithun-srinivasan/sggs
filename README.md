# Sri Guru Granth Sahib Ji Reader

A focused, verse-by-verse web reader for Sri Guru Granth Sahib Ji. The app
supports all 1,430 Angs, Unicode Gurmukhi, optional transliteration and
translations, saved verses (with JSON export/import), Gurbani search, and
responsive navigation.

## Technology

- Next.js 16.3.5 with the App Router (statically generated for all 1430 Angs)
- React 19
- TypeScript (strict mode)
- Tailwind CSS v4 via `@tailwindcss/postcss`
- Lucide React icons
- BaniDB v2 public API for scripture data

## Requirements

- Node.js 20 or newer
- npm
- Internet access for BaniDB data (fetched at build time, cached forever)

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:localhost:3000](http://localhost:3000). The home page
provides resume, random Ang, quick-jump, search, and reading entry points.

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
- Shows English or Punjabi translation when available.
- Copies a verse (with attribution) to the clipboard.
- Saves individual verses as bookmarks.
- Lareevar reading mode — blends Gurmukhi words into a continuous flow.
- Previous/Next controls in top and bottom navigation bars.
- Horizontal touch swipes for previous/next Ang on touch devices.
- Auto-scroll to previous Ang (scroll to top) and next Ang (scroll to bottom).

### Reader preferences

The settings panel supports:

- Showing or hiding transliteration
- Showing or hiding translations
- Selecting English or Punjabi translations
- Increasing or decreasing text size (80%–160%)
- Light, dark, and sepia themes

Preferences are stored in `localStorage` under `sgs-reader-prefs`.

### Search and bookmarks

- `/search` searches BaniDB by Gurmukhi or English text.
- Quick-search suggestion chips for common terms.
- Search results link directly to the matching Ang and verse fragment.
- `/bookmarks` lists saved verses with date stamps and deep links.
- JSON export and import for backup and transfer between devices.
- Bookmarks are stored locally under `sgs-reader-bookmarks`.

### Home page

The home page at `/` includes:

- Resume the last Ang opened in the browser
- Random Ang navigation
- A slider and number input for jumping to any Ang
- Quick links to major scripture sections (31 Raags)
- A rotating selection of featured sacred verses
- Links to search, bookmarks, and the reader

## Data and caching

The BaniDB integration lives in [`lib/data.ts`](lib/data.ts). It maps the API
response into the application's `Ang` and `VerseLine` types with null-guards
for missing writers, translations, and transliterations.

`app/ang/[id]/page.tsx` defines static parameters for all 1,430 Angs via
`generateStaticParams`. The Ang data is fetched during `npm run build` and
cached indefinitely. The build can therefore take longer than a typical
small Next.js build.

The search endpoint uses uncached requests because results are dynamic.

## Project structure

```text
app/
  layout.tsx                     Root layout, fonts, and application providers
  page.tsx                       Home page
  globals.css                    Global styles and CSS custom-property theme tokens
  icon.svg                       App icon (SVG)
  ang/[id]/
    page.tsx                     Ang reader page and static route generation
    AngStartSentinel.tsx         Scroll-to-top → previous Ang detection
    AngEndSentinel.tsx           Scroll-to-bottom → next Ang auto-advance
    BottomNav.tsx                Scroll-aware fixed bottom navigation
    not-found.tsx                Custom 404 for out-of-range Ang numbers
  bookmarks/page.tsx             Saved verses list with export/import
  search/
    page.tsx                     Search interface
    actions.ts                   Server action wrapping BaniDB search
components/
  NavigationBar.tsx              Top navigation bar (scroll-aware, auto-hide)
  ReaderControls.tsx             Display, language, size, and theme controls
  ReaderPrefsProvider.tsx        React context for reader preferences (localStorage)
  BookmarksProvider.tsx          React context for bookmark state (localStorage)
  VerseCard.tsx                  Single verse display + copy / bookmark actions
  SwipeContainer.tsx             Touch-swipe wrapper for Ang navigation
  PageTransition.tsx             Crossfade overlay for page transitions
  SikhSymbols.tsx                SVG icons (Khanda emblem)
lib/
  data.ts                        BaniDB fetching, response mapping, and search
  types.ts                       Shared TypeScript types and Ang constants
  useSwipeNavigation.ts          Horizontal swipe detection hook
tests/
  ang-navigation.spec.ts         Playwright end-to-end tests (navigation + theme)
```

## Routes

| Route | Description |
| --- | --- |
| `/` | Reader home page |
| `/ang/1` through `/ang/1430` | Individual Ang reader pages |
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

- Bookmarks and preferences are browser-local and have no account or sync.
- Search depends on the BaniDB service and network availability.
- The Ang data is fetched once at build time and does not update if BaniDB
  corrects an error (a full rebuild is required).

## License and attribution

This project uses the BaniDB API for scripture data. Review the API's current
terms and attribution requirements before deploying the application publicly.