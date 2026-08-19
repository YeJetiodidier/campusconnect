// src/shared/renderCard.js
// Builds the listing card markup used by both Internship Listings and
// Campus Events grids, and wires up its favorite-toggle button.
//
// options: { to, title, subtitle, meta, imageUrl, kind ("job"|"event"),
//            favorited, onToggleFavorite }
// When there's no imageUrl (most internships), a branded icon thumbnail
// is used instead of a broken/empty image.

import { icons } from "./icons.js";

export function renderCard(options) {
  const { to, title, subtitle, meta, imageUrl, kind = "job", favorited, onToggleFavorite } = options;
  const fallbackIcon = kind === "event" ? icons.calendar : icons.briefcase;

  const card = document.createElement("div");
  card.className = "card fade-in";
  card.innerHTML = `
    <button type="button" class="favorite-btn ${favorited ? "favorited" : ""}" aria-label="${
    favorited ? "Remove from favorites" : "Save to favorites"
  }"><span class="icon">${icons.heart}</span></button>
    <a href="${to}" class="card-link">
      ${
        imageUrl
          ? `<img src="${imageUrl}" alt="${title}" />`
          : `<div class="card-thumb-fallback"><span class="icon">${fallbackIcon}</span></div>`
      }
      <div class="card-body">
        <p class="card-title">${escapeHtml(title)}</p>
        ${subtitle ? `<p class="card-subtitle">${escapeHtml(subtitle)}</p>` : ""}
        ${meta ? `<p class="card-meta">${escapeHtml(meta)}</p>` : ""}
      </div>
    </a>
  `;

  card.querySelector(".favorite-btn").addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    onToggleFavorite();
  });

  return card;
}

export function escapeHtml(value) {
  if (value == null) return "";
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}
