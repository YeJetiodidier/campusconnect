import{b as v,d as m,h as b,a as y,c as h}from"./index.esm2017-gTHyaaP9.js";/* empty css              */import{d as p,a as x}from"./firebase-config-C3QPZpAg.js";import{i as w,a as L,t as k}from"./favoritesStore-JloAdjsq.js";const r=document.getElementById("servicesGrid"),a=document.getElementById("serviceSearchInput");let o=[];function d(t){return t==null?"":String(t).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;")}w(()=>{o.length>0&&c()});async function g(){if(r){r.innerHTML='<p style="grid-column: span 3; text-align: center;">Loading services...</p>';try{const t=await y(h(p,"services"));o=[],t.forEach(s=>{o.push({id:s.id,...s.data()})}),c()}catch(t){console.error("Error fetching services: ",t),r.innerHTML='<p style="grid-column: span 3; text-align: center; color: red;">Failed to load services.</p>'}}}function c(){r.innerHTML="";const t=(a==null?void 0:a.value.toLowerCase())||"",s=o.filter(e=>{var i,n;return((i=e.title)==null?void 0:i.toLowerCase().includes(t))||((n=e.category)==null?void 0:n.toLowerCase().includes(t))});if(s.length===0){r.innerHTML='<p style="grid-column: span 3; text-align: center; color: #94a3b8;">No services available. Click "+ Offer a Service" to add one!</p>';return}s.forEach(e=>{const i=L("services",e.id),n=document.createElement("div");n.className="card";const f=e.imageUrl?`<img src="${e.imageUrl}" alt="${d(e.title)}" onerror="this.onerror=null; this.src='data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='200' viewBox='0 0 300 200' fill='%23f1f5f9'><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='14' fill='%2364748b'>Campus Service</text></svg>';">`:'<div style="width:100%; height:180px; background:#f1f5f9; display:flex; align-items:center; justify-content:center; color:#64748b; font-weight:600; font-size:14px;">Campus Service</div>';n.innerHTML=`
      <div class="card-image-box">
        ${f}
        <span class="badge">${d(e.category||"Service")}</span>
      </div>
      <div class="card-body">
        <div class="card-title-row">
          <h3>${e.title}</h3>
          <span class="price">${e.rate} FCFA/hr</span>
        </div>
      </div>
      <div class="card-footer" style="display:flex; justify-content:space-between; align-items:center;">
        <div style="display:flex; gap:8px; align-items:center;">
          <a href="service-details.html?id=${e.id}" class="btn-connect">View Details</a>
          <button class="btn-delete" data-id="${e.id}" style="color:red; background:none; border:none; cursor:pointer;">Delete</button>
        </div>
        <button type="button" class="like-btn ${i?"liked":""}" style="background:${i?"rgba(37, 99, 235, 0.08)":"none"}; border:1px solid ${i?"#2563eb":"#cbd5e1"}; border-radius:16px; padding:4px 10px; cursor:pointer; display:inline-flex; align-items:center; gap:4px; font-size:13px; color:${i?"#2563eb":"#64748b"}; transition:all 0.2s;" aria-label="Like service">
          <span class="like-icon">👍</span> <span class="like-label">${i?"Saved":"Like"}</span>
        </button>
      </div>
    `,n.querySelector(".like-btn").addEventListener("click",l=>{l.preventDefault(),l.stopPropagation(),k("services",e.id,e.title)}),n.querySelector(".btn-delete").addEventListener("click",async l=>{const u=l.target.getAttribute("data-id");confirm("Are you sure you want to delete this service listing?")&&(await v(m(p,"services",u)),g())}),r.appendChild(n)})}a==null||a.addEventListener("input",c);b(x,t=>{t?g():r&&(r.innerHTML='<p style="grid-column: span 3; text-align: center; color: #64748b;">Please <a href="login.html" style="color: #4f46e5; font-weight:600;">log in</a> to view student services.</p>')});
