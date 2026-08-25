// src/shared/permissions.js
// Centralized Role-Based Access Control logic for CampusConnect

/**
 * Validates whether the currently authenticated user has the 'Agency' role
 * allowing them to post premium content like Jobs and Internships.
 * 
 * Instead of hardcoding emails, any user who registers with the alias "+partner"
 * (e.g. google+partner@gmail.com or hr+partner@company.com) will automatically
 * be recognized as an agency.
 */
export function isUserAgency(user) {
  if (!user || !user.email) return false;
  const email = user.email.toLowerCase();
  
  return email.includes("+partner@") || email.endsWith("@campusconnect.com");
}
