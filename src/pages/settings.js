// src/pages/settings.js
import { renderSidebar } from "../shared/sidebar.js";
import { renderFooter } from "../shared/footer.js";
import { onAuthChange } from "../auth.js";

// Layout init
renderSidebar("settings");
renderFooter();

const themeToggle = document.getElementById("theme-toggle");
const emailToggle = document.getElementById("email-toggle");

// Initialize theme from LocalStorage
const currentTheme = localStorage.getItem("campusconnect_theme");
if (currentTheme === "dark") {
  document.documentElement.classList.add("dark-theme");
  themeToggle.checked = true;
}

// Toggle listener
themeToggle.addEventListener("change", (e) => {
  if (e.target.checked) {
    document.documentElement.classList.add("dark-theme");
    localStorage.setItem("campusconnect_theme", "dark");
  } else {
    document.documentElement.classList.remove("dark-theme");
    localStorage.setItem("campusconnect_theme", "light");
  }
});

// Guard route
onAuthChange((user) => {
  if (!user) {
    window.location.href = "/login.html";
  }
});
