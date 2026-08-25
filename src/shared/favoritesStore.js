// src/shared/favoritesStore.js
// Client-side local storage implementation for Saved Items / Favorites.
// Eliminates Firestore document reads/writes for user saved items to avoid billing costs.

const LOCAL_STORAGE_KEY = "campusconnect_favorites";
let favorites = loadFromLocalStorage();
let listeners = [];

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
  listeners.forEach((fn) => fn(favorites));
}

export function initFavoritesStore(onChange) {
  if (onChange) {
    listeners.push(onChange);
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
}
