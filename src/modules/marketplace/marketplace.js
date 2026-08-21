/**
 * CampusConnect — Marketplace Module (mk1 UI)
 * Firestore-first catalog with a bundled seed fallback so the
 * page works instantly in local preview. Prices are in FCFA.
 * All dynamic values are rendered via textContent (no HTML injection).
 */

import { auth, db } from '../../config/firebase.js';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, getDocs, query, orderBy, limit as fLimit } from 'firebase/firestore';

const CURRENCY = 'FCFA';
const PAGE_SIZE = 12;

// ── DOM refs ──────────────────────────────────────────────────
const grid = document.getElementById('mpGrid');
const resultsInfo = document.getElementById('mpResultsInfo');
const searchAll = document.getElementById('mpSearchAll');
const searchHint = document.getElementById('mpSearchHint');
const priceMin = document.getElementById('mpPriceMin');
const priceMax = document.getElementById('mpPriceMax');
const condInputs = document.querySelectorAll('.cond-input');
const pickupInputs = document.querySelectorAll('input[name="pickup"]');
const sortSelect = document.getElementById('mpSort');
const loadMoreBtn = document.getElementById('mpLoadMore');
const emptyState = document.getElementById('mpEmpty');
const categoryList = document.getElementById('mpCategoryList');
const filterToggle = document.getElementById('mpFilterToggle');
const closeFilters = document.getElementById('mpCloseFilters');
const sidebar = document.getElementById('mpSidebar');
const filterCount = document.getElementById('mpFilterCount');
const menuBtn = document.getElementById('mpMenuBtn');
const mobileMenu = document.getElementById('mpMobileMenu');
const headerLoginBtn = document.getElementById('mpLoginBtn');
const headerDashboardBtn = document.getElementById('mpDashboardBtn');
const mobileLoginBtn = document.getElementById('mpMobileLogin');
const mobileDashboardBtn = document.getElementById('mpMobileDashboard');

// ── State ─────────────────────────────────────────────────────
let items = [];
let activeCategory = 'all';
let rendered = 0;

const filters = { search: '', priceMin: null, priceMax: null, conditions: new Set(), pickup: '' };

