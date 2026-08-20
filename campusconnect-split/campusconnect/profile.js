(function () {
      "use strict";

      const toastEl = document.getElementById("toast");
      const toastMsg = document.getElementById("toastMsg");
      const toastIcon = document.getElementById("toastIcon");
      let toastTimer;

      function showToast(message, icon = "info") {
        toastMsg.textContent = message;
        toastIcon.textContent = icon;
        toastEl.classList.remove("opacity-0", "pointer-events-none", "translate-y-3");
        toastEl.classList.add("opacity-100", "translate-y-0");
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => {
          toastEl.classList.add("opacity-0", "pointer-events-none", "translate-y-3");
          toastEl.classList.remove("opacity-100", "translate-y-0");
        }, 2600);
      }

      // —— Mobile nav ——
      const sideNav = document.getElementById("sideNav");
      const overlay = document.getElementById("overlay");
      const openNav = document.getElementById("openNav");
      const closeNav = document.getElementById("closeNav");

      function openSide() {
        sideNav.classList.remove("closed-mobile");
        overlay.classList.remove("opacity-0", "pointer-events-none");
        overlay.classList.add("opacity-100");
        document.body.style.overflow = "hidden";
      }
      function closeSide() {
        sideNav.classList.add("closed-mobile");
        overlay.classList.add("opacity-0", "pointer-events-none");
        overlay.classList.remove("opacity-100");
        document.body.style.overflow = "";
      }
      openNav.addEventListener("click", openSide);
      closeNav.addEventListener("click", closeSide);
      overlay.addEventListener("click", closeSide);
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
          closeSide();
          closeEdit();
        }
      });

      // —— Tabs ——
      const tabBtns = document.querySelectorAll(".tab-btn");
      const panels = document.querySelectorAll(".tab-panel");

      function switchTab(name) {
        tabBtns.forEach((btn) => {
          const selected = btn.dataset.tab === name;
          btn.setAttribute("aria-selected", selected ? "true" : "false");
        });
        panels.forEach((panel) => {
          const match = panel.id === "tab-" + name;
          panel.classList.toggle("hidden", !match);
          panel.hidden = !match;
        });
      }

      tabBtns.forEach((btn) => {
        btn.addEventListener("click", () => switchTab(btn.dataset.tab));
      });

      // —— Theme ——
      const themeToggle = document.getElementById("themeToggle");
      const themeIcon = document.getElementById("themeIcon");
      const root = document.documentElement;

      function applyTheme(dark) {
        root.classList.toggle("dark", dark);
        root.classList.toggle("light", !dark);
        themeIcon.textContent = dark ? "light_mode" : "dark_mode";
        try {
          localStorage.setItem("cc-theme", dark ? "dark" : "light");
        } catch (_) {}
      }
      const saved = (() => {
        try {
          return localStorage.getItem("cc-theme");
        } catch (_) {
          return null;
        }
      })();
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      applyTheme(saved === "dark" || (!saved && prefersDark));
      themeToggle.addEventListener("click", () => applyTheme(!root.classList.contains("dark")));

      // —— Actions ——
      document.getElementById("shareBtn").addEventListener("click", async () => {
        const url = window.location.href;
        if (navigator.share) {
          try {
            await navigator.share({ title: "Alex Rivera · CampusConnect", url });
          } catch (_) {}
        } else if (navigator.clipboard) {
          await navigator.clipboard.writeText(url);
          showToast("Profile link copied", "link");
        } else {
          showToast("Share: " + url, "share");
        }
      });

      document.getElementById("messageBtn").addEventListener("click", () => {
        showToast("Opening messages…", "chat");
      });
      document.getElementById("quickPostBtn").addEventListener("click", () => {
        showToast("Quick Post coming soon", "add_circle");
      });
      document.getElementById("newListingBtn")?.addEventListener("click", () => {
        showToast("Create listing form would open here", "sell");
      });
      document.getElementById("newServiceBtn")?.addEventListener("click", () => {
        showToast("Create service form would open here", "work");
      });

      document.querySelectorAll(".manage-btn").forEach((btn) => {
        btn.addEventListener("click", () => showToast("Listing management panel", "settings"));
      });

      document.querySelectorAll(".unsave-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
          const card = btn.closest("article");
          card?.classList.add("opacity-50", "pointer-events-none");
          showToast("Removed from saved", "bookmark_remove");
          setTimeout(() => card?.remove(), 400);
        });
      });

      // —— Edit modal ——
      const editModal = document.getElementById("editModal");
      const editName = document.getElementById("editName");
      const editBio = document.getElementById("editBio");

      function openEdit() {
        editModal.classList.remove("hidden");
        editModal.classList.add("flex");
        document.body.style.overflow = "hidden";
        editName.focus();
      }
      function closeEdit() {
        editModal.classList.add("hidden");
        editModal.classList.remove("flex");
        document.body.style.overflow = "";
      }

      document.getElementById("editProfileBtn").addEventListener("click", openEdit);
      document.getElementById("closeEditModal").addEventListener("click", closeEdit);
      document.getElementById("cancelEdit").addEventListener("click", closeEdit);
      document.getElementById("editModalBackdrop").addEventListener("click", closeEdit);

      document.getElementById("editForm").addEventListener("submit", (e) => {
        e.preventDefault();
        const name = editName.value.trim();
        const bio = editBio.value.trim();
        if (name) {
          document.querySelector("h1").textContent = name;
        }
        if (bio) {
          document.getElementById("bioText").textContent = bio;
        }
        closeEdit();
        showToast("Profile updated", "check_circle");
      });
    })();
