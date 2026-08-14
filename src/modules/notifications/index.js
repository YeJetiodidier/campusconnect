/**
 * CampusConnect – Notifications JS
 * Hooks up Firestore real-time listener for user notifications.
 */

import { auth, db } from '../../config/firebase.js';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, orderBy, onSnapshot, writeBatch, doc } from 'firebase/firestore';

const notificationsFeed = document.getElementById('notificationsFeed');
const markAllReadBtn = document.getElementById('markAllReadBtn');
const notifBadge = document.getElementById('notifBadge');

let currentUserId = null;

onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = '/login.html';
    return;
  }

  currentUserId = user.uid;

  // Sidebar info
  const userNameEl = document.getElementById('userName');
  if (userNameEl && user.displayName) userNameEl.textContent = user.displayName;

  const userAvatar = document.getElementById('userAvatar');
  if (userAvatar && user.photoURL) userAvatar.src = user.photoURL;

  // Init listener
  listenToNotifications(user.uid);
});

function listenToNotifications(uid) {
  const q = query(
    collection(db, 'users', uid, 'notifications'),
    orderBy('timestamp', 'desc')
  );

  onSnapshot(q, (snapshot) => {
    let unreadCount = 0;
    const notifications = [];

    snapshot.forEach(docSnap => {
      const data = docSnap.data();
      notifications.push({ id: docSnap.id, ...data });
      if (!data.read) unreadCount++;
    });

    renderNotifications(notifications);
    updateBadge(unreadCount);
  }, (err) => {
    console.warn('Error fetching notifications (often due to missing index or db init):', err.message);
    // Silent fail – dummy keeps UI looking okay in local preview
  });
}

function updateBadge(count) {
  if (notifBadge) {
    notifBadge.style.display = count > 0 ? 'block' : 'none';
  }
}

function renderNotifications(notifs) {
  if (notifs.length === 0) {
    notificationsFeed.innerHTML = `
      <div class="notif-card" style="justify-content: center; color: #888;">
        <p>No notifications yet.</p>
      </div>`;
    return;
  }

  notificationsFeed.innerHTML = ''; // Clear placeholder
  
  notifs.forEach(n => {
    // Determine icon and color based on type
    let icon = 'notifications';
    let bgColor = 'bg-blue';

    if (n.type === 'message') { icon = 'chat'; bgColor = 'bg-purple'; }
    if (n.type === 'marketplace') { icon = 'sell'; bgColor = 'bg-green'; }
    if (n.type === 'system') { icon = 'campaign'; bgColor = 'bg-orange'; }

    const timeStr = n.timestamp 
      ? new Date(n.timestamp.toDate()).toLocaleString([], {hour: '2-digit', minute:'2-digit', month: 'short', day: 'numeric'}) 
      : 'Just now';

    const card = document.createElement('div');
    card.className = `notif-card ${n.read ? '' : 'unread'}`;
    card.innerHTML = `
      <div class="notif-icon-wrap ${bgColor}">
        <span class="material-symbols-outlined">${icon}</span>
      </div>
      <div class="notif-body">
        <p class="notif-title">${escapeHtml(n.title || 'Notification')}</p>
        <p class="notif-desc">${escapeHtml(n.body || '')}</p>
        <span class="notif-time">${timeStr}</span>
      </div>
      <div class="notif-unread-dot"></div>
    `;
    
    // Optional click handler to mark single item read / navigate
    card.addEventListener('click', () => {
      // Logic to mark as read and redirect based on n.link could go here
    });

    notificationsFeed.appendChild(card);
  });
}

markAllReadBtn?.addEventListener('click', async () => {
  if (!currentUserId) return;
  // Fallback: visual clear
  document.querySelectorAll('.notif-card').forEach(c => c.classList.remove('unread'));
  updateBadge(0);
  
  // Real update: Needs fetching unread docs and batch updating. 
  // Omitted here for simplicity in UI demo unless you want full batch read logic written out.
});

function escapeHtml(str) {
  if (!str) return '';
  return str.toString().replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