// ── Seed data (156 items in FCFA) ─────────────────────────────
function buildSeedItems() {
  const IMG = {
    textbook: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&h=450&fit=crop',
    tech: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&h=450&fit=crop',
    furniture: 'https://images.unsplash.com/photo-1505798577917-a65157d3320a?w=600&h=450&fit=crop',
    clothing: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=450&fit=crop',
    decor: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600&h=450&fit=crop',
    kitchen: 'https://images.unsplash.com/photo-1584990347449-a1c4ab6a3d76?w=600&h=450&fit=crop',
    tickets: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=600&h=450&fit=crop',
  };

  const catalog = [
    ['MacBook Air 13" (M2, 256GB)', 'tech', 850000, 'brand-new', 'North Campus', 'Alex R.', '3rd Year · Eng', 312],
    ['Organic Chemistry Textbook', 'textbook', 45000, 'like-new', 'Science Hall', 'Sarah K.', '4th Year · Bio', 189],
    ['LED Desk Lamp (Warm Light)', 'decor', 25000, 'like-new', 'South Campus', 'Jordan M.', '2nd Year · Arts', 96],
    ['Wireless Headphones ANC', 'tech', 120000, 'good', 'West Campus', 'Maya L.', 'Grad Student', 240],
    ['Classic Backpack (Black)', 'clothing', 15000, 'fair', 'North Campus', 'Tom H.', '1st Year · Music', 74],
    ['TI-84 Plus Graphing Calculator', 'tech', 60000, 'like-new', 'Engineering Sq.', 'Elena V.', '3rd Year · Math', 158],
    ['C++ Programming Book', 'textbook', 55000, 'good', 'Main Library', 'Kevin M.', 'Grad Student', 67],
    ['Dorm Compact Fridge 50L', 'furniture', 175000, 'good', 'South Campus', 'Nadia B.', '3rd Year · Econ', 203],
    ['Graphic Calculator Case', 'tech', 18000, 'fair', 'West Campus', 'Leo F.', '2nd Year · Physics', 45],
    ['Calculus I Solutions Manual', 'textbook', 20000, 'like-new', 'Science Hall', 'Priya S.', '2nd Year · Math', 132],
    ['Mechanical Keyboard 87 Keys', 'tech', 90000, 'brand-new', 'North Campus', 'Ivan D.', '3rd Year · CS', 98],
    ['Study Desk Lamp Rechargeable', 'decor', 20000, 'good', 'Engineering Sq.', 'Aisha N.', '1st Year · Med', 56],
    ['Electric Kettle Stainless Steel', 'kitchen', 30000, 'like-new', 'South Campus', 'Chris W.', '4th Year · Law', 120],
    ['Hammock for Dorm', 'decor', 18000, 'good', 'Off-Campus', 'Sofia G.', 'Grad Student', 33],
    ['Linear Algebra Textbook 6th Ed', 'textbook', 50000, 'good', 'Main Library', 'Daniel O.', '3rd Year · CS', 88],
    ['Bluetooth Speaker Portable', 'tech', 70000, 'brand-new', 'North Campus', 'Liam P.', '2nd Year · Music', 211],
    ['Rice Cooker 1.8L', 'kitchen', 35000, 'like-new', 'West Campus', 'Eva M.', '4th Year · Bio', 77],
    ['Desk Chair Ergonomic Mesh', 'furniture', 120000, 'good', 'Off-Campus', 'Yann K.', 'Grad Student', 145],
    ['Physics: Principles and Applications', 'textbook', 48000, 'fair', 'Science Hall', 'Grace T.', '1st Year · Eng', 52],
    ['Phone Gimbal Stabilizer', 'tech', 65000, 'like-new', 'South Campus', 'Omar H.', '3rd Year · Film', 132],
    ['Floor Lamp Tall', 'decor', 32000, 'good', 'North Campus', 'Zoe R.', '2nd Year · Design', 61],
    ['Winter Jacket (M)', 'clothing', 45000, 'like-new', 'Off-Campus', 'Ben A.', '3rd Year · Geo', 44],
    ['Biology Lab Coat (L)', 'clothing', 12000, 'brand-new', 'Science Hall', 'Mia C.', '1st Year · Med', 29],
    ['External SSD 500GB', 'tech', 95000, 'like-new', 'North Campus', 'Noel S.', 'Grad Student', 178],
    ['Intro to Psychology Textbook', 'textbook', 42000, 'good', 'Main Library', 'Lina D.', '2nd Year · Psy', 91],
    ['Campus Bike (Urban)', 'furniture', 210000, 'good', 'Off-Campus', 'Paul E.', '4th Year · Eng', 66],
    ['Microwave 20L', 'furniture', 135000, 'fair', 'South Campus', 'Tina W.', '3rd Year · Econ', 84],
    ['Dress Shirt (White, M)', 'clothing', 16000, 'brand-new', 'North Campus', 'Sam L.', '2nd Year · Bus', 37],
    ['UX/UI Design Notes Bundle', 'textbook', 28000, 'like-new', 'West Campus', 'Nina F.', '4th Year · Design', 113],
    ['Power Bank 20000mAh', 'tech', 26000, 'good', 'Engineering Sq.', 'Roy G.', '1st Year · CS', 201],
    ['Coffee Maker Drip 10 Cup', 'kitchen', 80000, 'like-new', 'South Campus', 'Ada O.', 'Grad Student', 58],
    ['Printer Wireless (Ink Included)', 'tech', 140000, 'good', 'North Campus', 'Ken J.', 'Staff · IT', 73],
    ['Data Structures Notes', 'textbook', 22000, 'fair', 'Engineering Sq.', 'Elle V.', '2nd Year · CS', 128],
    ['Mini Football Table', 'decor', 55000, 'good', 'West Campus', 'Max B.', '3rd Year · Sports', 25],
    ['Scientific Calculator FX-991', 'tech', 30000, 'brand-new', 'Science Hall', 'Lia M.', '1st Year · Eng', 156],
    ['Queen Air Mattress with Pump', 'furniture', 60000, 'brand-new', 'Off-Campus', 'Tom H.', '2nd Year · Music', 82],
    ['Campus Event Wristbands x5', 'tickets', 10000, 'brand-new', 'North Campus', 'UA Events Committee', 'Campus Org', 40],
    ['Football Match Ticket (Varsity)', 'tickets', 5000, 'brand-new', 'Stadium Gate 2', 'UA Sports', 'Campus Org', 23],
    ['Concert Ticket Student Night', 'tickets', 15000, 'brand-new', 'West Campus', 'Music Club', 'Campus Org', 31],
    ['Programmable Thermostat', 'tech', 38000, 'good', 'South Campus', 'Ivan D.', '3rd Year · CS', 21],
    ['Sewing Kit Complete', 'clothing', 14000, 'brand-new', 'North Campus', 'Mia C.', '1st Year · Med', 34],
    ['Essay Writing Resource Pack', 'textbook', 19000, 'like-new', 'Main Library', 'Lina D.', '2nd Year · Psy', 76],
    ['Webcam 1080p HD', 'tech', 45000, 'like-new', 'North Campus', 'Noel S.', 'Grad Student', 118],
    ['Indoor Plant + Ceramic Pot', 'decor', 17000, 'good', 'South Campus', 'Zoe R.', '2nd Year · Design', 49],
    ['Desk Speakers 2.1', 'tech', 85000, 'good', 'West Campus', 'Roy G.', '1st Year · CS', 63],
    ['Backpack Laptop 16"', 'clothing', 38000, 'like-new', 'North Campus', 'Nina F.', '4th Year · Design', 41],
    ['Mechanical Pencils Pack (12)', 'kitchen', 8000, 'brand-new', 'Engineering Sq.', 'Lia M.', '1st Year · Eng', 66],
    ['Desk Organizer Acrylic', 'decor', 12000, 'like-new', 'South Campus', 'Grace T.', '1st Year · Eng', 55],
    ['Portable Monitor 15.6"', 'tech', 150000, 'brand-new', 'North Campus', 'Kevin M.', 'Grad Student', 92],
    ['Analog Watch (Student)', 'clothing', 22000, 'good', 'West Campus', 'Ben A.', '3rd Year · Geo', 19],
    ['Language Flashcards FR/EN', 'textbook', 9000, 'like-new', 'Main Library', 'Priya S.', '2nd Year · Math', 38],
    ['Electric Scooter Foldable', 'tech', 320000, 'good', 'Off-Campus', 'Paul E.', '4th Year · Eng', 53],
    ['Blender Portable USB', 'kitchen', 26000, 'brand-new', 'South Campus', 'Ada O.', 'Grad Student', 29],
    ['Desk Mat XXL Mousepad', 'decor', 11000, 'like-new', 'North Campus', 'Ivan D.', '3rd Year · CS', 86],
    ['Notebooks Bulk (10-pack)', 'kitchen', 15000, 'brand-new', 'Engineering Sq.', 'Tom H.', '2nd Year · Music', 44],
    ['Whiteboard A3 Reusable', 'decor', 14000, 'good', 'West Campus', 'Sofia G.', 'Grad Student', 27],
  ];

  // Expand to 156 items by cycling the catalog with variation
  const result = [];
  let idx = 0;
  while (result.length < 156) {
    const base = catalog[idx % catalog.length];
    const copyNum = Math.floor(idx / catalog.length) + 1;
    const prefix = copyNum > 1 ? copyNum + ' ' : '';
    result.push({
      id: 'seed-' + (idx + 1),
      title: prefix + base[0],
      category: base[1],
      price: Math.round(base[2] * (1 + ((idx * 7) % 10) / 100)),
      condition: base[3],
      location: base[4],
      sellerName: base[5],
      sellerMeta: base[6],
      views: Math.max(3, base[7] - ((idx * 5) % 60)),
      image: IMG[base[1]],
      createdAt: Date.now() - idx * 3600000,
      description: 'Quality ' + base[1] + ' item listed by ' + base[5] + ' (' + base[6] + '). Pickup at ' + base[4] + '.',
    });
    idx++;
  }
  return result;
}

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
  return 'https://ui-avatars.com/api/?name=' + encodeURIComponent(name) + '&background=4D61FC&color=fff&size=40';
}

