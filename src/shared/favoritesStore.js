// src/shared/favoritesStore.js
// Small in-memory store for the current page's favorites, kept in sync
// with Firestore. Each page calls initFavoritesStore() once on load; other
// modules on that page can then read isFavorited() / call toggleFavorite()
// without each maintaining their own subscription.

import { onAuthChange } from "../auth.js";
import { subscribeToFavorites, addFavorite, removeFavorite, isFavorited as checkFavorited } from "../services/favoritesService.js";

let favorites = [];
let currentUser = null;
let listeners = [];

export function initFavoritesStore(onChange) {
  if (onChange) listeners.push(onChange);

  let unsubscribeFavorites = null;
  onAuthChange((user) => {
    currentUser = user;
    if (unsubscribeFavorites) unsubscribeFavorites();

    if (!user) {
      favorites = [];
      notify();
      return;
    }
    unsubscribeFavorites = subscribeToFavorites(user.uid, (items) => {
      favorites = items;
      notify();
    });
  });
}

function notify() {
  listeners.forEach((fn) => fn(favorites));
}

export function getFavorites() {
  return favorites;
}

export function isFavorited(sourceCollection, sourceId) {
  return checkFavorited(favorites, sourceCollection, sourceId);
}

export async function toggleFavorite(sourceCollection, sourceId, title) {
  if (!currentUser) {
    alert("Please log in to save items.");
    return;
  }
  if (checkFavorited(favorites, sourceCollection, sourceId)) {
    await removeFavorite(currentUser.uid, sourceCollection, sourceId);
  } else {
    await addFavorite(currentUser.uid, sourceCollection, sourceId, title);
  }
}
