import{h,a as d,c as p}from"./index.esm2017-gTHyaaP9.js";/* empty css              */import{a as w,d as f}from"./firebase-config-C3QPZpAg.js";import{i as b,a as y,t as v}from"./favoritesStore-JloAdjsq.js";import{a as x}from"./firebase-DeKucMEk.js";const o=document.getElementById("marketplaceGrid"),l=document.getElementById("searchInput");let r=[];function g(e){return e==null?"":String(e).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;")}b(()=>{r.length>0&&s()});async function u(){if(o){o.innerHTML='<p style="grid-column: span 3; text-align: center;">Loading listings...</p>';try{let e;try{e=await d(p(f,"listings"))}catch(a){console.warn("Primary fetch on /listings failed, trying /products fallback: ",a),e=await d(p(f,"products"))}r=[],e.forEach(a=>{r.push({id:a.id,...a.data()})}),s()}catch(e){console.error("Error fetching products: ",e),o.innerHTML='<p style="grid-column: span 3; text-align: center; color: red;">Failed to load items.</p>'}}}function s(){o.innerHTML="";const e=(l==null?void 0:l.value.toLowerCase())||"",a=r.filter(t=>{var i,n;return((i=t.title)==null?void 0:i.toLowerCase().includes(e))||((n=t.category)==null?void 0:n.toLowerCase().includes(e))});if(a.length===0){o.innerHTML='<p style="grid-column: span 3; text-align: center; color: #94a3b8;">No items listed yet. Be the first to list one!</p>';return}a.forEach(t=>{const i=y("products",t.id),n=document.createElement("div");n.className="card";const m=t.imageUrl?`<img src="${t.imageUrl}" alt="${g(t.title)}" onerror="this.onerror=null; this.src='data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='200' viewBox='0 0 300 200' fill='%23f1f5f9'><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='14' fill='%2364748b'>Campus Marketplace</text></svg>';">`:'<div style="width:100%; height:180px; background:#f1f5f9; display:flex; align-items:center; justify-content:center; color:#64748b; font-weight:600; font-size:14px;">Campus Marketplace</div>';n.innerHTML=`
      <div class="card-image-box">
        ${m}
        <span class="badge">${g(t.condition||"Used")}</span>
      </div>
      <div class="card-body">
        <div class="card-title-row">
          <h3>${t.title}</h3>
          <span class="price">${t.price} FCFA</span>
        </div>
        <p class="location">📍 ${t.location||"Campus"}</p>
      </div>
      <div class="card-footer" style="display:flex; justify-content:space-between; align-items:center;">
        <a href="product-details.html?id=${t.id}" class="btn-connect">View Details</a>
        <button type="button" class="like-btn ${i?"liked":""}" style="background:${i?"rgba(37, 99, 235, 0.08)":"none"}; border:1px solid ${i?"#2563eb":"#cbd5e1"}; border-radius:16px; padding:4px 10px; cursor:pointer; display:inline-flex; align-items:center; gap:4px; font-size:13px; color:${i?"#2563eb":"#64748b"}; transition:all 0.2s;" aria-label="Like item">
          <span class="like-icon">👍</span> <span class="like-label">${i?"Saved":"Like"}</span>
        </button>
      </div>
    `,n.querySelector(".like-btn").addEventListener("click",c=>{c.preventDefault(),c.stopPropagation(),v("products",t.id,t.title)}),o.appendChild(n)})}l==null||l.addEventListener("input",s);u();h(w,()=>{u()});h(x,e=>{e?(window.location.pathname==="/"||window.location.pathname==="/index.html"||window.location.pathname.endsWith("/"))&&(window.location.href="/dashboard.html"):(window.location.pathname==="/"||window.location.pathname==="/index.html"||window.location.pathname.endsWith("/"))&&(window.location.href="/login.html")});
