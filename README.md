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
- **Add new records**: The **Add New** button opens a modal with two modes — search Discogs to auto-fill everything, or add manually as a fallback.
- **Discogs integration**: Search Discogs by album or artist name, pick the right pressing, and have the artist, title, year, format, tracklist, and cover art filled in automatically.
- **Cover art everywhere**: Band cards and album cards display artwork fetched from Discogs or uploaded manually, with styled placeholder icons for records without an image.
- **Per-user collections**: Every user only ever sees and manages their own records — secured by Supabase Auth and Row Level Security at the database level.

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

- **Add New — Discogs search**  
  The **Add New** button opens a two-mode modal. In **Search Discogs** mode, type any album name or artist and browse matching pressings from the Discogs database. Clicking a result fetches the full release details and auto-fills the artist, title, year, format, tracklist, and cover art — then saves everything to Supabase in one step.

- **Add New — manual fallback**  
  Switch to **Add Manually** to enter all fields by hand, exactly as before. The app checks whether the band already exists and reuses or creates it, inserts the album and tracks, then immediately refreshes the UI.

- **Cover art**  
  Band cards display artist thumbnails and album cards display cover art, sourced from Discogs or uploaded manually. Records without a stored image fall back to styled dark placeholders with a subtle vinyl or music-note icon.

- **User accounts & route protection**  
  Sign up or sign in with email and password. Unauthenticated visitors are redirected to `/login` by a Next.js middleware that runs on every request. Sessions are managed server-side via Supabase Auth cookies and refreshed automatically.

- **Row Level Security**  
  Every database row (`bands`, `albums`, `tracks`) is owned by the user who created it. Supabase RLS policies ensure each user can only read and write their own collection — no data leaks between accounts, even if the anon key is exposed.

- **Duplicate prevention**  
  A unique database constraint on `(user_id, discogs_release_id)` stops the same pressing from being added twice via Discogs search. When a duplicate is detected the app shows an inline warning instead of a generic error.

- **Cover image uploads (manual adds)**  
  When adding a record manually, optional **album cover** and **band image** file pickers appear in the form (jpg, png, webp). Selecting a file shows an instant preview before submitting. On save, images are uploaded to a public Supabase Storage bucket (`covers`) under a per-user path:
  - Album covers → `covers/{user_id}/{timestamp}-{filename}`
  - Band images → `covers/{user_id}/bands/{timestamp}-{filename}`

  The returned public URL is stored in the database as `cover_image`. Band images are only uploaded when the band is being created — adding a second album to an existing band leaves the band image unchanged.

---

## Roadmap

The Record Vault is built in layers. **Layer 5 is complete**; **Layer 6 is next**.

| Layer | Status | Focus |
|-------|--------|--------|
| **Layer 1** | Done | Dark UI, band/album grids, album detail & tracklists, sample collection data |
| **Layer 2** | Done | Real-time search (bands & albums) and format filters (All / Vinyl / CD / EP) |
| **Layer 3** | Done | Supabase PostgreSQL database — live data fetching, Add New modal form to insert bands & albums |
| **Layer 4** | Done | Discogs API integration — search Discogs to auto-fill metadata, artwork, and tracklists; cover art on band and album cards |
| **Layer 5** | **Done** | Auth & security — Supabase Auth (email signup/signin), middleware route protection, RLS, duplicate prevention, cover image uploads to Supabase Storage |
| **Layer 6** | **Next** | Barcode scanning — scan a record's barcode to identify and add it instantly |
| **Later** | Planned | Collection statistics, export/import |

If you have ideas or want a feature prioritized, feel free to open an issue or share feedback.

---

## Tech & Setup (for developers)

- **Framework:** Next.js  
- **UI:** React  
- **Language:** TypeScript  
- **Database:** Supabase (PostgreSQL) — three tables: `bands`, `albums`, `tracks`  
- **Auth:** Supabase Auth — email/password signup and signin, server-side session cookies, Next.js middleware for route protection  
- **Storage:** Supabase Storage — `covers` bucket for user-uploaded album and band images, stored under per-user paths  
- **Security:** Row Level Security (RLS) on all tables; unique constraint on `(user_id, discogs_release_id)` for duplicate prevention  
- **Music metadata:** Discogs REST API — release search and full release details, proxied through Next.js server-side API routes to keep the token secure

### Environment variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-public-key>
DISCOGS_TOKEN=<your-discogs-personal-access-token>
```

Supabase values are found in **Supabase Dashboard → Settings → API**.  
The Discogs token is generated at **discogs.com → Settings → Developers → Generate new token**.

### Run locally

```bash
npm install
npm run dev
```

Then open `http://localhost:3000` in your browser.

---

## Vision

The Record Vault aims to make managing a physical music collection feel as smooth and immediate as using a modern streaming app — while still celebrating the formats, artwork, and rituals that make collecting records special.
