// src/pages/dashboard.js
// Route: /dashboard.html — landing view after login.
//
// Pulls small, scoped queries only (never full collections) so the
// dashboard stays fast: latest open internships, upcoming events, the
// user's saved events/jobs, and the unread notification count.

import { renderSidebar } from "../shared/sidebar.js";
import { renderFooter } from "../shared/footer.js";
import { renderEmptyState } from "../shared/uiHelpers.js";
import { escapeHtml } from "../shared/renderCard.js";
import { icons } from "../shared/icons.js";
import { onAuthChange } from "../auth.js";
import { subscribeToLatestListings } from "../services/internshipsService.js";
import { subscribeToNotifications, countUnread } from "../services/notificationsService.js";
import { fetchUpcomingEvents } from "../services/eventsService.js";
import { initFavoritesStore } from "../shared/favoritesStore.js";

renderSidebar("dashboard");
renderFooter();

document.getElementById("stat-icon-jobs").innerHTML = `<span class="icon">${icons.briefcase}</span>`;
document.getElementById("stat-icon-events").innerHTML = `<span class="icon">${icons.calendar}</span>`;
document.getElementById("stat-icon-notifs").innerHTML = `<span class="icon">${icons.bell}</span>`;
document.getElementById("cta-icon").innerHTML = `<span class="icon">${icons.arrowRight}</span>`;

const heroGreeting = document.getElementById("hero-greeting");
const heroMessage = document.getElementById("hero-message");
const summaryJobs = document.getElementById("summary-jobs");
const summaryEvents = document.getElementById("summary-events");
const summaryNotifications = document.getElementById("summary-notifications");
const latestJobsMount = document.getElementById("latest-jobs-mount");
const notificationsPanelMount = document.getElementById("notifications-panel-mount");
const eventsPanelMount = document.getElementById("events-panel-mount");

function timeOfDayGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 18) return "Good Afternoon";
  return "Good Evening";
}

onAuthChange((user) => {
  const firstName = user?.displayName?.split(" ")[0];
  heroGreeting.textContent = `${timeOfDayGreeting()}${firstName ? `, ${firstName}` : ""}!`;

  if (!user) {
    summaryNotifications.textContent = "0";
    notificationsPanelMount.innerHTML = "";
    renderEmptyState(notificationsPanelMount, { title: "Log in to see notifications" });
    return;
  }

  subscribeToNotifications(user.uid, (items) => {
    const unread = countUnread(items);
    summaryNotifications.textContent = String(unread);
    heroMessage.textContent =
      unread > 0
        ? `You have ${unread} unread notification${unread === 1 ? "" : "s"}. Check what's new.`
        : "You're all caught up on notifications.";
    renderNotificationsPanel(items.slice(0, 3));
  });
});

initFavoritesStore((favorites) => {
  const savedJobs = favorites.filter((f) => f.sourceCollection === "jobs");
  const savedEvents = favorites.filter((f) => f.sourceCollection === "events");
  summaryJobs.textContent = String(savedJobs.length);
  summaryEvents.textContent = String(savedEvents.length);
});

function renderNotificationsPanel(items) {
  if (items.length === 0) {
    notificationsPanelMount.innerHTML = "";
    renderEmptyState(notificationsPanelMount, { title: "You're all caught up" });
    return;
  }

  notificationsPanelMount.innerHTML = items
    .map(
      (n) => `
      <div class="panel-row fade-in">
        <span class="panel-avatar"><span class="icon">${icons.bell}</span></span>
        <div style="min-width:0;">
          <p class="panel-row-title">${escapeHtml(n.title)}</p>
          <p class="panel-row-meta">${escapeHtml(n.message)}</p>
        </div>
      </div>`
    )
    .join("");
}

function renderLatestJobs(jobs) {
  if (jobs.length === 0) {
    latestJobsMount.innerHTML = "";
    renderEmptyState(latestJobsMount, {
      title: "No listings yet",
      description: "Check back soon for new opportunities.",
    });
    return;
  }

  const grid = document.createElement("div");
  grid.className = "mini-card-grid fade-in";
  jobs.forEach((job) => {
    const card = document.createElement("a");
    card.href = `/job-details.html?id=${job.id}`;
    card.className = "mini-card";
    card.innerHTML = `
      <div class="mini-card-thumb">
        <span class="icon">${icons.briefcase}</span>
        ${job.type ? `<span class="badge">${escapeHtml(job.type)}</span>` : ""}
      </div>
      <div class="mini-card-body">
        <p class="mini-card-title">${escapeHtml(job.title)}</p>
        <p class="mini-card-meta">${escapeHtml(job.company || "")}</p>
      </div>
    `;
    grid.appendChild(card);
  });

  latestJobsMount.innerHTML = "";
  latestJobsMount.appendChild(grid);
}

function renderEventsPanel(events) {
  if (events.length === 0) {
    eventsPanelMount.innerHTML = "";
    renderEmptyState(eventsPanelMount, { title: "No upcoming events" });
    return;
  }

  eventsPanelMount.innerHTML = events
    .slice(0, 3)
    .map((event) => {
      const date = event.date?.toDate ? event.date.toDate() : event.date ? new Date(event.date) : null;
      const day = date ? date.getDate() : "–";
      const month = date ? date.toLocaleDateString(undefined, { month: "short" }).toUpperCase() : "";
      return `
      <a href="/event-details.html?id=${event.id}" class="panel-row fade-in">
        <div class="panel-date-chip">${day}<br/>${month}</div>
        <div style="min-width:0;">
          <p class="panel-row-title">${escapeHtml(event.title)}</p>
          <p class="panel-row-meta">${escapeHtml(event.venue || "")}</p>
        </div>
      </a>`;
    })
    .join("");
}

subscribeToLatestListings(renderLatestJobs, 4);
fetchUpcomingEvents().then(renderEventsPanel);
