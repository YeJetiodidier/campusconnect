/* =========================================================
   SEED DATA SCRIPT
   Populates every collection with realistic sample documents,
   so the team can see the database structure working with
   real data instead of an empty project.

   HOW TO RUN:
   1. npm install firebase-admin
   2. Download a service account key from your Firebase project
      (Project Settings → Service Accounts → Generate new private key)
      and save it as "serviceAccountKey.json" in this folder.
   3. node seed-data.js

   To run against the LOCAL EMULATOR instead of a live project:
   1. firebase emulators:start
   2. In a separate terminal: 
      export FIRESTORE_EMULATOR_HOST="localhost:8080"
      node seed-data.js
   ========================================================= */

const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore, Timestamp } = require('firebase-admin/firestore');

// Only load a real service account if one exists — otherwise assume
// we're pointing at the local emulator via FIRESTORE_EMULATOR_HOST.
try {
  const serviceAccount = require("./serviceAccountKey.json");
  initializeApp({ credential: cert(serviceAccount) });
} catch (e) {
  initializeApp({ projectId: "campusconnect-dev" });
}

const db = getFirestore();

async function seed() {
  console.log("Seeding CampusConnect Firestore data...\n");

  // ---- USERS ----
  const users = [
    { id: "user_alice", name: "Alice Mbeki", email: "alice.mbeki@university.edu", role: "student", avgRating: 4.8, ratingCount: 12, referralCode: "NGT-ALICE1" },
    { id: "user_brian", name: "Brian Fon", email: "brian.fon@university.edu", role: "student", avgRating: 4.2, ratingCount: 5, referralCode: "NGT-BRIAN1" },
    { id: "user_cynthia", name: "Cynthia Ngu", email: "cynthia.ngu@university.edu", role: "student", avgRating: 0, ratingCount: 0, referralCode: "NGT-CYNTH1" },
    { id: "recruiter_dan", name: "Dan Recruiter — TechCorp", email: "dan@techcorp.com", role: "recruiter", avgRating: 0, ratingCount: 0, referralCode: "NGT-DANREC" },
    { id: "admin_admin", name: "Campus Admin", email: "admin@university.edu", role: "admin", avgRating: 0, ratingCount: 0, referralCode: "NGT-ADMIN1" },
  ];
  for (const u of users) {
    await db.collection("users").doc(u.id).set({
      userId: u.id, name: u.name, email: u.email, role: u.role,
      profileImage: null, isVerified: true, createdAt: Timestamp.now(),
      avgRating: u.avgRating, ratingCount: u.ratingCount, referralCode: u.referralCode,
    });
  }
  console.log(`✓ Seeded ${users.length} users`);

  // ---- LISTINGS ----
  const listings = [
    { title: "Calculus Textbook (8th Ed.)", description: "Barely used, no highlights.", price: 15000, condition: "Like New", category: "Textbooks", sellerId: "user_alice", sellerName: "Alice Mbeki", sellerRating: 4.8 },
    { title: "Mini Fridge", description: "Works perfectly, moving out sale.", price: 45000, condition: "Good", category: "Appliances", sellerId: "user_brian", sellerName: "Brian Fon", sellerRating: 4.2 },
  ];
  for (const l of listings) {
    await db.collection("listings").add({
      ...l, status: "available", imageURLs: [], createdAt: Timestamp.now(),
    });
  }
  console.log(`✓ Seeded ${listings.length} listings`);


  // ---- SERVICES ----
  await db.collection("services").add({
    title: "Graphic Design & Poster Making", description: "Event posters, flyers, logo design.",
    hourlyRate: 5000, portfolioLink: "https://behance.net/example",
    providerId: "user_cynthia", providerName: "Cynthia Ngu", createdAt: Timestamp.now(),
  });
  console.log("✓ Seeded 1 service");

  // ---- JOBS + APPLICATIONS (subcollection) ----
  const jobRef = await db.collection("jobs").add({
    company: "TechCorp", title: "Frontend Intern", description: "React internship, 3 months.",
    location: "Remote", deadline: Timestamp.fromDate(new Date("2026-09-30")),
    postedBy: "recruiter_dan", status: "open",
  });
  await jobRef.collection("applications").add({
    applicantId: "user_alice", resumeURL: "https://storage.example.com/resumes/alice.pdf",
    submittedAt: Timestamp.now(), status: "pending",
  });
  console.log("✓ Seeded 1 job with 1 application");

  // ---- EVENTS + RSVPS (subcollection) ----
  const eventRef = await db.collection("events").add({
    title: "Career Fair 2026", description: "Meet recruiters from 20+ companies.",
    date: Timestamp.fromDate(new Date("2026-09-15T09:00:00")),
    venue: "Main Auditorium", capacity: 300, category: "Career", createdBy: "admin_admin",
  });
  await eventRef.collection("rsvps").doc("user_alice").set({
    rsvpAt: Timestamp.now(), status: "going",
  });
  console.log("✓ Seeded 1 event with 1 RSVP");

  // ---- CONVERSATIONS + MESSAGES (subcollection) ----
  const convoRef = await db.collection("conversations").add({
    participantIds: ["user_alice", "user_brian"], listingId: null,
    lastMessage: "Is the fridge still available?", lastMessageAt: Timestamp.now(),
  });
  await convoRef.collection("messages").add({
    senderId: "user_alice", content: "Is the fridge still available?",
    timestamp: Timestamp.now(), status: "sent",
  });
  console.log("✓ Seeded 1 conversation with 1 message");

  // ---- NOTIFICATIONS ----
  await db.collection("notifications").add({
    userId: "user_brian", title: "New message", message: "Alice sent you a message.",
    type: "message", status: "unread", createdAt: Timestamp.now(),
  });
  console.log("✓ Seeded 1 notification");

  // ---- REFERRALS ----
  await db.collection("referrals").add({
    referrerId: "user_alice", referredUserId: "user_cynthia", referralCode: "NGT-ALICE1",
    createdAt: Timestamp.now(), status: "completed",
  });
  console.log("✓ Seeded 1 referral");

  // ---- RATINGS ----
  await db.collection("ratings").add({
    sellerId: "user_alice", buyerId: "user_brian", stars: 5,
    review: "Great seller, fast response!", createdAt: Timestamp.now(),
  });
  console.log("✓ Seeded 1 rating");

  // ---- ANNOUNCEMENTS ----
  await db.collection("announcements").add({
    title: "Platform Maintenance Notice", content: "CampusConnect will be down for maintenance on Sunday, 2AM–4AM.",
    postedBy: "admin_admin", publishDate: Timestamp.now(), status: "published",
  });
  console.log("✓ Seeded 1 announcement");

  console.log("\n✅ Seeding complete. All 10 collections + 3 subcollections now have sample data.");
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});