import { db, auth } from "../src/firebase-config.js";
import { collection, getDocs } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { initFavoritesStore, isFavorited, toggleFavorite } from "../src/shared/favoritesStore.js";

const marketplaceGrid = document.getElementById("marketplaceGrid");
const searchInput = document.getElementById("searchInput");

let products = [];

function escapeHtml(value) {
  if (value == null) return "";
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

initFavoritesStore(() => {
  if (products.length > 0) renderProducts();
});

async function fetchProducts() {
  if (!marketplaceGrid) return;
  marketplaceGrid.innerHTML = `<p style="grid-column: span 3; text-align: center;">Loading listings...</p>`;

  try {
    // Note: Firestore Security Rules specify /listings collection for Marketplace
    let querySnapshot;
    try {
      querySnapshot = await getDocs(collection(db, "listings"));
    } catch (e) {
      console.warn("Primary fetch on /listings failed, trying /products fallback: ", e);
      querySnapshot = await getDocs(collection(db, "products"));
    }

    products = [];
    querySnapshot.forEach((document) => {
      products.push({ id: document.id, ...document.data() });
    });
    renderProducts();
  } catch (err) {
    console.error("Error fetching products: ", err);
    marketplaceGrid.innerHTML = `<p style="grid-column: span 3; text-align: center; color: red;">Failed to load items.</p>`;
  }
}

function renderProducts() {
  marketplaceGrid.innerHTML = "";
  const query = searchInput?.value.toLowerCase() || "";
  const filtered = products.filter(p => p.title?.toLowerCase().includes(query) || p.category?.toLowerCase().includes(query));

  if (filtered.length === 0) {
    marketplaceGrid.innerHTML = `<p style="grid-column: span 3; text-align: center; color: #94a3b8;">No items listed yet. Be the first to list one!</p>`;
    return;
  }

  filtered.forEach(item => {
    const favorited = isFavorited("products", item.id);
    const card = document.createElement("div");
    card.className = "card";
    const imgMarkup = item.imageUrl
      ? `<img src="${item.imageUrl}" alt="${escapeHtml(item.title)}" onerror="this.onerror=null; this.src='data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'300\' height=\'200\' viewBox=\'0 0 300 200\' fill=\'%23f1f5f9\'><text x=\'50%\' y=\'50%\' dominant-baseline=\'middle\' text-anchor=\'middle\' font-family=\'sans-serif\' font-size=\'14\' fill=\'%2364748b\'>Campus Marketplace</text></svg>';">`
      : `<div style="width:100%; height:180px; background:#f1f5f9; display:flex; align-items:center; justify-content:center; color:#64748b; font-weight:600; font-size:14px;">Campus Marketplace</div>`;

    card.innerHTML = `
      <div class="card-image-box">
        ${imgMarkup}
        <span class="badge">${escapeHtml(item.condition || 'Used')}</span>
      </div>
      <div class="card-body">
        <div class="card-title-row">
          <h3>${item.title}</h3>
          <span class="price">${item.price} FCFA</span>
        </div>
        <p class="location">📍 ${item.location || 'Campus'}</p>
      </div>
      <div class="card-footer" style="display:flex; justify-content:space-between; align-items:center;">
        <a href="product-details.html?id=${item.id}" class="btn-connect">View Details</a>
        <button type="button" class="like-btn ${favorited ? "liked" : ""}" style="background:${favorited ? 'rgba(37, 99, 235, 0.08)' : 'none'}; border:1px solid ${favorited ? '#2563eb' : '#cbd5e1'}; border-radius:16px; padding:4px 10px; cursor:pointer; display:inline-flex; align-items:center; gap:4px; font-size:13px; color:${favorited ? '#2563eb' : '#64748b'}; transition:all 0.2s;" aria-label="Like item">
          <span class="like-icon">👍</span> <span class="like-label">${favorited ? "Saved" : "Like"}</span>
        </button>
      </div>
    `;

    card.querySelector(".like-btn").addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      toggleFavorite("products", item.id, item.title);
    });

    marketplaceGrid.appendChild(card);
  });
}

searchInput?.addEventListener("input", renderProducts);

// Fetch products immediately on load since rules allow `match /listings/{listingId} { allow read: if true; }`
fetchProducts();

onAuthStateChanged(auth, () => {
  fetchProducts();
});