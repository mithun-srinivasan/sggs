# Sri Guru Granth Sahib Ji Reader

[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61dafb)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38bdf8)](https://tailwindcss.com/)
[![Tests](https://img.shields.io/badge/Playwright-13_passing-brightgreen)](https://playwright.dev/)
[![License](https://img.shields.io/badge/License-MIT-amber)](./LICENSE)

A focused, verse-by-verse web reader for Sri Guru Granth Sahib Ji — all 1,430 Angs
plus the five daily Nitnem Banis, genuine translations in four languages, real
teekas with correct attribution, word-by-word meanings, a daily Hukamnama from
SGPC, reading plans and streaks, and offline PWA support.

**Live:** `https://srigurugranthsahib.vercel.app/`

## Contents

- [How the whole product works](#how-the-whole-product-works)
- [Features](#features)
- [Technology](#technology)
- [Getting started](#getting-started)
- [Project structure](#project-structure)
- [Routes](#routes)
- [Testing](#testing)
- [Data sources and attribution](#data-sources-and-attribution)
- [Current limitations](#current-limitations)
- [License](#license)

## How the whole product works

### System architecture — build time vs runtime

Most of the site is pre-rendered to static HTML at build time from BaniDB;
only dynamic pieces (search, Hukamnama refresh, user data) touch the network
at runtime.

```mermaid
flowchart TD
    subgraph BUILD["Build time — npm run build"]
        GEN["generateStaticParams<br/>1430 Angs + 1430 print pages + 5 banis"]
        FETCH["fetchUpstream — BaniDB API<br/>20s timeout + 2 retries"]
        MAP["mapVerse — normalize to VerseLine"]
        HTML["≈2,880 static HTML pages"]
        GEN --> FETCH --> MAP --> HTML
    end
    subgraph RUNTIME["Runtime — browser + Vercel"]
        USER["Reader"]
        STATIC["Static page shell"]
        PREFS["ReaderPrefsProvider<br/>localStorage: sgs-reader-prefs"]
        DATA["Progress · Bookmarks · Notes · Highlights<br/>localStorage providers"]
        SEARCH["Search server action<br/>live BaniDB, no cache"]
        HUKAM["Hukamnama server action<br/>SGPC scrape + BaniDB mirror, 6h cache"]
        SW["Service worker<br/>offline cache + fallback"]
        USER --> STATIC
        STATIC --> PREFS
        STATIC --> DATA
        USER --> SEARCH
        USER --> HUKAM
        STATIC --> SW
    end
    HTML --> STATIC
```

### Verse rendering pipeline — one `VerseCard`

Every verse flows through the same layers, each independently toggleable in
Reader Settings:

```mermaid
flowchart LR
    G["Gurmukhi<br/>verse.unicode"] --> T["Transliteration<br/>en · hi · ur · ipa"]
    T --> TR["Translation<br/>en · pu · hi · es"]
    TR --> C["Commentary / Teeka<br/>SGPC English · Darpan · Faridkot"]
    C --> P["Pad-arth<br/>word-by-word meanings"]
    P --> F["Footer actions<br/>copy · share PNG · highlight · note · bookmark"]
```

### Daily Hukamnama flow — including the pre-dawn fallback

SGPC publishes each day's Hukamnama at Amrit Vela. Between midnight IST and
then, *today's* selection does not exist yet — so the app transparently serves
yesterday's (still in effect), labelled with its own date.

```mermaid
flowchart TD
    IST["Compute today's date in IST"] --> TRY["Try BaniDB hukamnamas YYYY/M/D"]
    TRY --> OK{"HTTP 200 with shabads?"}
    OK -- Yes --> SHOW["Show Hukamnama<br/>labelled with that date"]
    OK -- No --> YEST["Try yesterday's date"]
    YEST --> OK2{"HTTP 200 with shabads?"}
    OK2 -- Yes --> SHOW
    OK2 -- No --> FALLBACK["Show fallback card<br/>linking to sgpc.net"]
    IMG["Scrape SGPC page for scan image<br/>runs in parallel, optional"] --> SHOW
```

### Offline flow — installed PWA without network

```mermaid
flowchart TD
    NAV["Navigate to a route"] --> HIT{"In service-worker cache?"}
    HIT -- Yes, online --> NET["Network-first: fresh HTML, re-cache"]
    HIT -- No, online --> NET
    NET -- Success --> SHOW["Render page"]
    NET -- Offline failure --> CACHED{"Cached copy exists?"}
    CACHED -- Yes --> SHOW
    CACHED -- No --> HOME["Fall back to cached home page"]
```

### Reader journey map

```mermaid
flowchart TD
    HOME["Home — Hukamnama · Nitnem · Journey · Gurpurabs · Raags"] --> ANG["Ang reader /ang/N<br/>swipe · continuous · focus · memorise"]
    HOME --> NITNEM["Nitnem /nitnem<br/>Japji · Jaap · Anand · Rehras · Sohila"]
    HOME --> SEARCH["Search"]
    HOME --> LEARN["Learn — chart + quiz"]
    HOME --> MARKS["Bookmarks"]
    ANG --> PRINT["Print / PDF + .txt"]
    SEARCH --> ANG
    MARKS --> ANG
    MARKS --> NITNEM
```

## Features

### Ang reader (`/ang/[id]`, all 1,430 Angs)

- Unicode Gurmukhi, four transliteration scripts (English / Hindi / Urdu / IPA).
- Translations in **English, Punjabi, Hindi, and Spanish** — genuine BaniDB
  sources, switchable in settings, plus parallel English + Punjabi mode.
- **Text & Commentary** — a real, attributable teeka block (not a relabelled
  translation): SGPC English rendering, Guru Granth Darpan, or Faridkot Teeka,
  switchable by language and source.
- **Word meanings** — per-verse pad-arth block where BaniDB provides it.
- Copy verse (with attribution), share as PNG card, 4-colour highlights,
  private notes, bookmarks with folders/tags.
- Lareevar mode, continuous reading (next Ang appended inline), focus mode
  (top bar edge-peeks on mouse approach so Settings stays reachable),
  memorisation mode, tap-to-transliterate.
- Swipe navigation, scroll sentinels, auto-hiding top/bottom bars.
- Print / Save-as-PDF view at `/ang/[id]/print` with all four translations,
  plus a `.txt` download.

### Nitnem (`/nitnem`)

- The five daily prayers in traditional order — Japji Sahib, Jaap Sahib,
  Anand Sahib, Rehras Sahib, Kirtan Sohila — each a statically generated
  reader with the same translations, commentary, and word meanings.
- Home-page card with recitation-time chips; bani-aware bookmarks that
  deep-link back to the Nitnem page.

### Reader preferences

Light / dark / sepia themes, auto theme, OLED black, custom accent, text size
80%–160%, all reading modes and toggles. Persisted in `localStorage` under
`sgs-reader-prefs` with validation so corrupt data can never break the app.

### Daily Hukamnama

SGPC's official scan image + page link, paired with BaniDB's text mirror of
the same Sri Darbar Sahib selection; pre-dawn fallback to the previous (still
current) Hukamnama; cached six hours.

### Reading journey

Progress bar (x/1430), streaks, reading history, N-day Sehaj Paath plans with
a daily Ang range, and a **daily goal tracker** (Angs/day with today's
progress bar). Stored in `localStorage` under `sgs-reader-progress`.

### Learn Gurmukhi (`/learn`)

Full akhar chart (seven traditional groups + ten lagan-matra vowel signs,
every item with English transliteration) above a multiple-choice quiz with
score and streak tracking.

### Home page extras

- Upcoming Gurpurabs (Nanakshahi) — each card links to that event's **verified
  own Bani** and shows the destination Ang chip.
- Resume / random Ang, quick-jump slider, 31-Raag index, featured verses.

### Search, bookmarks, shortcuts, PWA

- `/search` (live BaniDB, Gurmukhi or English), `/bookmarks` (tags, print,
  JSON export/import).
- Keyboard shortcuts (press `?`).
- Installable PWA: web manifest, production-only service worker with
  precached shell, runtime route caching, offline home fallback, and an
  offline indicator banner.

## Technology

- Next.js 16.3.5 (App Router, Turbopack) + React 19 + TypeScript (strict).
- Tailwind CSS v4, Lucide icons, Vercel Analytics + Speed Insights.
- BaniDB v2 API (scripture, translations, teekas, pad-arth, banis).
- SGPC website scrape (daily Hukamnama image only).
- ESLint (`eslint-config-next`, zero-error policy) + Playwright (Chromium).

## Getting started

Requirements: Node.js 20+, npm, and internet access (BaniDB at build time;
Hukamnama/search at runtime).

```bash
npm install
npm run dev        # http://localhost:3000
```

Production build (pre-renders ≈2,880 static pages — takes a few minutes):

```bash
npm run build
npm run start
```

### Available scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Local development server |
| `npm run build` | Production build + full static generation |
| `npm run start` | Serve the production build locally |
| `npm run typecheck` | TypeScript `tsc --noEmit` |
| `npm run lint` | ESLint over the repo (must report 0 errors) |
| `npm run test` | Playwright suite, headless Chromium |
| `npm run test:ui` | Playwright interactive UI mode |

## Project structure

```text
app/
  layout.tsx                     Root layout, fonts, metadata, providers
  page.tsx                       Home page
  manifest.ts                    PWA web-app manifest
  actions.ts                     Server action: getTodaysHukamnama
  globals.css                    Theme tokens, focus/print CSS
  ang/[id]/
    page.tsx                     Ang reader + static route generation
    actions.ts                   Server action: getAngForReader (continuous mode)
    ClientAngReader.tsx          Chains Angs for continuous mode
    AngStartSentinel.tsx / AngEndSentinel.tsx   Scroll-edge navigation
    BottomNav.tsx                Scroll-aware bottom navigation
    not-found.tsx                Custom 404 for out-of-range Angs
    print/page.tsx               Print / PDF layout · PrintAng.tsx controls
  nitnem/page.tsx                Nitnem index (five daily prayers)
  nitnem/[token]/page.tsx        Bani reader (statically generated ×5)
  bookmarks/page.tsx             Saved verses: tags, print, import/export
  learn/page.tsx                 Gurmukhi chart + practice quiz
  search/page.tsx + actions.ts   Gurbani search interface + server action
components/
  NavigationBar.tsx              Top bar (scroll-aware, focus-mode edge peek)
  ReaderControls.tsx             Settings panel (display, modes, languages)
  ReaderPrefsProvider.tsx        Preferences context (localStorage)
  BookmarksProvider.tsx          Bookmarks + tags (localStorage)
  ProgressProvider.tsx           Progress, streaks, history, plans, goals
  NotesProvider.tsx / HighlightsProvider.tsx   Notes + colours (localStorage)
  VerseCard.tsx                  One verse: layers + actions
  HukamnamaCard.tsx              Daily Hukamnama (SGPC + BaniDB)
  NitnemCard.tsx                 Home-page daily-prayers card
  ReadingJourney.tsx             Progress/streak/plan/goal card
  GurpurabCalendar.tsx           Upcoming Gurpurabs card
  OfflineIndicator.tsx           Offline banner · ServiceWorkerRegistrar.tsx
  SwipeContainer.tsx · PageTransition.tsx · ShortcutHelp.tsx · SikhSymbols.tsx
lib/
  data.ts                        BaniDB fetching (timeout+retry), mapping,
                                 search, Hukamnama (+ pre-dawn fallback), banis
  types.ts                       Shared types (VerseLine, Bani, prefs, …)
  nitnem.ts                      Nitnem metadata table (client-safe)
  gurpurabs.ts                   Verified Nanakshahi Gurpurab → Ang table
  gurmukhi.ts                    Akhar + lagan-matra data for Learn page
  shortcuts.ts · downloadAng.ts · useSwipeNavigation.ts
public/
  sw.js                          Service worker (v2 offline caching)
  icon-192.png · icon-512.png · golden-temple-night.png
tests/
  ang-navigation.spec.ts · commentary.spec.ts · learn-gurpurab.spec.ts
  new-features.spec.ts           Playwright suite (13 tests)
eslint.config.mjs · next.config.ts · next-env.d.ts
```

## Routes

| Route | Description |
| --- | --- |
| `/` | Home: Hukamnama, Nitnem, journey, Gurpurabs, Raags |
| `/ang/1` … `/ang/1430` | Verse-by-verse Ang reader pages |
| `/ang/[id]/print` | Print / Save-as-PDF layout |
| `/nitnem` | Daily Nitnem index |
| `/nitnem/japji` · `/jaap` · `/anand` · `/rehras` · `/sohila` | Bani readers |
| `/learn` | Gurmukhi chart + quiz |
| `/search` | Gurbani search |
| `/bookmarks` | Saved verses (localStorage) |

Invalid Ang numbers or bani tokens show a custom not-found page.

## Testing

```bash
npm run test        # headless Playwright run (Chromium)
npm run test:ui     # interactive UI mode
```

13 tests cover Ang navigation, theme persistence, genuine commentary sources
and switching, the Learn chart, Gurpurab Ang chips, Hindi/Spanish switching,
pad-arth display, Nitnem pages, and the daily goal tracker.

## Data sources and attribution

Scripture text, translations, teekas, and pad-arth come from the
[BaniDB API](https://github.com/KhalisFoundation/BaniDB-API) (Khalis
Foundation), whose published translation sources are:

| BaniDB key | Source | Used as |
| --- | --- | --- |
| `en.bdb` / `en.ssk` | Dr. Sant Singh Khalsa (SikhNet) | Default English translation |
| `en.ms` | Bhai Manmohan Singh (SGPC) | English commentary rendering |
| `pu.ss` / `pu.bdb` | Prof. Sahib Singh, *Guru Granth Darpan* (SGPC) | Punjabi translation + Darpan commentary |
| `pu.ft` | *Faridkot Teeka*, Sant Giani Badan Singh Ji | Faridkot commentary |
| `pu.pss` | Pad-arth (word meanings) | Word-meanings block |
| `hi.ss` / `hi.sts` | Hindi renderings | Hindi translation |
| `es.sn` | Spanish rendering | Spanish translation |

The Daily Hukamnama image and page link come from the
[official SGPC website](https://www.sgpc.net/hukamnama/); its text is BaniDB's
mirror of the same Sri Darbar Sahib selection. Review both providers' current
terms before deploying publicly.

## Current limitations

- Bookmarks, preferences, progress, notes, and highlights are browser-local
  with no account or sync.
- Search depends on the BaniDB service and network availability.
- Ang/bani data is fetched once at build time — a rebuild picks up any
  upstream corrections.
- SGPC publishes the Hukamnama only as an image, so its text is mirrored
  from BaniDB rather than parsed from SGPC directly.

## License

MIT — see [LICENSE](./LICENSE). The license covers this application's code;
scripture, translations, and third-party data remain under their providers'
terms (see attribution above).
