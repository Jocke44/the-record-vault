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
- **Add new records**: The **Add New** button opens an **Add to collection** modal with two modes — search Discogs to auto-fill everything, or add manually as a fallback. After a successful add the modal stays open so you can keep adding records without reopening it.
- **Discogs integration**: Search Discogs by **barcode** (default), **title / artist**, or **catalog number**, pick the right pressing, preview the full release, then confirm to save. Artist, title, year, format, label, tracklist, and cover art are filled in automatically.
- **Record label**: Each album can store a record label — shown on album cards and the detail view, populated from Discogs or entered manually, and editable in the add and edit dialogs.
- **Cover art everywhere**: Band cards and album cards display artwork fetched from Discogs or uploaded manually, with styled placeholder icons for records without an image. All Discogs images are served through a server-side proxy to bypass hotlinking restrictions.
- **Full edit support**: Edit band names, album details, and tracklists directly from the collection view.
- **Delete with confirmation**: Remove bands or albums with a confirmation step before any data is lost.
- **Per-user collections**: Every user only ever sees and manages their own records — secured by Supabase Auth and Row Level Security at the database level.
- **Welcoming login page**: A full-bleed moody vinyl photo with a dark overlay, glassmorphism sign-in card, tagline, a **Forgot your password?** link, and a 3-step explainer on the **Sign Up** tab guiding new users through sign-up and email confirmation.
- **Three Discogs search modes**: Toggle above the search bar switches between **Barcode** (default), **Title / Artist**, and **Cat. No.** — useful for identifying pressings by whatever identifier you have to hand.
- **Preview before adding**: Selecting a Discogs result opens a preview screen with artwork, metadata, and tracklist before you confirm the add.
- **Band sidebar & Sign Out**: A sticky band list (desktop) or slide-out drawer (mobile) for jumping to alphabetical sections; **Sign Out** in the navbar ends your session.
- **Auth-aware collection loading**: The collection refetches automatically when you sign in, so your data is always current after login.
- **Visual search grid**: Discogs search results display as a responsive 2-column card grid with full-width cover art — easy to browse at a glance. Collapses to single column on mobile.
- **Alphabetical band sections**: Bands are grouped A → Ö with correct Swedish locale sorting. Leading 'The' is ignored — The Beatles files under B, not T.

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

- **Three Discogs search modes**  
  When searching Discogs in the Add to collection dialog, a toggle above the search bar switches between **Barcode** (default), **Title / Artist**, and **Cat. No.** Barcode mode accepts 8–14 digit codes; Cat. No. mode searches by the catalog number printed on the sleeve or label.

- **Supabase-backed persistence**  
  All bands, albums, and tracks are stored in a PostgreSQL database on Supabase. Data is fetched live on page load — no static mock data in production.

- **Add New — Discogs search**  
  The **Add New** button opens a two-mode modal titled **Add to collection**. In **Search Discogs** mode, pick a search type (**Barcode**, **Title / Artist**, or **Cat. No.**) and browse up to 20 matching pressings from the Discogs database. The dialog lazily fetches full release details in parallel so each result displays its actual cover art — the Discogs search endpoint omits image data, so a secondary per-release request is made for each row. Clicking a result loads a **preview screen** showing artwork, artist, title, year, format, label, and tracklist. Click **Confirm Add** to save everything to Supabase. On success the modal resets and stays open so you can add another record without reopening it.

- **Add New — manual fallback**  
  Switch to **Add Manually** to enter all fields by hand, including an optional **Label**. The app checks whether the band already exists and reuses or creates it, inserts the album and tracks, then immediately refreshes the UI. The modal stays open after a successful manual add as well.

- **Record label**  
  Albums store an optional record label in the database. Labels from Discogs are saved automatically on add; manual adds and the edit dialog let you set or change them. Labels appear on album cards (beside the year) and in the album detail view.

- **Band sidebar**  
  On the home screen, a sticky sidebar lists all bands alphabetically for quick navigation to each letter section. On mobile, a menu button opens the same list as a slide-out drawer.

- **Sign Out**  
  The navbar **Sign Out** button ends your Supabase session and returns you to the login page.

