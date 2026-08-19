// src/pages/events.js
// Route: /events.html

import { renderSidebar } from "../shared/sidebar.js";
import { renderFooter } from "../shared/footer.js";
import { renderCard } from "../shared/renderCard.js";
import { renderEmptyState, renderSkeletonGrid } from "../shared/uiHelpers.js";
import { initFavoritesStore, isFavorited, toggleFavorite } from "../shared/favoritesStore.js";
import { fetchUpcomingEvents } from "../services/eventsService.js";

renderSidebar("events");
renderFooter();

const mount = document.getElementById("events-mount");
const chipsContainer = document.getElementById("category-chips");

let currentCategory = "";
let events = [];

initFavoritesStore(() => renderList());

async function load() {
  renderSkeletonGrid(mount);
  events = await fetchUpcomingEvents({ category: currentCategory });
  renderList();
}

function renderList() {
  if (events.length === 0) {
    renderEmptyState(mount, {
      title: "No upcoming events",
      description: "Check back soon, or try a different category.",
    });
    return;
  }

  const grid = document.createElement("div");
  grid.className = "grid fade-in";

  events.forEach((event) => {
    grid.appendChild(
      renderCard({
        to: `/event-details.html?id=${event.id}`,
        title: event.title,
        subtitle: event.venue,
        meta: formatEventDate(event),
        imageUrl: event.coverImageURL,
        kind: "event",
        favorited: isFavorited("events", event.id),
        onToggleFavorite: () => toggleFavorite("events", event.id, event.title),
      })
    );
  });

  mount.innerHTML = "";
  mount.appendChild(grid);
}

function formatEventDate(event) {
  if (!event.date) return "";
  const date = event.date?.toDate ? event.date.toDate() : new Date(event.date);
  const dateStr = date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  return event.time ? `${dateStr} · ${event.time}` : dateStr;
}

chipsContainer.addEventListener("click", (e) => {
  const chip = e.target.closest(".chip");
  if (!chip) return;
  chipsContainer.querySelectorAll(".chip").forEach((c) => c.classList.remove("active"));
  chip.classList.add("active");
  currentCategory = chip.dataset.category;
  load();
});

load();
