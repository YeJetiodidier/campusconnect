/**
 * CampusConnect – Messages / Chat Page
 * Handles Firebase Auth session + Firestore real-time messaging
 */

import { auth } from '../../config/firebase.js';
import { db }   from '../../config/firebase.js';
import { onAuthStateChanged }         from 'firebase/auth';
import {
  collection, addDoc, query,
  orderBy, onSnapshot, serverTimestamp,
  doc, getDoc
} from 'firebase/firestore';

// ── Auth guard ──────────────────────────────────────────────────
onAuthStateChanged(auth, (user) => {
  if (!user) { window.location.href = '/login.html'; return; }

  // Patch user info into sidebar
  const nameEl  = document.getElementById('userName');
  const subEl   = document.getElementById('userSub');
  const avatarEl = document.getElementById('userAvatar');

  if (nameEl && user.displayName) nameEl.textContent = user.displayName;
  if (subEl  && user.email)       subEl.textContent  = user.email;
  if (avatarEl && user.photoURL)  avatarEl.src       = user.photoURL;
});

// ── Conversation switch ─────────────────────────────────────────
let currentUnsubscribe = null;

function selectConversation(convItem) {
  // Update active state in list
  document.querySelectorAll('.conv-item').forEach(el => el.classList.remove('active'));
  convItem.classList.add('active');

  const convoId = convItem.dataset.convo;
  loadMessages(convoId);
}

document.querySelectorAll('.conv-item').forEach(item => {
  item.addEventListener('click', () => selectConversation(item));
});

// ── Send message ────────────────────────────────────────────────
const input   = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');

let activeConvoId = 'sarah'; // default active conversation

async function sendMessage() {
  const text = input.value.trim();
  if (!text) return;

  const user = auth.currentUser;
  if (!user) return;

  input.value = '';

  try {
    await addDoc(collection(db, 'conversations', activeConvoId, 'messages'), {
      text,
      senderId: user.uid,
      senderName: user.displayName || 'You',
      timestamp: serverTimestamp()
    });
  } catch (e) {
    // Firestore may not exist yet in dev — render locally anyway
    renderLocalMessage(text);
  }
}

sendBtn.addEventListener('click', sendMessage);
input.addEventListener('keydown', (e) => {
  if ((e.key === 'Enter' && !e.shiftKey) || (e.key === 'Enter' && (e.metaKey || e.ctrlKey))) {
    e.preventDefault();
    sendMessage();
  }
});

// ── Load messages from Firestore (real-time) ────────────────────
function loadMessages(convoId) {
  activeConvoId = convoId;

  // Unsubscribe previous listener
  if (currentUnsubscribe) { currentUnsubscribe(); currentUnsubscribe = null; }

  const dynamicEl = document.getElementById('dynamicMessages');
  if (dynamicEl) dynamicEl.innerHTML = '';

  const user = auth.currentUser;
  if (!user) return;

  const q = query(
    collection(db, 'conversations', convoId, 'messages'),
    orderBy('timestamp', 'asc')
  );

  currentUnsubscribe = onSnapshot(q, (snapshot) => {
    if (dynamicEl) dynamicEl.innerHTML = '';
    snapshot.forEach(docSnap => {
      const msg = docSnap.data();
      const isSent = msg.senderId === user.uid;
      appendMessage({ text: msg.text, isSent, time: formatTime(msg.timestamp) });
    });
    scrollToBottom();
  }, (err) => {
    // Silently fail – static HTML messages still visible
    console.warn('Firestore snapshot error:', err.message);
  });
}

// ── Helpers ─────────────────────────────────────────────────────
function formatTime(ts) {
  if (!ts || !ts.toDate) return 'now';
  const d = ts.toDate();
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function appendMessage({ text, isSent, time }) {
  const dynamicEl = document.getElementById('dynamicMessages');
  if (!dynamicEl) return;

  const row = document.createElement('div');
  row.className = `message-row ${isSent ? 'sent' : 'received'}`;
  row.innerHTML = isSent
    ? `<div class="bubble sent-bubble">
         <p>${escapeHtml(text)}</p>
         <span class="msg-time">${time} <span class="material-symbols-outlined check-icon">done_all</span></span>
       </div>`
    : `<img src="https://ui-avatars.com/api/?name=Contact&background=2563eb&color=fff&size=32" class="msg-avatar" alt="">
       <div class="bubble received-bubble">
         <p>${escapeHtml(text)}</p>
         <span class="msg-time">${time}</span>
       </div>`;

  dynamicEl.appendChild(row);
  scrollToBottom();
}

function renderLocalMessage(text) {
  appendMessage({ text, isSent: true, time: new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) });
}

function scrollToBottom() {
  const area = document.getElementById('messagesArea');
  if (area) area.scrollTop = area.scrollHeight;
}

function escapeHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

// ── Search conversations ─────────────────────────────────────────
document.getElementById('convSearch')?.addEventListener('input', (e) => {
  const q = e.target.value.toLowerCase();
  document.querySelectorAll('.conv-item').forEach(item => {
    const name = item.querySelector('.conv-name')?.textContent.toLowerCase() || '';
    item.style.display = name.includes(q) ? '' : 'none';
  });
});

// ── Initial scroll to bottom ─────────────────────────────────────
window.addEventListener('load', scrollToBottom);
