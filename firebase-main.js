import { db } from "./firebase-config.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const marketplaceGrid = document.getElementById("marketplaceGrid");
const searchInput = document.getElementById("searchInput");

let products = [];

async function fetchProducts() {
  if (!marketplaceGrid) return;
  marketplaceGrid.innerHTML = `<p style="grid-column: span 3; text-align: center;">Loading listings...</p>`;

  try {
    const querySnapshot = await getDocs(collection(db, "products"));
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
  const filtered = products.filter(p => p.title.toLowerCase().includes(query) || p.category.toLowerCase().includes(query));

  if (filtered.length === 0) {
    marketplaceGrid.innerHTML = `<p style="grid-column: span 3; text-align: center; color: #94a3b8;">No items listed yet. Be the first to list one!</p>`;
    return;
  }

  filtered.forEach(item => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <div class="card-image-box">
        <img src="${item.imageUrl || 'https://via.placeholder.com/300'}" alt="${item.title}">
        <span class="badge">${item.condition || 'Used'}</span>
      </div>
      <div class="card-body">
        <div class="card-title-row">
          <h3>${item.title}</h3>
          <span class="price">${item.price}FCFA</span>
        </div>
        <p class="location">📍 ${item.location || 'Campus'}</p>
      </div>
      <div class="card-footer">
        <a href="product-details.html?id=${item.id}" class="btn-connect">View Details</a>
      </div>
    `;
    marketplaceGrid.appendChild(card);
  });
}

searchInput?.addEventListener("input", renderProducts);
fetchProducts();