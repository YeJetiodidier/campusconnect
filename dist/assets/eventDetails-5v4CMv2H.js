import"./index.esm2017-aF7IW9R1.js";import{r as f,a as b,o as g,i}from"./footer-DPNrPZWS.js";import{r as y,e as s}from"./renderCard-CLS294Wn.js";import{i as h,t as $,a as E}from"./favoritesStore-JloAdjsq.js";import{a as L,g as u,c as S,r as I}from"./eventsService-B0KpubtB.js";import"./firebase-config-CsnSWmcf.js";f("events");b();const o=document.getElementById("event-details-mount"),m=new URLSearchParams(location.search).get("id");let e=null,n=null,a=!1;h(()=>{e&&p()});g(async t=>{n=t,e&&t&&(a=await u(e.id,t.uid),c())});async function B(){if(!m){v();return}if(e=await L(m),!e){v();return}n&&(a=await u(e.id,n.uid)),R()}function v(){o.innerHTML="",y(o,{title:"This event isn't available",description:"It may have been removed or already taken place."});const t=document.createElement("div");t.style.textAlign="center",t.innerHTML='<a href="/events.html" style="color:#7c3aed;text-decoration:underline;font-size:13px;">Back to Campus Events</a>',o.appendChild(t)}function R(){const t=w(e);o.innerHTML=`
    <a href="/events.html" class="back-link"><span class="icon">${i.chevronLeft}</span> Back to events</a>

    ${e.coverImageURL?`<img src="${e.coverImageURL}" alt="${s(e.title)}" class="detail-image" />`:""}

    <div class="detail-header">
      <h1 class="detail-title">${s(e.title)}</h1>
      <button type="button" id="favorite-btn" class="icon-btn" aria-label="Save to favorites"><span class="icon">${i.heart}</span></button>
    </div>

    <div class="detail-meta">
      ${t?`<span class="meta-item"><span class="icon">${i.calendar}</span> ${t}</span>`:""}
      ${e.venue?`<span class="meta-item"><span class="icon">${i.location}</span> ${s(e.venue)}</span>`:""}
      ${e.capacity?`<span class="meta-item"><span class="icon">${i.user}</span> Capacity ${e.capacity}</span>`:""}
    </div>

    <div class="detail-body">${s(e.description)}</div>

    <div style="margin-top:32px;">
      <button type="button" id="rsvp-btn" class="btn btn-primary"></button>
    </div>
  `,document.getElementById("favorite-btn").addEventListener("click",()=>{$("events",e.id,e.title)}),document.getElementById("rsvp-btn").addEventListener("click",k),p(),c()}async function k(){if(!n){alert("Please log in to RSVP.");return}const t=document.getElementById("rsvp-btn");t.disabled=!0,t.textContent="Please wait…",a?(await S(e.id,n.uid),a=!1):(await I(e.id,n.uid),a=!0),t.disabled=!1,c()}function c(){const t=document.getElementById("rsvp-btn");t&&(t.textContent=a?"You're going · Cancel RSVP":"RSVP / I'm interested",t.classList.toggle("btn-secondary",a),t.classList.toggle("btn-primary",!a))}function p(){const t=document.getElementById("favorite-btn");if(!t)return;const r=E("events",e.id);t.classList.toggle("favorited",r),t.setAttribute("aria-label",r?"Remove from favorites":"Save to favorites")}function w(t){var l;if(!t.date)return"";const d=((l=t.date)!=null&&l.toDate?t.date.toDate():new Date(t.date)).toLocaleDateString(void 0,{year:"numeric",month:"short",day:"numeric"});return t.time?`${d} · ${t.time}`:d}B();
