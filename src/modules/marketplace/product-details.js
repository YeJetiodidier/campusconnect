/**
 * CampusConnect — Product Details page (mk2 "next page")
 * Loads a listing by ?id= from Firestore or the shared seed
 * catalog, renders details in FCFA, and routes "Buy Now" to the
 * payment gateway.
 */

import { auth, db } from '../../config/firebase.js';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, collection, getDocs, query, orderBy, limit as fLimit } from 'firebase/firestore';
import { buildSeedItems } from './seed-data.js';

const CURRENCY = 'FCFA';

// ── DOM refs ──────────────────────────────────────────────────
const image = document.getElementById('pdImage');
const title = document.getElementById('pdTitle');
const price = document.getElementById('pdPrice');
const priceBox = document.getElementById('pdPriceBox');
const locationEl = document.getElementById('pdLocation');
const condition = document.getElementById('pdCondition');
const conditionBadge = document.getElementById('pdConditionBadge');
const views = document.getElementById('pdViews');
const listed = document.getElementById('pdListed');
const categoryFact = document.getElementById('pdCategoryFact');
const categoryEl = document.getElementById('pdCategory');
const crumbCategory = document.getElementById('pdCrumbCategory');
const description = document.getElementById('pdDescription');
const sellerName = document.getElementById('pdSellerName');
const sellerMeta = document.getElementById('pdSellerMeta');
const sellerAvatar = document.getElementById('pdSellerAvatarImg');
const wishBtn = document.getElementById('pdWishBtn');
const saveBtn = document.getElementById('pdSaveBtn');
const buyBtn = document.getElementById('pdBuyBtn');
const relatedGrid = document.getElementById('pdRelatedGrid');
const menuBtn = document.getElementById('pdMenuBtn');
const mobileMenu = document.getElementById('pdMobileMenu');
const helpLink = document.getElementById('pdHelpLink');

const headerLoginBtn = document.getElementById('pdLoginBtn');
const headerDashboardBtn = document.getElementById('pdDashboardBtn');
const mobileLoginBtn = document.getElementById('pdMobileLogin');
const mobileDashboardBtn = document.getElementById('pdMobileDashboard');

// ── State ─────────────────────────────────────────────────────
let item = null;

// ── Helpers ───────────────────────────────────────────────────
function formatFCFA(amount) {
  return new Intl.NumberFormat('fr-CM', { maximumFractionDigits: 0 }).format(Math.round(amount)) + ' ' + CURRENCY;
}

function conditionClass(cond) {
  const map = { 'brand-new': 'badge-brand-new', 'like-new': 'badge-like-new', good: 'badge-good', fair: 'badge-fair' };
  return map[cond] || 'badge-good';
}

function conditionLabel(cond) {
  const map = { 'brand-new': 'Brand New', 'like-new': 'Like New', good: 'Good', fair: 'Fair' };
  return map[cond] || cond;
}

function icon(name) {
  const s = document.createElement('span');
  s.className = 'material-symbols-outlined';
  s.textContent = name;
  return s;
}

function avatarUrl(name) {
  return 'https://ui-avatars.com/api/?name=' + encodeURIComponent(name) + '&background=4D61FC&color=fff&size=60';
}

