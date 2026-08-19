// src/shared/uiHelpers.js
// Small reusable render helpers: empty state and skeleton grid placeholders.

export function renderEmptyState(mount, { title, description }) {
  mount.innerHTML = `
    <div class="empty-state">
      <p>${title}</p>
      ${description ? `<p>${description}</p>` : ""}
    </div>
  `;
}

export function renderSkeletonGrid(mount, count = 8) {
  const cards = Array.from({ length: count })
    .map(
      () => `
      <div class="skeleton-card">
        <div class="skeleton-block skeleton-img"></div>
        <div class="skeleton-block skeleton-line"></div>
        <div class="skeleton-block skeleton-line short"></div>
      </div>`
    )
    .join("");
  mount.innerHTML = `<div class="grid">${cards}</div>`;
}
