import { db, auth } from "../src/firebase-config.js";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

const servicesGrid = document.getElementById("servicesGrid");
const searchInput = document.getElementById("serviceSearchInput");

let services = [];

async function fetchServices() {
  if (!servicesGrid) return;
  servicesGrid.innerHTML = `<p style="grid-column: span 3; text-align: center;">Loading services...</p>`;
  try {
    const querySnapshot = await getDocs(collection(db, "services"));
    services = [];
    querySnapshot.forEach((document) => {
      services.push({ id: document.id, ...document.data() });
    });
    renderServices();
  } catch (err) {
    console.error("Error fetching services: ", err);
    servicesGrid.innerHTML = `<p style="grid-column: span 3; text-align: center; color: red;">Failed to load services.</p>`;
  }
}

function renderServices() {
  servicesGrid.innerHTML = "";
  const query = searchInput?.value.toLowerCase() || "";
  const filtered = services.filter(s => s.title.toLowerCase().includes(query) || s.category.toLowerCase().includes(query));

  if (filtered.length === 0) {
    servicesGrid.innerHTML = `<p style="grid-column: span 3; text-align: center; color: #94a3b8;">No services available. Click "+ Offer a Service" to add one!</p>`;
    return;
  }

  filtered.forEach(service => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <div class="card-image-box">
        <img src="${service.imageUrl || 'https://via.placeholder.com/300'}" alt="${service.title}">
        <span class="badge">${service.category}</span>
      </div>
      <div class="card-body">
        <div class="card-title-row">
          <h3>${service.title}</h3>
          <span class="price">${service.rate} FCFA/hr</span>
        </div>
      </div>
      <div class="card-footer">
        <a href="service-details.html?id=${service.id}" class="btn-connect">View Details</a>
        <button class="btn-delete" data-id="${service.id}" style="color:red; background:none; border:none; cursor:pointer;">Delete</button>
      </div>
    `;

    card.querySelector(".btn-delete").addEventListener("click", async (e) => {
      const id = e.target.getAttribute("data-id");
      if (confirm("Are you sure you want to delete this service listing?")) {
        await deleteDoc(doc(db, "services", id));
        fetchServices();
      }
    });

    servicesGrid.appendChild(card);
  });
}

searchInput?.addEventListener("input", renderServices);

onAuthStateChanged(auth, (user) => {
  if (user) {
    fetchServices();
  } else {
    if (servicesGrid) {
      servicesGrid.innerHTML = `<p style="grid-column: span 3; text-align: center; color: red;">Please <a href="login.html">log in</a> to view services.</p>`;
    }
  }
});