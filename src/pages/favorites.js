// src/pages/favorites.js
// Route: /favorites.html

import { renderSidebar } from "../shared/sidebar.js";
import { renderFooter } from "../shared/footer.js";
import { renderCard } from "../shared/renderCard.js";
import { renderEmptyState, renderSkeletonGrid } from "../shared/uiHelpers.js";
import { initFavoritesStore, toggleFavorite } from "../shared/favoritesStore.js";
import { fetchJobById } from "../services/internshipsService.js";
import { fetchEventById } from "../services/eventsService.js";
import { fetchProductById } from "../services/marketplaceService.js";
import { fetchServiceById } from "../services/servicesService.js";

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
      let source = null;
      if (favorite.sourceCollection === "jobs") {
        source = await fetchJobById(favorite.sourceId);
      } else if (favorite.sourceCollection === "events") {
        source = await fetchEventById(favorite.sourceId);
      } else if (favorite.sourceCollection === "products" || favorite.sourceCollection === "listings") {
        source = await fetchProductById(favorite.sourceId);
      } else if (favorite.sourceCollection === "services") {
        source = await fetchServiceById(favorite.sourceId);
      }
      return { favorite, source };
    })
  );

  // Drop favorites whose source doc no longer exists
  enrichedItems = results.filter((r) => r.source);
  render();
});

function updateCounts(favorites) {
  const jobs = favorites.filter((f) => f.sourceCollection === "jobs").length;
  const events = favorites.filter((f) => f.sourceCollection === "events").length;
  const products = favorites.filter((f) => f.sourceCollection === "products" || f.sourceCollection === "listings").length;
  const services = favorites.filter((f) => f.sourceCollection === "services").length;

  document.getElementById("count-all").textContent = favorites.length ? `(${favorites.length})` : "";
  document.getElementById("count-jobs").textContent = jobs ? `(${jobs})` : "";
  document.getElementById("count-events").textContent = events ? `(${events})` : "";
  if (document.getElementById("count-products")) document.getElementById("count-products").textContent = products ? `(${products})` : "";
  if (document.getElementById("count-services")) document.getElementById("count-services").textContent = services ? `(${services})` : "";
}

function render() {
  const visible = enrichedItems.filter(({ favorite }) => {
    if (activeTab === "jobs") return favorite.sourceCollection === "jobs";
    if (activeTab === "events") return favorite.sourceCollection === "events";
    if (activeTab === "products") return favorite.sourceCollection === "products";
    if (activeTab === "services") return favorite.sourceCollection === "services";
    return true;
  });

  if (visible.length === 0) {
    mount.innerHTML = "";
    renderEmptyState(mount, {
      title: "Nothing saved here yet",
      description: "Tap Like (👍) or Save (❤️) on any item to view it here.",
    });
    return;
  }

  const grid = document.createElement("div");
  grid.className = "grid fade-in";

  visible.forEach(({ favorite, source }) => {
    const type = favorite.sourceCollection;
    let cardProps = {};

    if (type === "jobs") {
      cardProps = {
        to: `/job-details.html?id=${source.id}`,
        title: source.title,
        subtitle: source.company,
        meta: source.location,
        kind: "job",
      };
    } else if (type === "events") {
      cardProps = {
        to: `/event-details.html?id=${source.id}`,
        title: source.title,
        subtitle: source.venue,
        meta: formatEventDate(source),
        imageUrl: source.coverImageURL,
        kind: "event",
      };
    } else if (type === "products" || type === "listings") {
      cardProps = {
        to: `/product-details.html?id=${source.id}`,
        title: source.title,
        subtitle: source.price ? `${source.price} FCFA` : "",
        meta: source.location || "Campus",
        imageUrl: source.imageUrl,
        kind: "product",
      };
    } else if (type === "services") {
      cardProps = {
        to: `/service-details.html?id=${source.id}`,
        title: source.title,
        subtitle: source.rate ? `${source.rate} FCFA/hr` : "",
        meta: source.category,
        imageUrl: source.imageUrl,
        kind: "service",
      };
    }

    grid.appendChild(
      renderCard({
        ...cardProps,
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
