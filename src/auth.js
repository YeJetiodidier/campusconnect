// src/auth.js
// TM2 (Ronic) owns the real Authentication module. This is the interface
// TM4's pages expect from it — swap the body of getCurrentUser() /
// onAuthChange() for TM2's actual Firebase Auth wiring once it lands in
// the shared repo. Keeping the same function signatures means the rest
// of this module doesn't need to change.

import { auth } from "./firebase-config.js";
import { onAuthStateChanged } from "firebase/auth";

/**
 * Calls `callback(user)` whenever auth state changes, where `user` is
 * `{ uid, displayName, email }` or `null` when logged out.
 * Returns an unsubscribe function.
 */
export function onAuthChange(callback) {
  return onAuthStateChanged(auth, (firebaseUser) => {
    if (!firebaseUser) {
      callback(null);
      return;
    }
    callback({
      uid: firebaseUser.uid,
      displayName: firebaseUser.displayName,
      email: firebaseUser.email,
    });
  });
}

/** One-off read of the current user (or null). Prefer onAuthChange for UI that needs to react live. */
export function getCurrentUser() {
  const u = auth.currentUser;
  if (!u) return null;
  return { uid: u.uid, displayName: u.displayName, email: u.email };
}
