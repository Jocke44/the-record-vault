# The Record Vault

**The Record Vault** is a personal music collection manager for people who love physical formats — Vinyl records, CDs, and EPs — wrapped in a dark, streaming-era interface inspired by Tidal and Spotify.

Browse your shelves visually, drill into albums with beautiful artwork, and keep track of what you own without losing the tactile charm of crates and jewel cases.

---

## Highlights

- **Cinematic dark UI**: A Tidal/Spotify‑inspired layout designed for evening listening sessions and big screens.
- **Format‑aware collection**: Built specifically for **Vinyl**, **CDs**, and **EPs**, not just generic “albums”.
- **Grid-first browsing**: Quickly scan your library through rich, poster-like grids.
- **Live search & format filters**: Find bands and albums as you type, and narrow the home screen by physical format.
- **Persistent database**: All records are stored in a Supabase PostgreSQL database — your collection survives page reloads and is ready to sync across devices.
- **Add new records**: The **Add New** button opens a modal form to add a band and album to the database in one step.

---

## Core Experience (Current)

- **Band grid**  
  See your collection by artist with a responsive grid view that makes it easy to jump into any band.

- **Album grid with format badges**  
  Browse albums with clear **format badges** (Vinyl, CD, EP) so you always know which version you own.

- **Album detail view & tracklists**  
  Open an album to see artwork, metadata, and **full tracklists** for each record.

- **Real-time search**  
  The navbar search bar filters as you type — **bands by name** on the home screen, **albums by title or year** when viewing a band. Matching is case-insensitive and supports partial text (e.g. `gr` finds Graveyard and Greta Van Fleet).

- **Format filter buttons**  
  On the home screen, filter by **All**, **Vinyl**, **CD**, or **EP** to show only bands that own at least one release in that format. Format filters combine with search (e.g. `gr` + **Vinyl** shows matching bands that also have Vinyl in the collection).

- **Supabase-backed persistence**  
  All bands, albums, and tracks are stored in a PostgreSQL database on Supabase. Data is fetched live on page load — no static mock data in production.

- **Add New modal**  
  The **Add New** button in the navbar opens a form for entering a band name, album title, year, and format. On submit the app checks whether the band already exists and reuses or creates it, inserts the album, then immediately refreshes the UI.

---

## Roadmap

The Record Vault is built in layers. **Layer 3 is complete**; **Layer 4 is next**.

| Layer | Status | Focus |
|-------|--------|--------|
| **Layer 1** | Done | Dark UI, band/album grids, album detail & tracklists, sample collection data |
| **Layer 2** | Done | Real-time search (bands & albums) and format filters (All / Vinyl / CD / EP) |
| **Layer 3** | **Done** | Supabase PostgreSQL database — live data fetching, Add New modal form to insert bands & albums |
| **Layer 4** | **Next** | Discogs API integration — auto-fill album metadata, artwork, and tracklists by searching Discogs |
| **Later** | Planned | Barcode scanning, collection statistics, export/import |

If you have ideas or want a feature prioritized, feel free to open an issue or share feedback.

---

## Tech & Setup (for developers)

- **Framework:** Next.js  
- **UI:** React  
- **Language:** TypeScript  
- **Database:** Supabase (PostgreSQL) — three tables: `bands`, `albums`, `tracks`  
- **Auth / API:** Supabase anon key via `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Environment variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-public-key>
```

Both values are found in **Supabase Dashboard → Settings → API**.

### Run locally

```bash
npm install
npm run dev
```

Then open `http://localhost:3000` in your browser.

---

## Vision

The Record Vault aims to make managing a physical music collection feel as smooth and immediate as using a modern streaming app — while still celebrating the formats, artwork, and rituals that make collecting records special.
