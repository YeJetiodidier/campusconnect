// src/services/eventsService.js
// Firestore access for the Campus Events module.
//
// Collection: "events"
// Fields (from Arrey's Event class):
//   eventID (doc id), title, date (Timestamp), time, venue, capacity,
//   category, description, coverImageURL, organizer
// Subcollection: events/{eventId}/attendees/{uid} -> { rsvpDate, status }

import { db } from "../firebase-config.js";
import {
  collection,
  doc,
  query,
  where,
  orderBy,
  limit,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";

const EVENTS_COLLECTION = "events";

/** Upcoming events, soonest first, optionally filtered by category. */
export async function fetchUpcomingEvents(filters = {}) {
  const eventsRef = collection(db, EVENTS_COLLECTION);
  const clauses = [where("date", ">=", Timestamp.now())];
  if (filters.category) clauses.push(where("category", "==", filters.category));

  const q = query(eventsRef, ...clauses, orderBy("date", "asc"), limit(50));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/** Fetch a single event for the Event Details page. */
export async function fetchEventById(eventId) {
  const snap = await getDoc(doc(db, EVENTS_COLLECTION, eventId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

/** RSVP the current user to an event (idempotent — safe to call again). */
export async function rsvpToEvent(eventId, uid) {
  await setDoc(doc(db, EVENTS_COLLECTION, eventId, "attendees", uid), {
    status: "going",
    rsvpDate: serverTimestamp(),
  });
}

/** Cancel a previous RSVP. */
export async function cancelRsvp(eventId, uid) {
  await deleteDoc(doc(db, EVENTS_COLLECTION, eventId, "attendees", uid));
}

/** Check whether the current user has already RSVP'd to this event. */
export async function getRsvpStatus(eventId, uid) {
  const snap = await getDoc(doc(db, EVENTS_COLLECTION, eventId, "attendees", uid));
  return snap.exists();
}
