// src/services/internshipsService.js
// All Firestore access for the Internship & Jobs module lives here so
// pages never talk to Firestore directly.
//
// Collection: "jobs"
// Fields (from Arrey's Job class + fields needed for listing/filtering):
//   jobID (doc id), title, company, type ("internship" | "job"),
//   location, category, description, deadline (Timestamp),
//   postedBy (recruiter uid), postedDate (Timestamp), status ("open"|"closed")

import { db } from "../firebase-config.js";
import {
  collection,
  doc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  getDoc,
  getDocs,
  onSnapshot,
} from "firebase/firestore";

const JOBS_COLLECTION = "jobs";
const PAGE_SIZE = 12;

function buildListingsQuery(filters = {}, cursor = null) {
  const jobsRef = collection(db, JOBS_COLLECTION);
  const clauses = [where("status", "==", "open")];
  if (filters.type) clauses.push(where("type", "==", filters.type));
  if (filters.category) clauses.push(where("category", "==", filters.category));
  if (filters.location) clauses.push(where("location", "==", filters.location));

  let q = query(jobsRef, ...clauses, orderBy("postedDate", "desc"), limit(PAGE_SIZE));
  if (cursor) {
    q = query(jobsRef, ...clauses, orderBy("postedDate", "desc"), startAfter(cursor), limit(PAGE_SIZE));
  }
  return q;
}

/** Fetch one page of internship/job listings. Returns { items, lastDoc, hasMore }. */
export async function fetchInternshipListings(filters = {}, cursor = null) {
  const q = buildListingsQuery(filters, cursor);
  const snapshot = await getDocs(q);
  const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
  return {
    items,
    lastDoc: snapshot.docs[snapshot.docs.length - 1] ?? null,
    hasMore: snapshot.docs.length === PAGE_SIZE,
  };
}

/**
 * Client-side keyword refinement over an already-fetched page.
 * For production-scale search, wire this to the Algolia extension
 * mentioned in the system analysis instead of filtering client-side.
 */
export function filterByKeyword(items, keyword) {
  if (!keyword) return items;
  const term = keyword.trim().toLowerCase();
  return items.filter(
    (job) =>
      job.title?.toLowerCase().includes(term) ||
      job.company?.toLowerCase().includes(term)
  );
}

/** Fetch a single job/internship by ID for the Job Details page. */
export async function fetchJobById(jobId) {
  const snap = await getDoc(doc(db, JOBS_COLLECTION, jobId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

/** Live subscription for a small "new for you" widget on the Dashboard. */
export function subscribeToLatestListings(callback, max = 5) {
  const q = query(
    collection(db, JOBS_COLLECTION),
    where("status", "==", "open"),
    orderBy("postedDate", "desc"),
    limit(max)
  );
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}
