/**
 * CampusConnect – Messages / Chat Page (chats.html)
 * - Firebase Auth guard
 * - Firestore real-time conversation list
 * - Real-time message loading per conversation
 * - Seller deep-link: ?sellerId=&sellerName=&productTitle= auto-creates conversation
 */

import { auth, db } from '../../config/firebase.js';
import { onAuthStateChanged } from 'firebase/auth';
import {
  collection, addDoc, query, where,
  orderBy, onSnapshot, serverTimestamp,
  getDocs, updateDoc, doc, setDoc, getDoc
} from 'firebase/firestore';


// ── DOM refs ────────────────────────────────────────────────────────
const convList        = document.getElementById('convList');
const convSearch      = document.getElementById('convSearch');
const chatEmptyState  = document.getElementById('chatEmptyState');
const chatActive      = document.getElementById('chatActive');
const chatBackBtn     = document.getElementById('chatBackBtn');
const chatAvatar      = document.getElementById('chatAvatar');
const chatName        = document.getElementById('chatName');
const messagesContainer = document.getElementById('messagesContainer');
const messagesArea    = document.getElementById('messagesArea');
const messageInput    = document.getElementById('messageInput');
const sendBtn         = document.getElementById('sendBtn');
const newConvoBanner  = document.getElementById('newConvoBanner');
const newConvoBannerText = document.getElementById('newConvoBannerText');
const ccToast         = document.getElementById('ccToast');
const userNameEl      = document.getElementById('userName');
const userSubEl       = document.getElementById('userSub');
const userAvatarEl    = document.getElementById('userAvatar');
const conversationsPanel = document.getElementById('conversationsPanel');

// ── State ────────────────────────────────────────────────────────────
let currentUser      = null;
let conversations    = [];
let activeConvoId    = null;
let unsubMessages    = null;
let unsubConvos      = null;
let unsubPresence    = null;
let searchQuery      = '';

// ── Helpers ───────────────────────────────────────────────────────────
function showToast(msg) {
  if (!ccToast) return;
  ccToast.textContent = msg;
  ccToast.classList.add('show');
  setTimeout(() => ccToast.classList.remove('show'), 2800);
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;');
}

function formatTime(ts) {
  if (!ts) return '';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  const now = new Date();
  const diff = now - d;
  if (diff < 60000) return 'now';
  if (diff < 3600000) return Math.floor(diff / 60000) + 'm ago';
  if (diff < 86400000) return d.toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' });
  return d.toLocaleDateString([], { month:'short', day:'numeric' });
}

function getPartnerName(convo) {
  if (!currentUser || !convo.participantNames) return 'Unknown';
  const partnerId = (convo.participants || []).find(p => p !== currentUser.uid);
  return convo.participantNames[partnerId] || 'Unknown';
}

function getPartnerUid(convo) {
  if (!currentUser || !convo?.participants) return null;
  return (convo.participants || []).find(p => p !== currentUser.uid) || null;
}

function getInitials(name) {
  return name ? name.trim().charAt(0).toUpperCase() : '?';
}

// ── Render conversation list ─────────────────────────────────────────
function renderConversations() {
  const filtered = searchQuery
    ? conversations.filter(c => getPartnerName(c).toLowerCase().includes(searchQuery))
    : conversations;

  if (filtered.length === 0) {
    convList.innerHTML = `
      <div style="padding:32px 20px;text-align:center;color:#94a3b8">
        <span class="material-symbols-outlined" style="font-size:40px;display:block;margin-bottom:8px;color:#c0c1ff">inbox</span>
        <p style="font-weight:600;color:#0b1c30;margin-bottom:4px">${searchQuery ? 'No results' : 'No conversations yet'}</p>
        <p style="font-size:13px">${searchQuery ? 'Try a different name.' : "Start a conversation from another student's profile."}</p>
      </div>`;
    return;
  }

  convList.innerHTML = filtered.map(c => {
    const name = getPartnerName(c);
    const initials = getInitials(name);
    const preview = c.lastMessage || 'No messages yet';
    const time = formatTime(c.lastMessageAt);
    const isActive = c.id === activeConvoId;
    return `
      <div class="conv-item ${isActive ? 'active' : ''}" data-id="${c.id}">
        <div style="width:44px;height:44px;border-radius:50%;background:#4648d4;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:16px;flex-shrink:0">${escapeHtml(initials)}</div>
        <div class="conv-info">
          <div class="conv-top">
            <span class="conv-name">${escapeHtml(name)}</span>
            <span class="conv-time">${time}</span>
          </div>
          <p class="conv-preview">${escapeHtml(preview)}</p>
        </div>
      </div>`;
  }).join('');

  convList.querySelectorAll('.conv-item').forEach(el => {
    el.addEventListener('click', () => openChat(el.dataset.id));
  });
}

