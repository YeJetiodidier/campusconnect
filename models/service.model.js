/* =========================================================
   SERVICE MODEL — /services/{serviceId}
   Services Module
   ========================================================= */

function createServiceDocument({ title, description, hourlyRate, portfolioLink = null, providerId, providerName }) {
  if (hourlyRate < 0) {
    throw new Error("Hourly rate cannot be negative.");
  }

  return {
    title,
    description,
    hourlyRate,
    portfolioLink,
    providerId,
    providerName,
    createdAt: new Date(),
  };
}

module.exports = { createServiceDocument };
