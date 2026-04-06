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
