import "./styles/index.css";
import { auth } from "./config/firebase.js";
import { onAuthStateChanged } from "firebase/auth";

onAuthStateChanged(auth, (user) => {
  if (user) {
    // User is signed in. If they are on index.html or /, redirect to dashboard.html
    if (window.location.pathname === "/" || window.location.pathname === "/index.html" || window.location.pathname.endsWith("/")) {
      window.location.href = "/dashboard.html";
    }
  } else {
    // User is signed out. If they are on the landing page (index.html or /), redirect to login.html
    if (window.location.pathname === "/" || window.location.pathname === "/index.html" || window.location.pathname.endsWith("/")) {
      window.location.href = "/login.html";
    }
  }
});

