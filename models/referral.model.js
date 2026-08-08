/* =========================================================
   REFERRAL MODEL — /referrals/{referralId}
   Referral Module
   ========================================================= */

function createReferralDocument({ referrerId, referredUserId, referralCode }) {
  return {
    referrerId,
    referredUserId,
    referralCode,
    createdAt: new Date(),
    status: "pending",
  };
}

function completeReferral() {
  return { status: "completed" };
}

module.exports = { createReferralDocument, completeReferral };
