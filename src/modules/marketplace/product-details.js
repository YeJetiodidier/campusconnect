/**
 * CampusConnect — Product Details JS
 * Uses the app-shell layout pattern (sidebar + app-main).
 */

import { auth, db } from '../../config/firebase.js';
import { doc, getDoc } from 'firebase/firestore';
import { renderSidebar } from '../../shared/sidebar.js';
import { renderFooter } from '../../shared/footer.js';
import { isFavorited, toggleFavorite } from '../../shared/favoritesStore.js';

// Render sidebar and footer
renderSidebar('favorites');
renderFooter();

// DOM Elements
const pdImage = document.getElementById('pdImage');
const pdThumbnails = document.getElementById('pdThumbnails');
const pdTitle = document.getElementById('pdTitle');
const pdPrice = document.getElementById('pdPrice');
const pdOriginalPrice = document.getElementById('pdOriginalPrice');
const pdConditionBadge = document.getElementById('pdConditionBadge');
const pdCrumbCategory = document.getElementById('pdCrumbCategory');
const pdCrumbSubCategory = document.getElementById('pdCrumbSubCategory');
const pdDescription = document.getElementById('pdDescription');
const pdSellerName = document.getElementById('pdSellerName');
const pdSellerAvatar = document.getElementById('pdSellerAvatar');
const pdMessageBtn = document.getElementById('pdMessageBtn');
const pdOfferBtn = document.getElementById('pdOfferBtn');
const pdBookmarkBtn = document.getElementById('pdBookmarkBtn');
const pdTags = document.getElementById('pdTags');

// Specs
const specBrand = document.getElementById('specBrand');
const specModel = document.getElementById('specModel');
const specColor = document.getElementById('specColor');
const specPower = document.getElementById('specPower');

let currentItem = null;

// Helper
function formatCurrency(amount) {
  if (amount == null) return '$0.00';
  if (typeof amount === 'string' && (amount.includes('$') || amount.includes('FCFA'))) return amount;
  return `$${Number(amount).toFixed(2)}`;
}

async function loadProduct(id) {
  if (!id) return getDemoProduct();

  try {
    let snap = await getDoc(doc(db, 'listings', id));
    if (!snap.exists()) snap = await getDoc(doc(db, 'products', id));
    if (snap.exists()) return { id: snap.id, ...snap.data() };
  } catch (err) {
    console.warn('Error loading product:', err);
  }

  return getDemoProduct();
}

function getDemoProduct() {
  return {
    id: 'demo-ti84',
    title: 'TI-84 Plus CE Color Graphing Calculator',
    price: 85.00,
    originalPrice: 130.00,
    condition: 'Like New',
    category: 'Electronics',
    subCategory: 'Calculators',
    tags: ['Electronics', 'STEM Required'],
    imageUrl: 'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?w=800&auto=format&fit=crop&q=80',
    thumbnails: [
      'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?w=300&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1587145820266-a5951ee6f620?w=300&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1611125832047-1d7ad1e8e48b?w=300&auto=format&fit=crop&q=80',
    ],
    sellerName: 'Alex R.',
    sellerAvatar: 'https://ui-avatars.com/api/?name=Alex+R&background=4f46e5&color=fff',
    description:
      'Used for one semester of Calculus II. In perfect working condition, screen has zero scratches (always had a protector on it). Comes with the original charging cable and slide case. Need to sell it quickly to buy textbooks for next term. Perfect for engineering or math majors.',
    specs: {
      brand: 'Texas Instruments',
      model: 'TI-84 Plus CE',
      color: 'Classic Black',
      powerSource: 'Rechargeable Battery (Included)',
    },
  };
}

function renderProduct(item) {
  currentItem = item;
  document.title = `${item.title} · CampusConnect`;

  // Breadcrumbs
  if (pdCrumbCategory) pdCrumbCategory.textContent = item.category || 'Electronics';
  if (pdCrumbSubCategory) pdCrumbSubCategory.textContent = item.subCategory || item.title;

  // Title & Prices
  pdTitle.textContent = item.title;
  pdPrice.textContent = formatCurrency(item.price);
  pdOriginalPrice.textContent = item.originalPrice ? formatCurrency(item.originalPrice) : '';

  // Condition badge
  pdConditionBadge.textContent = `👍 ${item.condition || 'Like New'}`;

  // Tags
  if (pdTags && item.tags) {
    pdTags.innerHTML = item.tags.map((t) => `<span class="pd-tag">${t}</span>`).join('');
  }

  // Main image
  const mainImg = item.imageUrl || item.image || '';
  pdImage.src = mainImg;
  pdImage.alt = item.title;
  pdImage.onerror = () => {
    pdImage.src = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" fill="%2394a3b8"><rect width="400" height="300" fill="%23e2e8f0"/><text x="200" y="160" text-anchor="middle" font-family="Inter,sans-serif" font-size="18" fill="%2394a3b8">No Image</text></svg>');
  };

  // Thumbnails
  const thumbs = item.thumbnails || [mainImg];
  pdThumbnails.innerHTML = thumbs
    .map(
      (url, i) => `
    <div class="pd-thumb ${i === 0 ? 'active' : ''}" data-src="${url}">
      <img src="${url}" alt="Thumbnail ${i + 1}" />
    </div>
  `
    )
    .join('');

  pdThumbnails.querySelectorAll('.pd-thumb').forEach((thumb) => {
    thumb.addEventListener('click', () => {
      pdThumbnails.querySelectorAll('.pd-thumb').forEach((t) => t.classList.remove('active'));
      thumb.classList.add('active');
      pdImage.src = thumb.dataset.src;
    });
  });

  // Description & Seller
  pdDescription.textContent = item.description || 'No description provided.';
  pdSellerName.textContent = item.sellerName || 'Seller';
  if (item.sellerAvatar) pdSellerAvatar.src = item.sellerAvatar;

  // Specs
  const specs = item.specs || {};
  if (specBrand) specBrand.textContent = specs.brand || item.brand || '—';
  if (specModel) specModel.textContent = specs.model || item.model || '—';
  if (specColor) specColor.textContent = specs.color || item.color || '—';
  if (specPower) specPower.textContent = specs.powerSource || item.powerSource || '—';

  // Bookmark state
  updateBookmarkState();
}

function updateBookmarkState() {
  if (!currentItem || !pdBookmarkBtn) return;
  const fav = isFavorited('listings', currentItem.id) || isFavorited('products', currentItem.id);
  pdBookmarkBtn.classList.toggle('favorited', fav);
}

// Events
pdBookmarkBtn?.addEventListener('click', () => {
  if (!currentItem) return;
  toggleFavorite('listings', currentItem.id, currentItem.title);
  updateBookmarkState();
});

pdMessageBtn?.addEventListener('click', () => {
  if (auth.currentUser) {
    window.location.href = `/messages.html?seller=${encodeURIComponent(currentItem?.sellerName || 'Seller')}`;
  } else {
    window.location.href = `/login.html?next=${encodeURIComponent(window.location.pathname + window.location.search)}`;
  }
});

pdOfferBtn?.addEventListener('click', () => {
  const offer = prompt(`Make an offer for "${currentItem?.title}" (Current: ${formatCurrency(currentItem?.price)}):`);
  if (offer) alert(`Your offer of $${offer} has been sent to ${currentItem?.sellerName || 'the seller'}!`);
});

// Init
(async function init() {
  const id = new URLSearchParams(window.location.search).get('id');
  const item = await loadProduct(id);
  renderProduct(item);
})();
