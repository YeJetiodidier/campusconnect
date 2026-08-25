import { db, auth } from "../src/firebase-config.js";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

const sellForm = document.getElementById("sellItemForm");
const submitBtn = document.getElementById("submitItemBtn");

// Helper to compress image to Base64 (max 600px width/height, webp format)
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
        // Compress heavily as webp to dodge 1MB firestore limit
        resolve(canvas.toDataURL("image/webp", 0.6));
      };
    };
    reader.onerror = error => reject(error);
  });
};

sellForm?.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!auth.currentUser) {
    alert("You must be logged in to publish an item.");
    return;
  }

  const title = document.getElementById("itemTitle").value;
  const price = parseFloat(document.getElementById("itemPrice").value);
  const category = document.getElementById("itemCategory").value;
  const condition = document.getElementById("itemCondition").value;
  const location = document.getElementById("itemLocation").value;
  const description = document.getElementById("itemDescription").value;
  const imageFile = document.getElementById("itemImage").files[0];

  if (!imageFile) {
    alert("Please upload an image for your listing.");
    return;
  }

  submitBtn.disabled = true;
  submitBtn.innerText = "Publishing...";

  try {
    const compressedImageUrl = await compressImageToBase64(imageFile);

    await addDoc(collection(db, "listings"), {
      sellerId: auth.currentUser.uid,
      sellerName: auth.currentUser.displayName || auth.currentUser.email || "Student",
      sellerEmail: auth.currentUser.email || "",
      title,
      price,
      category,
      condition,
      location,
      description,
      imageUrl: compressedImageUrl,
      createdAt: serverTimestamp()
    });

    alert("Item listed successfully!");
    window.location.href = "marketplace.html";
  } catch (err) {
    console.error("Error publishing listing: ", err);
    alert("Failed to publish item. Check your Firebase credentials.");
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerText = "Publish Listing";
  }
});