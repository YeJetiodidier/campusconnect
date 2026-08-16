// src/shared/footer.js
// Site footer — brand blurb + Platform/Resources link columns + copyright,
// matching the reference design. Call renderFooter() once per page into
// a <div id="app-footer"></div> placed at the bottom of <main>.

export function renderFooter() {
  const mount = document.getElementById("app-footer");
  if (!mount) return;

  const year = new Date().getFullYear();

  mount.innerHTML = `
    <footer class="site-footer">
      <div class="site-footer__brand">
        <p class="site-footer__title">CampusConnect</p>
        <p class="site-footer__blurb">
          Empowering students to connect, trade, and grow within the university
          ecosystem. Built for the modern campus experience.
        </p>
        <p class="site-footer__copyright">&copy; ${year} CampusConnect University Platform. All rights reserved.</p>
      </div>

      <div class="site-footer__col">
        <p class="site-footer__heading">Platform</p>
        <a href="#">About Us</a>
        <a href="/internships.html">Internships</a>
        <a href="/events.html">Events</a>
        <a href="#">Marketplace</a>
        <a href="#">Services</a>
      </div>

      <div class="site-footer__col">
        <p class="site-footer__heading">Resources</p>
        <a href="#">Contact</a>
        <a href="#">Info</a>
        <a href="/dashboard.html">Dashboard</a>
        <a href="#">Privacy Policy</a>
      </div>
    </footer>
  `;
}
