// src/pages/marketplace.js
import { renderSidebar } from "../shared/sidebar.js";
import { renderFooter } from "../shared/footer.js";
import { onAuthChange } from "../auth.js";
import { createMarketplaceItem, fetchMarketplaceItems } from "../services/marketplaceService.js";

// Layout Init
renderSidebar("marketplace");
renderFooter();

let currentUser = null;
const postBtn = document.getElementById("post-item-btn");
const createPanel = document.getElementById("create-post-panel");
const cancelBtn = document.getElementById("cancel-post-btn");
const createForm = document.getElementById("create-post-form");
const submitBtn = document.getElementById("submit-post-btn");

const grid = document.getElementById("marketplace-grid");
const loading = document.getElementById("loading-state");

postBtn.addEventListener("click", () => {
  createPanel.style.display = "block";
});

cancelBtn.addEventListener("click", () => {
  createPanel.style.display = "none";
  createForm.reset();
});

// Guard route & capture user
onAuthChange((user) => {
  if (!user) {
    window.location.href = "/login.html";
    return;
  }
  currentUser = user;
  loadItems(); // Fetch when authenticated
});

async function loadItems() {
  loading.style.display = "block";
  grid.innerHTML = "";
  try {
    const items = await fetchMarketplaceItems();
    if (items.length === 0) {
        loading.textContent = "No items available yet. Be the first to post!";
        return;
    }
    loading.style.display = "none";

    items.forEach(item => {
      const card = document.createElement("article");
      card.className = "card";
      
      const badge = `<span class="badge" style="background: var(--primary-light); color: var(--primary); font-size: 0.75rem;">${item.category}</span>`;
      
      card.innerHTML = `
        <div class="card-content">
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            ${badge}
            <span style="font-weight: 600; color: var(--primary);">${item.price} FCFA</span>
          </div>
          <h3 class="card-title">${item.title}</h3>
          <p style="color: var(--text-muted); font-size: 0.875rem; margin-bottom: 16px;">${item.description}</p>
          
          <div style="font-size: 0.75rem; color: var(--text-muted); border-top: 1px solid var(--border); padding-top: 12px;">
            <span>Seller: <strong>${item.sellerName}</strong></span> <br>
            <span>Condition: ${item.condition}</span>
          </div>
        </div>
      `;
      grid.appendChild(card);
    });
  } catch (err) {
    console.error("Error loading items", err);
    loading.textContent = "Failed to load marketplace items.";
  }
}

createForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  if(!currentUser) return;
  
  submitBtn.disabled = true;
  submitBtn.textContent = "Publishing...";

  const data = {
    title: document.getElementById("item-title").value.trim(),
    price: document.getElementById("item-price").value,
    category: document.getElementById("item-category").value,
    condition: document.getElementById("item-condition").value,
    description: document.getElementById("item-desc").value.trim()
  };

  try {
    await createMarketplaceItem(data, currentUser);
    createPanel.style.display = "none";
    createForm.reset();
    await loadItems(); // Refresh items globally!
  } catch (err) {
    console.error("Error creating post", err);
    alert("Could not post item. Try again.");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Publish Item";
  }
});
