import"./index.esm2017-gTHyaaP9.js";/* empty css               */import{r as c,a as p,i as n}from"./footer-S7tz1WGR.js";import{r as m,e as i}from"./renderCard-CKdLQDp5.js";import{i as f,t as b,a as u}from"./favoritesStore-JloAdjsq.js";import{f as v}from"./internshipsService-icUKAQ5o.js";import"./firebase-config-C3QPZpAg.js";c("internships");p();const o=document.getElementById("job-details-mount"),r=new URLSearchParams(location.search).get("id");let t=null;f(()=>{t&&d()});async function y(){if(!r){l();return}if(t=await v(r),!t){l();return}h()}function l(){o.innerHTML="",m(o,{title:"This listing is no longer available",description:"It may have been closed by the recruiter or removed by an administrator."});const e=document.createElement("div");e.style.textAlign="center",e.innerHTML='<a href="/internships.html" style="color:#7c3aed;text-decoration:underline;font-size:13px;">Back to Internships &amp; Jobs</a>',o.appendChild(e)}function h(){var s;const e=(s=t.deadline)!=null&&s.toDate?t.deadline.toDate():t.deadline?new Date(t.deadline):null,a=e?e.toLocaleDateString(void 0,{year:"numeric",month:"short",day:"numeric"}):null;o.innerHTML=`
    <a href="/internships.html" class="back-link"><span class="icon">${n.chevronLeft}</span> Back to listings</a>

    <div class="detail-header">
      <div>
        <h1 class="detail-title">${i(t.title)}</h1>
        <p class="detail-subtitle">${i(t.company)}</p>
      </div>
      <button type="button" id="favorite-btn" class="icon-btn" aria-label="Save to favorites"><span class="icon">${n.heart}</span></button>
    </div>

    <div class="detail-meta">
      ${t.location?`<span class="meta-item"><span class="icon">${n.location}</span> ${i(t.location)}</span>`:""}
      ${a?`<span class="meta-item"><span class="icon">${n.calendar}</span> Apply by ${a}</span>`:""}
      ${t.type?`<span style="background:#f3f4f6;border-radius:999px;padding:2px 10px;text-transform:capitalize;">${i(t.type)}</span>`:""}
    </div>

    <div class="detail-body">${i(t.description)}</div>

    <div style="margin-top:32px;">
      <a href="${t.applyUrl||"#apply"}" class="btn btn-primary">Apply now <span class="icon">${n.arrowRight}</span></a>
    </div>
  `,document.getElementById("favorite-btn").addEventListener("click",()=>{b("jobs",t.id,t.title)}),d()}function d(){const e=document.getElementById("favorite-btn");if(!e)return;const a=u("jobs",t.id);e.classList.toggle("favorited",a),e.setAttribute("aria-label",a?"Remove from favorites":"Save to favorites")}y();
