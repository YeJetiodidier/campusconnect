import"./index.esm2017-gTHyaaP9.js";/* empty css               */import{r as u,a as g,i as s,o as f,s as h,c as y}from"./footer-S7tz1WGR.js";import{r as l,e as a}from"./renderCard-CKdLQDp5.js";import{s as v}from"./internshipsService-icUKAQ5o.js";import{f as $}from"./eventsService-Do205TkU.js";import{i as E}from"./favoritesStore-JloAdjsq.js";import"./firebase-config-C3QPZpAg.js";u("dashboard");g();document.getElementById("stat-icon-jobs").innerHTML=`<span class="icon">${s.briefcase}</span>`;document.getElementById("stat-icon-events").innerHTML=`<span class="icon">${s.calendar}</span>`;document.getElementById("stat-icon-notifs").innerHTML=`<span class="icon">${s.bell}</span>`;document.getElementById("cta-icon").innerHTML=`<span class="icon">${s.arrowRight}</span>`;const b=document.getElementById("hero-greeting"),L=document.getElementById("hero-message"),M=document.getElementById("summary-jobs"),w=document.getElementById("summary-events"),p=document.getElementById("summary-notifications"),c=document.getElementById("latest-jobs-mount"),r=document.getElementById("notifications-panel-mount"),d=document.getElementById("events-panel-mount");function C(){const t=new Date().getHours();return t<12?"Good Morning":t<18?"Good Afternoon":"Good Evening"}f(t=>{var n;const e=(n=t==null?void 0:t.displayName)==null?void 0:n.split(" ")[0];if(b.textContent=`${C()}${e?`, ${e}`:""}!`,!t){p.textContent="0",r.innerHTML="",l(r,{title:"Log in to see notifications"});return}h(t.uid,i=>{const o=y(i);p.textContent=String(o),L.textContent=o>0?`You have ${o} unread notification${o===1?"":"s"}. Check what's new.`:"You're all caught up on notifications.",H(i.slice(0,3))})});E(t=>{const e=t.filter(i=>i.sourceCollection==="jobs"),n=t.filter(i=>i.sourceCollection==="events");M.textContent=String(e.length),w.textContent=String(n.length)});function H(t){if(t.length===0){r.innerHTML="",l(r,{title:"You're all caught up"});return}r.innerHTML=t.map(e=>`
      <div class="panel-row fade-in">
        <span class="panel-avatar"><span class="icon">${s.bell}</span></span>
        <div style="min-width:0;">
          <p class="panel-row-title">${a(e.title)}</p>
          <p class="panel-row-meta">${a(e.message)}</p>
        </div>
      </div>`).join("")}function T(t){if(t.length===0){c.innerHTML="",l(c,{title:"No listings yet",description:"Check back soon for new opportunities."});return}const e=document.createElement("div");e.className="mini-card-grid fade-in",t.forEach(n=>{const i=document.createElement("a");i.href=`/job-details.html?id=${n.id}`,i.className="mini-card",i.innerHTML=`
      <div class="mini-card-thumb">
        <span class="icon">${s.briefcase}</span>
        ${n.type?`<span class="badge">${a(n.type)}</span>`:""}
      </div>
      <div class="mini-card-body">
        <p class="mini-card-title">${a(n.title)}</p>
        <p class="mini-card-meta">${a(n.company||"")}</p>
      </div>
    `,e.appendChild(i)}),c.innerHTML="",c.appendChild(e)}function B(t){if(t.length===0){d.innerHTML="",l(d,{title:"No upcoming events"});return}d.innerHTML=t.slice(0,3).map(e=>{var m;const n=(m=e.date)!=null&&m.toDate?e.date.toDate():e.date?new Date(e.date):null,i=n?n.getDate():"–",o=n?n.toLocaleDateString(void 0,{month:"short"}).toUpperCase():"";return`
      <a href="/event-details.html?id=${e.id}" class="panel-row fade-in">
        <div class="panel-date-chip">${i}<br/>${o}</div>
        <div style="min-width:0;">
          <p class="panel-row-title">${a(e.title)}</p>
          <p class="panel-row-meta">${a(e.venue||"")}</p>
        </div>
      </a>`}).join("")}v(T,4);$().then(B);
