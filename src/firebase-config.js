// src/firebase-config.js
// Central Firebase app initialization for CampusConnect.
// TM1 (Didier) owns the actual Firebase project/config values — replace
// the placeholders below with the real ones from the shared Firebase project.
//
// Uses the "firebase" npm package (run `npm install` first) — Vite bundles
// it, so every page that imports from here shares one initialized app.

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyABWsxkcPCNP7QtsMYppa_JiW5PwwjGXQs",
  authDomain: "campusconnect-899f8.firebaseapp.com",
  projectId: "campusconnect-899f8",
  storageBucket: "campusconnect-899f8.firebasestorage.app",
  messagingSenderId: "118873847122",
  appId: "1:118873847122:web:ca531760da697841d7b68b",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
