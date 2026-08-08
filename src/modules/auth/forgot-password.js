import { auth } from '../../config/firebase.js';
import { sendPasswordResetEmail } from 'firebase/auth';

(function () {
      "use strict";

      const emailInput = document.getElementById("email");
      const emailField = document.getElementById("emailField");
      const emailError = document.getElementById("emailError");
      const formError = document.getElementById("formError");
      const formErrorText = document.getElementById("formErrorText");
      const forgotForm = document.getElementById("forgotForm");
      const submitBtn = document.getElementById("submitBtn");
      const submitLabel = document.getElementById("submitLabel");
      const submitSpinner = document.getElementById("submitSpinner");
      const requestPanel = document.getElementById("requestPanel");
      const successPanel = document.getElementById("successPanel");
      const sentEmail = document.getElementById("sentEmail");
      const resendBtn = document.getElementById("resendBtn");
      const resendLabel = document.getElementById("resendLabel");
      const tryAnother = document.getElementById("tryAnother");

      const toastEl = document.getElementById("toast");
      const toastMsg = document.getElementById("toastMsg");
      const toastIcon = document.getElementById("toastIcon");
      let toastTimer;
      let resendCooldown = null;

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

      function setFieldError(message) {
        if (message) {
          emailField.classList.add("field-error");
          emailError.textContent = message;
          emailError.classList.remove("hidden");
        } else {
          emailField.classList.remove("field-error");
          emailError.textContent = "";
          emailError.classList.add("hidden");
        }
      }

      function clearFormError() {
        formError.classList.add("hidden");
      }

      function showFormError(message) {
        formErrorText.textContent = message;
        formError.classList.remove("hidden");
      }

      function isValidEmail(value) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      }

      function validate() {
        const email = emailInput.value.trim();
        if (!email) {
          setFieldError("Email is required.");
          return false;
        }
        if (!isValidEmail(email)) {
          setFieldError("Enter a valid email address.");
          return false;
        }
        setFieldError("");
        return true;
      }

      emailInput.addEventListener("input", () => {
        if (emailField.classList.contains("field-error")) setFieldError("");
        clearFormError();
      });

      function showSuccess(email) {
        sentEmail.textContent = email;
        requestPanel.classList.add("hidden");
        successPanel.classList.remove("hidden");
      }

      function showRequest() {
        successPanel.classList.add("hidden");
        requestPanel.classList.remove("hidden");
        emailInput.focus();
      }

      function startResendCooldown(seconds) {
        let left = seconds;
        resendBtn.disabled = true;
        resendLabel.textContent = "Resend in " + left + "s";
        clearInterval(resendCooldown);
        resendCooldown = setInterval(() => {
          left -= 1;
          if (left <= 0) {
            clearInterval(resendCooldown);
            resendBtn.disabled = false;
            resendLabel.textContent = "Resend email";
          } else {
            resendLabel.textContent = "Resend in " + left + "s";
          }
        }, 1000);
      }

      function simulateSend(email) {
        return new Promise((resolve) => {
          setTimeout(() => resolve(true), 900);
        });
      }

      forgotForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        clearFormError();
        if (!validate()) {
          emailInput.focus();
          return;
        }

        const email = emailInput.value.trim();
        submitBtn.disabled = true;
        submitLabel.textContent = "Sending…";
        submitSpinner.classList.remove("hidden");

        try {
          await sendPasswordResetEmail(auth, email);
          // Always show success (no email enumeration)
          showSuccess(email);
          showToast("Reset link sent if account exists", "mark_email_read");
          startResendCooldown(30);
        } catch (_) {
          showFormError("We couldn’t send the email. Please try again.");
        } finally {
          submitBtn.disabled = false;
          submitLabel.textContent = "Send reset link";
          submitSpinner.classList.add("hidden");
        }
      });

      resendBtn.addEventListener("click", async () => {
        const email = sentEmail.textContent;
        resendBtn.disabled = true;
        resendLabel.textContent = "Sending…";
        try {
          await sendPasswordResetEmail(auth, email);
          showToast("Reset email resent", "forward_to_inbox");
          startResendCooldown(30);
        } catch (e) {
          showToast("Error resending email", "error");
          resendBtn.disabled = false;
          resendLabel.textContent = "Resend email";
        }
      });

      tryAnother.addEventListener("click", () => {
        showRequest();
        emailInput.value = "";
        setFieldError("");
      });

      // Theme
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
    })();
