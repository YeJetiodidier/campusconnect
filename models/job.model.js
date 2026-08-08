/* =========================================================
   JOB MODEL — /jobs/{jobId}
   Internship & Jobs Module
   Subcollection: /jobs/{jobId}/applications/{applicationId}
   ========================================================= */

const VALID_JOB_STATUSES = ["open", "closed"];
const VALID_APPLICATION_STATUSES = ["pending", "reviewed", "rejected"];

function createJobDocument({ company, title, description, location, deadline, postedBy }) {
  return {
    company,
    title,
    description,
    location,
    deadline: new Date(deadline),
    postedBy,
    status: "open",
  };
}

function createApplicationDocument({ applicantId, resumeURL }) {
  return {
    applicantId,
    resumeURL,
    submittedAt: new Date(),
    status: "pending",
  };
}

module.exports = { createJobDocument, createApplicationDocument, VALID_JOB_STATUSES, VALID_APPLICATION_STATUSES };
