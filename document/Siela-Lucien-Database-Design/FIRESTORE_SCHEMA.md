# CampusConnect — Firestore Database Schema

Firestore doesn't enforce a schema at the database level the way SQL's
`CREATE TABLE` does — any document in a collection *could* have
different fields. This document is the schema in the sense that
matters for a team: the structure every document is expected to
follow, enforced in practice by (1) the client/Cloud Function code that
writes it and (2) Security Rules that reject writes shaping data wrong
(see `API_DOCUMENTATION.md`).

Type notation: `string`, `number`, `boolean`, `timestamp`,
`array<T>`, `map` (Firestore's nested-object type), and `reference`
(a document reference, stored as a UID/ID string pointing at another
collection).

---

## `users/{uid}`
Document ID = the Firebase Authentication UID (not auto-generated —
this is what links a Firestore profile to its Auth account).

| Field | Type | Required | Notes |
|---|---|---|---|
| fullName | string | ✅ | |
| email | string | ✅ | Mirrors the Firebase Auth email; kept here too so it's queryable in Firestore without a separate Auth lookup. |
| university | string | | |
| phone | string | | |
| role | string | ✅ | `"student"` \| `"admin"` — default `"student"`. |
| createdAt | timestamp | ✅ | Set via `serverTimestamp()` at creation, never client-supplied. |

**Not stored here:** password, verification token/expiry, session
tokens — all owned by Firebase Authentication itself. See
`TECHNICAL_DOCUMENTATION.md`.

---

## `categories/{categoryId}`

| Field | Type | Required | Notes |
|---|---|---|---|
| name | string | ✅ | e.g. "Textbooks", "Tutoring" |
| kind | string | ✅ | `"item"` \| `"service"` |

Small, rarely-written, read by every listing/search screen — a good
candidate for client-side caching.

---

## `listings/{listingId}`

| Field | Type | Required | Notes |
|---|---|---|---|
| sellerId | reference (uid) | ✅ | Points to `users/{uid}` |
| sellerName | string | ✅ | **Denormalized** copy of the seller's name, written once at listing-creation time, so a listing card can render without a second read. Accepted staleness: if the seller renames themselves later, past listings keep the old name until re-saved — a deliberate tradeoff, see `TECHNICAL_DOCUMENTATION.md`. |
| categoryId | reference | ✅ | Points to `categories/{id}` |
| categoryName | string | ✅ | Denormalized, same reasoning as `sellerName` |
| title | string | ✅ | |
| description | string | ✅ | |
| price | number | ✅ | |
| kind | string | ✅ | `"item"` \| `"service"` |
| condition | string | | Items only |
| location | string | | |
| status | string | ✅ | `"active"` \| `"sold"` \| `"removed"` — default `"active"` |
| images | array\<string\> | | Up to 5 Firebase Storage download URLs |
| hourlyRate | number | | Services only |
| skills | array\<string\> | | Services only |
| portfolioLink | string | | Services only |
| createdAt | timestamp | ✅ | `serverTimestamp()` |

---

## `internships/{internshipId}`

| Field | Type | Required | Notes |
|---|---|---|---|
| postedBy | reference (uid) | ✅ | |
| title | string | ✅ | |
| company | string | ✅ | |
| type | string | ✅ | `"internship"` \| `"job"` |
| location | string | | |
| remote | boolean | | default `false` |
| description | string | ✅ | |
| deadline | timestamp | | |
| applyLink | string | | If set, "Apply" opens this externally; if empty, applications happen via the subcollection below. |
| createdAt | timestamp | ✅ | |

### `internships/{internshipId}/applications/{applicationId}` (subcollection)

| Field | Type | Required | Notes |
|---|---|---|---|
| applicantId | reference (uid) | ✅ | |
| applicantName | string | ✅ | Denormalized |
| applicantEmail | string | ✅ | Denormalized |
| resumeUrl | string | ✅ | Firebase Storage URL (PDF) |
| coverNote | string | | |
| status | string | ✅ | `"submitted"` \| `"reviewed"` \| `"accepted"` \| `"rejected"` |
| createdAt | timestamp | ✅ | |

Document ID recommendation: use the applicant's `uid` as the document
ID (same pattern as RSVPs below) so "has this student already applied"
is a direct read and a second application structurally can't be
created.

---

## `events/{eventId}`

| Field | Type | Required | Notes |
|---|---|---|---|
| organizerId | reference (uid) | ✅ | |
| title | string | ✅ | |
| description | string | | |
| location | string | | |
| eventDate | timestamp | ✅ | |
| category | string | | |
| capacity | number | | Absent/null = unlimited |
| rsvpCount | number | ✅ | **Denormalized counter**, incremented/decremented by a Cloud Function whenever a document is added/removed from the `rsvps` subcollection — avoids counting the whole subcollection on every page load. See `TECHNICAL_DOCUMENTATION.md`. |
| createdAt | timestamp | ✅ | |

### `events/{eventId}/rsvps/{uid}` (subcollection, doc ID = the RSVPing user's UID)

| Field | Type | Required | Notes |
|---|---|---|---|
| createdAt | timestamp | ✅ | |

Deliberately minimal — the document's *existence* at a known ID is the
data that matters; there's nothing else to store per RSVP.

---

## `threads/{threadId}`
Document ID: `{listingId}_{sorted uid1}_{sorted uid2}` — deterministic,
so re-opening a conversation always resolves to the same document.

| Field | Type | Required | Notes |
|---|---|---|---|
| listingId | reference | ✅ | |
| listingTitle | string | ✅ | Denormalized |
| participantIds | array\<string\> | ✅ | Exactly 2 UIDs — used by Security Rules to check membership |
| lastMessage | string | ✅ | Denormalized preview, updated on every new message |
| lastMessageAt | timestamp | ✅ | |

### `threads/{threadId}/messages/{messageId}` (subcollection)

| Field | Type | Required | Notes |
|---|---|---|---|
| senderId | reference (uid) | ✅ | |
| content | string | ✅ | |
| createdAt | timestamp | ✅ | `serverTimestamp()` |
| readBy | array\<string\> | | UIDs who've seen it — powers the unread badge |

Real-time delivery (FR-MSG-01) needs **no custom infrastructure**
here: the client subscribes to this subcollection with
`onSnapshot()` and Firestore pushes new messages live. See
`TECHNICAL_DOCUMENTATION.md`.
