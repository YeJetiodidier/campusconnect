// src/services/marketplaceService.js
import { db } from "../firebase-config.js";
import {
  collection,
  addDoc,
  query,
  orderBy,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";

const MARKETPLACE_COLLECTION = "marketplace";

/** Post a new item to the marketplace */
export async function createMarketplaceItem(itemData, user) {
  const docRef = await addDoc(collection(db, MARKETPLACE_COLLECTION), {
    title: itemData.title,
    description: itemData.description,
    price: Number(itemData.price),
    category: itemData.category,
    condition: itemData.condition,
    sellerId: user.uid,
    sellerName: user.displayName || user.email,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

/** Fetch all items (latest first) */
export async function fetchMarketplaceItems() {
  const q = query(
    collection(db, MARKETPLACE_COLLECTION),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}
