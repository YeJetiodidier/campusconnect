import { db, storage } from "./firebase-config.js";
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";

const offerForm = document.getElementById("offerServiceForm");
const submitBtn = document.getElementById("submitServiceBtn");

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
    const storageRef = ref(storage, `services/${Date.now()}_${imageFile.name}`);
    const snapshot = await uploadBytes(storageRef, imageFile);
    const imageUrl = await getDownloadURL(snapshot.ref);

    await addDoc(collection(db, "services"), {
      title,
      rate,
      category,
      description,
      imageUrl,
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