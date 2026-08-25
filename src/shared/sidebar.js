// src/shared/sidebar.js
// App-wide navigation. Behaves differently by screen size (all handled
// in styles.css, this file just renders the markup once):
//
//  - Desktop (>1024px): full vertical sidebar, icons + labels, always visible.
//  - Tablet (721-1024px): the same sidebar collapses to an icon-only rail —
//    still vertical, still permanently visible, just narrower.
//  - Phone (<=720px): the sidebar becomes an off-canvas drawer. A slim
//    top bar (logo + hamburger + notification bell) replaces it; tapping
//    the hamburger slides the full sidebar in over a dimmed backdrop.
//
// Call renderSidebar("dashboard") once per page, passing the nav key that
// should show as active.

import { onAuthChange } from "../auth.js";
import { subscribeToNotifications, countUnread } from "../services/notificationsService.js";
import { icons } from "./icons.js";
import logoUrl from "../assets/campusconnect-logo.png";

// Global theme initialization — applies saved dark-theme across all pages
if (localStorage.getItem("campusconnect_theme") === "dark") {
  document.documentElement.classList.add("dark-theme");
}


const NAV_ITEMS = [
  { key: "dashboard", label: "Dashboard", href: "/dashboard.html", icon: icons.dashboard },
  { key: "internships", label: "Internships", href: "/internships.html", icon: icons.briefcase },
  { key: "events", label: "Events", href: "/events.html", icon: icons.calendar },
  { key: "messages", label: "Messages", href: "/messages.html", icon: icons.messages },
  { key: "favorites", label: "Saved Items", href: "/favorites.html", icon: icons.heart },
  { key: "notifications", label: "Notifications", href: "/notifications.html", icon: icons.bell },
  { key: "profile", label: "Profile", href: "/profile.html", icon: icons.user },
  { key: "settings", label: "Settings", href: "/settings.html", icon: icons.settings },
];