// ── Data source: Firestore first, seed fallback ───────────────
async function fetchItems() {
  try {
    const q = query(collection(db, 'listings'), orderBy('createdAt', 'desc'), fLimit(200));
    const snap = await getDocs(q);
    if (!snap.empty) {
      const mapped = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      if (mapped.every((it) => typeof it.price === 'number' && it.title)) {
        items = mapped;
        return;
      }
    }
  } catch (err) {
    console.warn('Marketplace Firestore unavailable, using seed data:', (err && err.message) || '');
  }
  items = buildSeedItems();
}

// ── Filtering / sorting / pagination ──────────────────────────
function getFiltered() {
  let list = items.filter((it) => {
    if (activeCategory !== 'all' && it.category !== activeCategory) return false;
    if (filters.search) {
      const q = filters.search.toLowerCase();
      const hay = (it.title + ' ' + it.category + ' ' + it.sellerName + ' ' + it.location).toLowerCase();
      if (hay.indexOf(q) === -1) return false;
    }
    if (filters.priceMin != null && it.price < filters.priceMin) return false;
    if (filters.priceMax != null && it.price > filters.priceMax) return false;
    if (filters.conditions.size > 0 && !filters.conditions.has(it.condition)) return false;
    if (filters.pickup && it.location !== filters.pickup) return false;
    return true;
  });

  const sortBy = sortSelect.value;
  if (sortBy === 'price-low') list.sort((a, b) => a.price - b.price);
  else if (sortBy === 'price-high') list.sort((a, b) => b.price - a.price);
  else if (sortBy === 'popular') list.sort((a, b) => (b.views || 0) - (a.views || 0));
  else list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

  return list;
}

