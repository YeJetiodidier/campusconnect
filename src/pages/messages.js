// src/pages/messages.js
// Route: /messages.html

import { icons } from "../shared/icons.js";
import { renderSidebar } from "../shared/sidebar.js";
import { renderFooter } from "../shared/footer.js";
import { renderEmptyState } from "../shared/uiHelpers.js";
import { escapeHtml } from "../shared/renderCard.js";
import { onAuthChange } from "../auth.js";
import {
  subscribeToConversations,
  subscribeToMessages,
  sendMessage,
} from "../services/messagesService.js";

renderSidebar("messages");
renderFooter();

// Inject icons
document.getElementById("chat-back-icon").innerHTML = icons.chevronLeft;
document.getElementById("chat-send-icon").innerHTML = icons.send;

const convoList = document.getElementById("convo-list");
const convoPanel = document.getElementById("convo-panel");
const chatPanel = document.getElementById("chat-panel");
const chatEmpty = document.getElementById("chat-empty");
const chatActive = document.getElementById("chat-active");
const chatHeader = document.getElementById("chat-header");
const chatMessages = document.getElementById("chat-messages");
const chatForm = document.getElementById("chat-form");
const chatInput = document.getElementById("chat-input");
const chatBackBtn = document.getElementById("chat-back-btn");
const searchInput = document.getElementById("convo-search");

let currentUser = null;
let conversations = [];
let activeConvoId = null;
let unsubMessages = null;

// ── Auth state ──────────────────────────────────────────

onAuthChange((user) => {
  currentUser = user;
  if (!user) {
    convoList.innerHTML = "";
    renderEmptyState(convoList, { title: "Log in to see your messages" });
    return;
  }
  subscribeToConversations(user.uid, (items) => {
    conversations = items;
    renderConversations();
  });
});

// ── Conversation list ───────────────────────────────────

function renderConversations(filter = "") {
  const filtered = filter
    ? conversations.filter((c) => {
        const name = getPartnerName(c).toLowerCase();
        return name.includes(filter.toLowerCase());
      })
    : conversations;

  if (filtered.length === 0) {
    convoList.innerHTML = "";
    renderEmptyState(convoList, {
      title: filter ? "No results" : "No conversations yet",
      description: filter
        ? "Try a different search term."
        : "Start a conversation from another student's profile.",
    });
    return;
  }

  convoList.innerHTML = filtered
    .map((c) => {
      const name = getPartnerName(c);
      const initials = name.charAt(0).toUpperCase();
      const preview = c.lastMessage || "No messages yet";
      const time = formatTime(c.lastMessageAt);
      const isActive = c.id === activeConvoId;
      return `
        <div class="convo-item ${isActive ? "convo-item--active" : ""}" data-id="${c.id}">
          <div class="convo-avatar">${initials}</div>
          <div class="convo-body">
            <div class="convo-top-row">
              <span class="convo-name">${escapeHtml(name)}</span>
              <span class="convo-time">${time}</span>
            </div>
            <p class="convo-preview">${escapeHtml(preview)}</p>
          </div>
        </div>`;
    })
    .join("");

  convoList.querySelectorAll(".convo-item").forEach((el) => {
    el.addEventListener("click", () => openChat(el.dataset.id));
  });
}

function getPartnerName(convo) {
  if (!currentUser || !convo.participantNames) return "Unknown";
  const partnerId = convo.participants.find((p) => p !== currentUser.uid);
  return convo.participantNames[partnerId] || "Unknown";
}

function getPartnerInitials(convo) {
  return getPartnerName(convo).charAt(0).toUpperCase();
}

// ── Chat area ───────────────────────────────────────────

function openChat(convoId) {
  activeConvoId = convoId;
  const convo = conversations.find((c) => c.id === convoId);
  if (!convo) return;

  // Update header
  const name = getPartnerName(convo);
  document.getElementById("chat-header-name").textContent = name;
  document.getElementById("chat-header-avatar").textContent = getPartnerInitials(convo);

  // Show chat area
  chatEmpty.hidden = true;
  chatActive.hidden = false;

  // Mobile: show chat panel, hide convo panel
  convoPanel.classList.add("convo-panel--hidden");
  chatPanel.classList.add("chat-panel--visible");

  // Re-render list to highlight active
  renderConversations(searchInput.value);

  // Subscribe to messages
  if (unsubMessages) unsubMessages();
  chatMessages.innerHTML = '<p class="loading-text">Loading…</p>';
  unsubMessages = subscribeToMessages(convoId, renderMessages);

  chatInput.focus();
}

function renderMessages(msgs) {
  if (msgs.length === 0) {
    chatMessages.innerHTML = `
      <div class="chat-start-notice">
        <p>This is the beginning of your conversation.</p>
      </div>`;
    return;
  }

  chatMessages.innerHTML = msgs
    .map((m) => {
      const isSent = m.senderUid === currentUser?.uid;
      const time = formatTime(m.createdAt);
      return `
        <div class="message-bubble ${isSent ? "message-bubble--sent" : "message-bubble--received"}">
          <p class="message-text">${escapeHtml(m.text)}</p>
          <span class="message-time">${time}</span>
        </div>`;
    })
    .join("");

  // Scroll to bottom
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// ── Send message ────────────────────────────────────────

chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const text = chatInput.value.trim();
  if (!text || !activeConvoId || !currentUser) return;

  chatInput.value = "";
  chatInput.focus();

  try {
    await sendMessage(activeConvoId, currentUser.uid, text);
  } catch (err) {
    console.error("Failed to send message:", err);
  }
});

// ── Back button (mobile) ────────────────────────────────

chatBackBtn.addEventListener("click", () => {
  activeConvoId = null;
  convoPanel.classList.remove("convo-panel--hidden");
  chatPanel.classList.remove("chat-panel--visible");
  chatEmpty.hidden = false;
  chatActive.hidden = true;
  renderConversations(searchInput.value);
});

// ── Search ──────────────────────────────────────────────

searchInput.addEventListener("input", (e) => {
  renderConversations(e.target.value);
});

// ── Helpers ─────────────────────────────────────────────

function formatTime(value) {
  if (!value) return "";
  const date = value?.toDate ? value.toDate() : new Date(value);
  const now = new Date();
  const diff = now - date;
  if (diff < 60000) return "now";
  if (diff < 3600000) return Math.floor(diff / 60000) + "m";
  if (diff < 86400000) return Math.floor(diff / 3600000) + "h";
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