export function renderSidebar(activeKey) {
  const mount = document.getElementById("app-sidebar");
  if (!mount) return;

  mount.innerHTML = `
    <div class="mobile-topbar">
      <button type="button" class="mobile-topbar__menu-btn" id="sidebar-open-btn" aria-label="Open menu">
        <span class="icon">${icons.menu}</span>
      </button>
      <a href="/" class="mobile-topbar__logo">
        <img src="${logoUrl}" alt="CampusConnect" />
      </a>
      <div style="display: flex; align-items: center; gap: 8px;">
        <button type="button" class="theme-toggle-btn" id="mobile-theme-toggle-btn" aria-label="Toggle dark mode" style="background:none; border:none; cursor:pointer; color:var(--text); padding:6px; display:flex; align-items:center; justify-content:center; border-radius:50%;">
          <span class="icon">${icons.settings}</span>
        </button>
        <a href="/notifications.html" class="mobile-topbar__bell" aria-label="Notifications">
          <span class="icon">${icons.bell}</span>
          <span id="mobile-notif-dot" class="sidebar-dot" hidden></span>
        </a>
      </div>
    </div>

    <div class="sidebar-backdrop" id="sidebar-backdrop"></div>

    <aside class="sidebar" id="sidebar-panel">
      <div class="sidebar-top-row">
        <a href="/" class="sidebar-brand">
          <img src="${logoUrl}" alt="CampusConnect" class="sidebar-logo" />
        </a>
        <button type="button" class="sidebar-close-btn" id="sidebar-close-btn" aria-label="Close menu">
          <span class="icon">${icons.close}</span>
        </button>
      </div>

      <nav class="sidebar-nav">
        ${NAV_ITEMS.map(
    (item) => `
          <a href="${item.href}" class="sidebar-nav-item ${item.key === activeKey ? "is-active" : ""}" title="${item.label}">
            <span class="sidebar-nav-icon">${item.icon}</span>
            <span class="sidebar-nav-label">${item.label}</span>
            ${item.key === "notifications" ? '<span id="sidebar-notif-dot" class="sidebar-dot" hidden></span>' : ""}
          </a>`
  ).join("")}
      </nav>

      <div style="padding: 0 12px; margin-bottom: 8px;">
        <button type="button" class="theme-toggle-sidebar-btn" id="sidebar-theme-toggle-btn" title="Toggle Dark/Light Mode" style="width: 100%; display: flex; align-items: center; gap: 12px; padding: 10px 14px; border: 1px solid var(--border); background: var(--surface); color: var(--text); border-radius: 10px; font-weight: 500; cursor: pointer; transition: all 0.2s ease;">
          <span class="icon" id="theme-toggle-icon" style="font-size: 1.1rem;">🌙</span>
          <span class="sidebar-nav-label" id="theme-toggle-text">Dark Mode</span>
        </button>
      </div>

      <button type="button" class="quick-post-btn" id="quick-post-btn" title="Quick Post">
        <span class="quick-post-plus">+</span> <span class="sidebar-nav-label">Quick Post</span>
      </button>

      <a href="/settings.html" class="sidebar-user" id="sidebar-user" hidden title="Go to Settings" style="text-decoration:none;color:inherit;">
        <div class="sidebar-user-avatar" id="sidebar-user-avatar"></div>
        <div class="sidebar-user-info sidebar-nav-label">
          <p class="sidebar-user-name" id="sidebar-user-name"></p>
          <p class="sidebar-user-role" id="sidebar-user-role">Student</p>
        </div>
      </a>
    </aside>
  `;

  // --- Mobile drawer open/close ---
  const panel = document.getElementById("sidebar-panel");
  const backdrop = document.getElementById("sidebar-backdrop");
  const openBtn = document.getElementById("sidebar-open-btn");
  const closeBtn = document.getElementById("sidebar-close-btn");

  function openDrawer() {
    panel.classList.add("is-open");
    backdrop.classList.add("is-visible");
    document.body.classList.add("sidebar-drawer-open");
  }
  function closeDrawer() {
    panel.classList.remove("is-open");
    backdrop.classList.remove("is-visible");
    document.body.classList.remove("sidebar-drawer-open");
  }

  openBtn.addEventListener("click", openDrawer);
  closeBtn.addEventListener("click", closeDrawer);
  backdrop.addEventListener("click", closeDrawer);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeDrawer();
  });

  document.getElementById("quick-post-btn").addEventListener("click", () => {
    window.location.href = "/marketplace.html";
  });

  // --- Dark mode toggle in sidebar ---
  const sidebarThemeBtn = document.getElementById("sidebar-theme-toggle-btn");
  const mobileThemeBtn = document.getElementById("mobile-theme-toggle-btn");
  const themeIcon = document.getElementById("theme-toggle-icon");
  const themeText = document.getElementById("theme-toggle-text");

  function updateThemeUI(isDark) {
    if (themeIcon) themeIcon.textContent = isDark ? "☀️" : "🌙";
    if (themeText) themeText.textContent = isDark ? "Light Mode" : "Dark Mode";
  }

  const isInitiallyDark = document.documentElement.classList.contains("dark-theme");
  updateThemeUI(isInitiallyDark);

  function toggleGlobalTheme() {
    const isDark = document.documentElement.classList.toggle("dark-theme");
    document.documentElement.classList.toggle("dark", isDark);
    localStorage.setItem("campusconnect_theme", isDark ? "dark" : "light");
    localStorage.setItem("cc-theme", isDark ? "dark" : "light");
    updateThemeUI(isDark);
  }

  if (sidebarThemeBtn) sidebarThemeBtn.addEventListener("click", toggleGlobalTheme);
  if (mobileThemeBtn) mobileThemeBtn.addEventListener("click", toggleGlobalTheme);

  // --- Live auth state: user card + unread notification dots ---
  let unsubscribeNotifications = null;
  onAuthChange((user) => {
    const userCard = document.getElementById("sidebar-user");
    const dot = document.getElementById("sidebar-notif-dot");
    const mobileDot = document.getElementById("mobile-notif-dot");

    if (unsubscribeNotifications) unsubscribeNotifications();

    if (!user) {
      userCard.hidden = true;
      if (dot) dot.hidden = true;
      if (mobileDot) mobileDot.hidden = true;
      return;
    }

    const name = user.displayName || user.email || "Student";
    userCard.hidden = false;
    document.getElementById("sidebar-user-name").textContent = name;
    document.getElementById("sidebar-user-avatar").textContent = name.charAt(0).toUpperCase();

    unsubscribeNotifications = subscribeToNotifications(user.uid, (items) => {
      const hasUnread = countUnread(items) > 0;
      if (dot) dot.hidden = !hasUnread;
      if (mobileDot) mobileDot.hidden = !hasUnread;
    });
  });
}
