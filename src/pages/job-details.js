// src/pages/job-details.js
// Route: /job-details.html?id=<jobId>

import { icons } from "../shared/icons.js";
import { renderSidebar } from "../shared/sidebar.js";
import { renderFooter } from "../shared/footer.js";
import { renderEmptyState } from "../shared/uiHelpers.js";
import { escapeHtml } from "../shared/renderCard.js";
import { initFavoritesStore, isFavorited, toggleFavorite } from "../shared/favoritesStore.js";
import { fetchJobById } from "../services/internshipsService.js";

renderSidebar("internships");
renderFooter();

const mount = document.getElementById("job-details-mount");
const jobId = new URLSearchParams(location.search).get("id");

let job = null;

initFavoritesStore(() => {
  if (job) updateFavoriteButton();
});

async function load() {
  if (!jobId) {
    renderNotFound();
    return;
  }
  job = await fetchJobById(jobId);
  if (!job) {
    renderNotFound();
    return;
  }
  renderJob();
}

function renderNotFound() {
  mount.innerHTML = "";
  renderEmptyState(mount, {
    title: "This listing is no longer available",
    description: "It may have been closed by the recruiter or removed by an administrator.",
  });
  const link = document.createElement("div");
  link.style.textAlign = "center";
  link.innerHTML = `<a href="/internships.html" style="color:#7c3aed;text-decoration:underline;font-size:13px;">Back to Internships &amp; Jobs</a>`;
  mount.appendChild(link);
}

function renderJob() {
  const deadlineDate = job.deadline?.toDate ? job.deadline.toDate() : job.deadline ? new Date(job.deadline) : null;
  const deadlineStr = deadlineDate
    ? deadlineDate.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })
    : null;

  mount.innerHTML = `
    <a href="/internships.html" class="back-link"><span class="icon">${icons.chevronLeft}</span> Back to listings</a>

    <div class="detail-header">
      <div>
        <h1 class="detail-title">${escapeHtml(job.title)}</h1>
        <p class="detail-subtitle">${escapeHtml(job.company)}</p>
      </div>
      <button type="button" id="favorite-btn" class="icon-btn" aria-label="Save to favorites"><span class="icon">${icons.heart}</span></button>
    </div>

    <div class="detail-meta">
      ${job.location ? `<span class="meta-item"><span class="icon">${icons.location}</span> ${escapeHtml(job.location)}</span>` : ""}
      ${deadlineStr ? `<span class="meta-item"><span class="icon">${icons.calendar}</span> Apply by ${deadlineStr}</span>` : ""}
      ${job.type ? `<span style="background:#f3f4f6;border-radius:999px;padding:2px 10px;text-transform:capitalize;">${escapeHtml(job.type)}</span>` : ""}
    </div>

    <div class="detail-body">${escapeHtml(job.description)}</div>

    <div style="margin-top:32px;">
      <a href="${job.applyUrl || "#apply"}" class="btn btn-primary">Apply now <span class="icon">${icons.arrowRight}</span></a>
    </div>
  `;

  document.getElementById("favorite-btn").addEventListener("click", () => {
    toggleFavorite("jobs", job.id, job.title);
  });
  updateFavoriteButton();
}

function updateFavoriteButton() {
  const btn = document.getElementById("favorite-btn");
  if (!btn) return;
  const favorited = isFavorited("jobs", job.id);
  btn.classList.toggle("favorited", favorited);
  btn.setAttribute("aria-label", favorited ? "Remove from favorites" : "Save to favorites");
}

load();