- **Auth-aware collection loading**  
  On sign-in (and on initial session restore), the app refetches the full collection from Supabase so your data is always current after authentication — no stale empty state after logging in.

- **Cover art**  
  Band cards display artist thumbnails and album cards display cover art, sourced from Discogs or uploaded manually. Records without a stored image fall back to styled dark placeholders with a subtle vinyl or music-note icon. All Discogs images are fetched server-side through `/api/proxy-image` to bypass hotlinking restrictions — the `getImageUrl` utility in `lib/get-image-url.ts` automatically routes Discogs URLs through the proxy while passing Supabase Storage URLs through unchanged.

- **Edit bands and albums**  
  Hover over any band or album card to reveal edit and delete icon buttons. Clicking the edit icon on a band opens a dialog to rename it. Clicking the edit icon on an album opens a full edit dialog — update the title, year, format, label, and cover image, and manage the tracklist by editing existing tracks, adding new ones, or removing entries.

- **Delete with confirmation**  
  The delete icon on each card opens a confirmation dialog before anything is removed. Deleting a band permanently removes it along with all its albums and tracks. Deleting an album removes only that album and its tracks, leaving the band intact.

- **User accounts & route protection**  
  Sign up or sign in with email and password. Unauthenticated visitors are redirected to `/login` by a Next.js middleware that runs on every request. Sessions are managed server-side via Supabase Auth cookies and refreshed automatically.

- **Login & landing page**  
  The login page doubles as a landing page — a full-screen vinyl photograph sets the mood, with the app name, tagline ("Get your collection Catalogued."), and a frosted-glass sign-in card centered on top. A **Forgot your password?** link below the password field leads to the reset flow. When the **Sign Up** tab is active, a 3-step explainer below the form walks new users through creating an account, confirming their email, and starting their collection.

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

The Record Vault is built in layers. **Layer 17 is complete**.

| Layer | Status | Focus |
|-------|--------|--------|
| **Layer 1** | Done | Dark UI, band/album grids, album detail & tracklists, sample collection data |
| **Layer 2** | Done | Real-time search (bands & albums) and format filters (All / Vinyl / CD / EP) |
| **Layer 3** | Done | Supabase PostgreSQL database — live data fetching, Add New modal form to insert bands & albums |
| **Layer 4** | Done | Discogs API integration — search Discogs to auto-fill metadata, artwork, and tracklists; cover art on band and album cards |
| **Layer 5** | **Done** | Auth & security — Supabase Auth (email signup/signin), middleware route protection, RLS, duplicate prevention, cover image uploads to Supabase Storage |
| **Layer 6** | **Done** | Barcode lookup — search by barcode number via the Discogs API; camera scanning removed in favour of reliable manual entry |
| **Layer 7** | **Done** | Edit & delete — edit band names, album details and tracklists; delete bands and albums with confirmation dialogs; full CRUD complete |
| **Layer 8** | **Done** | Image proxy & search UX — server-side Discogs image proxy, lazy-loaded full-res cover art in search results, wider/taller search dialog |
| **Layer 9** | **Done** | Search & sorting UX — format filter (Vinyl/CD/Cassette) in Discogs search dialog, catalog number search type, alphabetical band sections A → Ö with Swedish locale sorting, The-prefix ignored for grouping |
| **Layer 10** | **Done** | Search results UI — Discogs search results refactored from thumbnail list to a responsive 2-column card grid with 200px full-width cover art; single column on mobile |
| **Layer 11** | **Done** | Export collection — download your full collection as a flat CSV (Band, Album, Year, Format) or nested JSON via a dropdown in the navbar |
| **Layer 12** | **Done** | Forgot password flow — request a reset email, confirm via auth callback, and set a new password |
| **Layer 13** | **Done** | Record label — optional `label` column on albums; shown on cards and detail view; populated from Discogs or entered manually; editable in add and edit dialogs |
| **Layer 14** | **Done** | Three-mode Discogs search — Barcode (default), Title / Artist, and Cat. No. toggles above the search bar |
| **Layer 15** | **Done** | Preview / confirm — selecting a Discogs result opens a preview screen before saving; user clicks Confirm Add to commit |
| **Layer 16** | **Done** | Multi-add modal — add dialog stays open after a successful add and resets for the next record |
| **Layer 17** | **Done** | Auth refetch — collection reloads on sign-in and initial session restore via `onAuthStateChange` |
| **Later** | Planned | Collection statistics, import collection from file |

