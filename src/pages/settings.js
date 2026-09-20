// src/pages/settings.js
import { renderSidebar } from "../shared/sidebar.js";
import { renderFooter } from "../shared/footer.js";
import { onAuthChange } from "../auth.js";
import { db, auth } from "../firebase-config.js";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { updateProfile, updatePassword } from "firebase/auth";

// ─── i18n ──────────────────────────────────────────────────────────────────
const TRANSLATIONS = {
  en: {
    "page-title":               "Settings",
    "page-subtitle":            "Manage your account preferences and configurations.",
    "nav-profile":              "Profile Settings",
    "nav-account":              "Account Preferences",
    "nav-notifications":        "Notification Management",
    "nav-privacy":              "Privacy & Security",
    "section-profile-title":    "Profile Settings",
    "label-display-name":       "Display Name",
    "label-email":              "Email Address",
    "label-bio":                "Bio",
    "btn-save-profile":         "Save Changes",
    "btn-save-profile-saving":  "Saving…",
    "section-account-title":    "Account Preferences",
    "pref-dark-mode":           "Dark Mode",
    "pref-dark-mode-desc":      "Adjust the visual theme of the interface across all pages.",
    "pref-language":            "Language",
    "pref-language-desc":       "Select your preferred interface language.",
    "pref-timezone":            "Timezone",
    "pref-timezone-desc":       "Set your local time formatting.",
    "section-notif-title":      "Notification Management",
    "pref-email-alerts":        "Email Alerts",
    "pref-email-alerts-desc":   "Receive notifications for important campus updates via email.",
    "pref-marketplace-notif":   "Marketplace Activity",
    "pref-marketplace-notif-desc": "Get notified when someone inquires about your listed products.",
    "pref-event-reminders":     "Event Reminders",
    "pref-event-reminders-desc":"Receive reminders for events you have registered or favorited.",
    "section-privacy-title":    "Privacy & Security",
    "label-new-password":       "New Password",
    "label-confirm-password":   "Confirm New Password",
    "placeholder-new-password": "Minimum 6 characters",
    "placeholder-confirm-password": "Re-enter new password",
    "btn-update-password":      "Update Password",
    "btn-updating-password":    "Updating…",
    "alert-saved":              "Settings saved successfully!",
    "alert-save-failed":        "Failed to save settings: ",
    "alert-pw-short":           "Password must be at least 6 characters long.",
    "alert-pw-mismatch":        "Passwords do not match.",
    "alert-pw-updated":         "Password updated successfully!",
    "alert-pw-relogin":         "For security reasons, please log out and log back in before updating your password.",
    "alert-pw-failed":          "Failed to update password: ",
  },
  fr: {
    "page-title":               "Paramètres",
    "page-subtitle":            "Gérez vos préférences et configurations de compte.",
    "nav-profile":              "Profil",
    "nav-account":              "Préférences",
    "nav-notifications":        "Notifications",
    "nav-privacy":              "Confidentialité",
    "section-profile-title":    "Paramètres du profil",
    "label-display-name":       "Nom affiché",
    "label-email":              "Adresse e-mail",
    "label-bio":                "Biographie",
    "btn-save-profile":         "Enregistrer",
    "btn-save-profile-saving":  "Enregistrement…",
    "section-account-title":    "Préférences du compte",
    "pref-dark-mode":           "Mode sombre",
    "pref-dark-mode-desc":      "Ajustez le thème visuel de l'interface sur toutes les pages.",
    "pref-language":            "Langue",
    "pref-language-desc":       "Sélectionnez votre langue d'interface préférée.",
    "pref-timezone":            "Fuseau horaire",
    "pref-timezone-desc":       "Définissez votre format d'heure local.",
    "section-notif-title":      "Gestion des notifications",
    "pref-email-alerts":        "Alertes par e-mail",
    "pref-email-alerts-desc":   "Recevez des notifications pour les mises à jour importantes du campus.",
    "pref-marketplace-notif":   "Activité du marché",
    "pref-marketplace-notif-desc": "Soyez notifié lorsque quelqu'un s'intéresse à vos annonces.",
    "pref-event-reminders":     "Rappels d'événements",
    "pref-event-reminders-desc":"Recevez des rappels pour les événements auxquels vous êtes inscrit.",
    "section-privacy-title":    "Confidentialité & Sécurité",
    "label-new-password":       "Nouveau mot de passe",
    "label-confirm-password":   "Confirmer le mot de passe",
    "placeholder-new-password": "Minimum 6 caractères",
    "placeholder-confirm-password": "Ressaisissez le mot de passe",
    "btn-update-password":      "Mettre à jour",
    "btn-updating-password":    "Mise à jour…",
    "alert-saved":              "Paramètres enregistrés avec succès !",
    "alert-save-failed":        "Échec de l'enregistrement : ",
    "alert-pw-short":           "Le mot de passe doit comporter au moins 6 caractères.",
    "alert-pw-mismatch":        "Les mots de passe ne correspondent pas.",
    "alert-pw-updated":         "Mot de passe mis à jour avec succès !",
    "alert-pw-relogin":         "Pour des raisons de sécurité, veuillez vous déconnecter et vous reconnecter avant de modifier votre mot de passe.",
    "alert-pw-failed":          "Échec de la mise à jour : ",
  },
};

