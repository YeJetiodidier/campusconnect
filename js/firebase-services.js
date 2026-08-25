import { db, auth } from "../src/firebase-config.js";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { initFavoritesStore, isFavorited, toggleFavorite } from "../src/shared/favoritesStore.js";

const servicesGrid = document.getElementById("servicesGrid");
const searchInput = document.getElementById("serviceSearchInput");

let services = [];

function escapeHtml(value) {
  if (value == null) return "";
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

initFavoritesStore(() => {
  if (services.length > 0) renderServices();
});

async function fetchServices() {
  if (!servicesGrid) return;
  servicesGrid.innerHTML = `<p style="grid-column: span 3; text-align: center;">Loading services...</p>`;
  try {
    const querySnapshot = await getDocs(collection(db, "services"));
    services = [];
    querySnapshot.forEach((document) => {
      services.push({ id: document.id, ...document.data() });
    });
    renderServices();
  } catch (err) {
    console.error("Error fetching services: ", err);
    servicesGrid.innerHTML = `<p style="grid-column: span 3; text-align: center; color: red;">Failed to load services.</p>`;
  }
}

function renderServices() {
  servicesGrid.innerHTML = "";
  const query = searchInput?.value.toLowerCase() || "";
  const filtered = services.filter(s => s.title?.toLowerCase().includes(query) || s.category?.toLowerCase().includes(query));

  if (filtered.length === 0) {
    servicesGrid.innerHTML = `<p style="grid-column: span 3; text-align: center; color: #94a3b8;">No services available. Click "+ Offer a Service" to add one!</p>`;
    return;
  }

  filtered.forEach(service => {
    const favorited = isFavorited("services", service.id);
    const card = document.createElement("div");
    card.className = "card";
    const imgMarkup = service.imageUrl
      ? `<img src="${service.imageUrl}" alt="${escapeHtml(service.title)}" onerror="this.onerror=null; this.src='data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'300\' height=\'200\' viewBox=\'0 0 300 200\' fill=\'%23f1f5f9\'><text x=\'50%\' y=\'50%\' dominant-baseline=\'middle\' text-anchor=\'middle\' font-family=\'sans-serif\' font-size=\'14\' fill=\'%2364748b\'>Campus Service</text></svg>';">`
      : `<div style="width:100%; height:180px; background:#f1f5f9; display:flex; align-items:center; justify-content:center; color:#64748b; font-weight:600; font-size:14px;">Campus Service</div>`;

    card.innerHTML = `
      <div class="card-image-box">
        ${imgMarkup}
        <span class="badge">${escapeHtml(service.category || 'Service')}</span>
      </div>
      <div class="card-body">
        <div class="card-title-row">
          <h3>${service.title}</h3>
          <span class="price">${service.rate} FCFA/hr</span>
        </div>
      </div>
      <div class="card-footer" style="display:flex; justify-content:space-between; align-items:center;">
        <div style="display:flex; gap:8px; align-items:center;">
          <a href="service-details.html?id=${service.id}" class="btn-connect">View Details</a>
          <button class="btn-delete" data-id="${service.id}" style="color:red; background:none; border:none; cursor:pointer;">Delete</button>
        </div>
        <button type="button" class="like-btn ${favorited ? "liked" : ""}" style="background:${favorited ? 'rgba(37, 99, 235, 0.08)' : 'none'}; border:1px solid ${favorited ? '#2563eb' : '#cbd5e1'}; border-radius:16px; padding:4px 10px; cursor:pointer; display:inline-flex; align-items:center; gap:4px; font-size:13px; color:${favorited ? '#2563eb' : '#64748b'}; transition:all 0.2s;" aria-label="Like service">
          <span class="like-icon">👍</span> <span class="like-label">${favorited ? "Saved" : "Like"}</span>
        </button>
      </div>
    `;

    card.querySelector(".like-btn").addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      toggleFavorite("services", service.id, service.title);
    });

    card.querySelector(".btn-delete").addEventListener("click", async (e) => {
      const id = e.target.getAttribute("data-id");
      if (confirm("Are you sure you want to delete this service listing?")) {
        await deleteDoc(doc(db, "services", id));
        fetchServices();
      }
    });

    servicesGrid.appendChild(card);
  });
}

searchInput?.addEventListener("input", renderServices);

onAuthStateChanged(auth, (user) => {
  if (user) {
    fetchServices();
  } else {
    if (servicesGrid) {
      servicesGrid.innerHTML = `<p style="grid-column: span 3; text-align: center; color: #64748b;">Please <a href="login.html" style="color: #4f46e5; font-weight:600;">log in</a> to view student services.</p>`;
    }
  }
});