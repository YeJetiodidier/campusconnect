// src/pages/profile.js
// Route: /profile.html

import { icons } from "../shared/icons.js";
import { renderSidebar } from "../shared/sidebar.js";
import { renderFooter } from "../shared/footer.js";
import { onAuthChange } from "../auth.js";
import { auth, db } from "../firebase-config.js";
import { signOut, updateProfile } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

renderSidebar("profile");
renderFooter();

// Inject icons
document.getElementById("edit-icon").innerHTML = icons.edit;
document.getElementById("signout-icon").innerHTML = icons.logout;

const profileAvatar = document.getElementById("profile-avatar");
const profileName = document.getElementById("profile-name");
const profileEmail = document.getElementById("profile-email");
const editBtn = document.getElementById("edit-btn");
const editLabel = document.getElementById("edit-label");
const cancelBtn = document.getElementById("cancel-btn");
const formActions = document.getElementById("form-actions");
const profileForm = document.getElementById("profile-form");
const signoutBtn = document.getElementById("signout-btn");

const fields = {
  name: document.getElementById("pf-name"),
  bio: document.getElementById("pf-bio"),
  campus: document.getElementById("pf-campus"),
  phone: document.getElementById("pf-phone"),
};

let currentUser = null;
let isEditing = false;
let profileData = {};

// ── Auth state ──────────────────────────────────────────

onAuthChange(async (user) => {
  currentUser = user;

  if (!user) {
    profileName.textContent = "Not signed in";
    profileEmail.textContent = "";
    profileAvatar.textContent = "?";
    editBtn.hidden = true;
    signoutBtn.hidden = true;
    Object.values(fields).forEach((f) => (f.value = ""));
    return;
  }

  editBtn.hidden = false;
  signoutBtn.hidden = false;

  // Firebase auth data
  const name = user.displayName || user.email || "Student";
  profileName.textContent = name;
  profileEmail.textContent = user.email || "";
  profileAvatar.textContent = name.charAt(0).toUpperCase();
  fields.name.value = user.displayName || "";

  // Firestore extended profile
  try {
    const snap = await getDoc(doc(db, "users", user.uid));
    if (snap.exists()) {
      profileData = snap.data();
      fields.bio.value = profileData.bio || "";
      fields.campus.value = profileData.campus || "";
      fields.phone.value = profileData.phone || "";
    }
  } catch (err) {
    console.error("Failed to load profile:", err);
  }
});

// ── Edit mode ───────────────────────────────────────────

function setEditing(state) {
  isEditing = state;
  Object.values(fields).forEach((f) => (f.disabled = !state));
  formActions.hidden = !state;
  editLabel.textContent = state ? "Editing…" : "Edit Profile";
  if (state) fields.name.focus();
}

editBtn.addEventListener("click", () => {
  setEditing(!isEditing);
});

cancelBtn.addEventListener("click", () => {
  // Restore values
  if (currentUser) {
    fields.name.value = currentUser.displayName || "";
    fields.bio.value = profileData.bio || "";
    fields.campus.value = profileData.campus || "";
    fields.phone.value = profileData.phone || "";
  }
  setEditing(false);
});

// ── Save profile ────────────────────────────────────────

profileForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!currentUser) return;

  const submitBtn = profileForm.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  submitBtn.textContent = "Saving…";

  try {
    const newName = fields.name.value.trim();

    // Update Firebase Auth display name
    if (newName && newName !== currentUser.displayName) {
      await updateProfile(auth.currentUser, { displayName: newName });
      profileName.textContent = newName;
      profileAvatar.textContent = newName.charAt(0).toUpperCase();
    }

    // Save extended profile to Firestore
    const data = {
      bio: fields.bio.value.trim(),
      campus: fields.campus.value,
      phone: fields.phone.value.trim(),
      updatedAt: new Date(),
    };
    await setDoc(doc(db, "users", currentUser.uid), data, { merge: true });
    profileData = { ...profileData, ...data };

    setEditing(false);
  } catch (err) {
    console.error("Failed to save profile:", err);
    alert("Could not save profile. Please try again.");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Save Changes";
  }
});

// ── Sign out ────────────────────────────────────────────

signoutBtn.addEventListener("click", async () => {
  try {
    await signOut(auth);
    window.location.href = "/index.html";
  } catch (err) {
    console.error("Sign out failed:", err);
  }
});
