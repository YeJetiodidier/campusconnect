import{a as P,d as b}from"./firebase-config-CWLAEKZD.js";import{o as A,q as D,l as T,b as N,a as w,U as q,d as B,c as R,u as H}from"./index.esm2017-DMBRuzyj.js";function Z(a){return A(P,e=>{if(!e){a(null);return}a({uid:e.uid,displayName:e.displayName,email:e.email})})}function I(a){return R(b,"users",a,"notifications")}function F(a,e,i=30){const d=D(I(a),N("createdDate","desc"),T(i));return w(d,o=>{e(o.docs.map(r=>({id:r.id,...r.data()})))},o=>(console.warn("Firestore index error in notifications, falling back to basic collection query:",o),w(I(a),r=>{const m=r.docs.map(l=>({id:l.id,...l.data()}));m.sort((l,g)=>{var c,h;return(((c=g.createdDate)==null?void 0:c.seconds)||0)-(((h=l.createdDate)==null?void 0:h.seconds)||0)}),e(m.slice(0,i))})))}async function z(a,e){await H(B(b,"users",a,"notifications",e),{status:"read"})}async function O(a,e){const i=e.filter(o=>o.status==="unread");if(i.length===0)return;const d=q(b);i.forEach(o=>{d.update(B(b,"users",a,"notifications",o.id),{status:"read"})}),await d.commit()}function U(a){return a.filter(e=>e.status==="unread").length}function s(a,e="0 0 24 24"){return`<svg viewBox="${e}" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">${a}</svg>`}const n={dashboard:s('<rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/>'),briefcase:s('<rect x="2.5" y="7" width="19" height="13" rx="2"/><path d="M8 7V5.5A1.5 1.5 0 0 1 9.5 4h5A1.5 1.5 0 0 1 16 5.5V7"/><path d="M2.5 12.5h19"/>'),calendar:s('<rect x="3" y="4.5" width="18" height="16" rx="2"/><path d="M8 3v3M16 3v3M3 9.5h18"/>'),bell:s('<path d="M6 9a6 6 0 1 1 12 0c0 4 1.5 5.5 1.5 5.5H4.5S6 13 6 9Z"/><path d="M10 19a2 2 0 0 0 4 0"/>'),heart:s('<path d="M12 20.5S3.5 15.2 3.5 9.3A4.8 4.8 0 0 1 12 6a4.8 4.8 0 0 1 8.5 3.3c0 5.9-8.5 11.2-8.5 11.2Z"/>'),messages:s('<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1.1-4.4A8 8 0 1 1 21 12Z"/>'),user:s('<circle cx="12" cy="8" r="4"/><path d="M4 20c1.5-4 5-6 8-6s6.5 2 8 6"/>'),settings:s('<circle cx="12" cy="12" r="3"/><path d="M19.4 13.5a7.7 7.7 0 0 0 0-3l2-1.5-2-3.4-2.3.9a7.6 7.6 0 0 0-2.6-1.5L14 2h-4l-.5 2.4a7.6 7.6 0 0 0-2.6 1.5l-2.3-.9-2 3.4 2 1.5a7.7 7.7 0 0 0 0 3l-2 1.5 2 3.4 2.3-.9c.77.65 1.66 1.16 2.6 1.5L10 22h4l.5-2.4a7.6 7.6 0 0 0 2.6-1.5l2.3.9 2-3.4-2-1.5Z"/>'),location:s('<path d="M12 21s7-6.3 7-11.5A7 7 0 0 0 5 9.5C5 14.7 12 21 12 21Z"/><circle cx="12" cy="9.5" r="2.3"/>'),arrowRight:s('<path d="M5 12h14M13 6l6 6-6 6"/>'),chevronLeft:s('<path d="M15 18l-6-6 6-6"/>'),menu:s('<path d="M4 7h16M4 12h16M4 17h16"/>'),close:s('<path d="M6 6l12 12M18 6L6 18"/>'),checkDouble:s('<path d="M2 12.5l4 4L14 8"/><path d="M9 12.5l4 4L21 8"/>'),megaphone:s('<path d="M3 11v2a2 2 0 0 0 2 2h1l2 5h2l-1.2-5H10l9 4V6l-9 4H3Z"/>'),send:s('<path d="M22 2 11 13"/><path d="M22 2 15 22 11 13 2 9 22 2Z"/>'),edit:s('<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5Z"/>'),logout:s('<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>')},_="/assets/campusconnect-logo-CYjNDdbV.png";localStorage.getItem("campusconnect_theme")==="dark"&&document.documentElement.classList.add("dark-theme");const V=[{key:"dashboard",label:"Dashboard",href:"/dashboard.html",icon:n.dashboard},{key:"internships",label:"Internships",href:"/internships.html",icon:n.briefcase},{key:"events",label:"Events",href:"/events.html",icon:n.calendar},{key:"messages",label:"Messages",href:"/messages.html",icon:n.messages},{key:"favorites",label:"Saved Items",href:"/favorites.html",icon:n.heart},{key:"notifications",label:"Notifications",href:"/notifications.html",icon:n.bell},{key:"profile",label:"Profile",href:"/profile.html",icon:n.user},{key:"settings",label:"Settings",href:"/settings.html",icon:n.settings}],j={dashboard:"Tableau de bord",internships:"Stages",events:"Événements",messages:"Messages",favorites:"Favoris",notifications:"Notifications",profile:"Profil",settings:"Paramètres"};function Y(a){const e=document.getElementById("app-sidebar");if(!e)return;const i=localStorage.getItem("campusconnect_lang")==="fr",d=V.map(t=>({...t,label:i&&j[t.key]||t.label}));e.innerHTML=`
    <div class="mobile-topbar">
      <button type="button" class="mobile-topbar__menu-btn" id="sidebar-open-btn" aria-label="Open menu">
        <span class="icon">${n.menu}</span>
      </button>
      <a href="/" class="mobile-topbar__logo">
        <img src="${_}" alt="CampusConnect" />
      </a>
      <div style="display: flex; align-items: center; gap: 8px;">
        <button type="button" class="theme-toggle-btn" id="mobile-theme-toggle-btn" aria-label="Toggle dark mode" style="background:none; border:none; cursor:pointer; color:var(--text); padding:6px; display:flex; align-items:center; justify-content:center; border-radius:50%;">
          <span class="icon">${n.settings}</span>
        </button>
        <a href="/notifications.html" class="mobile-topbar__bell" aria-label="Notifications">
          <span class="icon">${n.bell}</span>
          <span id="mobile-notif-dot" class="sidebar-dot" hidden></span>
        </a>
      </div>
    </div>

    <div class="sidebar-backdrop" id="sidebar-backdrop"></div>

    <aside class="sidebar" id="sidebar-panel">
      <div class="sidebar-top-row">
        <a href="/" class="sidebar-brand">
          <img src="${_}" alt="CampusConnect" class="sidebar-logo" />
        </a>
        <button type="button" class="sidebar-close-btn" id="sidebar-close-btn" aria-label="Close menu">
          <span class="icon">${n.close}</span>
        </button>
      </div>

      <nav class="sidebar-nav">
        ${d.map(t=>`
          <a href="${t.href}" class="sidebar-nav-item ${t.key===a?"is-active":""}" title="${t.label}">
            <span class="sidebar-nav-icon">${t.icon}</span>
            <span class="sidebar-nav-label">${t.label}</span>
            ${t.key==="notifications"?'<span id="sidebar-notif-dot" class="sidebar-dot" hidden></span>':""}
          </a>`).join("")}
      </nav>

      <div style="padding: 0 12px; margin-bottom: 8px;">
        <button type="button" class="theme-toggle-sidebar-btn" id="sidebar-theme-toggle-btn" title="Toggle Dark/Light Mode" style="width: 100%; display: flex; align-items: center; gap: 12px; padding: 10px 14px; border: 1px solid var(--border); background: var(--surface); color: var(--text); border-radius: 10px; font-weight: 500; cursor: pointer; transition: all 0.2s ease;">
          <span class="icon" id="theme-toggle-icon" style="font-size: 1.1rem;">🌙</span>
          <span class="sidebar-nav-label" id="theme-toggle-text">${i?"Mode sombre":"Dark Mode"}</span>
        </button>
      </div>

      <button type="button" class="quick-post-btn" id="quick-post-btn" title="${i?"Publier":"Quick Post"}">
        <span class="quick-post-plus">+</span> <span class="sidebar-nav-label">${i?"Publier":"Quick Post"}</span>
      </button>

      <a href="/settings.html" class="sidebar-user" id="sidebar-user" hidden title="Go to Settings" style="text-decoration:none;color:inherit;">
        <div class="sidebar-user-avatar" id="sidebar-user-avatar"></div>
        <div class="sidebar-user-info sidebar-nav-label">
          <p class="sidebar-user-name" id="sidebar-user-name"></p>
          <p class="sidebar-user-role" id="sidebar-user-role">${i?"Étudiant":"Student"}</p>
        </div>
      </a>
    </aside>
  `;const o=document.getElementById("sidebar-panel"),r=document.getElementById("sidebar-backdrop"),m=document.getElementById("sidebar-open-btn"),l=document.getElementById("sidebar-close-btn");function g(){o.classList.add("is-open"),r.classList.add("is-visible"),document.body.classList.add("sidebar-drawer-open")}function c(){o.classList.remove("is-open"),r.classList.remove("is-visible"),document.body.classList.remove("sidebar-drawer-open")}m.addEventListener("click",g),l.addEventListener("click",c),r.addEventListener("click",c),document.addEventListener("keydown",t=>{t.key==="Escape"&&c()}),document.getElementById("quick-post-btn").addEventListener("click",()=>{window.location.href="/marketplace.html"});const h=document.getElementById("sidebar-theme-toggle-btn"),v=document.getElementById("mobile-theme-toggle-btn"),y=document.getElementById("theme-toggle-icon"),k=document.getElementById("theme-toggle-text");function x(t){y&&(y.textContent=t?"☀️":"🌙"),k&&(k.textContent=t?"Light Mode":"Dark Mode")}const C=document.documentElement.classList.contains("dark-theme");x(C);function M(){const t=document.documentElement.classList.toggle("dark-theme");document.documentElement.classList.toggle("dark",t),localStorage.setItem("campusconnect_theme",t?"dark":"light"),localStorage.setItem("cc-theme",t?"dark":"light"),x(t)}h&&h.addEventListener("click",M),v&&v.addEventListener("click",M);let f=null;Z(t=>{const E=document.getElementById("sidebar-user"),u=document.getElementById("sidebar-notif-dot"),p=document.getElementById("mobile-notif-dot");if(f&&f(),!t){E.hidden=!0,u&&(u.hidden=!0),p&&(p.hidden=!0);return}const $=t.displayName||t.email||"Student";E.hidden=!1,document.getElementById("sidebar-user-name").textContent=$,document.getElementById("sidebar-user-avatar").textContent=$.charAt(0).toUpperCase(),f=F(t.uid,S=>{const L=U(S)>0;u&&(u.hidden=!L),p&&(p.hidden=!L)})})}function J(){const a=document.getElementById("app-footer");if(!a)return;const e=localStorage.getItem("campusconnect_lang")==="fr";a.innerHTML=`
    <footer class="site-footer">
      <div class="site-footer__brand">
        <p class="site-footer__title">CampusConnect</p>
        <p class="site-footer__blurb">
          ${e?"Permettre aux étudiants de se connecter, d'échanger et de progresser au sein de l'université. Conçu pour l'expérience étudiante moderne.":"Empowering students to connect, trade, and grow within the university ecosystem. Built for the modern campus experience."}
        </p>
        <p class="site-footer__copyright">&copy; 2026 ${e?"Plateforme Universitaire CampusConnect. Tous droits réservés.":"CampusConnect University Platform. All rights reserved."}</p>
      </div>

      <div class="site-footer__col">
        <p class="site-footer__heading">${e?"Plateforme":"Platform"}</p>
        <a href="/about.html">${e?"À propos de nous":"About Us"}</a>
        <a href="/internships.html">${e?"Stages":"Internships"}</a>
        <a href="/events.html">${e?"Événements":"Events"}</a>
        <a href="/marketplace.html">${e?"Marché":"Marketplace"}</a>
        <a href="/services.html">Services</a>
      </div>

      <div class="site-footer__col">
        <p class="site-footer__heading">${e?"Ressources":"Resources"}</p>
        <a href="/help-center.html">${e?"Centre d'aide":"Help Center"}</a>
        <a href="/guidelines.html">${e?"Règles étudiantes":"Student Guidelines"}</a>
        <a href="/privacy-policy.html">${e?"Politique de confidentialité":"Privacy Policy"}</a>
        <a href="/referrals.html">${e?"Parrainages":"Referrals"}</a>
        <a href="/dashboard.html">${e?"Tableau de bord":"Dashboard"}</a>
      </div>
    </footer>
  `}export{J as a,z as b,U as c,n as i,O as m,Z as o,Y as r,F as s};
