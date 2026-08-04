# CampusConnect — Technical Documentation (Database Design)

This is the "why," not just the "what" — meant to be what I can speak
to directly if asked to defend a design choice during the
presentation.

## 1. Why Firestore (NoSQL) changes the design process, not just the syntax

Designing a relational schema starts from "what entities exist and how
do they relate" and mostly ends there — the database enforces the rest
(foreign keys, joins do the work of connecting things at read time).
Designing a Firestore schema starts from **"what does each screen need
to read, and how often"** — because there's no JOIN, every relationship
you don't denormalize costs you a second network round-trip. That's
why this design looks different from a straight MySQL-to-Firestore
translation: it's optimized for how the app actually reads data, not
just for representing the entities cleanly.

## 2. Denormalization: what it is and where I used it

Denormalization means storing a copy of data in more than one place so
a read doesn't need a second fetch. I used it in exactly three spots,
each for a specific, named reason:

| Where | What's copied | Why |
|---|---|---|
| `listings.sellerName` | The seller's name, from `users` | The marketplace grid renders dozens of cards at once — fetching the seller's name separately for each one would mean dozens of extra reads (and dollars — Firestore bills per read) for one page load. |
| `events.rsvpCount` | A count of the `rsvps` subcollection | Reading "how many people are going" by counting the subcollection means downloading every RSVP document just to get a number. A maintained counter is one field. |
| `threads.lastMessage` / `lastMessageAt` | The most recent message | The Messages inbox list needs a one-line preview per conversation; without this, opening the inbox would mean reading the last message of *every* thread separately. |

**The honest tradeoff, stated plainly:** denormalized data can go
stale. If a seller changes their display name, listings they posted
before that change keep showing the old name until that specific
listing is re-saved. For a name field on a student marketplace, that's
an acceptable tradeoff — it would **not** be acceptable for something
like a price or a status flag, which is exactly why those fields are
*not* denormalized anywhere in this design; they're only ever read
from their single source of truth.

## 3. Where I used subcollections instead of a flat collection + foreign key

`applications` live under `internships/{id}/applications`, and `rsvps`
live under `events/{id}/rsvps`, rather than as flat top-level
collections with an `internshipId`/`eventId` field (the more
SQL-instinctive choice). Reasoning: the most common query for both is
"give me everything under this one parent" (all applicants for this
posting, all RSVPs for this event) — a subcollection makes that the
*default*, cheapest possible query, with no `WHERE` filtering needed.
The cost: there's no single query for "all of a user's applications
across every internship" without either a collection group query or a
small denormalized index document — a real tradeoff, made knowingly in
favor of the more common access pattern.

## 4. Meaningful document IDs as a uniqueness constraint

SQL gets uniqueness from a `UNIQUE` constraint. Firestore doesn't have
one — so instead, `events/{id}/rsvps/{uid}` uses **the RSVPing user's
own UID as the document ID**. Writing to that path twice doesn't create
a duplicate, it just overwrites the same document — so "a user can
only RSVP once" isn't something application code has to check and
enforce, it's structurally true. I used the same pattern for
`internships/{id}/applications/{applicantUid}`.

## 5. What Firebase Authentication removes from this design entirely

A relational design for this app would need a `users` table with a
`password_hash` column, plus a separate `verification_token` /
`verification_token_expires` pair to track email verification state —
and application code to hash passwords correctly, generate and email
those tokens, and check expiry. **None of that exists in this design**
because Firebase Authentication is a separate, dedicated service that
already does all of it — password hashing, session/token issuance, and
`sendEmailVerification()` / `user.emailVerified` for FR-AUTH-02. The
Firestore `users` collection only holds profile data. This isn't a
missing feature — it's fewer moving parts to get wrong, because it's
not reinvented.

## 6. Real-time messaging (FR-MSG-01) without a WebSocket server

A relational/Node.js design typically needs a WebSocket server (or
Socket.IO, as Arrey's technical feasibility review notes) to push
messages live. Firestore's `onSnapshot()` listener does this natively:
subscribe to a query, get called back on every change, no separate
real-time infrastructure to design, host, or scale. This is the
single biggest simplification Firebase brings to this project's
architecture — worth highlighting in the presentation as a genuine
reason to prefer it over the MySQL/Express design, not just "because
we were told to."

## 7. Security Rules are the actual backend, and that has to be said out loud

The single easiest way to demo a broken Firebase app is to leave
Firestore in "test mode" (open read/write to anyone) past the first
day of development. Security Rules are not an optional hardening pass
at the end — they're the only thing standing between "a student can
edit their own listing" and "a student can edit anyone's listing,"
since there's no server in between checking that for them. This is
called out directly in `API_DOCUMENTATION.md` and should be treated as
launch-blocking, not a nice-to-have.

## 8. What's still open for the Development phase

This is Analysis & Design — these are correctly *not* resolved yet,
flagged here so they don't get lost:
- Final confirmation with Arrey on Firebase vs. MySQL for the
  architecture diagram (see `README.md` in this folder)
- Field-level validation rules (max lengths, enum checks) in the
  Security Rules draft — sketched, not exhaustive
- Firestore composite indexes will be needed once search/filter
  queries combine multiple `where()` clauses (e.g. category + price
  range + status) — Firestore will tell you exactly which index it
  needs the first time you run such a query in development; this is
  normal and expected, not a design flaw to solve in advance.
