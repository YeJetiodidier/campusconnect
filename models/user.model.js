/* =========================================================
   USER MODEL — /users/{userId}
   Used by the Node.js/Express backend (Authentication Module)
   to validate data shape before writing to Firestore, and to
   provide consistent helper functions across the app.
   ========================================================= */

const VALID_ROLES = ["student", "recruiter", "admin"];

/**
 * Builds a new user document with sensible defaults.
 * Called by the Authentication Module on registration.
 */
function createUserDocument({ userId, name, email, role = "student", profileImage = null }) {
  if (!VALID_ROLES.includes(role)) {
    throw new Error(`Invalid role "${role}". Must be one of: ${VALID_ROLES.join(", ")}`);
  }
  if (!email.endsWith("@university.edu")) {
    // Replace with the actual institutional domain used by the school
    throw new Error("Email must be an institutional address.");
  }

  return {
    userId,
    name,
    email,
    role,
    profileImage,
    isVerified: false,
    createdAt: new Date(),
    avgRating: 0,
    ratingCount: 0,
    referralCode: generateReferralCode(userId),
  };
}

/** Generates a short, unique-looking referral code from a user ID. */
function generateReferralCode(userId) {
  return "NGT-" + userId.slice(0, 6).toUpperCase();
}

/**
 * Called by a Cloud Function whenever a new rating document is
 * created — recomputes and returns the updated avgRating/ratingCount
 * for the rated user, per the denormalization strategy in the
 * Database Design Documentation (Section 3.1).
 */
function recalculateRating(existingAvg, existingCount, newStars) {
  const newCount = existingCount + 1;
  const newAvg = (existingAvg * existingCount + newStars) / newCount;
  return { avgRating: Math.round(newAvg * 10) / 10, ratingCount: newCount };
}

module.exports = { createUserDocument, generateReferralCode, recalculateRating, VALID_ROLES };
