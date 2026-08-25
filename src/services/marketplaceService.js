// src/services/marketplaceService.js
import { db } from "../firebase-config.js";
import { doc, getDoc } from "firebase/firestore";

export async function fetchProductById(productId) {
    try {
        let snap = await getDoc(doc(db, "listings", productId));
        if (snap.exists()) return { id: snap.id, ...snap.data() };

        snap = await getDoc(doc(db, "products", productId));
        if (snap.exists()) return { id: snap.id, ...snap.data() };

        return null;
    } catch (e) {
        console.error("Error fetching product/listing by ID:", e);
        return null;
    }
}
