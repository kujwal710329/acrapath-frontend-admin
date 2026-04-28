/**
 * Professionals API service
 * Wraps the admin users endpoints with correct params per tab
 */

import { apiRequest, clearEndpointCache } from "@/utilities/api";
import { logger } from "@/utilities/logger";

/** Maps tab key → profileVerificationStatus query value */
export const TAB_STATUS_MAP = {
  members: "verified",
  requests: "requests",
  onHold: "on_hold",
  verificationPending: "pending",
  topVerified: null, // uses fetchAllEmployees — no profileVerificationStatus filter
};

/**
 * Fetch paginated list of professionals for a given tab
 * GET /api/v1/users?role=employee&profileVerificationStatus=...&page=...&limit=...&search=...
 */
export async function fetchProfessionals({
  tab = "members",
  page = 1,
  limit = 20,
  search = "",
} = {}) {
  const params = new URLSearchParams({
    role: "employee",
    profileVerificationStatus: TAB_STATUS_MAP[tab] ?? "verified",
    page: String(page),
    limit: String(limit),
  });
  if (search.trim()) params.set("search", search.trim());

  const endpoint = `/users?${params.toString()}`;
  logger.debug("[professionals] fetching", { tab, page, limit, search });

  return apiRequest(endpoint, {}, { useCache: false });
}

/**
 * Fetch all employees (no profileVerificationStatus filter) — used by Top Verified tab
 * GET /api/v1/users?role=employee&page=&limit=&search=
 */
export async function fetchAllEmployees({ page = 1, limit = 20, search = "" } = {}) {
  const params = new URLSearchParams({
    role: "employee",
    page: String(page),
    limit: String(limit),
  });
  if (search.trim()) params.set("search", search.trim());

  const endpoint = `/users?${params.toString()}`;
  logger.debug("[professionals] fetching all employees", { page, limit, search });

  return apiRequest(endpoint, {}, { useCache: false });
}

/**
 * Toggle top professional status for a user
 * PATCH /api/v1/users/admin/top-verified-professionals/:userId/toggle
 * Response: { success, message, data: { sfUserId, isTopProfessional } }
 */
export async function toggleTopProfessionalStatus(userId) {
  logger.debug("[professionals] toggling top professional status", { userId });
  clearEndpointCache("/users");
  return apiRequest(`/users/admin/top-verified-professionals/${userId}/toggle`, {
    method: "PATCH",
  });
}

/**
 * Update a professional's verification status
 * PATCH /api/v1/users/:id/verification-status
 */
export async function updateVerificationStatus(userId, profileVerificationStatus) {
  logger.debug("[professionals] updating status", { userId, profileVerificationStatus });
  clearEndpointCache("/users");
  return apiRequest(`/users/${userId}/admin-verification-status`, {
    method: "PATCH",
    body: JSON.stringify({ profileVerificationStatus }),
  });
}

/**
 * Create a professional profile as admin (no user self-registration required)
 * POST /api/v1/users/admin/create-professional
 */
export async function createAdminProfessional(payload) {
  logger.debug("[professionals] admin creating professional", { email: payload.email });
  clearEndpointCache("/users");
  return apiRequest("/users/admin/create-professional", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/**
 * Get S3 presigned upload URL for a document during admin professional creation
 * POST /api/v1/users/admin/professional-presigned-url
 */
export async function getAdminProfessionalPresignedUrl({ documentType, fileName, tempId }) {
  logger.debug("[professionals] getting admin presigned url", { documentType, tempId });
  return apiRequest("/users/admin/professional-presigned-url", {
    method: "POST",
    body: JSON.stringify({ documentType, fileName, tempId }),
  });
}

/**
 * Permanently delete a professional account (admin only)
 * DELETE /api/v1/users/:userId/admin-delete
 */
export async function adminDeleteProfessional(userId) {
  logger.debug("[professionals] admin deleting professional", { userId });
  clearEndpointCache("/users");
  return apiRequest(`/users/${userId}/admin-delete`, { method: "DELETE" });
}

/**
 * Archive or unarchive a professional account (admin only)
 * Archive  → accountStatus: "inactive"
 * Unarchive → accountStatus: "active"
 * PATCH /api/v1/users/:userId/admin-account-status
 */
export async function adminUpdateAccountStatus(userId, accountStatus) {
  logger.debug("[professionals] admin updating account status", { userId, accountStatus });
  clearEndpointCache("/users");
  return apiRequest(`/users/${userId}/admin-account-status`, {
    method: "PATCH",
    body: JSON.stringify({ accountStatus }),
  });
}

/**
 * Update any editable field on a professional's profile (admin only)
 * PATCH /api/v1/users/:userId/admin-update
 * Body: { personalInfo?: {...}, professionalInfo?: {...}, firstName?, middleName?, lastName? }
 * Sends only changed fields (partial PATCH).
 */
export async function adminUpdateProfessionalProfile(userId, payload) {
  logger.debug("[professionals] admin updating profile fields", { userId, fields: Object.keys(payload) });
  clearEndpointCache("/users");
  return apiRequest(`/users/${userId}/admin-update`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

/**
 * Get a presigned S3 upload URL for a document on an existing professional's profile (admin only)
 * POST /api/v1/users/:userId/admin-document-presigned-url
 */
export async function adminDocumentPresignedUrl(userId, { documentType, fileName }) {
  return apiRequest(`/users/${userId}/admin-document-presigned-url`, {
    method: "POST",
    body: JSON.stringify({ documentType, fileName }),
  }, { useCache: false });
}

/**
 * Save an uploaded S3 document key to a professional's profile (admin only)
 * PATCH /api/v1/users/:userId/admin-save-document
 */
export async function adminSaveDocument(userId, { documentType, documentKey, experienceType, experienceIndex }) {
  return apiRequest(`/users/${userId}/admin-save-document`, {
    method: "PATCH",
    body: JSON.stringify({ documentType, documentKey, experienceType, experienceIndex }),
  }, { useCache: false });
}

/**
 * Remove a document from a professional's profile (admin only)
 * DELETE /api/v1/users/:userId/admin-document
 */
export async function adminDeleteDocument(userId, { documentType, experienceType, experienceIndex }) {
  return apiRequest(`/users/${userId}/admin-document`, {
    method: "DELETE",
    body: JSON.stringify({ documentType, experienceType, experienceIndex }),
  }, { useCache: false });
}
