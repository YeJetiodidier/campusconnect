import"./index.esm2017-aF7IW9R1.js";import{r as u,a as g,i as s,o as f,s as h,c as y}from"./footer-DPNrPZWS.js";import{r as l,e as i}from"./renderCard-CLS294Wn.js";import{s as v}from"./internshipsService-B4iR-s-o.js";import{f as $}from"./eventsService-B0KpubtB.js";import{i as E}from"./favoritesStore-JloAdjsq.js";import"./firebase-config-CsnSWmcf.js";u("dashboard");g();document.getElementById("stat-icon-jobs").innerHTML=`<span class="icon">${s.briefcase}</span>`;document.getElementById("stat-icon-events").innerHTML=`<span class="icon">${s.calendar}</span>`;document.getElementById("stat-icon-notifs").innerHTML=`<span class="icon">${s.bell}</span>`;document.getElementById("cta-icon").innerHTML=`<span class="icon">${s.arrowRight}</span>`;const b=document.getElementById("hero-greeting"),L=document.getElementById("hero-message"),M=document.getElementById("summary-jobs"),w=document.getElementById("summary-events"),p=document.getElementById("summary-notifications"),c=document.getElementById("latest-jobs-mount"),r=document.getElementById("notifications-panel-mount"),d=document.getElementById("events-panel-mount");function C(){const t=new Date().getHours();return t<12?"Good Morning":t<18?"Good Afternoon":"Good Evening"}f(t=>{var n;const e=(n=t==null?void 0:t.displayName)==null?void 0:n.split(" ")[0];if(b.textContent=`${C()}${e?`, ${e}`:""}!`,!t){p.textContent="0",r.innerHTML="",l(r,{title:"Log in to see notifications"});return}h(t.uid,a=>{const o=y(a);p.textContent=String(o),L.textContent=o>0?`You have ${o} unread notification${o===1?"":"s"}. Check what's new.`:"You're all caught up on notifications.",H(a.slice(0,3))})});E(t=>{const e=t.filter(a=>a.sourceCollection==="jobs"),n=t.filter(a=>a.sourceCollection==="events");M.textContent=String(e.length),w.textContent=String(n.length)});function H(t){if(t.length===0){r.innerHTML="",l(r,{title:"You're all caught up"});return}r.innerHTML=t.map(e=>`
      <div class="panel-row fade-in">
        <span class="panel-avatar"><span class="icon">${s.bell}</span></span>
        <div style="min-width:0;">
          <p class="panel-row-title">${i(e.title)}</p>
          <p class="panel-row-meta">${i(e.message)}</p>
        </div>
      </div>`).join("")}function T(t){if(t.length===0){c.innerHTML="",l(c,{title:"No listings yet",description:"Check back soon for new opportunities."});return}const e=document.createElement("div");e.className="mini-card-grid fade-in",t.forEach(n=>{const a=document.createElement("a");a.href=`/job-details.html?id=${n.id}`,a.className="mini-card",a.innerHTML=`
      <div class="mini-card-thumb">
        <span class="icon">${s.briefcase}</span>
        ${n.type?`<span class="badge">${i(n.type)}</span>`:""}
      </div>
      <div class="mini-card-body">
        <p class="mini-card-title">${i(n.title)}</p>
        <p class="mini-card-meta">${i(n.company||"")}</p>
      </div>
    `,e.appendChild(a)}),c.innerHTML="",c.appendChild(e)}function B(t){if(t.length===0){d.innerHTML="",l(d,{title:"No upcoming events"});return}d.innerHTML=t.slice(0,3).map(e=>{var m;const n=(m=e.date)!=null&&m.toDate?e.date.toDate():e.date?new Date(e.date):null,a=n?n.getDate():"–",o=n?n.toLocaleDateString(void 0,{month:"short"}).toUpperCase():"";return`
      <a href="/event-details.html?id=${e.id}" class="panel-row fade-in">
        <div class="panel-date-chip">${a}<br/>${o}</div>
        <div style="min-width:0;">
          <p class="panel-row-title">${i(e.title)}</p>
          <p class="panel-row-meta">${i(e.venue||"")}</p>
        </div>
      </a>`}).join("")}v(T,4);$().then(B);
