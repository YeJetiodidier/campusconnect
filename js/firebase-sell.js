import { db, storage } from "./firebase-config.js";
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";

const sellForm = document.getElementById("sellItemForm");
const submitBtn = document.getElementById("submitItemBtn");

sellForm?.addEventListener("submit", async (e) => {
  e.preventDefault();

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
    const storageRef = ref(storage, `products/${Date.now()}_${imageFile.name}`);
    const snapshot = await uploadBytes(storageRef, imageFile);
    const imageUrl = await getDownloadURL(snapshot.ref);

    await addDoc(collection(db, "products"), {
      title,
      price,
      category,
      condition,
      location,
      description,
      imageUrl,
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