function countActiveFilters() {
  let n = activeCategory !== 'all' ? 1 : 0;
  if (filters.search) n++;
  if (filters.priceMin != null || filters.priceMax != null) n++;
  n += filters.conditions.size;
  if (filters.pickup) n++;
  return n;
}

function updateFilterBadge() {
  const n = countActiveFilters();
  filterCount.hidden = n === 0;
  filterCount.textContent = n > 99 ? '99+' : String(n);
}

// ── Card rendering (DOM-based, safe) ──────────────────────────
function buildCard(it) {
  const article = document.createElement('article');
  article.className = 'product-card';
  article.dataset.id = it.id;

  const imgWrap = document.createElement('div');
  imgWrap.className = 'card-img-wrap';

  const img = document.createElement('img');
  img.src = it.image;
  img.alt = it.title;
  img.loading = 'lazy';

  const badge = document.createElement('span');
  badge.className = 'badge ' + conditionClass(it.condition);
  badge.textContent = conditionLabel(it.condition);

  const wish = document.createElement('button');
  wish.type = 'button';
  wish.className = 'wish-btn' + (isWishlisted(it.id) ? ' active' : '');
  wish.dataset.wish = it.id;
  wish.setAttribute('aria-label', 'Save ' + it.title);
  wish.appendChild(icon('favorite'));
  wish.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(it.id);
    wish.classList.toggle('active', isWishlisted(it.id));
  });

  imgWrap.append(img, badge, wish);

  const body = document.createElement('div');
  body.className = 'card-body';

  const cat = document.createElement('span');
  cat.className = 'card-category';
  cat.textContent = it.category;

  const title = document.createElement('h3');
  title.className = 'card-title';
  title.textContent = it.title;

  const price = document.createElement('span');
  price.className = 'card-price';
  price.textContent = formatFCFA(it.price);

  const loc = document.createElement('div');
  loc.className = 'card-meta';
  loc.appendChild(icon('location_on'));
  loc.appendChild(document.createTextNode(it.location));

  const views = document.createElement('div');
  views.className = 'card-meta';
  views.appendChild(icon('visibility'));
  views.appendChild(document.createTextNode((it.views || 0) + ' views'));

  const seller = document.createElement('div');
  seller.className = 'card-seller';

  const avatar = document.createElement('span');
  avatar.className = 'seller-avatar';
  const avImg = document.createElement('img');
  avImg.src = avatarUrl(it.sellerName);
  avImg.alt = '';
  avatar.appendChild(avImg);

  const sellerText = document.createElement('span');
  sellerText.textContent = it.sellerName + ' · ' + it.sellerMeta;

  const connect = document.createElement('a');
  connect.className = 'connect-link';
  connect.href = '/product-details.html?id=' + encodeURIComponent(it.id);
  connect.textContent = 'Connect ';
  connect.appendChild(icon('arrow_forward'));

  seller.append(avatar, sellerText, connect);

  body.append(cat, title, price, loc, views, seller);
  article.append(imgWrap, body);
  return article;
}