If you have ideas or want a feature prioritized, feel free to open an issue or share feedback.

---

## Tech & Setup (for developers)

- **Framework:** Next.js  
- **UI:** React  
- **Language:** TypeScript  
- **Database:** Supabase (PostgreSQL) — three tables: `bands`, `albums`, `tracks`. The `albums` table columns in use: `id`, `title`, `year`, `format`, `band_id`, `cover_image`, `user_id`, `discogs_release_id`, `label` (text, nullable)  
- **Auth:** Supabase Auth — email/password signup and signin, server-side session cookies, Next.js middleware for route protection  
- **Storage:** Supabase Storage — `covers` bucket for user-uploaded album and band images, stored under per-user paths  
- **Security:** Row Level Security (RLS) on all tables; unique constraint on `(user_id, discogs_release_id)` for duplicate prevention  
- **Music metadata:** Discogs REST API — release search and full release details, proxied through Next.js server-side API routes to keep the token secure

### Environment variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-public-key>
NEXT_PUBLIC_SITE_URL=http://localhost:3000
DISCOGS_TOKEN=<your-discogs-personal-access-token>
```

Supabase values are found in **Supabase Dashboard → Settings → API**.  
The Discogs token is generated at **discogs.com → Settings → Developers → Generate new token**.  
`NEXT_PUBLIC_SITE_URL` is the public URL of your app (e.g. `http://localhost:3000` locally, or your Vercel deployment URL in production). Required for the forgot-password flow — Supabase uses it as the redirect target in reset emails.

### Run locally

```bash
pnpm install
pnpm dev
```

Then open `http://localhost:3000` in your browser.

---

## PWA Support

The Record Vault is a Progressive Web App (PWA). Install and offline behaviour only apply to **production builds** — PWA is disabled during local development (`pnpm dev`).

- **Installable** — can be added to your home screen on mobile or desktop
- **Offline support** — cached routes remain accessible without internet
- **Native feel** — opens in its own window without browser UI

To install: open the live app in Chrome and click the install icon in the address bar.

---

## Vision

The Record Vault aims to make managing a physical music collection feel as smooth and immediate as using a modern streaming app — while still celebrating the formats, artwork, and rituals that make collecting records special.

---

## Changelog

### 2026-09-11

- Added record label — optional `label` column on albums; shown on cards and
  detail view; populated from Discogs or entered manually; editable in add and
  edit dialogs
- Refactored Discogs search to three modes — Barcode (default), Title / Artist,
  and Cat. No. toggles above the search bar
- Added preview / confirm step — selecting a Discogs result opens a preview
  screen before saving; user clicks Confirm Add to commit
- Add modal stays open after a successful add — resets for the next record
  without reopening the dialog
- Collection refetches on auth state change — reloads on sign-in and initial
  session restore
- Added band sidebar for alphabetical jump navigation (desktop sticky,
  mobile drawer)
- Added Sign Out button and Forgot your password? link on the login page

### 2026-06-27

- Added CSV and JSON export — download your full collection as a flat CSV
  (Band, Album, Year, Format) or nested JSON, via a dropdown in the navbar
- Fixed export returning empty albums — band/album join used strict equality
  on mismatched types (number vs string); wrapped both sides in Number()

### 2026-06-26

- Fixed Discogs search result covers collapsing to thin strips on mobile —
  caused by a nested scroll container inside the dialog's main scroll area;
  removed the inner scroller so cards keep full height and scroll cleanly

### 2026-06-21

- Refactored Discogs search results from a thumbnail list to a responsive 2-column card grid with 200px full-width cover art
- Search grid collapses to a single column on mobile for easier browsing on small screens

### 2026-06-19

- Refactored tracks fetch to lazy-load per album on click
- Removed the 10,000 row Supabase workaround for tracks
- `fetchTracksForAlbum()` now fetches on demand only
