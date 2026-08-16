// src/pages/event-details.js
// Route: /event-details.html?id=<eventId>

import { icons } from "../shared/icons.js";
import { renderSidebar } from "../shared/sidebar.js";
import { renderFooter } from "../shared/footer.js";
import { renderEmptyState } from "../shared/uiHelpers.js";
import { escapeHtml } from "../shared/renderCard.js";
import { initFavoritesStore, isFavorited, toggleFavorite } from "../shared/favoritesStore.js";
import { fetchEventById, rsvpToEvent, cancelRsvp, getRsvpStatus } from "../services/eventsService.js";
import { onAuthChange } from "../auth.js";

renderSidebar("events");
renderFooter();

const mount = document.getElementById("event-details-mount");
const eventId = new URLSearchParams(location.search).get("id");

let event = null;
let currentUser = null;
let rsvped = false;

initFavoritesStore(() => {
  if (event) updateFavoriteButton();
});

onAuthChange(async (user) => {
  currentUser = user;
  if (event && user) {
    rsvped = await getRsvpStatus(event.id, user.uid);
    updateRsvpButton();
  }
});

async function load() {
  if (!eventId) {
    renderNotFound();
    return;
  }
  event = await fetchEventById(eventId);
  if (!event) {
    renderNotFound();
    return;
  }
  if (currentUser) {
    rsvped = await getRsvpStatus(event.id, currentUser.uid);
  }
  renderEvent();
}

function renderNotFound() {
  mount.innerHTML = "";
  renderEmptyState(mount, {
    title: "This event isn't available",
    description: "It may have been removed or already taken place.",
  });
  const link = document.createElement("div");
  link.style.textAlign = "center";
  link.innerHTML = `<a href="/events.html" style="color:#7c3aed;text-decoration:underline;font-size:13px;">Back to Campus Events</a>`;
  mount.appendChild(link);
}

function renderEvent() {
  const dateStr = formatEventDate(event);

  mount.innerHTML = `
    <a href="/events.html" class="back-link"><span class="icon">${icons.chevronLeft}</span> Back to events</a>

    ${event.coverImageURL ? `<img src="${event.coverImageURL}" alt="${escapeHtml(event.title)}" class="detail-image" />` : ""}

    <div class="detail-header">
      <h1 class="detail-title">${escapeHtml(event.title)}</h1>
      <button type="button" id="favorite-btn" class="icon-btn" aria-label="Save to favorites"><span class="icon">${icons.heart}</span></button>
    </div>

    <div class="detail-meta">
      ${dateStr ? `<span class="meta-item"><span class="icon">${icons.calendar}</span> ${dateStr}</span>` : ""}
      ${event.venue ? `<span class="meta-item"><span class="icon">${icons.location}</span> ${escapeHtml(event.venue)}</span>` : ""}
      ${event.capacity ? `<span class="meta-item"><span class="icon">${icons.user}</span> Capacity ${event.capacity}</span>` : ""}
    </div>

    <div class="detail-body">${escapeHtml(event.description)}</div>

    <div style="margin-top:32px;">
      <button type="button" id="rsvp-btn" class="btn btn-primary"></button>
    </div>
  `;

  document.getElementById("favorite-btn").addEventListener("click", () => {
    toggleFavorite("events", event.id, event.title);
  });
  document.getElementById("rsvp-btn").addEventListener("click", handleRsvpToggle);

  updateFavoriteButton();
  updateRsvpButton();
}

async function handleRsvpToggle() {
  if (!currentUser) {
    alert("Please log in to RSVP.");
    return;
  }
  const btn = document.getElementById("rsvp-btn");
  btn.disabled = true;
  btn.textContent = "Please wait…";

  if (rsvped) {
    await cancelRsvp(event.id, currentUser.uid);
    rsvped = false;
  } else {
    await rsvpToEvent(event.id, currentUser.uid);
    rsvped = true;
  }
  btn.disabled = false;
  updateRsvpButton();
}

function updateRsvpButton() {
  const btn = document.getElementById("rsvp-btn");
  if (!btn) return;
  btn.textContent = rsvped ? "You're going · Cancel RSVP" : "RSVP / I'm interested";
  btn.classList.toggle("btn-secondary", rsvped);
  btn.classList.toggle("btn-primary", !rsvped);
}

function updateFavoriteButton() {
  const btn = document.getElementById("favorite-btn");
  if (!btn) return;
  const favorited = isFavorited("events", event.id);
  btn.classList.toggle("favorited", favorited);
  btn.setAttribute("aria-label", favorited ? "Remove from favorites" : "Save to favorites");
}

function formatEventDate(event) {
  if (!event.date) return "";
  const date = event.date?.toDate ? event.date.toDate() : new Date(event.date);
  const dateStr = date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  return event.time ? `${dateStr} · ${event.time}` : dateStr;
}

load();