const currentLang = localStorage.getItem("campusconnect_lang") || "en";

function t(key) {
  return (TRANSLATIONS[currentLang] || TRANSLATIONS.en)[key] || key;
}

function applyTranslations() {
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    const attr = el.getAttribute("data-i18n-attr");
    if (attr) {
      el.setAttribute(attr, t(key));
    } else {
      el.textContent = t(key);
    }
  });
}

// ─── App shell ─────────────────────────────────────────────────────────────
renderSidebar("settings");
renderFooter();

// Apply translations after DOM is ready
applyTranslations();

// ─── Element references ────────────────────────────────────────────────────
const navItems         = document.querySelectorAll(".settings-nav-item");
const panels           = document.querySelectorAll(".settings-panel");
const themeToggle      = document.getElementById("theme-toggle");
const languageSelect   = document.getElementById("languageSelect");

const displayNameInput  = document.getElementById("displayNameInput");
const emailInput        = document.getElementById("emailInput");
const bioInput          = document.getElementById("bioInput");
const saveProfileBtn    = document.getElementById("saveProfileBtn");

const passwordChangeForm    = document.getElementById("passwordChangeForm");
const newPasswordInput      = document.getElementById("newPasswordInput");
const confirmPasswordInput  = document.getElementById("confirmPasswordInput");
const changePasswordBtn     = document.getElementById("changePasswordBtn");

// ─── 1. Theme toggle ───────────────────────────────────────────────────────
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

// ─── 2. Language select ─────────────────────────────────────────────────────
if (languageSelect) {
  languageSelect.value = currentLang;
  languageSelect.addEventListener("change", (e) => {
    const newLang = e.target.value;
    localStorage.setItem("campusconnect_lang", newLang);
    // Reload to apply translations site-wide
    window.location.reload();
  });
}

// ─── 3. Tab navigation ─────────────────────────────────────────────────────
navItems.forEach((item) => {
  item.addEventListener("click", () => {
    const targetId = item.getAttribute("data-target");
    navItems.forEach((n) => n.classList.remove("is-active"));
    item.classList.add("is-active");
    panels.forEach((panel) => {
      panel.style.display = panel.id === targetId ? "block" : "none";
    });
  });
});

// ─── 4. Live auth & Firestore data ─────────────────────────────────────────
let currentUser = null;

onAuthChange(async (user) => {
  if (!user) {
    window.location.href = "/login.html";
    return;
  }
  currentUser = user;

  if (displayNameInput) displayNameInput.value = user.displayName || "";
  if (emailInput) emailInput.value = user.email || "";

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

// ─── 5. Save profile ───────────────────────────────────────────────────────
if (saveProfileBtn) {
  saveProfileBtn.addEventListener("click", async () => {
    const fbUser = auth.currentUser;
    if (!fbUser && !currentUser) return;
    const uid = fbUser ? fbUser.uid : currentUser.uid;
    const newName = displayNameInput.value.trim();
    const newBio  = bioInput.value.trim();

    saveProfileBtn.disabled = true;
    saveProfileBtn.textContent = t("btn-save-profile-saving");

    try {
      if (fbUser && newName && newName !== fbUser.displayName) {
        await updateProfile(fbUser, { displayName: newName });
      }
      await setDoc(
        doc(db, "users", uid),
        { displayName: newName, bio: newBio, updatedAt: new Date().toISOString() },
        { merge: true }
      );
      alert(t("alert-saved"));
    } catch (err) {
      console.error("Error updating profile:", err);
      alert(t("alert-save-failed") + err.message);
    } finally {
      saveProfileBtn.disabled = false;
      saveProfileBtn.textContent = t("btn-save-profile");
    }
  });
}

// ─── 6. Change password ────────────────────────────────────────────────────
if (passwordChangeForm) {
  passwordChangeForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const fbUser = auth.currentUser;
    if (!fbUser) return;

    const newPassword     = newPasswordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    if (newPassword.length < 6) { alert(t("alert-pw-short")); return; }
    if (newPassword !== confirmPassword) { alert(t("alert-pw-mismatch")); return; }

    changePasswordBtn.disabled = true;
    changePasswordBtn.textContent = t("btn-updating-password");

    try {
      await updatePassword(fbUser, newPassword);
      alert(t("alert-pw-updated"));
      passwordChangeForm.reset();
    } catch (err) {
      console.error("Error updating password:", err);
      if (err.code === "auth/requires-recent-login") {
        alert(t("alert-pw-relogin"));
      } else {
        alert(t("alert-pw-failed") + err.message);
      }
    } finally {
      changePasswordBtn.disabled = false;
      changePasswordBtn.textContent = t("btn-update-password");
    }
  });
}
