# CampusConnect — TM4 Module (Siela) — HTML/CSS/JS + npm (Vite)

Internships, Events & Dashboard: Internship Listings, Job Details, Campus
Events, Event Details, Dashboard, Notifications, Favorites — plain
HTML/CSS/JavaScript (no framework), bundled with **Vite** and using the
**firebase** npm package for Firestore/Auth. Branded with the
CampusConnect logo.

## Getting started

```bash
npm install
npm run dev        # local dev server with hot reload
npm run build       # production build → dist/
npm run preview     # preview the production build locally
```

`npm run dev` will print a local URL — open `/dashboard.html` (or just
`/`, which redirects there).

## What's in here

```
index.html                  Redirects to /dashboard.html
dashboard.html               /dashboard.html
internships.html             /internships.html
job-details.html             /job-details.html?id=<jobId>
events.html                  /events.html
event-details.html           /event-details.html?id=<eventId>
notifications.html           /notifications.html

src/
  assets/campusconnect-logo.png    The CampusConnect logo, used in the header
  firebase-config.js                Firebase app init (fill in TM1's config)
  auth.js                           Interface expected from TM2's Auth module
  styles.css                        All styling — brand palette pulled from the logo
  services/
    internshipsService.js           Firestore access — jobs collection
    eventsService.js                Firestore access — events collection + RSVPs
    notificationsService.js         Firestore access — per-user notifications
    favoritesService.js             Firestore access — per-user favorites
  shared/
    header.js                       Renders the logo + nav + notification bell into #app-header
    renderCard.js                   Builds the listing-card markup used by grids
    uiHelpers.js                    Empty-state and skeleton-loader renderers
    favoritesStore.js                Per-page favorites state, kept in sync with Firestore
  pages/
    dashboard.js, internships.js, job-details.js,
    events.js, event-details.js, notifications.js
```

Each `.html` page is a real, separate document (a classic multi-page site)
that loads one `<script type="module">` from `src/pages/`. Vite bundles
each page — and everything it imports — independently.

## Integration steps (for the team)

1. Copy this project's contents into the shared repo (or merge folder-by-
   folder if the team already has a Vite project going).
2. `npm install` — pulls in `firebase` and Vite itself.
3. Fill in the real Firebase project values in `src/firebase-config.js`
   (TM1 owns these).
4. Add `/marketplace.html`, `/services.html`, `/login.html`, etc. from
   TM2 and TM3 alongside these, and extend `NAV_LINKS` in
   `src/shared/header.js` so the header covers the whole app, not just
   this module.
5. Swap `src/auth.js` for TM2's real Authentication wiring once it's
   ready — keep the same `onAuthChange(callback)` / `getCurrentUser()`
   shape so nothing else in this module has to change.

## Firestore collections this module expects

- `jobs` — see field list at the top of `internshipsService.js`
- `events` — see field list at the top of `eventsService.js`, plus an
  `events/{eventId}/attendees/{uid}` subcollection for RSVPs
- `users/{uid}/notifications` — see `notificationsService.js`
- `users/{uid}/favorites` — see `favoritesService.js`

These match the `Job`, `Event`, and `Notification` classes from Arrey's
updated system analysis, with a few extra fields added (`type`,
`category`, `status`) where the listing/filter UI needed them. Confirm
with Gig (TM5) when the Firestore schema is finalized.

## Security rules this module needs (coordinate with TM1)

- `jobs`, `events`: public read; write restricted to verified recruiters/admins
- `events/{id}/attendees/{uid}`: a user may only read/write their own attendee doc
- `users/{uid}/notifications`, `users/{uid}/favorites`: a user may only
  read/write documents under their own `uid`

## Notes on this version

- **Sidebar app-shell layout, three deliberate states** — every page uses
  `<div class="app-shell"><div id="app-sidebar"></div><main class="app-main">…</main></div>`.
  `src/shared/sidebar.js` renders the logo, nav (Dashboard, Internships,
  Events, Messages, Saved Items, Notifications, Profile, Settings), a
  Quick Post button, and a user card into `#app-sidebar`, and behaves
  differently by screen size (all in `styles.css`, no JS branching needed
  except opening/closing the drawer):
  - **Desktop (>1024px)** — full vertical sidebar, icons + labels, always visible.
  - **Tablet (721–1024px)** — the same sidebar collapses to a narrow
    icon-only rail: still vertical, still permanently visible, just no
    text labels (hover shows a native tooltip).
  - **Phone (≤720px)** — the sidebar becomes an off-canvas drawer that
    slides in over a dimmed backdrop, opened via a hamburger button in a
    slim top bar (logo + notification bell). This is the standard mobile
    pattern used by Gmail, Notion, Slack, etc., rather than squeezing the
    sidebar into a strip or turning it into a horizontal bar.
- **Real icon set, no emoji** — `src/shared/icons.js` exports small inline
  SVG icons (stroke-based, matches a clean SaaS look) used throughout the
  sidebar, stat cards, listing cards, and detail pages.
- **Inter typeface** — loaded via Google Fonts in `styles.css` for a more
  polished, professional look than the system font stack.
- **Shared footer** — `src/shared/footer.js` renders the brand blurb +
  Platform/Resources link columns + copyright on every page, matching the
  reference design.
- **Dashboard matches the approved mockup**: a purple hero greeting card
  with a time-of-day message and live unread count, three stat cards
  (saved internships, saved events, unread notifications), a "New
  Internships & Jobs" grid with a browse-more CTA banner, and two side
  panels (Notifications preview with avatar icons, Upcoming Events with
  date chips) — all populated from live Firestore data.
- **Motion & depth** — cards, panels, and buttons lift on hover with
  shadows and subtle transitions; new content fades in via a `.fade-in`
  utility class instead of popping in instantly.
- Not TM4's pages yet: **Messages** (Messaging module) and **Saved Items**
  (`/favorites.html`) are linked from the sidebar/dashboard but not built —
  Saved Items would reuse `renderCard` + `favoritesStore.js` the same way
  `internships.js` does. **Profile**/**Settings** link to `#` as
  placeholders for TM2's pages. **Quick Post** shows a placeholder alert —
  it belongs to TM3's Marketplace "Sell Item" flow.
- `favoritesStore.js` plays the same role `useFavorites()`/`FavoritesService`
  played in the React/Angular versions: one Firestore subscription per
  page, shared by every card/button that needs to know what's saved.
