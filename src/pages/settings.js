// src/pages/settings.js
import { renderSidebar } from "../shared/sidebar.js";
import { renderFooter } from "../shared/footer.js";
import { onAuthChange } from "../auth.js";
import { db, auth } from "../firebase-config.js";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { updateProfile, updatePassword } from "firebase/auth";

// Render app shell
renderSidebar("settings");
renderFooter();

// Element references
const settingsNav = document.getElementById("settingsNav");
const navItems = document.querySelectorAll(".settings-nav-item");
const panels = document.querySelectorAll(".settings-panel");
const themeToggle = document.getElementById("theme-toggle");

const displayNameInput = document.getElementById("displayNameInput");
const emailInput = document.getElementById("emailInput");
const bioInput = document.getElementById("bioInput");
const saveProfileBtn = document.getElementById("saveProfileBtn");

const passwordChangeForm = document.getElementById("passwordChangeForm");
const newPasswordInput = document.getElementById("newPasswordInput");
const confirmPasswordInput = document.getElementById("confirmPasswordInput");
const changePasswordBtn = document.getElementById("changePasswordBtn");

// 1. Theme toggle initialization
const currentTheme = localStorage.getItem("campusconnect_theme");
if (currentTheme === "dark") {
  document.documentElement.classList.add("dark-theme");
  if (themeToggle) themeToggle.checked = true;
}

if (themeToggle) {
  themeToggle.addEventListener("change", (e) => {
    if (e.target.checked) {
      document.documentElement.classList.add("dark-theme");
      localStorage.setItem("campusconnect_theme", "dark");
    } else {
      document.documentElement.classList.remove("dark-theme");
      localStorage.setItem("campusconnect_theme", "light");
    }
  });
}

// 2. Tab navigation switching
navItems.forEach((item) => {
  item.addEventListener("click", () => {
    const targetId = item.getAttribute("data-target");
    navItems.forEach((n) => n.classList.remove("is-active"));
    item.classList.add("is-active");

    panels.forEach((panel) => {
      if (panel.id === targetId) {
        panel.style.display = "block";
      } else {
        panel.style.display = "none";
      }
    });
  });
});

// 3. Live Auth & Firestore Data Population
let currentUser = null;

onAuthChange(async (user) => {
  if (!user) {
    window.location.href = "/login.html";
    return;
  }
  currentUser = user;

  if (displayNameInput) displayNameInput.value = user.displayName || "";
  if (emailInput) emailInput.value = user.email || "";

  // Load bio from Firestore user doc
  try {
    const userDocRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userDocRef);
    if (userSnap.exists()) {
      const data = userSnap.data();
      if (bioInput && data.bio) bioInput.value = data.bio;
    }
  } catch (err) {
    console.error("Error loading user profile data:", err);
  }
});

// 4. Save Profile Changes
if (saveProfileBtn) {
  saveProfileBtn.addEventListener("click", async () => {
    if (!currentUser) return;
    const newName = displayNameInput.value.trim();
    const newBio = bioInput.value.trim();

    saveProfileBtn.disabled = true;
    saveProfileBtn.textContent = "Saving...";

    try {
      if (newName && newName !== currentUser.displayName) {
        await updateProfile(currentUser, { displayName: newName });
      }

      await setDoc(
        doc(db, "users", currentUser.uid),
        {
          displayName: newName,
          bio: newBio,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );

      alert("Settings saved successfully!");
    } catch (err) {
      console.error("Error updating profile:", err);
      alert("Failed to save settings: " + err.message);
    } finally {
      saveProfileBtn.disabled = false;
      saveProfileBtn.textContent = "Save Changes";
    }
  });
}

// 5. Change Password Handler
if (passwordChangeForm) {
  passwordChangeForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!currentUser) return;

    const newPassword = newPasswordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    if (newPassword.length < 6) {
      alert("Password must be at least 6 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    changePasswordBtn.disabled = true;
    changePasswordBtn.textContent = "Updating...";

    try {
      await updatePassword(currentUser, newPassword);
      alert("Password updated successfully!");
      passwordChangeForm.reset();
    } catch (err) {
      console.error("Error updating password:", err);
      if (err.code === "auth/requires-recent-login") {
        alert("For security reasons, please log out and log back in before updating your password.");
      } else {
        alert("Failed to update password: " + err.message);
      }
    } finally {
      changePasswordBtn.disabled = false;
      changePasswordBtn.textContent = "Update Password";
    }
  });
}
