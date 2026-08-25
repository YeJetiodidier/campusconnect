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
  createJobPanel.style.display = "block";
});

cancelJobBtn.addEventListener("click", () => {
  createJobPanel.style.display = "none";
  createJobForm.reset();
});

// Helper: compress logo to base64
const compressLogoToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    if (!file) { resolve(""); return; }
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX = 200; // Logos can be small
        let w = img.width, h = img.height;
        if (w > h && w > MAX) { h *= MAX / w; w = MAX; }
        else if (h > MAX) { w *= MAX / h; h = MAX; }
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/webp", 0.6));
      };
    };
    reader.onerror = error => reject(error);
  });
};

createJobForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!isUserAgency(currentUser)) return;
  
  submitJobBtn.disabled = true;
  submitJobBtn.textContent = "Publishing...";

  try {
    const file = document.getElementById("job-logo").files[0];
    const logoUrl = await compressLogoToBase64(file);

    await createInternshipListing({
      title: document.getElementById("job-title").value.trim(),
      company: document.getElementById("job-company").value.trim(),
      type: document.getElementById("job-type").value,
      location: document.getElementById("job-location").value.trim(),
      salary: document.getElementById("job-salary").value.trim(),
      link: document.getElementById("job-link").value.trim(),
      logoUrl: logoUrl
    }, currentUser);

    createJobPanel.style.display = "none";
    createJobForm.reset();
    await loadFirstPage(); // refresh grid
  } catch(err) {
    console.error("Job publish failed:", err);
    alert("Could not post job. Check permissions.");
  } finally {
    submitJobBtn.disabled = false;
    submitJobBtn.textContent = "Publish";
  }
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
