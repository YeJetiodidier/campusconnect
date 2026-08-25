// src/shared/permissions.js
// Centralized Role-Based Access Control logic for CampusConnect

export const AGENCY_EMAILS = [
  "partners@campusconnect.com",
  "hr@campusconnect.com",
  "careers@campusconnect.com",
  "agency@campusconnect.com"
];

/**
 * Validates whether the currently authenticated user has the 'Agency' role
 * allowing them to post premium content like Jobs and Internships.
 */
export function isUserAgency(user) {
  if (!user || !user.email) return false;
  return AGENCY_EMAILS.includes(user.email.toLowerCase());
}
