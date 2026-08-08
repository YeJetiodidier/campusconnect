/* =========================================================
   NOTIFICATION MODEL — /notifications/{notificationId}
   ========================================================= */

const NOTIFICATION_TYPES = ["listing_match", "message", "announcement", "referral", "application_update"];

function createNotificationDocument({ userId, title, message, type }) {
  if (!NOTIFICATION_TYPES.includes(type)) {
    throw new Error(`Invalid notification type "${type}".`);
  }
  return {
    userId,
    title,
    message,
    type,
    status: "unread",
    createdAt: new Date(),
  };
}

module.exports = { createNotificationDocument, NOTIFICATION_TYPES };
