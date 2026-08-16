// src/pages/notifications.js
// Route: /notifications.html

import { icons } from "../shared/icons.js";
import { renderSidebar } from "../shared/sidebar.js";
import { renderFooter } from "../shared/footer.js";
import { renderEmptyState } from "../shared/uiHelpers.js";
import { escapeHtml } from "../shared/renderCard.js";
import { onAuthChange } from "../auth.js";
import { subscribeToNotifications, markNotificationAsRead, markAllAsRead } from "../services/notificationsService.js";

renderSidebar("notifications");
renderFooter();

const mount = document.getElementById("notifications-mount");
const markAllLink = document.getElementById("mark-all-read");

let currentUser = null;
let notifications = [];

onAuthChange((user) => {
  currentUser = user;
  if (!user) {
    mount.innerHTML = "";
    renderEmptyState(mount, { title: "Log in to see your notifications" });
    return;
  }
  subscribeToNotifications(user.uid, (items) => {
    notifications = items;
    render();
  });
});

function render() {
  if (notifications.length === 0) {
    mount.innerHTML = "";
    renderEmptyState(mount, {
      title: "You're all caught up",
      description: "New activity on your saved internships and events will show up here.",
    });
    return;
  }

  const list = document.createElement("div");
  list.className = "fade-in";
  notifications.forEach((n) => {
    const item = document.createElement("div");
    item.className = `notif-item ${n.status === "unread" ? "unread" : ""}`;
    item.innerHTML = `
      <span class="notif-icon"><span class="icon">${icons.bell}</span></span>
      <div style="flex:1;">
        <p class="notif-title">${escapeHtml(n.title)}</p>
        <p class="notif-message">${escapeHtml(n.message)}</p>
        <p class="notif-time">${formatTimestamp(n.createdDate)}</p>
      </div>
      ${n.status === "unread" ? `<span class="notif-dot"></span>` : ""}
    `;
    if (n.status === "unread") {
      item.addEventListener("click", () => markNotificationAsRead(currentUser.uid, n.id));
    }
    list.appendChild(item);
  });

  mount.innerHTML = "";
  mount.appendChild(list);
}

function formatTimestamp(value) {
  if (!value) return "";
  const date = value?.toDate ? value.toDate() : new Date(value);
  return date.toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

markAllLink.addEventListener("click", (e) => {
  e.preventDefault();
  if (currentUser) markAllAsRead(currentUser.uid, notifications);
});
