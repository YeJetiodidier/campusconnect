/* =========================================================
   CONVERSATION + MESSAGE MODELS
   Messaging Module
   /conversations/{conversationId}
   /conversations/{conversationId}/messages/{messageId}
   ========================================================= */

/**
 * Finds (or signals the need to create) a conversation between
 * two specific users. Firestore has no unique-composite-key
 * constraint, so the backend must query for an existing
 * conversation with these two participants before creating a
 * new one — this helper just builds the query shape.
 */
function conversationQueryParticipants(userIdA, userIdB) {
  return [userIdA, userIdB].sort(); // sorted so lookups are consistent regardless of who initiated
}

function createConversationDocument({ participantIds, listingId = null }) {
  return {
    participantIds,
    listingId,
    lastMessage: null,
    lastMessageAt: new Date(),
  };
}

function createMessageDocument({ senderId, content }) {
  return {
    senderId,
    content,
    timestamp: new Date(),
    status: "sent",
  };
}

/** Fields to update on the parent conversation whenever a new message is sent. */
function conversationPreviewUpdate(content) {
  return {
    lastMessage: content,
    lastMessageAt: new Date(),
  };
}

module.exports = {
  conversationQueryParticipants,
  createConversationDocument,
  createMessageDocument,
  conversationPreviewUpdate,
};
