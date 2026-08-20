// src/services/messagesService.js
// Firestore-backed real-time messaging service for CampusConnect.

import { db } from "../firebase-config.js";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  getDocs,
  limit,
} from "firebase/firestore";

/* ── Conversations ─────────────────────────────────────── */

/**
 * Subscribe to conversations the current user participates in.
 * @param {string} uid
 * @param {Function} callback  receives sorted array of conversation objects
 * @returns {Function} unsubscribe
 */
export function subscribeToConversations(uid, callback) {
  const q = query(
    collection(db, "conversations"),
    where("participants", "array-contains", uid),
    orderBy("lastMessageAt", "desc")
  );
  return onSnapshot(q, (snap) => {
    const convos = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(convos);
  });
}

/**
 * Start a new conversation (or return existing one).
 */
export async function startConversation(currentUid, currentName, partnerUid, partnerName) {
  // Check for existing conversation between these two users
  const q = query(
    collection(db, "conversations"),
    where("participants", "array-contains", currentUid)
  );
  const snap = await getDocs(q);
  const existing = snap.docs.find((d) => {
    const p = d.data().participants;
    return p.includes(partnerUid);
  });
  if (existing) return existing.id;

  // Create new conversation
  const docRef = await addDoc(collection(db, "conversations"), {
    participants: [currentUid, partnerUid],
    participantNames: { [currentUid]: currentName, [partnerUid]: partnerName },
    lastMessage: "",
    lastMessageAt: serverTimestamp(),
  });
  return docRef.id;
}

/* ── Messages within a conversation ────────────────────── */

/**
 * Subscribe to messages in a conversation, ordered oldest-first.
 */
export function subscribeToMessages(conversationId, callback) {
  const q = query(
    collection(db, "conversations", conversationId, "messages"),
    orderBy("createdAt", "asc")
  );
  return onSnapshot(q, (snap) => {
    const msgs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(msgs);
  });
}

/**
 * Send a message and update the conversation's preview.
 */
export async function sendMessage(conversationId, senderUid, text) {
  const trimmed = text.trim();
  if (!trimmed) return;

  await addDoc(collection(db, "conversations", conversationId, "messages"), {
    senderUid,
    text: trimmed,
    createdAt: serverTimestamp(),
  });

  await updateDoc(doc(db, "conversations", conversationId), {
    lastMessage: trimmed.length > 80 ? trimmed.slice(0, 80) + "…" : trimmed,
    lastMessageAt: serverTimestamp(),
  });
}
