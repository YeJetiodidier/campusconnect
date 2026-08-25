// src/services/notificationsService.js
// Firestore access for the Notification module (per-user feed).
//
// Subcollection: users/{uid}/notifications/{notificationID}
// Fields (from Arrey's Notification class):
//   notificationID (doc id), userID, title, message, type, status
//   ("unread" | "read"), createdDate (Timestamp)

import { db } from "../firebase-config.js";
import {
  collection,
  doc,
  query,
  orderBy,
  limit,
  onSnapshot,
  updateDoc,
  writeBatch,
} from "firebase/firestore";

function notificationsRef(uid) {
  return collection(db, "users", uid, "notifications");
}

/** Live-subscribe to a user's notification feed, most recent first. Returns an unsubscribe function. */
export function subscribeToNotifications(uid, callback, max = 30) {
  const q = query(notificationsRef(uid), orderBy("createdDate", "desc"), limit(max));
  return onSnapshot(
    q,
    (snapshot) => {
      callback(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    },
    (error) => {
      console.warn("Firestore index error in notifications, falling back to basic collection query:", error);
      // Fallback query without orderBy if index is missing in Firestore
      return onSnapshot(notificationsRef(uid), (fallbackSnapshot) => {
        const items = fallbackSnapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        items.sort((a, b) => (b.createdDate?.seconds || 0) - (a.createdDate?.seconds || 0));
        callback(items.slice(0, max));
      });
    }
  );
}

/** Mark a single notification as read. */
export async function markNotificationAsRead(uid, notificationId) {
  await updateDoc(doc(db, "users", uid, "notifications", notificationId), { status: "read" });
}

/** Mark every currently-loaded unread notification as read (batched write). */
export async function markAllAsRead(uid, notifications) {
  const unread = notifications.filter((n) => n.status === "unread");
  if (unread.length === 0) return;

  const batch = writeBatch(db);
  unread.forEach((n) => {
    batch.update(doc(db, "users", uid, "notifications", n.id), { status: "read" });
  });
  await batch.commit();
}

/** Derive the unread count from an already-loaded notifications array. */
export function countUnread(notifications) {
  return notifications.filter((n) => n.status === "unread").length;
}
