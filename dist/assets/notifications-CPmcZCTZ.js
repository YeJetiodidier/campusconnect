import"./index.esm2017-aF7IW9R1.js";import{r as m,a as u,i as s,o as p,s as f,m as h,b as g}from"./footer-DPNrPZWS.js";import{r as c,e as r}from"./renderCard-CLS294Wn.js";import"./firebase-config-CsnSWmcf.js";m("notifications");u();const n=document.getElementById("notifications-mount"),d=document.getElementById("mark-all-read");d.querySelector(".icon").innerHTML=s.checkDouble;let o=null,a=[];p(t=>{if(o=t,!t){n.innerHTML="",c(n,{title:"Log in to see your notifications"});return}f(t.uid,e=>{a=e,y()})});function y(){if(a.length===0){n.innerHTML="",c(n,{title:"You're all caught up",description:"New activity on your saved internships and events will show up here."});return}const t=document.createElement("div");t.className="notif-list fade-in",a.forEach(e=>{const i=document.createElement("div");i.className=`notif-card ${e.status==="unread"?"unread":""}`;const l=e.type==="announcement"?s.megaphone:s.bell;i.innerHTML=`
      <span class="notif-icon">${l}</span>
      <div class="notif-body">
        <p class="notif-title">${r(e.title)}</p>
        <p class="notif-message">${r(e.message)}</p>
        <p class="notif-time">${L(e.createdDate)}</p>
      </div>
      ${e.status==="unread"?'<span class="notif-dot"></span>':""}
    `,e.status==="unread"&&i.addEventListener("click",()=>h(o.uid,e.id)),t.appendChild(i)}),n.innerHTML="",n.appendChild(t)}function L(t){return t?(t!=null&&t.toDate?t.toDate():new Date(t)).toLocaleString(void 0,{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"}):""}d.addEventListener("click",()=>{o&&g(o.uid,a)});
