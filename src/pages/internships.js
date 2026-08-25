// src/pages/internships.js
// Route: /internships.html

import { renderSidebar } from "../shared/sidebar.js";
import { renderFooter } from "../shared/footer.js";
import { renderCard } from "../shared/renderCard.js";
import { renderEmptyState, renderSkeletonGrid } from "../shared/uiHelpers.js";
import { initFavoritesStore, isFavorited, toggleFavorite } from "../shared/favoritesStore.js";
import { fetchInternshipListings, filterByKeyword, createInternshipListing } from "../services/internshipsService.js";
import { isUserAgency } from "../shared/permissions.js";
import { auth } from "../firebase-config.js";
import { onAuthStateChanged } from "firebase/auth";

renderSidebar("internships");
renderFooter();

const mount = document.getElementById("listings-mount");
const loadMoreRow = document.getElementById("load-more-row");
const loadMoreBtn = document.getElementById("load-more-btn");
const keywordInput = document.getElementById("keyword-input");
const typeSelect = document.getElementById("type-select");
const categorySelect = document.getElementById("category-select");

// UI nodes for Agency Posts
const agencyPostBtn = document.getElementById("agency-post-btn");
const createJobPanel = document.getElementById("create-job-panel");
const cancelJobBtn = document.getElementById("cancel-job-btn");
const createJobForm = document.getElementById("create-job-form");
const submitJobBtn = document.getElementById("submit-job-btn");

let currentUser = null;

// Auth check specifically for the post button
onAuthStateChanged(auth, (user) => {
  currentUser = user;
  if (isUserAgency(user)) {
    agencyPostBtn.style.display = "block";
  }
});

agencyPostBtn.addEventListener("click", () => {
  window.location.href = "/post-opportunity.html";
});

let allItems = [];
let lastDoc = null;
let hasMore = false;

initFavoritesStore(() => renderList()); // re-render cards when favorites change

async function loadFirstPage() {
  renderSkeletonGrid(mount);
  const filters = { type: typeSelect.value, category: categorySelect.value };
  const result = await fetchInternshipListings(filters);
  allItems = result.items;
  lastDoc = result.lastDoc;
  hasMore = result.hasMore;
  renderList();
}

async function loadMore() {
  loadMoreBtn.disabled = true;
  loadMoreBtn.textContent = "Loading…";
  const filters = { type: typeSelect.value, category: categorySelect.value };
  const result = await fetchInternshipListings(filters, lastDoc);
  allItems = allItems.concat(result.items);
  lastDoc = result.lastDoc;
  hasMore = result.hasMore;
  loadMoreBtn.disabled = false;
  loadMoreBtn.textContent = "Load more";
  renderList();
}

function renderList() {
  const visible = filterByKeyword(allItems, keywordInput.value);

  if (visible.length === 0) {
    renderEmptyState(mount, {
      title: "No listings match your filters",
      description: "Try clearing a filter or searching a different keyword.",
    });
    loadMoreRow.hidden = true;
    return;
  }

  const grid = document.createElement("div");
  grid.className = "grid fade-in";

  visible.forEach((job) => {
    grid.appendChild(
      renderCard({
        to: `/job-details.html?id=${job.id}`,
        title: job.title,
        subtitle: job.company,
        meta: job.location,
        kind: "job",
        favorited: isFavorited("jobs", job.id),
        onToggleFavorite: () => toggleFavorite("jobs", job.id, job.title),
      })
    );
  });

  mount.innerHTML = "";
  mount.appendChild(grid);
  loadMoreRow.hidden = !hasMore;
}

keywordInput.addEventListener("input", renderList);
typeSelect.addEventListener("change", loadFirstPage);
categorySelect.addEventListener("change", loadFirstPage);
loadMoreBtn.addEventListener("click", loadMore);

loadFirstPage();