function timeAgo(ts) {
  if (!ts) return '—';
  const d = ts instanceof Date ? ts : new Date(ts);
  const sec = Math.floor((Date.now() - d.getTime()) / 1000);
  if (sec < 3600) return Math.max(1, Math.floor(sec / 60)) + ' min ago';
  if (sec < 86400) return Math.floor(sec / 3600) + ' hr ago';
  if (sec < 604800) return Math.floor(sec / 86400) + ' days ago';
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

// ── Wishlist (shared with marketplace) ────────────────────────
function isWishlisted(id) {
  try {
    return JSON.parse(localStorage.getItem('cc-wishlist') || '[]').indexOf(id) !== -1;
  } catch (_) {
    return false;
  }
}

function toggleWishlist(id) {
  let list = [];
  try {
    list = JSON.parse(localStorage.getItem('cc-wishlist') || '[]');
  } catch (_) {
    list = [];
  }
  const idx = list.indexOf(id);
  if (idx >= 0) list.splice(idx, 1);
  else list.push(id);
  localStorage.setItem('cc-wishlist', JSON.stringify(list));
  const active = isWishlisted(id);
  wishBtn.classList.toggle('active', active);
  saveBtn.classList.toggle('active', active);
  updateSaveLabel(active);
  showToast(active ? 'Saved to your list' : 'Removed from saved items', 'favorite');
}

function updateSaveLabel(active) {
  saveBtn.innerHTML = '';
  saveBtn.appendChild(icon('favorite'));
  saveBtn.appendChild(document.createTextNode(active ? ' Saved' : ' Save Item'));
}

// ── Data loading ──────────────────────────────────────────────
async function loadFirestoreItem(id) {
  try {
    const snap = await getDoc(doc(db, 'listings', id));
    if (snap.exists()) return { id: snap.id, ...snap.data() };
  } catch (err) {
    console.warn('Product details Firestore unavailable, using seed data:', (err && err.message) || '');
  }
  return null;
}

async function loadFirestoreRelated(categoryName, excludeId, count) {
  try {
    const q = query(collection(db, 'listings'), orderBy('createdAt', 'desc'), fLimit(60));
    const snap = await getDocs(q);
    const list = snap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .filter((it) => it.category === categoryName && it.id !== excludeId && typeof it.price === 'number');
    return list.slice(0, count);
  } catch (_) {
    return [];
  }
}

// ── Render ────────────────────────────────────────────────────
function renderItem(it) {
  document.title = it.title + ' · CampusConnect';

  image.src = it.image;
  image.alt = it.title;
  title.textContent = it.title;
  price.textContent = formatFCFA(it.price);
  priceBox.textContent = formatFCFA(it.price);
  locationEl.textContent = it.location || '—';
  condition.textContent = conditionLabel(it.condition);
  conditionBadge.className = 'badge ' + conditionClass(it.condition);
  conditionBadge.textContent = conditionLabel(it.condition);
  views.textContent = (it.views || 0) + ' views';
  listed.textContent = timeAgo(it.createdAt);
  categoryFact.textContent = it.category;
  categoryEl.textContent = it.category;
  crumbCategory.textContent = it.category.charAt(0).toUpperCase() + it.category.slice(1);
  description.textContent = it.description || 'No description provided.';

  sellerName.textContent = it.sellerName || 'Unknown';
  sellerMeta.textContent = it.sellerMeta || '';
  sellerAvatar.src = avatarUrl(it.sellerName || 'Seller');

  const active = isWishlisted(it.id);
  wishBtn.classList.toggle('active', active);
  saveBtn.classList.toggle('active', active);
  updateSaveLabel(active);

  // Buy Now → payment gateway (FCFA params)
  const params = new URLSearchParams({
    listingId: it.id,
    title: it.title,
    seller: it.sellerName || '',
    sellerId: it.sellerId || '',
    price: String(Math.round(it.price)),
    image: it.image,
  });
  buyBtn.href = '/paymentgateway.html?' + params.toString();
}

// ── Related items (DOM-built cards, marketplace style) ────────
function relatedCard(it) {
  const article = document.createElement('article');
  article.className = 'product-card';

  const imgWrap = document.createElement('div');
  imgWrap.className = 'card-img-wrap';
  const img = document.createElement('img');
  img.src = it.image;
  img.alt = it.title;
  img.loading = 'lazy';
  imgWrap.appendChild(img);

  const body = document.createElement('div');
  body.className = 'card-body';

  const cat = document.createElement('span');
  cat.className = 'card-category';
  cat.textContent = it.category;
  const t = document.createElement('h3');
  t.className = 'card-title';
  t.textContent = it.title;
  const p = document.createElement('span');
  p.className = 'card-price';
  p.textContent = formatFCFA(it.price);
  const loc = document.createElement('div');
  loc.className = 'card-meta';
  loc.appendChild(icon('location_on'));
  loc.appendChild(document.createTextNode(it.location || ''));

  const seller = document.createElement('div');
  seller.className = 'card-seller';
  const av = document.createElement('span');
  av.className = 'seller-avatar';
  const avImg = document.createElement('img');
  avImg.src = avatarUrl(it.sellerName || 'Seller');
  avImg.alt = '';
  av.appendChild(avImg);
  const name = document.createElement('span');
  name.textContent = it.sellerName || '';
  const link = document.createElement('a');
  link.className = 'connect-link';
  link.href = '/product-details.html?id=' + encodeURIComponent(it.id);
  link.textContent = 'View';
  link.appendChild(icon('arrow_forward'));
  seller.append(av, name, link);

  body.append(cat, t, p, loc, seller);
  article.append(imgWrap, body);
  return article;
}

function renderRelated(list) {
  relatedGrid.innerHTML = '';
  list.forEach((it) => relatedGrid.appendChild(relatedCard(it)));
}

// ── Not found state ───────────────────────────────────────────
function showNotFound() {
  const main = document.querySelector('.pd-main');
  main.innerHTML =
    '<div class="pd-notfound">' +
    '<span class="material-symbols-outlined">search_off</span>' +
    '<h1>Item not found</h1>' +
    '<p>The listing may have been removed or never existed.</p>' +
    '<a href="/marketplace.html" class="btn btn-primary">Back to Marketplace</a>' +
    '</div>';
}

// ── Toast ─────────────────────────────────────────────────────
function showToast(message, iconName) {
  let toast = document.querySelector('.mp-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'mp-toast';
    document.body.appendChild(toast);
  }
  toast.innerHTML = '';
  toast.appendChild(icon(iconName || 'check_circle'));
  const msg = document.createElement('span');
  msg.textContent = message;
  toast.appendChild(msg);
  toast.classList.add('show');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('show'), 2400);
}

