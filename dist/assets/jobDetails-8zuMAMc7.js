import"./modulepreload-polyfill-B5Qt9EMX.js";/* empty css               */import{r as m,a as f,i as r}from"./footer-C9JiiZp_.js";import{r as b,e as a}from"./renderCard-CqHj5xky.js";import{i as u,t as v,a as h}from"./favoritesStore-BcMbUSNM.js";import{f as y}from"./internshipsService-CRgIEVBd.js";import"./firebase-config-CWLAEKZD.js";import"./index.esm2017-DMBRuzyj.js";m("internships");f();const o=document.getElementById("job-details-mount"),l=new URLSearchParams(location.search).get("id");let t=null;u(()=>{t&&c()});async function g(){if(!l){d();return}if(t=await y(l),!t){d();return}$()}function d(){o.innerHTML="",b(o,{title:"This listing is no longer available",description:"It may have been closed by the recruiter or removed by an administrator."});const e=document.createElement("div");e.style.textAlign="center",e.innerHTML='<a href="/internships.html" style="color:#7c3aed;text-decoration:underline;font-size:13px;">Back to Internships &amp; Jobs</a>',o.appendChild(e)}function $(){var s;const e=(s=t.deadline)!=null&&s.toDate?t.deadline.toDate():t.deadline?new Date(t.deadline):null,n=e?e.toLocaleDateString(void 0,{year:"numeric",month:"short",day:"numeric"}):null;o.innerHTML=`
    <a href="/internships.html" class="back-link"><span class="icon">${r.chevronLeft}</span> Back to listings</a>

    <div class="detail-header">
      <div>
        <h1 class="detail-title">${a(t.title)}</h1>
        <p class="detail-subtitle">${a(t.company)}</p>
      </div>
      <button type="button" id="favorite-btn" class="icon-btn" aria-label="Save to favorites"><span class="icon">${r.heart}</span></button>
    </div>

    <div class="detail-meta">
      ${t.location?`<span class="meta-item"><span class="icon">${r.location}</span> ${a(t.location)}</span>`:""}
      ${n?`<span class="meta-item"><span class="icon">${r.calendar}</span> Apply by ${n}</span>`:""}
      ${t.type?`<span style="background:#f3f4f6;border-radius:999px;padding:2px 10px;text-transform:capitalize;">${a(t.type)}</span>`:""}
    </div>

    <div class="detail-body">${a(t.description)}</div>

    <div style="margin-top:32px;display:flex;gap:12px;flex-wrap:wrap;">
      ${(()=>{let i=(t.applicationLink||t.applyUrl||"").trim();if(!i)return'<span style="color:#94a3b8;font-size:14px;padding:10px 0;">Contact the recruiter to apply for this position.</span>';const p=/^https?:\/\//i.test(i)||/^mailto:/i.test(i)?i:`https://${i}`;return`<a href="${a(p)}" target="_blank" rel="noopener noreferrer" class="btn btn-primary" id="apply-btn">Apply now <span class="icon">${r.arrowRight}</span></a>`})()}
      <a href="/internships.html" class="btn" style="background:var(--surface);border:1px solid var(--border);color:var(--text);">← Back to listings</a>
    </div>
  `,document.getElementById("favorite-btn").addEventListener("click",()=>{v("jobs",t.id,t.title)}),c()}function c(){const e=document.getElementById("favorite-btn");if(!e)return;const n=h("jobs",t.id);e.classList.toggle("favorited",n),e.setAttribute("aria-label",n?"Remove from favorites":"Save to favorites")}g();
