import { auth, db } from '../../config/firebase.js';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';

const splashScreen = document.getElementById('splashScreen');
const appContainer = document.getElementById('app');
const hasSeenSplash = sessionStorage.getItem('hasSeenSplash') === 'true';

if (hasSeenSplash && splashScreen) {
  splashScreen.remove();
  if (appContainer) appContainer.classList.add('app-visible');
}

let authResolved = false;
let minTimerDone = false;

function tryHideSplash() {
  if (authResolved && minTimerDone && splashScreen && splashScreen.parentNode) {
    splashScreen.classList.add('splash-hidden');
    if (appContainer) appContainer.classList.add('app-visible');
    sessionStorage.setItem('hasSeenSplash', 'true');
    splashScreen.addEventListener('transitionend', () => {
      if (splashScreen.parentNode) splashScreen.remove();
    }, { once: true });
  }
}

if (!hasSeenSplash) {
  setTimeout(() => { minTimerDone = true; tryHideSplash(); }, 2000);
} else {
  minTimerDone = true;
}

// ── Dashboard Data Hooks ────────────────────────────────────────
function bindDashboardData(user) {
  const listingsGrid = document.getElementById('listingsGrid');
  const statListings = document.getElementById('statListings');
  const messagesList = document.getElementById('messagesList');
  // Dummy hook for saved items
  const statSaved = document.getElementById('statSaved');

  // Listings Query (Assume standard users collection or global listings collection with uid filter)
  if (listingsGrid || statListings) {
    const listingsQ = query(
      collection(db, 'listings'), 
      where('sellerId', '==', user.uid),
      orderBy('createdAt', 'desc'), 
      limit(4)
    );
    
    onSnapshot(listingsQ, (snapshot) => {
      if (statListings) statListings.textContent = snapshot.size;
      
      if (listingsGrid) {
        if (snapshot.empty) {
          listingsGrid.innerHTML = `
            <div style="font-size:0.875rem; color:#888; padding: 12px; border: 1px dashed #ccc; border-radius:8px;">
              You haven't posted any listings yet.
            </div>`;
        } else {
          listingsGrid.innerHTML = '';
          snapshot.forEach(docSnap => {
            const data = docSnap.data();
            const badgeClass = data.status === 'pending' ? 'pending-badge' : 'active-badge';
            const statusTxt  = data.status === 'pending' ? 'Pending' : 'Active';
            // Placeholder if missing
            const imgUrl = data.images && data.images[0] ? data.images[0] : 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&h=200&fit=crop';
            
            listingsGrid.innerHTML += `
              <div class="listing-card" onclick="window.location.href='/marketplace.html'">
                <div class="listing-img-wrap">
                  <img src="${imgUrl}" alt="">
                  <span class="listing-badge ${badgeClass}">${statusTxt}</span>
                </div>
                <div class="listing-body">
                  <p class="listing-title">${escapeHtml(data.title || 'Untitled')}</p>
                  <div class="listing-meta">
                    <span class="listing-price">${data.price ? '$'+data.price : 'Free'}</span>
                    <span class="listing-views"><span class="material-symbols-outlined">visibility</span> ${data.views || 0}</span>
                  </div>
                </div>
              </div>
            `;
          });
        }
      }
    }, (err) => {
      console.warn("Listings fetch warning:", err.message);
      // Soft fail, maintain static HTML demo
    });
  }

  // Messages Preview Hook
  if (messagesList) {
    const convoQ = query(
      collection(db, 'users', user.uid, 'conversations'),
      orderBy('lastActivity', 'desc'),
      limit(3)
    );
    
    onSnapshot(convoQ, (snapshot) => {
      const statMsgs = document.getElementById('statMessages');
      if (statMsgs) statMsgs.textContent = snapshot.size;

      if (!snapshot.empty) {
        messagesList.innerHTML = '';
        snapshot.forEach(docSnap => {
          const c = docSnap.data();
          const pName = c.partnerName || 'Unknown';
          const pre   = c.lastMessage || 'New conversation';
          const pAva  = c.partnerAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(pName)}&background=635bff&color=fff`;
          
          messagesList.innerHTML += `
            <div class="msg-item" onclick="window.location.href='/chats.html'">
              <img src="${pAva}" alt="" class="msg-avatar">
              <div class="msg-body">
                <span class="msg-name">${escapeHtml(pName)}</span>
                <span class="msg-preview">${escapeHtml(pre)}</span>
              </div>
              <div class="msg-dot ${c.unread ? 'online' : ''}"></div>
            </div>`;
        });
      }
    }, (err) => {
      console.warn("Conversations preview warning:", err.message);
      // Soft fail, let html static fallback show
    });
  }

  // Generic saved items watcher
  if (statSaved) {
    onSnapshot(collection(db, 'users', user.uid, 'savedItems'), (snap) => {
      statSaved.textContent = snap.size;
    }, () => {}); // Fallback ignores errors
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return str.toString().replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

// ── Auth Handling ────────────────────────────────────────
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = '/login.html';
    return;
  }

  // 1. Text Replacements
  if (!hasSeenSplash) {
    const welcomeEl = document.querySelector('.welcome-text');
    if (welcomeEl && user.displayName) welcomeEl.textContent = `WELCOME BACK, ${user.displayName.split(' ')[0].toUpperCase()}!`;
  }

  const heroGreeting = document.getElementById('heroGreeting');
  if (heroGreeting && user.displayName) heroGreeting.textContent = `Good Morning, ${user.displayName.split(' ')[0]}!`;
  
  const userNameEl = document.getElementById('userName');
  if (userNameEl && user.displayName) userNameEl.textContent = user.displayName;

  const userAvatar = document.getElementById('userAvatar');
  if (userAvatar && user.photoURL) userAvatar.src = user.photoURL;

  // 2. Hydrate dynamic metrics
  bindDashboardData(user);

  authResolved = true;
  tryHideSplash();
});
