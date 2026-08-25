/**
 * CampusConnect – Landing Page
 * Scroll effects, mobile menu, theme toggle, search, filters,
 * bookmark toggles, newsletter, and auth-aware CTAs.
 */

import { auth } from '../../config/firebase.js';
import { onAuthStateChanged } from 'firebase/auth';

(function () {
  'use strict';

  // ── Toast helper ──────────────────────────────────────────────
  const toastEl = document.getElementById('toast');
  const toastMsg = document.getElementById('toastMsg');
  const toastIcon = document.getElementById('toastIcon');
  let toastTimer;

  function showToast(message, icon = 'check_circle') {
    toastMsg.textContent = message;
    toastIcon.textContent = icon;
    toastEl.classList.remove('opacity-0', 'pointer-events-none', 'translate-y-3');
    toastEl.classList.add('opacity-100', 'translate-y-0');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastEl.classList.add('opacity-0', 'pointer-events-none', 'translate-y-3');
      toastEl.classList.remove('opacity-100', 'translate-y-0');
    }, 2800);
  }

  // ── Auth-aware header buttons ─────────────────────────────────
  const headerLoginBtn = document.getElementById('headerLoginBtn');
  const headerDashboardBtn = document.getElementById('headerDashboardBtn');
  const mobileLoginBtn = document.getElementById('mobileLoginBtn');
  const mobileDashboardBtn = document.getElementById('mobileDashboardBtn');

  onAuthStateChanged(auth, (user) => {
    if (user) {
      headerLoginBtn?.classList.add('hidden');
      headerDashboardBtn?.classList.remove('hidden');
      mobileLoginBtn?.classList.add('hidden');
      mobileDashboardBtn?.classList.remove('hidden');
    } else {
      headerLoginBtn?.classList.remove('hidden');
      headerDashboardBtn?.classList.add('hidden');
      mobileLoginBtn?.classList.remove('hidden');
      mobileDashboardBtn?.classList.add('hidden');
    }
  });

  // ── Header shadow + reading progress ──────────────────────────
  const header = document.getElementById('siteHeader');
  const pageProgress = document.getElementById('pageProgress');

  function onScroll() {
    const y = window.scrollY;

    if (y > 8) {
      header.classList.add('shadow-sm', 'border-outline-variant');
      header.classList.remove('border-transparent');
    } else {
      header.classList.remove('shadow-sm', 'border-outline-variant');
      header.classList.add('border-transparent');
    }

    const doc = document.documentElement;
    const max = doc.scrollHeight - doc.clientHeight;
    const pct = max > 0 ? (y / max) * 100 : 0;
    pageProgress.style.width = pct + '%';
    pageProgress.setAttribute('aria-valuenow', Math.round(pct));
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ── Active nav by section ─────────────────────────────────────
  const sections = ['top', 'marketplace', 'services', 'internships', 'events'];
  const navLinks = document.querySelectorAll('.nav-link[data-section]');

  function updateActiveNav() {
    const offset = 100;
    let current = 'top';
    for (const id of sections) {
      const el = document.getElementById(id);
      if (el && el.getBoundingClientRect().top <= offset) current = id;
    }
    navLinks.forEach((link) => {
      const isActive = link.dataset.section === current;
      link.classList.toggle('active', isActive);
      link.classList.toggle('text-primary', isActive);
      link.classList.toggle('text-on-surface-variant', !isActive);
    });
  }
  window.addEventListener('scroll', updateActiveNav, { passive: true });
  updateActiveNav();

  // ── Mobile menu ───────────────────────────────────────────────
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  const mobileMenuIcon = document.getElementById('mobileMenuIcon');

  function closeMobileMenu() {
    if (!mobileMenu) return;
    mobileMenu.classList.add('hidden');
    mobileMenu.classList.remove('open');
    mobileMenuBtn?.setAttribute('aria-expanded', 'false');
    if (mobileMenuIcon) mobileMenuIcon.textContent = 'menu';
  }

  function openMobileMenu() {
    if (!mobileMenu) return;
    mobileMenu.classList.remove('hidden');
    mobileMenu.classList.add('open');
    mobileMenuBtn?.setAttribute('aria-expanded', 'true');
    if (mobileMenuIcon) mobileMenuIcon.textContent = 'close';
  }

  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const open = mobileMenuBtn.getAttribute('aria-expanded') === 'true';
      open ? closeMobileMenu() : openMobileMenu();
    });

    mobileMenu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', closeMobileMenu);
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeMobileMenu();
    });
  }

  // ── Theme toggle ──────────────────────────────────────────────
  const themeToggle = document.getElementById('themeToggle');
  const themeIcon = document.getElementById('themeIcon');
  const root = document.documentElement;

  function applyTheme(dark) {
    root.classList.toggle('dark', dark);
    root.classList.toggle('dark-theme', dark);
    if (themeIcon) themeIcon.textContent = dark ? 'light_mode' : 'dark_mode';
    try {
      localStorage.setItem('cc-theme', dark ? 'dark' : 'light');
      localStorage.setItem('campusconnect_theme', dark ? 'dark' : 'light');
    } catch (_) { }
  }

  const savedTheme = (() => {
    try {
      return localStorage.getItem('campusconnect_theme') || localStorage.getItem('cc-theme');
    } catch (_) {
      return null;
    }
  })();
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  applyTheme(savedTheme === 'dark' || (!savedTheme && prefersDark));

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      applyTheme(!root.classList.contains('dark') && !root.classList.contains('dark-theme'));
    });
  }

  // ── Bookmarks ─────────────────────────────────────────────────
  document.querySelectorAll('.bookmark-btn').forEach((button) => {
    button.addEventListener('click', () => {
      const saved = button.dataset.saved === 'true';
      button.dataset.saved = String(!saved);
      button.textContent = saved ? 'bookmark' : 'bookmark_added';
      button.classList.toggle('text-primary', !saved);
      button.classList.toggle('filled', !saved);
      showToast(saved ? 'Removed from saved' : 'Saved to your list', saved ? 'bookmark_remove' : 'bookmark_added');
    });
  });

  // ── Search ────────────────────────────────────────────────────
  function handleSearch(query) {
    const q = (query || '').trim();
    if (!q) {
      showToast('Type something to search', 'search');
      return;
    }
    showToast(`Searching for “${q}”…`, 'search');
  }

  document.getElementById('heroSearchForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    handleSearch(document.getElementById('heroSearch').value);
  });

  document.getElementById('headerSearch')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch(e.target.value);
    }
  });

  // ── Marketplace filters ───────────────────────────────────────
  const chips = document.querySelectorAll('.filter-chip');
  const cards = document.querySelectorAll('.product-card');
  const noMsg = document.getElementById('noProductsMsg');

  chips.forEach((chip) => {
    chip.addEventListener('click', () => {
      chips.forEach((c) => c.classList.remove('active'));
      chip.classList.add('active');
      const filter = chip.dataset.filter;
      let visible = 0;
      cards.forEach((card) => {
        const show = filter === 'all' || card.dataset.category === filter;
        card.classList.toggle('hidden', !show);
        if (show) visible++;
      });
      noMsg.classList.toggle('hidden', visible > 0);
    });
  });

  // ── RSVP buttons ──────────────────────────────────────────────
  document.querySelectorAll('button').forEach((button) => {
    if (button.textContent.trim() === 'RSVP') {
      button.addEventListener('click', () => {
        showToast('RSVP sent! See you there.', 'event_available');
      });
    }
  });

  // ── Newsletter ────────────────────────────────────────────────
  document.getElementById('newsletterForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('newsletterEmail');
    if (email.checkValidity()) {
      showToast('Thanks! You’re on the list.', 'mark_email_read');
      email.value = '';
    }
  });

  // ── Button press feedback ─────────────────────────────────────
  document.querySelectorAll('button').forEach((button) => {
    button.addEventListener('mousedown', () => button.classList.add('scale-95'));
    button.addEventListener('mouseup', () => button.classList.remove('scale-95'));
    button.addEventListener('mouseleave', () => button.classList.remove('scale-95'));
  });
})();
