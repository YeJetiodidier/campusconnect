# CampusConnect — Installation Guide (Firebase Setup)

This covers standing up the Firebase project itself — the database and
backend services this design assumes. It doesn't cover the frontend
build/hosting (that overlaps with the UI team's setup once their build
exists).

## 1. Prerequisites
- A Google account
- [Node.js](https://nodejs.org) 18+ (for the Firebase CLI and Cloud Functions)

## 2. Create the Firebase project
1. Go to [console.firebase.google.com](https://console.firebase.google.com) → **Add project**
2. Name it (e.g. `campusconnect-dev` for development, a separate
   `campusconnect-prod` later for the real launch — don't share one
   project between dev and grading/demo data)
3. Google Analytics is optional for this project — safe to skip

## 3. Enable the services this design uses
In the left sidebar:
- **Authentication** → Sign-in method → enable **Email/Password**
- **Firestore Database** → Create database → start in **test mode** for
  development (switch to the rules in `API_DOCUMENTATION.md` before any
  real data goes in — test mode allows anyone to read/write everything)
- **Storage** → Get started (for listing images and resumes)

## 4. Install the CLI and connect the project
```bash
npm install -g firebase-tools
firebase login
firebase init
```
When prompted, select: **Firestore**, **Functions**, **Storage**,
**Hosting** (if the frontend will deploy here too), and pick the
project you created in step 2.

## 5. Add the Security Rules
Copy the rules draft from `API_DOCUMENTATION.md` into the
`firestore.rules` file `firebase init` created, then deploy:
```bash
firebase deploy --only firestore:rules
```

## 6. Seed the categories collection
Categories are read-only from the client, so they need to be created
once via the Firebase Console (Firestore → Start collection →
`categories`) or a small one-off script — see `DATA_DICTIONARY.md` for
the fields each category document needs.

## 7. Get the web app config
Project settings (gear icon) → your apps → **Add app → Web**. This
gives you the `firebaseConfig` object the frontend needs to initialize
the SDK (`initializeApp(firebaseConfig)`).

## 8. University email restriction (FR-AUTH-01)
Firebase Authentication doesn't have a built-in "only allow this email
domain" setting — this has to be enforced in the `onUserCreate` Cloud
Function (see `API_DOCUMENTATION.md`), which checks the new account's
email domain and disables/deletes the account if it doesn't match the
institution's domain.

## 9. Local development
```bash
firebase emulators:start
```
Runs Firestore, Auth, and Storage emulators locally — lets the whole
team develop and test Security Rules without touching real (or
shared) data, and without needing a live internet connection for most
of the work.

## Costs to be aware of
Firebase's free "Spark" plan covers Authentication and a generous
Firestore/Storage quota — enough for development and a class
demo/presentation. Cloud Functions requires the pay-as-you-go "Blaze"
plan to deploy at all (it still has a free monthly quota, but it does
require adding a billing method) — worth flagging to the team before
picking Cloud Functions for something that could instead be handled
client-side.