function applyPagination(list) {
  const total = list.length;
  grid.innerHTML = '';
  list.slice(0, rendered).forEach((it) => grid.appendChild(buildCard(it)));

  const start = total === 0 ? 0 : 1;
  const end = Math.min(rendered, total);
  resultsInfo.textContent = 'Showing ' + start + '–' + end + ' of ' + total + ' items';
  emptyState.hidden = total > 0;
  loadMoreBtn.hidden = rendered >= total;
}

function render() {
  rendered = PAGE_SIZE;
  applyPagination(getFiltered());
  updateFilterBadge();
}

// ── Wishlist (localStorage) ───────────────────────────────────
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
  showToast(idx >= 0 ? 'Removed from saved items' : 'Saved to your list', 'favorite');
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

// ── Category list sidebar ─────────────────────────────────────
function buildCategoryList() {
  categoryList.innerHTML = '';
  const counts = {};
  items.forEach((it) => {
    counts[it.category] = (counts[it.category] || 0) + 1;
  });
  const cats = [['all', items.length]];
  Object.keys(counts)
    .sort((a, b) => counts[b] - counts[a])
    .forEach((k) => cats.push([k, counts[k]]));

  cats.forEach(([cat, count]) => {
    const row = document.createElement('div');
    row.className = 'category-row' + (activeCategory === cat ? ' active' : '');
    row.dataset.cat = cat;
    const name = document.createElement('span');
    name.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
    const num = document.createElement('span');
    num.className = 'count';
    num.textContent = String(count);
    row.append(name, num);
    row.addEventListener('click', () => {
      activeCategory = row.dataset.cat;
      buildCategoryList();
      render();
      if (window.innerWidth <= 980) sidebar.classList.remove('open');
    });
    categoryList.appendChild(row);
  });
}

// ── Events / wiring ───────────────────────────────────────────
function wireEvents() {
  let searchTimer;
  const onSearch = (e) => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      filters.search = (e.target.value || '').trim();
      render();
    }, 180);
  };
  searchAll.addEventListener('input', onSearch);
  searchHint.addEventListener('input', onSearch);

  condInputs.forEach((cb) =>
    cb.addEventListener('change', () => {
      if (cb.checked) filters.conditions.add(cb.value);
      else filters.conditions.delete(cb.value);
    }),
  );

  pickupInputs.forEach((r) =>
    r.addEventListener('change', () => {
      filters.pickup = r.checked ? r.value : '';
    }),
  );

  sortSelect.addEventListener('change', render);

  loadMoreBtn.addEventListener('click', () => {
    rendered += PAGE_SIZE;
    applyPagination(getFiltered());
  });

  document.getElementById('mpApplyFilters').addEventListener('click', () => {
    filters.priceMin = priceMin.value !== '' ? Number(priceMin.value) : null;
    filters.priceMax = priceMax.value !== '' ? Number(priceMax.value) : null;
    render();
    if (window.innerWidth <= 980) sidebar.classList.remove('open');
  });

  filterToggle.addEventListener('click', () => sidebar.classList.add('open'));
  closeFilters.addEventListener('click', () => sidebar.classList.remove('open'));

  menuBtn.addEventListener('click', () => {
    const open = mobileMenu.hidden;
    mobileMenu.hidden = !open;
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.querySelector('span').textContent = open ? 'close' : 'menu';
  });

  document.getElementById('helpLink').addEventListener('click', (e) => {
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
  grid.innerHTML = Array.from({ length: 8 })
    .map(() => '<div class="card-skeleton"></div>')
    .join('');
  await fetchItems();
  buildCategoryList();
  render();
  wireEvents();
})();