// ── Events ────────────────────────────────────────────────────
function wireEvents() {
  wishBtn.addEventListener('click', () => item && toggleWishlist(item.id));
  saveBtn.addEventListener('click', () => item && toggleWishlist(item.id));

  // Buy Now: signed-out users → login (return to checkout after)
  buyBtn.addEventListener('click', (e) => {
    if (!auth.currentUser) {
      e.preventDefault();
      window.location.href = '/login.html?next=/paymentgateway.html';
    }
  });

  menuBtn.addEventListener('click', () => {
    const open = mobileMenu.hidden;
    mobileMenu.hidden = !open;
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.querySelector('span').textContent = open ? 'close' : 'menu';
  });

  helpLink.addEventListener('click', (e) => {
    e.preventDefault();
    showToast('Help Center coming soon', 'help');
  });
}

// ── Auth-aware header ─────────────────────────────────────────
onAuthStateChanged(auth, (user) => {
  headerLoginBtn.hidden = !!user;
  headerDashboardBtn.hidden = !user;
  mobileLoginBtn.hidden = !!user;
  mobileDashboardBtn.hidden = !user;
});

// ── Init ──────────────────────────────────────────────────────
(async function init() {
  wireEvents();

  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');

  let fallback = null;
  if (id) {
    item = await loadFirestoreItem(id);
    if (!item) {
      fallback = buildSeedItems().find((it) => it.id === id) || null;
      item = fallback;
    }
  }

  if (!item) {
    showNotFound();
    return;
  }

  renderItem(item);

  // Related: same category (Firestore preferred, seed fallback)
  const relatedFirestore = await loadFirestoreRelated(item.category, item.id, 4);
  if (relatedFirestore.length > 0) {
    renderRelated(relatedFirestore);
  } else {
    renderRelated(buildSeedItems().filter((it) => it.category === item.category && it.id !== item.id).slice(0, 4));
  }
})();
