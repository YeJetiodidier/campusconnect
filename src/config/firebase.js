import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getFunctions } from "firebase/functions";
import { getMessaging } from "firebase/messaging";

// TODO: Replace with your actual Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyABWsxkcPCNP7QtsMYppa_JiW5PwwjGXQs",
  authDomain: "campusconnect-899f8.firebaseapp.com",
  projectId: "campusconnect-899f8",
  storageBucket: "campusconnect-899f8.firebasestorage.app",
  messagingSenderId: "118873847122",
  appId: "1:118873847122:web:ca531760da697841d7b68b",
  measurementId: "G-1WPMVZQ7V5"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firebase Services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);
// We wrap messaging in a try-catch because it's only supported on certain environments
export let messaging = null;
try {
  messaging = getMessaging(app);
} catch (error) {
  console.log("Firebase Messaging not supported on this device/browser.", error);
}

export default app;