// src/shared/footer.js
// Site footer — brand blurb + Platform/Resources link columns + copyright,
// matching the reference design. Call renderFooter() once per page into
// a <div id="app-footer"></div> placed at the bottom of <main>.

export function renderFooter() {
  const mount = document.getElementById("app-footer");
  if (!mount) return;

  const isFr = localStorage.getItem("campusconnect_lang") === "fr";

  mount.innerHTML = `
    <footer class="site-footer">
      <div class="site-footer__brand">
        <p class="site-footer__title">CampusConnect</p>
        <p class="site-footer__blurb">
          ${isFr 
            ? "Permettre aux étudiants de se connecter, d'échanger et de progresser au sein de l'université. Conçu pour l'expérience étudiante moderne."
            : "Empowering students to connect, trade, and grow within the university ecosystem. Built for the modern campus experience."}
        </p>
        <p class="site-footer__copyright">&copy; 2026 ${isFr ? "Plateforme Universitaire CampusConnect. Tous droits réservés." : "CampusConnect University Platform. All rights reserved."}</p>
      </div>

      <div class="site-footer__col">
        <p class="site-footer__heading">${isFr ? "Plateforme" : "Platform"}</p>
        <a href="/about.html">${isFr ? "À propos de nous" : "About Us"}</a>
        <a href="/internships.html">${isFr ? "Stages" : "Internships"}</a>
        <a href="/events.html">${isFr ? "Événements" : "Events"}</a>
        <a href="/marketplace.html">${isFr ? "Marché" : "Marketplace"}</a>
        <a href="/services.html">${isFr ? "Services" : "Services"}</a>
      </div>

      <div class="site-footer__col">
        <p class="site-footer__heading">${isFr ? "Ressources" : "Resources"}</p>
        <a href="/help-center.html">${isFr ? "Centre d'aide" : "Help Center"}</a>
        <a href="/guidelines.html">${isFr ? "Règles étudiantes" : "Student Guidelines"}</a>
        <a href="/privacy-policy.html">${isFr ? "Politique de confidentialité" : "Privacy Policy"}</a>
        <a href="/referrals.html">${isFr ? "Parrainages" : "Referrals"}</a>
        <a href="/dashboard.html">${isFr ? "Tableau de bord" : "Dashboard"}</a>
      </div>
    </footer>
  `;
}
