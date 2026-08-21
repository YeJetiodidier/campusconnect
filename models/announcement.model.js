/* =========================================================
   ANNOUNCEMENT MODEL — /announcements/{announcementId}
   Announcements Module
   ========================================================= */

function createAnnouncementDocument({ title, content, postedBy, status = "published" }) {
  return {
    title,
    content,
    postedBy,
    publishDate: new Date(),
    status,
  };
}

module.exports = { createAnnouncementDocument };
