// src/shared/favoritesStore.js
// Dual-layer favorites store: Real-time Firestore sync when logged in, with LocalStorage fallback/cache.
// Ensures likes/saved items sync across all user devices (mobile, desktop, tablet) seamlessly.

import { db, auth } from "../firebase-config.js";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

const LOCAL_STORAGE_KEY = "campusconnect_favorites";
let favorites = loadFromLocalStorage();
let listeners = [];
let unsubscribeSnapshot = null;
let currentUserId = null;

function loadFromLocalStorage() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("Failed to read favorites from localStorage:", e);
    return [];
  }
}

function saveToLocalStorage() {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(favorites));
  } catch (e) {
    console.error("Failed to write favorites to localStorage:", e);
  }
}

function notify() {
  listeners.forEach((fn) => {
    try {
      fn(favorites);
    } catch (e) {
      console.error("Error in favorites listener:", e);
    }
  });
}

// Automatically bind to Auth state to sync with Firestore in real time
onAuthStateChanged(auth, (user) => {
  if (unsubscribeSnapshot) {
    unsubscribeSnapshot();
    unsubscribeSnapshot = null;
  }

  if (user) {
    currentUserId = user.uid;
    const userDocRef = doc(db, "users", user.uid);

    // Listen for real-time changes to the user's favorites in Firestore across devices
    unsubscribeSnapshot = onSnapshot(userDocRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (Array.isArray(data.favorites)) {
          // If local favorites had items prior to initial sync, merge them
          if (favorites.length > 0) {
            const merged = [...data.favorites];
            let changed = false;
            favorites.forEach((localFav) => {
              const exists = merged.some(
                (f) =>
                  f.sourceCollection === localFav.sourceCollection &&
                  String(f.sourceId) === String(localFav.sourceId)
              );
              if (!exists) {
                merged.push(localFav);
                changed = true;
              }
            });

            favorites = merged;
            saveToLocalStorage();

            if (changed) {
              setDoc(userDocRef, { favorites: merged }, { merge: true }).catch(console.error);
            }
          } else {
            favorites = data.favorites;
            saveToLocalStorage();
          }
          notify();
        }
      }
    }, (error) => {
      console.warn("Firestore favorites snapshot error:", error);
    });
  } else {
    currentUserId = null;
    favorites = loadFromLocalStorage();
    notify();
  }
});

export function initFavoritesStore(onChange) {
  if (onChange && typeof onChange === "function") {
    if (!listeners.includes(onChange)) {
      listeners.push(onChange);
    }
    onChange(favorites);
  }
}

export function getFavorites() {
  return favorites;
}

export function isFavorited(sourceCollection, sourceId) {
  return favorites.some(
    (f) => f.sourceCollection === sourceCollection && String(f.sourceId) === String(sourceId)
  );
}

export async function toggleFavorite(sourceCollection, sourceId, title) {
  const index = favorites.findIndex(
    (f) => f.sourceCollection === sourceCollection && String(f.sourceId) === String(sourceId)
  );

  if (index >= 0) {
    favorites.splice(index, 1);
  } else {
    favorites.push({
      sourceCollection,
      sourceId: String(sourceId),
      title: title || "",
      savedAt: new Date().toISOString(),
    });
  }

  saveToLocalStorage();
  notify();

  // Sync to Firestore if user is authenticated
  if (auth.currentUser) {
    try {
      const userDocRef = doc(db, "users", auth.currentUser.uid);
      await setDoc(userDocRef, { favorites }, { merge: true });
    } catch (e) {
      console.error("Failed to sync favorite toggle to Firestore:", e);
    }
  }
}
