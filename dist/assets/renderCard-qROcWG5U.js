import{i as n}from"./footer-DBB2HTc9.js";function b(e,{title:t,description:a}){e.innerHTML=`
    <div class="empty-state">
      <p>${t}</p>
      ${a?`<p>${a}</p>`:""}
    </div>
  `}function $(e,t=8){const a=Array.from({length:t}).map(()=>`
      <div class="skeleton-card">
        <div class="skeleton-block skeleton-img"></div>
        <div class="skeleton-block skeleton-line"></div>
        <div class="skeleton-block skeleton-line short"></div>
      </div>`).join("");e.innerHTML=`<div class="grid">${a}</div>`}function k(e){const{to:t,title:a,subtitle:r,meta:i,imageUrl:c,kind:v="job",favorited:o,onToggleFavorite:p}=e,f=v==="event"?n.calendar:n.briefcase,s=document.createElement("div");return s.className="card fade-in",s.innerHTML=`
    <button type="button" class="favorite-btn ${o?"favorited":""}" aria-label="${o?"Remove from favorites":"Save to favorites"}"><span class="icon">${n.heart}</span></button>
    <a href="${t}" class="card-link">
      ${c?`<img src="${c}" alt="${a}" />`:`<div class="card-thumb-fallback"><span class="icon">${f}</span></div>`}
      <div class="card-body">
        <p class="card-title">${l(a)}</p>
        ${r?`<p class="card-subtitle">${l(r)}</p>`:""}
        ${i?`<p class="card-meta">${l(i)}</p>`:""}
      </div>
    </a>
  `,s.querySelector(".favorite-btn").addEventListener("click",d=>{d.preventDefault(),d.stopPropagation(),p()}),s}function l(e){return e==null?"":String(e).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;")}export{k as a,$ as b,l as e,b as r};
