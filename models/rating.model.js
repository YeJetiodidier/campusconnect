/* =========================================================
   RATING MODEL — /ratings/{ratingId}
   Ratings & Reviews Module
   ========================================================= */

function createRatingDocument({ sellerId, buyerId, stars, review = "" }) {
  if (stars < 1 || stars > 5) {
    throw new Error("Stars must be between 1 and 5.");
  }
  return {
    sellerId,
    buyerId,
    stars,
    review,
    createdAt: new Date(),
  };
}

module.exports = { createRatingDocument };
