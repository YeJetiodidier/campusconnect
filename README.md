# CampusConnect — TM4 Module (Siela) — HTML/CSS/JS + npm (Vite)

Internships, Events & Dashboard: Internship Listings, Job Details, Campus
Events, Event Details, Dashboard, Notifications, Favorites — plain
HTML/CSS/JavaScript (no framework), bundled with **Vite** and using the
**firebase** npm package for Firestore/Auth. Branded with the
CampusConnect logo.

## Fixes in this update

- **Saved Items page built** (`favorites.html` / `src/pages/favorites.js`) —
  this was the 404 you hit. It was linked from the sidebar and dashboard
  but the page itself was never created, **and** it was missing from
  `vite.config.js`'s build entries, so even a rebuild wouldn't have
  deployed it. Both are fixed now. It shows saved internships and events
  in tabs (All / Internships & Jobs / Events), fetching the full listing
  for each saved item so the cards look the same as on the Internships/
  Events pages. Un-saving from here updates instantly everywhere else too.
- **Notifications page hardened** — restyled as bordered cards (icon
  circle, title, message, timestamp) instead of plain list rows, added a
  page title + subtitle + a real "Mark all as read" button with an icon,
  and added `overflow-wrap: break-word` plus `flex-wrap` on the header row
  so long titles or a narrow viewport can't clip or overflow text.
- **Quick Post now goes somewhere** — instead of a placeholder alert, it
  navigates to `/marketplace.html`, a stub page explaining that the real
  Marketplace & Services module belongs to TM3. Swap the stub for the
  real pages once they're merged in; nothing else needs to change since
  the link already points at `/marketplace.html`.

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
favorites.html                /favorites.html — Saved Items
marketplace.html             /marketplace.html — stub, TM3 owns the real module

src/
  assets/campusconnect-logo.png    The CampusConnect logo, used in the sidebar
  firebase-config.js                Firebase app init (fill in TM1's config)
  auth.js                           Interface expected from TM2's Auth module
  styles.css                        All styling — brand palette pulled from the logo
  services/
    internshipsService.js           Firestore access — jobs collection
    eventsService.js                Firestore access — events collection + RSVPs
    notificationsService.js         Firestore access — per-user notifications
    favoritesService.js             Firestore access — per-user favorites
  shared/
    sidebar.js                      Logo + nav + Quick Post + user card into #app-sidebar
    footer.js                       Brand blurb + Platform/Resources links into #app-footer
    icons.js                        Inline SVG icon set used everywhere (no emoji)
    renderCard.js                   Builds the listing-card markup used by grids
    uiHelpers.js                    Empty-state and skeleton-loader renderers
    favoritesStore.js                Per-page favorites state, kept in sync with Firestore
  pages/
    dashboard.js, internships.js, job-details.js,
    events.js, event-details.js, notifications.js,
    favorites.js, marketplace-stub.js
```

Each `.html` page is a real, separate document (a classic multi-page site)
that loads one `<script type="module">` from `src/pages/`. Vite bundles
each page — and everything it imports — independently. Every page is
listed in `vite.config.js`'s `rollupOptions.input` — **a page not listed
there won't be part of `npm run build`'s output**, even if the `.html`
file exists in the project (this is what caused the Saved Items 404).
Add any new page to both places.

## Integration steps (for the team)

1. Copy this project's contents into the shared repo (or merge folder-by-
   folder if the team already has a Vite project going).
2. `npm install` — pulls in `firebase` and Vite itself.
3. Fill in the real Firebase project values in `src/firebase-config.js`
   (TM1 owns these).
4. Add `/services.html`, `/login.html`, etc. from TM2 and TM3 alongside
   these, and extend `NAV_ITEMS` in `src/shared/sidebar.js` so the
   sidebar covers the whole app, not just this module. Replace
   `marketplace.html` with TM3's real Marketplace pages when ready —
   nothing else needs to change since `sidebar.js`'s Quick Post button
   already links to `/marketplace.html`.
5. Swap `src/auth.js` for TM2's real Authentication wiring once it's
   ready — keep the same `onAuthChange(callback)` / `getCurrentUser()`
   shape so nothing else in this module has to change.
6. **Remember to run `npm run build` and redeploy** after pulling in
   changes — `npm run dev` serves files directly and will pick up new
   pages automatically, but the deployed host only serves whatever was
   in the last `dist/` build.

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
