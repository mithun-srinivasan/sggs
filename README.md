# Sri Guru Granth Sahib Ji Reader

A focused, verse-by-verse web reader for Sri Guru Granth Sahib Ji. The app
supports all 1,430 Angs, Unicode Gurmukhi, optional transliteration and
translations, saved verses, Gurbani search, and responsive navigation.

## Technology

- Next.js 16.3.5 with the App Router
- React 19
- TypeScript
- Tailwind CSS v4 through `@tailwindcss/postcss`
- Lucide React icons
- BaniDB v2 for Ang and search data

## Requirements

- Node.js 20 or newer is recommended.
- npm
- Internet access when loading live BaniDB data or running a production build

## Getting started

From the project directory:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in a browser. The home
page provides resume, random Ang, quick-jump, search, and reading entry points.

To create and run a production build:

```bash
npm run build
npm run start
```

The available npm scripts are:

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the local development server |
| `npm run build` | Build and statically generate the application |
| `npm run start` | Serve the production build |
| `npm run lint` | Run the configured Next.js lint command |

## Features

### Ang reader

- Reads Ang 1 through Ang 1430 at `/ang/[id]`.
- Fetches Ang data from BaniDB's `/v2/angs/:id` endpoint.
- Displays Unicode Gurmukhi, transliteration, writer metadata when available,
  and line numbers when provided by the API.
- Shows English, Punjabi, or Spanish translation when that translation exists.
- Copies a verse and its available supporting text to the clipboard.
- Saves individual verses as bookmarks.
- Provides previous and next controls in the top and bottom navigation bars.
- Supports fast horizontal touch swipes for previous/next Ang navigation while
  preserving normal vertical scrolling.
- Moves to the previous Ang when the reader is scrolled back to the top, and
  can advance to the next Ang at the end of the current page.

### Reader preferences

The settings panel supports:

- Showing or hiding transliteration
- Showing or hiding translations
- Selecting English, Punjabi, or Spanish translations
- Increasing or decreasing text size from 80% to 160%
- Light, dark, and sepia themes

Preferences are stored in the browser's `localStorage` under
`sgs-reader-prefs`.

### Search and bookmarks

- `/search` searches BaniDB by Gurmukhi or English text.
- Search results link directly to the matching Ang and verse fragment.
- `/bookmarks` lists saved verses and links back to their Ang and verse.
- Bookmarks are stored locally under `sgs-reader-bookmarks`; they are not
  synced between browsers or devices.

### Home page

The home page at `/` includes:

- Resume the last Ang opened in the browser
- Random Ang navigation
- A number input and slider for jumping to any Ang
- Quick links to major scripture sections
- A rotating selection of featured verses
- Links to search, bookmarks, and the reader

The last opened Ang is stored locally under `sggs_last_ang`.

## Data and caching

The BaniDB integration lives in [`lib/data.ts`](lib/data.ts). It maps the API
response into the application's `Ang` and `VerseLine` types and safely handles
missing writers, translations, transliterations, and network failures.

`app/ang/[id]/page.tsx` defines static parameters for all 1,430 Angs. As a
result, `npm run build` requests the Ang data during the build and can take
longer than a typical small Next.js build. The fetch is configured to cache
scripture data indefinitely.

The search endpoint uses uncached requests because search results are dynamic.
The app currently fails softly when BaniDB is unavailable: an Ang that cannot
be loaded is treated as unavailable, and a failed search returns no results.

## Project structure

```text
app/
  layout.tsx                 Root layout, fonts, and application providers
  page.tsx                   Home page
  globals.css               Global styles and theme variables
  ang/[id]/
    page.tsx                 Ang reader page and static route generation
    AngStartSentinel.tsx     Previous-Ang navigation at the top of the page
    AngEndSentinel.tsx       Next-Ang navigation at the end of the page
    BottomNav.tsx            Scroll-aware bottom navigation
    not-found.tsx            Out-of-range Ang page
  bookmarks/page.tsx         Saved verses page
  search/
    page.tsx                 Search interface
    actions.ts               Server action for BaniDB search
components/
  NavigationBar.tsx          Top navigation and reader settings access
  ReaderControls.tsx         Display, language, size, and theme controls
  ReaderPrefsProvider.tsx    Local reader preference state
  BookmarksProvider.tsx      Local bookmark state
  VerseCard.tsx              Verse display and copy/bookmark actions
  SwipeContainer.tsx         Touch navigation wrapper
  SikhSymbols.tsx            Sikh visual symbols used by the reader
lib/
  data.ts                    BaniDB fetching and response mapping
  types.ts                   Shared TypeScript types and Ang constants
  useSwipeNavigation.ts      Horizontal swipe detection hook

  ang1.json, ang2.json       Local sample data retained for reference
public/
  golden-temple.png          Home page background asset
  golden-temple-night.png    Home page night background asset
```

## Routes

| Route | Description |
| --- | --- |
| `/` | Reader home page |
| `/ang/1` through `/ang/1430` | Individual Ang reader pages |
| `/search` | Gurbani search |
| `/bookmarks` | Locally saved verses |

Invalid Ang numbers show the custom not-found page and link back to Ang 1.

## Current limitations

- Bookmarks and preferences are browser-local and have no account or sync
  system.
- Search depends on the BaniDB service and network availability.
- The reader does not currently provide built-in audio playback.
- There is no automated test suite in the repository yet.

## License and attribution

This project uses the BaniDB API for scripture data. Review the API's current
terms and attribution requirements before deploying the application publicly.
