// src/services/favoritesService.js
// Firestore access for the Favorites feature, shared across Internships,
// Events, and the Dashboard.
//
// Subcollection: users/{uid}/favorites/{favoriteId}
// Each doc: { sourceCollection: "jobs" | "events", sourceId, title,
//             savedAt (Timestamp) }
// favoriteId is deterministic: `${sourceCollection}_${sourceId}` so
// save/un-save can target the doc directly without an extra query.

import { db } from "../firebase-config.js";
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";

function favoritesRef(uid) {
  return collection(db, "users", uid, "favorites");
}

function favoriteDocId(sourceCollection, sourceId) {
  return `${sourceCollection}_${sourceId}`;
}

/** Live-subscribe to all of a user's favorites. Returns an unsubscribe function. */
export function subscribeToFavorites(uid, callback) {
  return onSnapshot(favoritesRef(uid), (snapshot) => {
    callback(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}

/** Save an item (internship/job or event) to favorites. */
export async function addFavorite(uid, sourceCollection, sourceId, title) {
  await setDoc(doc(db, "users", uid, "favorites", favoriteDocId(sourceCollection, sourceId)), {
    sourceCollection,
    sourceId,
    title,
    savedAt: serverTimestamp(),
  });
}

/** Remove an item from favorites. */
export async function removeFavorite(uid, sourceCollection, sourceId) {
  await deleteDoc(doc(db, "users", uid, "favorites", favoriteDocId(sourceCollection, sourceId)));
}

export function isFavorited(favorites, sourceCollection, sourceId) {
  return favorites.some((f) => f.sourceCollection === sourceCollection && f.sourceId === sourceId);
}
