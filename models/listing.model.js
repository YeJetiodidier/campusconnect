/* =========================================================
   LISTING MODEL — /listings/{listingId}
   Marketplace Module
   ========================================================= */

const VALID_STATUSES = ["available", "sold", "removed"];
const MAX_IMAGES = 5;

/**
 * Builds a new listing document. Requires the seller's current
 * name/rating to be passed in, so they can be denormalized onto
 * the listing (see Database Design Documentation, Section 3.2).
 */
function createListingDocument({ title, description, price, condition, category, imageURLs = [], sellerId, sellerName, sellerRating = 0 }) {
  if (imageURLs.length > MAX_IMAGES) {
    throw new Error(`A listing can have at most ${MAX_IMAGES} images.`);
  }
  if (price < 0) {
    throw new Error("Price cannot be negative.");
  }

  return {
    title,
    description,
    price,
    condition,
    category,
    status: "available",
    imageURLs,
    sellerId,
    sellerName,
    sellerRating,
    createdAt: new Date(),
  };
}

/** Soft-delete — matches the SRS requirement; never hard-deletes a listing. */
function softDeleteListing() {
  return { status: "removed" };
}

function markAsSold() {
  return { status: "sold" };
}

module.exports = { createListingDocument, softDeleteListing, markAsSold, VALID_STATUSES, MAX_IMAGES };
