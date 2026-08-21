# CampusConnect — Initial API Documentation (Firebase)

## There is no custom REST API for most of this app

This is the most important thing to understand about "the API" in a
Firebase architecture, worth stating plainly so nobody expects a
Swagger-style endpoint list and is confused not to find one: the client
app (web/PWA) talks **directly to Firestore and Firebase Storage**
using Firebase's client SDK. There's no Node/Express server sitting in
between handling `GET /api/listings` the way a traditional backend
would.

In this architecture, **the "API" is enforced by two things instead**:
1. **Security Rules** — Firestore/Storage's own access-control
   language, evaluated on every read/write. This is the real security
   boundary; it's not optional and it's not the same as client-side
   validation (a user can always call Firestore directly, bypassing
   your UI).
2. **Cloud Functions** — small server-side functions for the handful of
   operations that genuinely need trusted server logic (can't be
   expressed as "is this write shaped correctly," like maintaining a
   denormalized counter).

## Security Rules (draft, by collection)

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function isSignedIn() { return request.auth != null; }
    function isOwner(uid) { return isSignedIn() && request.auth.uid == uid; }

    // users: anyone signed in can read profiles; only the owner can write their own
    match /users/{uid} {
      allow read: if isSignedIn();
      allow create: if isOwner(uid);
      allow update: if isOwner(uid);
      allow delete: if false; // account deletion goes through a Cloud Function (cleans up their listings/messages first)
    }

    // categories: read-only from the client; managed by admins via the console/a Function
    match /categories/{id} {
      allow read: if true;
      allow write: if false;
    }

    // listings: anyone can browse; only the signed-in owner can create/edit/soft-delete their own
    match /listings/{id} {
      allow read: if true;
      allow create: if isSignedIn() && request.resource.data.sellerId == request.auth.uid;
      allow update: if isOwner(resource.data.sellerId);
      allow delete: if false; // soft-delete only: this is an update (status: "removed"), never a real delete
    }

    // internships: anyone can browse; only a signed-in user can post
    match /internships/{id} {
      allow read: if true;
      allow create: if isSignedIn() && request.resource.data.postedBy == request.auth.uid;
      allow update: if isOwner(resource.data.postedBy);

      // applications: applicant can create their own; only the internship's poster can read the list
      match /applications/{applicantUid} {
        allow create: if isOwner(applicantUid);
        allow read: if isOwner(applicantUid)
                     || isOwner(get(/databases/$(database)/documents/internships/$(id)).data.postedBy);
      }
    }

    // events: anyone can browse; only a signed-in user can create
    match /events/{id} {
      allow read: if true;
      allow create: if isSignedIn() && request.resource.data.organizerId == request.auth.uid;
      allow update: if false; // rsvpCount is Cloud-Function-only, everything else is edited by the organizer via a Function too

      // rsvps: a user can only create/delete THEIR OWN rsvp document (doc ID = their uid)
      match /rsvps/{uid} {
        allow read: if true;
        allow create, delete: if isOwner(uid);
      }
    }

    // threads & messages: only the two participants can read/write
    match /threads/{threadId} {
      allow read, update: if isSignedIn() && request.auth.uid in resource.data.participantIds;
      allow create: if isSignedIn() && request.auth.uid in request.resource.data.participantIds;

      match /messages/{messageId} {
        allow read: if isSignedIn() && request.auth.uid in get(/databases/$(database)/documents/threads/$(threadId)).data.participantIds;
        allow create: if isSignedIn() && request.resource.data.senderId == request.auth.uid;
      }
    }
  }
}
```

This is a **first draft** for the Analysis & Design phase — it should
be reviewed against the final module list once Arrey's system design is
confirmed against Firebase, and tightened further (e.g. field-level
validation: max string lengths, enum checks on `status`/`kind`/`type`,
image-count limits) before implementation.

## Cloud Functions (the handful of operations that need server trust)

| Function | Trigger | Purpose |
|---|---|---|
| `onUserCreate` | Auth trigger, on new account | Creates the matching `users/{uid}` profile document; checks the email domain against the allowed university list (FR-AUTH-01) and can disable/flag the account if it doesn't match. |
| `onRsvpWrite` | Firestore trigger, on create/delete under `events/{id}/rsvps/{uid}` | Increments/decrements `events/{id}.rsvpCount`. Also checks capacity and can reject over-capacity writes. |
| `onApplicationCreate` | Firestore trigger, on new application | Optional: notify the poster (email/notification) that a new application arrived. |
| `validateUpload` | Storage trigger, on file finalize | MIME-type + magic-byte validation for uploaded images/resumes (NFR-SEC-03) before the corresponding Firestore document is allowed to reference the file. |
| `deleteUserData` | Callable, invoked on account deletion | Cascades cleanup — since Firestore has no `ON DELETE CASCADE` the way SQL does, this Function has to walk and delete/anonymize a user's listings, messages, etc. by hand. |

## Client SDK access patterns, by module (matches Arrey's module list)

**Authentication Module**
```js
// Register
const cred = await createUserWithEmailAndPassword(auth, email, password);
await sendEmailVerification(cred.user);           // FR-AUTH-02, built into Firebase Auth
await setDoc(doc(db, "users", cred.user.uid), { fullName, university, phone, role: "student", createdAt: serverTimestamp() });

// Login
const cred = await signInWithEmailAndPassword(auth, email, password);
if (!cred.user.emailVerified) { /* block, prompt to verify — UC-01 alt flow 3b */ }
```

**Marketplace Module**
```js
// Search/filter (FR-SCH-01)
query(collection(db, "listings"),
  where("status", "==", "active"),
  where("categoryId", "==", categoryId),
  orderBy("createdAt", "desc"));
```

**Messaging Module** — real-time, no extra infrastructure needed:
```js
onSnapshot(collection(db, "threads", threadId, "messages"), (snap) => {
  // fires immediately on every new message — this IS FR-MSG-01
});
```

## What this replaces from an earlier, non-Firebase prototype

An earlier working prototype (see `/software-engineering` root) used a
hand-rolled Node.js backend with its own REST API, a custom SMTP
client, and a hand-rolled WebSocket server — all of that becomes
unnecessary under Firebase: Authentication, `onSnapshot()`, and Cloud
Functions cover the same ground natively. That prototype is still
useful as a working reference for the *feature logic* (what a listing
needs, how applications/RSVPs should behave) but its backend
architecture should not be presented as the Firebase implementation.
