import { auth } from '../../config/firebase.js';
import { 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider 
} from 'firebase/auth';

const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const emailField = document.getElementById("emailField");
const passwordField = document.getElementById("passwordField");
const emailError = document.getElementById("emailError");
const passwordError = document.getElementById("passwordError");
const formError = document.getElementById("formError");
const formErrorText = document.getElementById("formErrorText");
const loginForm = document.getElementById("loginForm");
const submitBtn = document.getElementById("submitBtn");
const submitLabel = document.getElementById("submitLabel");
const submitSpinner = document.getElementById("submitSpinner");
const togglePasswordBtn = document.getElementById("togglePasswordBtn");
const passwordIcon = document.getElementById("passwordIcon");
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
  }, 2800);
}

function setFieldError(fieldEl, errorEl, message) {
  if (message) {
    fieldEl.classList.add("field-error");
    errorEl.textContent = message;
    errorEl.classList.remove("hidden");
  } else {
    fieldEl.classList.remove("field-error");
    errorEl.textContent = "";
    errorEl.classList.add("hidden");
  }
}

function clearFormError() {
  formError.classList.add("hidden");
}

function showFormError(message) {
  formErrorText.textContent = message;
  formError.classList.remove("hidden");
}

const blockedDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com', 'icloud.com'];

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isInstitutionalEmail(email) {
  const domain = email.split('@')[1]?.toLowerCase();
  return domain && !blockedDomains.includes(domain);
}

function validate() {
  let ok = true;
  const email = emailInput.value.trim();
  const password = passwordInput.value;

  if (!email) {
    setFieldError(emailField, emailError, "Email is required.");
    ok = false;
  } else if (!isValidEmail(email)) {
    setFieldError(emailField, emailError, "Enter a valid email address.");
    ok = false;
  } else if (!isInstitutionalEmail(email)) {
    setFieldError(emailField, emailError, "Please use your institutional university email.");
    ok = false;
  } else {
    setFieldError(emailField, emailError, "");
  }

  if (!password) {
    setFieldError(passwordField, passwordError, "Password is required.");
    ok = false;
  } else if (password.length < 8) {
    setFieldError(passwordField, passwordError, "Password must be at least 8 characters.");
    ok = false;
  } else {
    setFieldError(passwordField, passwordError, "");
  }

  return ok;
}

// Live clear errors on input
emailInput.addEventListener("input", () => {
  if (emailField.classList.contains("field-error")) setFieldError(emailField, emailError, "");
  clearFormError();
});
passwordInput.addEventListener("input", () => {
  if (passwordField.classList.contains("field-error")) setFieldError(passwordField, passwordError, "");
  clearFormError();
});

// Password visibility
togglePasswordBtn.addEventListener("click", () => {
  const showing = passwordInput.type === "text";
  passwordInput.type = showing ? "password" : "text";
  passwordIcon.textContent = showing ? "visibility" : "visibility_off";
  togglePasswordBtn.setAttribute("aria-label", showing ? "Show password" : "Hide password");
  togglePasswordBtn.setAttribute("aria-pressed", showing ? "false" : "true");
});

// Submit Email/Password Authentication
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  clearFormError();
  if (!validate()) {
    const firstError = loginForm.querySelector(".field-error input");
    if (firstError) firstError.focus();
    return;
  }

  submitBtn.disabled = true;
  submitLabel.textContent = "Signing in...";
  submitSpinner.classList.remove("hidden");

  const email = emailInput.value.trim().toLowerCase();
  const password = passwordInput.value;

  try {
    await signInWithEmailAndPassword(auth, email, password);
    showToast("Signed in successfully", "check_circle");
    submitLabel.textContent = "Success";
    setTimeout(() => {
      window.location.href = "/dashboard.html";
    }, 1000);
  } catch (error) {
    console.error("Login Default Error:", error);
    showFormError(error.message || "Incorrect email or password. Please try again.");
    submitBtn.disabled = false;
    submitLabel.textContent = "Sign in";
    submitSpinner.classList.add("hidden");
  }
});

// Google Authentication
document.getElementById("googleBtn").addEventListener("click", async () => {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    
    if (!isInstitutionalEmail(result.user.email)) {
      await auth.signOut();
      showToast("Access denied! Please sign in using your institutional email.", "error");
      return;
    }
    
    showToast("Signed in with Google successfully", "check_circle");
    setTimeout(() => {
      window.location.href = "/dashboard.html";
    }, 1000);
  } catch (error) {
    console.error("Google Auth Error:", error);
    showToast(error.message || "Failed to sign in with Google", "error");
  }
});

// Theme toggle
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

themeToggle.addEventListener("click", () => {
  applyTheme(!root.classList.contains("dark"));
});

// Subtle focus scale on field wrappers
document.querySelectorAll("#loginForm input:not([type=checkbox])").forEach((input) => {
  const wrap = input.parentElement;
  input.addEventListener("focus", () => wrap.classList.add("scale-[1.01]"));
  input.addEventListener("blur", () => wrap.classList.remove("scale-[1.01]"));
});
