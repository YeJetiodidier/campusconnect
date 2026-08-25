// src/pages/post-opportunity.js
import { auth } from "../firebase-config.js";
import { onAuthStateChanged } from "firebase/auth";
import { isUserAgency } from "../shared/permissions.js";
import { createInternshipListing } from "../services/internshipsService.js";

let currentUser = null;

// Enforce RBAC
onAuthStateChanged(auth, (user) => {
  currentUser = user;
  if (!user || !isUserAgency(user)) {
    alert("You do not have permission to access the Partner Portal. Redirecting to Internships...");
    window.location.href = "/internships.html";
  }
});

const form = document.getElementById("post-opportunity-form");
const submitBtn = document.getElementById("submit-opportunity-btn");

// Image Compressor
const compressLogoToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    if (!file) { resolve(""); return; }
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX = 200;
        let w = img.width, h = img.height;
        if (w > h && w > MAX) { h *= MAX / w; w = MAX; }
        else if (h > MAX) { w *= MAX / h; h = MAX; }
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/webp", 0.6));
      };
    };
    reader.onerror = error => reject(error);
  });
};

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!currentUser || !isUserAgency(currentUser)) {
      alert("Unauthorized Access.");
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "Publishing Opportunity...";

    try {
      const logoFile = document.getElementById("job-logo").files[0];
      const logoUrl = await compressLogoToBase64(logoFile);

      const jobData = {
        title: document.getElementById("job-title").value.trim(),
        company: document.getElementById("job-company").value.trim(),
        type: document.getElementById("job-type").value,
        location: document.getElementById("job-location").value.trim(),
        salary: document.getElementById("job-salary").value.trim(),
        link: document.getElementById("job-link").value.trim(),
        logoUrl: logoUrl,
        // The new UI also includes deadline and description, we should store them
        deadline: document.getElementById("job-deadline").value,
        description: document.getElementById("job-desc").value.trim()
      };

      await createInternshipListing(jobData, currentUser);

      alert("Opportunity successfully posted!");
      window.location.href = "/internships.html";
    } catch (err) {
      console.error("Error posting opportunity:", err);
      alert("Failed to submit opportunity. Check your network or permissions.");
      submitBtn.disabled = false;
      submitBtn.textContent = "Post Opportunity";
    }
  });
}
