/* =========================================================
   EVENT MODEL — /events/{eventId}
   Campus Events Module
   Subcollection: /events/{eventId}/rsvps/{userId}
   ========================================================= */

function createEventDocument({ title, description, date, venue, capacity, category, createdBy }) {
  return {
    title,
    description,
    date: new Date(date),
    venue,
    capacity,
    category,
    createdBy,
  };
}

/** RSVP document ID is the userId itself — one RSVP per user, per event. */
function createRsvpDocument() {
  return {
    rsvpAt: new Date(),
    status: "going",
  };
}

function cancelRsvp() {
  return { status: "cancelled" };
}

module.exports = { createEventDocument, createRsvpDocument, cancelRsvp };
