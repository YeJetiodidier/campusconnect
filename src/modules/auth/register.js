import { auth } from '../../config/firebase.js';
import { 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider 
} from 'firebase/auth';

(function () {
      "use strict";

      const uniLabels = {
        main: "Main Campus",
        tech: "Technology Institute",
        med: "Medical Science Center",
        arts: "Global Arts University"
      };

      let currentStep = 1;

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

      function setFieldError(fieldId, errorId, message) {
        const field = document.getElementById(fieldId);
        const err = document.getElementById(errorId);
        if (!field || !err) return;
        if (message) {
          field.classList.add("field-error");
          err.textContent = message;
          err.classList.remove("hidden");
        } else {
          field.classList.remove("field-error");
          err.textContent = "";
          err.classList.add("hidden");
        }
      }

      function clearFormError() {
        document.getElementById("formError").classList.add("hidden");
      }

      function showFormError(msg) {
        document.getElementById("formErrorText").textContent = msg;
        document.getElementById("formError").classList.remove("hidden");
      }

      const blockedDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com', 'icloud.com'];
      function isValidEmail(v) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      }
      
      function isInstitutionalEmail(email) {
        const domain = email.split('@')[1]?.toLowerCase();
        return domain && !blockedDomains.includes(domain);
      }

      // —— Password strength ——
      function scorePassword(pw) {
        let score = 0;
        if (pw.length >= 8) score++;
        if (pw.length >= 12) score++;
        if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
        if (/\d/.test(pw)) score++;
        if (/[^A-Za-z0-9]/.test(pw)) score++;
        return Math.min(score, 4);
      }

      function updateStrength(pw) {
        const score = scorePassword(pw);
        const colors = ["#ba1a1a", "#c45c00", "#855300", "#006c49", "#006c49"];
        const labels = ["Too weak", "Weak", "Fair", "Strong", "Very strong"];
        const bars = ["strBar1", "strBar2", "strBar3", "strBar4"];
        bars.forEach((id, i) => {
          const el = document.getElementById(id);
          if (i < score) {
            el.style.width = "100%";
            el.style.backgroundColor = colors[score] || colors[0];
          } else {
            el.style.width = "0%";
          }
        });
        document.getElementById("strengthLabel").textContent = pw ? labels[score] || labels[0] : "Password strength";

        const setRule = (id, ok) => {
          const li = document.getElementById(id);
          const icon = li.querySelector(".material-symbols-outlined");
          icon.textContent = ok ? "check_circle" : "radio_button_unchecked";
          icon.classList.toggle("text-tertiary", ok);
          li.classList.toggle("text-tertiary", ok);
        };
        setRule("ruleLen", pw.length >= 8);
        setRule("ruleUpper", /[A-Z]/.test(pw));
        setRule("ruleNum", /\d/.test(pw));
      }

      document.getElementById("password").addEventListener("input", (e) => {
        updateStrength(e.target.value);
        setFieldError("passwordField", "passwordError", "");
        clearFormError();
      });

      // —— Toggle visibility ——
      function bindToggle(btnId, inputId, iconId) {
        const btn = document.getElementById(btnId);
        const input = document.getElementById(inputId);
        const icon = document.getElementById(iconId);
        btn.addEventListener("click", () => {
          const showing = input.type === "text";
          input.type = showing ? "password" : "text";
          icon.textContent = showing ? "visibility" : "visibility_off";
          btn.setAttribute("aria-pressed", showing ? "false" : "true");
          btn.setAttribute("aria-label", showing ? "Show password" : "Hide password");
        });
      }
      bindToggle("togglePassword", "password", "passwordIcon");
      bindToggle("toggleConfirm", "confirmPassword", "confirmIcon");

      // —— Step navigation UI ——
      function goToStep(step) {
        currentStep = step;
        document.querySelectorAll(".step-panel").forEach((p) => {
          p.classList.toggle("active", Number(p.dataset.step) === step);
        });

        const dots = [1, 2, 3].map((n) => document.getElementById("stepDot" + n));
        const labels = [
          null,
          document.getElementById("stepLabel2"),
          document.getElementById("stepLabel3")
        ];
        const lines = [
          document.getElementById("stepLine1"),
          document.getElementById("stepLine2")
        ];

        dots.forEach((dot, i) => {
          const n = i + 1;
          if (n < step) {
            dot.className = "w-8 h-8 rounded-full bg-tertiary text-on-tertiary flex items-center justify-center text-label-sm font-bold shrink-0";
            dot.innerHTML = '<span class="material-symbols-outlined text-[18px]">check</span>';
            dot.removeAttribute("aria-current");
          } else if (n === step) {
            dot.className = "w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center text-label-sm font-bold shrink-0";
            dot.textContent = String(n);
            dot.setAttribute("aria-current", "step");
          } else {
            dot.className = "w-8 h-8 rounded-full bg-surface-container-high text-on-surface-variant flex items-center justify-center text-label-sm font-bold shrink-0";
            dot.textContent = String(n);
            dot.removeAttribute("aria-current");
          }
        });

        if (labels[1]) {
          labels[1].classList.toggle("text-on-surface", step >= 2);
          labels[1].classList.toggle("text-on-surface-variant", step < 2);
        }
        if (labels[2]) {
          labels[2].classList.toggle("text-on-surface", step >= 3);
          labels[2].classList.toggle("text-on-surface-variant", step < 3);
        }
        lines[0].className = "flex-1 h-0.5 rounded-full " + (step > 1 ? "bg-tertiary" : "bg-primary");
        lines[1].className = "flex-1 h-0.5 rounded-full " + (step > 2 ? "bg-tertiary" : step === 2 ? "bg-primary" : "bg-outline-variant");

        clearFormError();
        window.scrollTo({ top: 0, behavior: "smooth" });
      }

      function validateStep1() {
        let ok = true;
        const name = document.getElementById("fullName").value.trim();
        const email = document.getElementById("email").value.trim();
        const uni = document.getElementById("university").value;

        if (!name || name.length < 2) {
          setFieldError("fullNameField", "fullNameError", "Enter your full name.");
          ok = false;
        } else {
          setFieldError("fullNameField", "fullNameError", "");
        }

        if (!email) {
          setFieldError("emailField", "emailError", "University email is required.");
          ok = false;
        } else if (!isValidEmail(email)) {
          setFieldError("emailField", "emailError", "Enter a valid email address.");
          ok = false;
        } else if (!isInstitutionalEmail(email)) {
          setFieldError("emailField", "emailError", "Please use your institutional university email.");
          ok = false;
        } else {
          setFieldError("emailField", "emailError", "");
        }

        if (!uni) {
          setFieldError("universityField", "universityError", "Select your university.");
          ok = false;
        } else {
          setFieldError("universityField", "universityError", "");
        }

        return ok;
      }

      function validateStep2() {
        let ok = true;
        const pw = document.getElementById("password").value;
        const confirm = document.getElementById("confirmPassword").value;

        if (pw.length < 8) {
          setFieldError("passwordField", "passwordError", "Password must be at least 8 characters.");
          ok = false;
        } else if (!/[A-Z]/.test(pw) || !/\d/.test(pw)) {
          setFieldError("passwordField", "passwordError", "Include an uppercase letter and a number.");
          ok = false;
        } else {
          setFieldError("passwordField", "passwordError", "");
        }

        if (!confirm) {
          setFieldError("confirmPasswordField", "confirmPasswordError", "Confirm your password.");
          ok = false;
        } else if (pw !== confirm) {
          setFieldError("confirmPasswordField", "confirmPasswordError", "Passwords do not match.");
          ok = false;
        } else {
          setFieldError("confirmPasswordField", "confirmPasswordError", "");
        }

        return ok;
      }

      function fillReview() {
        document.getElementById("reviewName").textContent = document.getElementById("fullName").value.trim() || "—";
        document.getElementById("reviewEmail").textContent = document.getElementById("email").value.trim() || "—";
        const uni = document.getElementById("university").value;
        document.getElementById("reviewUni").textContent = uniLabels[uni] || "—";
        const id = document.getElementById("studentId").value.trim();
        document.getElementById("reviewId").textContent = id || "Not provided";
      }

      document.getElementById("nextToStep2").addEventListener("click", () => {
        if (validateStep1()) goToStep(2);
        else {
          showFormError("Please fix the highlighted fields.");
          document.querySelector("#step1 .field-error input, #step1 .field-error select")?.focus();
        }
      });

      document.getElementById("backToStep1").addEventListener("click", () => goToStep(1));

      document.getElementById("nextToStep3").addEventListener("click", () => {
        if (validateStep2()) {
          fillReview();
          goToStep(3);
        } else {
          showFormError("Please fix the highlighted fields.");
          document.querySelector("#step2 .field-error input")?.focus();
        }
      });

      document.getElementById("backToStep2").addEventListener("click", () => goToStep(2));

      // Live clear on input
      ["fullName", "email", "university", "confirmPassword"].forEach((id) => {
        const el = document.getElementById(id);
        el.addEventListener("input", () => clearFormError());
        el.addEventListener("change", () => clearFormError());
      });

      document.getElementById("confirmPassword").addEventListener("input", () => {
        const pw = document.getElementById("password").value;
        const c = document.getElementById("confirmPassword").value;
        if (c && pw !== c) {
          setFieldError("confirmPasswordField", "confirmPasswordError", "Passwords do not match.");
        } else {
          setFieldError("confirmPasswordField", "confirmPasswordError", "");
        }
      });

      // Submit
      document.getElementById("registerForm").addEventListener("submit", (e) => {
        e.preventDefault();
        clearFormError();

        if (!validateStep1() || !validateStep2()) {
          showFormError("Some details need fixing. Go back and check each step.");
          return;
        }

        if (!document.getElementById("terms").checked) {
          document.getElementById("termsError").textContent = "You must accept the terms to continue.";
          document.getElementById("termsError").classList.remove("hidden");
          return;
        }
        document.getElementById("termsError").classList.add("hidden");

        const btn = document.getElementById("submitBtn");
        const label = document.getElementById("submitLabel");
        const spinner = document.getElementById("submitSpinner");
        btn.disabled = true;
        label.textContent = "Creating account…";
        spinner.classList.remove("hidden");

        // Firebase Auth Creation
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;
        
        createUserWithEmailAndPassword(auth, email, password)
          .then(() => {
            if (email.endsWith('@test.edu')) {
              showToast("Test account registered! Redirecting to dashboard...", "check_circle");
              setTimeout(() => {
                window.location.href = "/dashboard.html";
              }, 1500);
            } else {
              document.getElementById("registerForm").classList.add("hidden");
              document.getElementById("loginLinkRow").classList.add("hidden");
              document.querySelector("nav[aria-label='Registration progress']").classList.add("hidden");
              document.getElementById("successEmail").textContent = email;
              document.getElementById("successPanel").classList.remove("hidden");
              showToast("Account created successfully", "mark_email_read");
            }
          })
          .catch((error) => {
            console.error(error);
            showFormError(error.message || "Failed to register.");
            btn.disabled = false;
            label.textContent = "Create account";
            spinner.classList.add("hidden");
          });
      });

      document.getElementById("resendBtn").addEventListener("click", () => {
        showToast("Verification email resent", "forward_to_inbox");
      });

            // Google button demo
      document.getElementById("googleBtn")?.addEventListener("click", async () => {
        try {
          const provider = new GoogleAuthProvider();
          const result = await signInWithPopup(auth, provider);
          
          if (!isInstitutionalEmail(result.user.email)) {
            await auth.signOut();
            showToast("Access denied! Please use an institutional email.", "error");
            return;
          }
          
          showToast("Signed up with Google successfully", "check_circle");
          setTimeout(() => {
            window.location.href = "/dashboard.html";
          }, 1000);
        } catch (error) {
          console.error("Google Auth Error:", error);
          showToast(error.message || "Failed to sign up with Google", "error");
        }
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

