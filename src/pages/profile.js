// src/pages/profile.js
// Route: /profile.html

import { icons } from "../shared/icons.js";
import { renderSidebar } from "../shared/sidebar.js";
import { renderFooter } from "../shared/footer.js";
import { onAuthChange } from "../auth.js";
import { auth, db } from "../firebase-config.js";
import { signOut, updateProfile } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

renderSidebar("profile");
renderFooter();

// Inject icons
document.getElementById("edit-icon").innerHTML = icons.edit;
document.getElementById("signout-icon").innerHTML = icons.logout;

const profileAvatar = document.getElementById("profile-avatar");
const profileAvatarImg = document.getElementById("profile-avatar-img");
const profileName = document.getElementById("profile-name");
const profileEmail = document.getElementById("profile-email");
const editBtn = document.getElementById("edit-btn");
const editLabel = document.getElementById("edit-label");
const cancelBtn = document.getElementById("cancel-btn");
const formActions = document.getElementById("form-actions");
const profileForm = document.getElementById("profile-form");
const signoutBtn = document.getElementById("signout-btn");
const avatarWrap = document.getElementById("avatar-wrap");
const avatarFileInput = document.getElementById("avatar-file-input");
const avatarHint = document.getElementById("avatar-hint");

const fields = {
  name: document.getElementById("pf-name"),
  bio: document.getElementById("pf-bio"),
  campus: document.getElementById("pf-campus"),
  phone: document.getElementById("pf-phone"),
};

let currentUser = null;
let isEditing = false;
let profileData = {};

// ── Helper: show uploaded photo or initial letter ────────────────────
function setAvatarPhoto(url) {
  if (url) {
    profileAvatarImg.src = url;
    profileAvatarImg.style.display = "block";
    profileAvatar.style.display = "none";
  } else {
    profileAvatarImg.style.display = "none";
    profileAvatar.style.display = "";
  }
}

// ── Auth state ──────────────────────────────────────────────────────

onAuthChange(async (user) => {
  currentUser = user;

  if (!user) {
    profileName.textContent = "Not signed in";
    profileEmail.textContent = "";
    profileAvatar.textContent = "?";
    setAvatarPhoto(null);
    editBtn.hidden = true;
    signoutBtn.hidden = true;
    avatarWrap.style.pointerEvents = "none";
    if (avatarHint) avatarHint.style.display = "none";
    Object.values(fields).forEach((f) => (f.value = ""));
    return;
  }

  editBtn.hidden = false;
  signoutBtn.hidden = false;
  avatarWrap.style.pointerEvents = "auto";

  // Set initial letter avatar
  const name = user.displayName || user.email || "Student";
  profileName.textContent = name;
  profileEmail.textContent = user.email || "";
  profileAvatar.textContent = name.charAt(0).toUpperCase();
  fields.name.value = user.displayName || "";

  // Load photo URL from Firebase Auth
  if (user.photoURL) {
    setAvatarPhoto(user.photoURL);
  }

  // Firestore extended profile
  try {
    const snap = await getDoc(doc(db, "users", user.uid));
    if (snap.exists()) {
      profileData = snap.data();
      fields.bio.value = profileData.bio || "";
      fields.campus.value = profileData.campus || "";
      fields.phone.value = profileData.phone || "";
      // Also load photoURL from Firestore in case Auth doesn't have it
      if (!user.photoURL && profileData.photoURL) {
        setAvatarPhoto(profileData.photoURL);
      }
    }
  } catch (err) {
    console.error("Failed to load profile:", err);
  }
});

// ── Avatar upload click handler ─────────────────────────────────────

avatarWrap.addEventListener("click", () => {
  if (currentUser) avatarFileInput.click();
});

avatarFileInput.addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file || !currentUser) return;

  // Validate size (max 5MB) and type
  if (file.size > 5 * 1024 * 1024) {
    alert("Image must be smaller than 5MB.");
    return;
  }
  if (!file.type.startsWith("image/")) {
    alert("Please select an image file.");
    return;
  }

  // Preview immediately before upload
  const localUrl = URL.createObjectURL(file);
  setAvatarPhoto(localUrl);
  if (avatarHint) avatarHint.textContent = "Uploading…";

  try {
    const storage = getStorage();
    const storageRef = ref(storage, `avatars/${currentUser.uid}/${file.name}`);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);

    // Update Firebase Auth profile photo
    await updateProfile(auth.currentUser, { photoURL: downloadURL });

    // Save to Firestore user doc
    await setDoc(doc(db, "users", currentUser.uid), { photoURL: downloadURL }, { merge: true });

    setAvatarPhoto(downloadURL);
    if (avatarHint) avatarHint.textContent = "Photo updated ✓";
    setTimeout(() => {
      if (avatarHint) avatarHint.textContent = "Click photo to change";
    }, 2500);
  } catch (err) {
    console.error("Failed to upload avatar:", err);
    alert("Could not upload photo. Please try again.");
    if (avatarHint) avatarHint.textContent = "Click photo to change";
    // Revert preview
    if (currentUser?.photoURL) {
      setAvatarPhoto(currentUser.photoURL);
    } else {
      setAvatarPhoto(null);
    }
  } finally {
    // Reset file input so the same file can be re-selected
    avatarFileInput.value = "";
  }
});

// ── Edit mode ────────────────────────────────────────────────────────

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
  if (currentUser) {
    fields.name.value = currentUser.displayName || "";
    fields.bio.value = profileData.bio || "";
    fields.campus.value = profileData.campus || "";
    fields.phone.value = profileData.phone || "";
  }
  setEditing(false);
});

// ── Save profile ─────────────────────────────────────────────────────

profileForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!currentUser) return;

  const submitBtn = profileForm.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  submitBtn.textContent = "Saving…";

  try {
    const newName = fields.name.value.trim();

    if (newName && newName !== currentUser.displayName) {
      await updateProfile(auth.currentUser, { displayName: newName });
      profileName.textContent = newName;
      profileAvatar.textContent = newName.charAt(0).toUpperCase();
    }

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

// ── Sign out ─────────────────────────────────────────────────────────

signoutBtn.addEventListener("click", async () => {
  try {
    await signOut(auth);
    window.location.href = "/index.html";
  } catch (err) {
    console.error("Sign out failed:", err);
  }
});
