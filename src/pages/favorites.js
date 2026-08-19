// src/pages/favorites.js
// Route: /favorites.html
//
// The favorites subcollection only stores { sourceCollection, sourceId,
// title, savedAt } — enough to render a plain list, but not enough for a
// full card (location, company, venue, image). So for each favorite we
// fetch the full source document (job or event) and render it with the
// same renderCard used on the Internships/Events pages, keeping the
// look consistent across the app.

import { renderSidebar } from "../shared/sidebar.js";
import { renderFooter } from "../shared/footer.js";
import { renderCard } from "../shared/renderCard.js";
import { renderEmptyState, renderSkeletonGrid } from "../shared/uiHelpers.js";
import { initFavoritesStore, toggleFavorite } from "../shared/favoritesStore.js";
import { fetchJobById } from "../services/internshipsService.js";
import { fetchEventById } from "../services/eventsService.js";

renderSidebar("favorites");
renderFooter();

const mount = document.getElementById("favorites-mount");
const chipsContainer = document.getElementById("tab-chips");

let activeTab = "all";
let enrichedItems = []; // [{ favorite, source }]

initFavoritesStore(async (favorites) => {
  updateCounts(favorites);

  if (favorites.length === 0) {
    enrichedItems = [];
    render();
    return;
  }

  renderSkeletonGrid(mount);

  const results = await Promise.all(
    favorites.map(async (favorite) => {
      const source =
        favorite.sourceCollection === "jobs"
          ? await fetchJobById(favorite.sourceId)
          : await fetchEventById(favorite.sourceId);
      return { favorite, source };
    })
  );

  // Drop favorites whose source doc no longer exists (deleted listing/event).
  enrichedItems = results.filter((r) => r.source);
  render();
});

function updateCounts(favorites) {
  const jobs = favorites.filter((f) => f.sourceCollection === "jobs").length;
  const events = favorites.filter((f) => f.sourceCollection === "events").length;
  document.getElementById("count-all").textContent = favorites.length ? `(${favorites.length})` : "";
  document.getElementById("count-jobs").textContent = jobs ? `(${jobs})` : "";
  document.getElementById("count-events").textContent = events ? `(${events})` : "";
}

function render() {
  const visible = enrichedItems.filter(({ favorite }) => {
    if (activeTab === "jobs") return favorite.sourceCollection === "jobs";
    if (activeTab === "events") return favorite.sourceCollection === "events";
    return true;
  });

  if (visible.length === 0) {
    mount.innerHTML = "";
    renderEmptyState(mount, {
      title: "Nothing saved here yet",
      description: "Tap the heart icon on any internship or event to save it for later.",
    });
    return;
  }

  const grid = document.createElement("div");
  grid.className = "grid fade-in";

  visible.forEach(({ favorite, source }) => {
    const isJob = favorite.sourceCollection === "jobs";
    grid.appendChild(
      renderCard({
        to: isJob ? `/job-details.html?id=${source.id}` : `/event-details.html?id=${source.id}`,
        title: source.title,
        subtitle: isJob ? source.company : source.venue,
        meta: isJob ? source.location : formatEventDate(source),
        imageUrl: isJob ? undefined : source.coverImageURL,
        kind: isJob ? "job" : "event",
        favorited: true,
        onToggleFavorite: () => toggleFavorite(favorite.sourceCollection, favorite.sourceId, favorite.title),
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
  activeTab = chip.dataset.tab;
  render();
});
