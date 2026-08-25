// src/services/servicesService.js
import { db } from "../firebase-config.js";
import { doc, getDoc } from "firebase/firestore";

export async function fetchServiceById(serviceId) {
    const snap = await getDoc(doc(db, "services", serviceId));
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() };
}