// ── Open a conversation ──────────────────────────────────────────────
function openChat(convoId) {
  activeConvoId = convoId;
  const convo = conversations.find(c => c.id === convoId);
  if (!convo) return;

  const name = getPartnerName(convo);
  chatName.textContent = name;
  chatAvatar.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=4648d4&color=fff&size=40`;

  // Show chat, hide empty state
  chatEmptyState.style.display = 'none';
  chatActive.style.display = 'flex';

  // Mobile: show back button, hide conversations panel
  if (window.innerWidth < 768) {
    chatBackBtn.style.display = 'flex';
    conversationsPanel.style.display = 'none';
  }

  // Re-render list to show active highlight
  renderConversations();

  // Track partner online status
  if (unsubPresence) { unsubPresence(); unsubPresence = null; }
  const chatOnlineDot = document.getElementById('chatOnlineDot');
  const chatStatusText = document.getElementById('chatStatusText');
  if (chatOnlineDot) chatOnlineDot.style.background = '#94a3b8';
  if (chatStatusText) {
    chatStatusText.textContent = 'Offline';
    chatStatusText.style.color = '#94a3b8';
  }

  const partnerUid = getPartnerUid(convo);
  if (partnerUid) {
    unsubPresence = onSnapshot(doc(db, 'presence', partnerUid), snap => {
      const data = snap.data();
      const lastSeenMillis = data?.lastSeen?.toMillis ? data.lastSeen.toMillis() : (data?.lastSeen?.seconds ? data.lastSeen.seconds * 1000 : 0);
      const isRecent = !lastSeenMillis || (Date.now() - lastSeenMillis < 10 * 60 * 1000);
      const isOnline = data?.online === true && isRecent;
      if (chatOnlineDot) chatOnlineDot.style.background = isOnline ? '#22c55e' : '#94a3b8';
      if (chatStatusText) {
        chatStatusText.textContent = isOnline ? 'Online' : 'Offline';
        chatStatusText.style.color = isOnline ? '#22c55e' : '#94a3b8';
      }
    }, err => {
      console.warn('Presence snapshot error:', err);
    });
  }

  // Subscribe to messages
  if (unsubMessages) { unsubMessages(); unsubMessages = null; }
  messagesContainer.innerHTML = `<div style="text-align:center;padding:20px;color:#94a3b8;font-size:14px">Loading messages…</div>`;

  const q = query(
    collection(db, 'conversations', convoId, 'messages'),
    orderBy('createdAt', 'asc')
  );
  unsubMessages = onSnapshot(q, snap => {
    if (snap.empty) {
      messagesContainer.innerHTML = `<div style="text-align:center;padding:40px 20px;color:#94a3b8;font-size:14px">No messages yet. Say hello! 👋</div>`;
    } else {
      messagesContainer.innerHTML = snap.docs.map(d => {
        const msg = d.data();
        const isSent = msg.senderUid === currentUser?.uid;
        const time = formatTime(msg.createdAt);
        return isSent
          ? `<div class="message-row sent">
               <div class="bubble sent-bubble">
                 <p>${escapeHtml(msg.text)}</p>
                 <span class="msg-time">${time} <span class="material-symbols-outlined check-icon">done_all</span></span>
               </div>
             </div>`
          : `<div class="message-row received">
               <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(getPartnerName(convo))}&background=4648d4&color=fff&size=32" class="msg-avatar" alt="">
               <div class="bubble received-bubble">
                 <p>${escapeHtml(msg.text)}</p>
                 <span class="msg-time">${time}</span>
               </div>
             </div>`;
      }).join('');
    }
    messagesArea.scrollTop = messagesArea.scrollHeight;
  }, err => {
    console.warn('Messages snapshot error:', err.message);
    messagesContainer.innerHTML = `<div style="text-align:center;padding:20px;color:#f43f5e;font-size:14px">Failed to load messages.</div>`;
  });

  messageInput.focus();
}

// ── Send message ─────────────────────────────────────────────────────
async function sendMessage() {
  const text = messageInput.value.trim();
  if (!text || !activeConvoId || !currentUser) return;
  messageInput.value = '';

  try {
    await addDoc(collection(db, 'conversations', activeConvoId, 'messages'), {
      senderUid: currentUser.uid,
      senderName: currentUser.displayName || 'You',
      text,
      createdAt: serverTimestamp()
    });
    await updateDoc(doc(db, 'conversations', activeConvoId), {
      lastMessage: text.length > 80 ? text.slice(0, 80) + '…' : text,
      lastMessageAt: serverTimestamp()
    });
  } catch (e) {
    // Render locally if Firestore fails
    const now = new Date().toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' });
    messagesContainer.innerHTML += `
      <div class="message-row sent">
        <div class="bubble sent-bubble">
          <p>${escapeHtml(text)}</p>
          <span class="msg-time">${now}</span>
        </div>
      </div>`;
    messagesArea.scrollTop = messagesArea.scrollHeight;
  }
}

sendBtn.addEventListener('click', sendMessage);
messageInput.addEventListener('keydown', e => {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
});

// ── Back button (mobile) ─────────────────────────────────────────────
chatBackBtn.addEventListener('click', () => {
  if (unsubMessages) { unsubMessages(); unsubMessages = null; }
  activeConvoId = null;
  chatActive.style.display = 'none';
  chatEmptyState.style.display = '';
  chatBackBtn.style.display = 'none';
  conversationsPanel.style.display = '';
  newConvoBanner.style.display = 'none';
  renderConversations();
});

// ── Search ────────────────────────────────────────────────────────────
convSearch.addEventListener('input', e => {
  searchQuery = e.target.value.toLowerCase();
  renderConversations();
});

// ── Start or find conversation with seller ───────────────────────────
async function startOrFindConversation(partnerUid, partnerName, productTitle) {
  if (!currentUser) return null;

  // Search existing convos for one with this partner
  const existing = conversations.find(c => (c.participants || []).includes(partnerUid));
  if (existing) return existing.id;

  // Create new conversation
  try {
    const docRef = await addDoc(collection(db, 'conversations'), {
      participants: [currentUser.uid, partnerUid],
      participantNames: {
        [currentUser.uid]: currentUser.displayName || 'You',
        [partnerUid]: partnerName
      },
      lastMessage: productTitle ? `Re: ${productTitle}` : '',
      lastMessageAt: serverTimestamp()
    });
    return docRef.id;
  } catch (err) {
    console.error('Failed to create conversation:', err);
    showToast('Could not start conversation. Please try again.');
    return null;
  }
}

// ── Auth guard + subscribe to conversations ───────────────────────────
onAuthStateChanged(auth, async user => {
  if (!user) {
    window.location.href = '/login.html?next=/chats.html';
    return;
  }
  currentUser = user;

  // Patch sidebar user info
  if (userNameEl) userNameEl.textContent = user.displayName || user.email || 'You';
  if (userSubEl)  userSubEl.textContent  = user.email || '';
  if (userAvatarEl && user.photoURL) userAvatarEl.src = user.photoURL;
  else if (userAvatarEl) userAvatarEl.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName||'U')}&background=4648d4&color=fff&size=40`;

  // Update online presence in Firestore
  try {
    await setDoc(doc(db, 'presence', user.uid), {
      online: true,
      lastSeen: serverTimestamp()
    }, { merge: true });
  } catch (e) {
    console.warn('Failed to set online presence:', e);
  }

  window.addEventListener('beforeunload', () => {
    try {
      setDoc(doc(db, 'presence', user.uid), {
        online: false,
        lastSeen: serverTimestamp()
      }, { merge: true });
    } catch (_) {}
  });

  // Heartbeat every 2 minutes while page is active
  setInterval(() => {
    if (auth.currentUser) {
      setDoc(doc(db, 'presence', auth.currentUser.uid), {
        online: true,
        lastSeen: serverTimestamp()
      }, { merge: true }).catch(() => {});
    }
  }, 2 * 60 * 1000);

  // Subscribe to conversations
  if (unsubConvos) unsubConvos();
  const q = query(
    collection(db, 'conversations'),
    where('participants', 'array-contains', user.uid),
    orderBy('lastMessageAt', 'desc')
  );
  unsubConvos = onSnapshot(q, async snap => {
    conversations = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    renderConversations();

    // ── Handle seller deep-link ─────────────────────────────────
    const params = new URLSearchParams(window.location.search);
    const sellerId    = params.get('sellerId');
    const sellerName  = params.get('sellerName');
    const productTitle = params.get('productTitle');

    if (sellerId && sellerId !== user.uid && !activeConvoId) {
      // Show banner
      if (newConvoBanner && newConvoBannerText) {
        newConvoBannerText.textContent = productTitle
          ? `Starting conversation about "${decodeURIComponent(productTitle)}" with ${decodeURIComponent(sellerName || 'Seller')}`
          : `Starting conversation with ${decodeURIComponent(sellerName || 'Seller')}`;
        newConvoBanner.style.display = 'flex';
      }

      const convoId = await startOrFindConversation(
        decodeURIComponent(sellerId),
        decodeURIComponent(sellerName || 'Seller'),
        productTitle ? decodeURIComponent(productTitle) : ''
      );

      // Clear URL params so refreshing doesn't re-open
      window.history.replaceState({}, '', '/chats.html');

      if (convoId) {
        // Wait a tick for conversations to update from snapshot
        setTimeout(() => {
          const convo = conversations.find(c => c.id === convoId);
          if (convo) {
            openChat(convoId);
          } else {
            // Force open even if not yet in list
            activeConvoId = convoId;
            chatName.textContent = decodeURIComponent(sellerName || 'Seller');
            chatAvatar.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(sellerName||'S')}&background=4648d4&color=fff&size=40`;
            chatEmptyState.style.display = 'none';
            chatActive.style.display = 'flex';
            if (window.innerWidth < 768) { chatBackBtn.style.display = 'flex'; conversationsPanel.style.display = 'none'; }
            openChat(convoId);
          }
        }, 600);
      }
    }
  }, err => {
    console.warn('Conversations snapshot error:', err.message);
    convList.innerHTML = `<div style="padding:24px;text-align:center;color:#f43f5e;font-size:14px">Failed to load conversations.</div>`;
  });
});
