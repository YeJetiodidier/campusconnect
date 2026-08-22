import { db } from "../src/firebase-config.js";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

const offerForm = document.getElementById("offerServiceForm");
const submitBtn = document.getElementById("submitServiceBtn");

// Helper to compress image to Base64 (max 600px, webp format)
const compressImageToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_SIZE = 600;
        let width = img.width;
        let height = img.height;

        if (width > height && width > MAX_SIZE) {
          height *= MAX_SIZE / width;
          width = MAX_SIZE;
        } else if (height > MAX_SIZE) {
          width *= MAX_SIZE / height;
          height = MAX_SIZE;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/webp", 0.6));
      };
    };
    reader.onerror = error => reject(error);
  });
};

offerForm?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const title = document.getElementById("serviceTitle").value;
  const rate = parseFloat(document.getElementById("serviceRate").value);
  const category = document.getElementById("serviceCategory").value;
  const description = document.getElementById("serviceDescription").value;
  const imageFile = document.getElementById("serviceImage").files[0];

  if (!imageFile) {
    alert("Please select a cover image.");
    return;
  }

  submitBtn.disabled = true;
  submitBtn.innerText = "Publishing Service...";

  try {
    const compressedImageUrl = await compressImageToBase64(imageFile);

    await addDoc(collection(db, "services"), {
      title,
      rate,
      category,
      description,
      imageUrl: compressedImageUrl,
      createdAt: serverTimestamp()
    });

    alert("Service listed successfully!");
    window.location.href = "services.html";
  } catch (err) {
    console.error("Error publishing service: ", err);
    alert("Failed to create service listing.");
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerText = "Publish Service";
  }
});