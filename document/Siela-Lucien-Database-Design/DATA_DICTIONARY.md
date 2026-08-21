# CampusConnect — Data Dictionary

A single, flat reference for every field in the database: its type,
whether it's required, validation/constraints, and a plain description.
Where `FIRESTORE_SCHEMA.md` is organized by collection to show
structure, this document is organized for lookup — "what is
`resumeUrl` and where does it live" — which is the more common way a
data dictionary actually gets used during development or a Q&A.

| Collection | Field | Type | Required | Constraints / Validation | Description |
|---|---|---|---|---|---|
| users | (doc ID) | string | ✅ | Firebase Auth UID | Links the profile to its Auth account |
| users | fullName | string | ✅ | 1–120 chars | Display name |
| users | email | string | ✅ | Valid email format; mirrors Firebase Auth email | Contact + login identity |
| users | university | string | | max 150 chars | e.g. "University of Buea" |
| users | phone | string | | | Contact number |
| users | role | string | ✅ | enum: `student`, `admin` | Access level |
| users | createdAt | timestamp | ✅ | server-generated, immutable | Account creation time |
| categories | (doc ID) | string | ✅ | auto-generated | |
| categories | name | string | ✅ | 1–80 chars | e.g. "Textbooks" |
| categories | kind | string | ✅ | enum: `item`, `service` | Which listing types use this category |
| listings | (doc ID) | string | ✅ | auto-generated | |
| listings | sellerId | reference | ✅ | must be an existing `users` UID | Owner of the listing |
| listings | sellerName | string | ✅ | denormalized from `users.fullName` at write time | Avoids a second read on listing cards |
| listings | categoryId | reference | ✅ | must be an existing `categories` doc | |
| listings | categoryName | string | ✅ | denormalized | |
| listings | title | string | ✅ | 1–150 chars | |
| listings | description | string | ✅ | non-empty | |
| listings | price | number | ✅ | ≥ 0 | In XAF |
| listings | kind | string | ✅ | enum: `item`, `service` | |
| listings | condition | string | | enum: `New`, `Good`, `Fair`; items only | |
| listings | location | string | | max 150 chars | |
| listings | status | string | ✅ | enum: `active`, `sold`, `removed`; default `active` | Drives soft-delete + Mark as Sold (FR-MKT-01) |
| listings | images | array<string> | | max length 5; each a Storage download URL | FR-MKT-02 |
| listings | hourlyRate | number | | ≥ 0; services only | FR-SRV-01 |
| listings | skills | array<string> | | services only | FR-SRV-01 |
| listings | portfolioLink | string | | valid URL; services only | FR-SRV-01 |
| listings | createdAt | timestamp | ✅ | server-generated | |
| internships | (doc ID) | string | ✅ | auto-generated | |
| internships | postedBy | reference | ✅ | must be an existing `users` UID | |
| internships | title | string | ✅ | 1–150 chars | |
| internships | company | string | ✅ | 1–150 chars | |
| internships | type | string | ✅ | enum: `internship`, `job` | |
| internships | location | string | | | |
| internships | remote | boolean | | default `false` | |
| internships | description | string | ✅ | non-empty | |
| internships | deadline | timestamp | | | Applications blocked after this date |
| internships | applyLink | string | | valid URL if present | Empty = apply in-app |
| internships | createdAt | timestamp | ✅ | server-generated | |
| internships/*/applications | (doc ID) | string | ✅ | recommend: applicant's UID (prevents duplicate applications) | FR-JOB-02 |
| internships/*/applications | applicantId | reference | ✅ | must be an existing `users` UID | |
| internships/*/applications | applicantName | string | ✅ | denormalized | |
| internships/*/applications | applicantEmail | string | ✅ | denormalized | |
| internships/*/applications | resumeUrl | string | ✅ | Storage URL; PDF only, 5MB max, MIME + magic-byte validated | NFR-SEC-03 |
| internships/*/applications | coverNote | string | | max ~1000 chars | |
| internships/*/applications | status | string | ✅ | enum: `submitted`, `reviewed`, `accepted`, `rejected`; default `submitted` | |
| internships/*/applications | createdAt | timestamp | ✅ | server-generated | |
| events | (doc ID) | string | ✅ | auto-generated | |
| events | organizerId | reference | ✅ | must be an existing `users` UID | |
| events | title | string | ✅ | 1–150 chars | |
| events | description | string | | | |
| events | location | string | | | |
| events | eventDate | timestamp | ✅ | | FR-EVT-01 |
| events | category | string | | | |
| events | capacity | number | | ≥ 1 if present; absent = unlimited | FR-EVT-01 |
| events | rsvpCount | number | ✅ | ≥ 0; maintained by Cloud Function, not client-writable | Denormalized counter |
| events | createdAt | timestamp | ✅ | server-generated | |
| events/*/rsvps | (doc ID) | string | ✅ | the RSVPing user's UID | Existence = "going"; prevents duplicate RSVPs by construction |
| events/*/rsvps | createdAt | timestamp | ✅ | server-generated | |
| threads | (doc ID) | string | ✅ | `{listingId}_{sorted uid pair}` — deterministic | |
| threads | listingId | reference | ✅ | must be an existing `listings` doc | |
| threads | listingTitle | string | ✅ | denormalized | |
| threads | participantIds | array<string> | ✅ | exactly 2 UIDs | Used by Security Rules for access control |
| threads | lastMessage | string | ✅ | denormalized preview | |
| threads | lastMessageAt | timestamp | ✅ | | Sort key for the threads list |
| threads/*/messages | (doc ID) | string | ✅ | auto-generated | |
| threads/*/messages | senderId | reference | ✅ | must be one of the thread's `participantIds` | |
| threads/*/messages | content | string | ✅ | non-empty | FR-MSG-01 |
| threads/*/messages | createdAt | timestamp | ✅ | server-generated | |
| threads/*/messages | readBy | array<string> | | UIDs who've opened the thread since this message | Powers the unread badge |

## Notes on conventions used throughout

- **`(doc ID)`** rows describe the Firestore document ID itself where it
  carries meaning (several collections deliberately use a meaningful ID
  — a UID, or a deterministic composite — instead of an
  auto-generated one; see `ER_DIAGRAM.md` for why).
- **"denormalized"** fields are intentional duplicates of data that
  lives authoritatively elsewhere (usually `users`), copied at
  write-time purely to avoid an extra read on common screens. They can
  go stale; that tradeoff is discussed in `TECHNICAL_DOCUMENTATION.md`,
  not hidden.
- **Validation** listed here is enforced two ways in a Firebase app:
  client-side (form validation before submit) and, non-negotiably,
  in **Security Rules** (`API_DOCUMENTATION.md`) — client-side checks
  alone are never trustworthy since a user can call Firestore directly.
