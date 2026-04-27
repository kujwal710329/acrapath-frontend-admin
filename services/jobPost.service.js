/**
 * Job Post API service
 * Wraps the admin job-posts endpoints with correct params per tab
 */

import { apiRequest, clearEndpointCache } from "@/utilities/api";
import { logger } from "@/utilities/logger";

/** Maps tab key → status query value */
export const JOB_POST_TAB_STATUS_MAP = {
  currentPost: "active",
  request: "requests",
  rejected: "rejected",
  topVerified: "active", // fetches active jobs; toggle column shown in TopVerifiedJobsTable
};

/**
 * Fetch paginated list of job posts for a given tab
 * GET /api/v1/jobs?status=...&page=...&limit=...&search=...
 */
export async function fetchJobPosts({
  tab = "currentPost",
  page = 1,
  limit = 20,
  search = "",
} = {}) {
  const params = new URLSearchParams({
    status: JOB_POST_TAB_STATUS_MAP[tab] ?? "active",
    page: String(page),
    limit: String(limit),
  });
  if (search.trim()) params.set("search", search.trim());

  const endpoint = `/jobs?${params.toString()}`;
  logger.debug("[jobPosts] fetching", { tab, page, limit, search });

  return apiRequest(endpoint, {}, { useCache: false });
}

/**
 * Toggle dreamjob (top verified) flag on a job
 * PATCH /api/v1/jobs/:jobId/toggle-dreamjob
 * Response: { success, message, data: { jobId, dreamjob } }
 */
export async function toggleDreamjob(jobId) {
  logger.debug("[jobPosts] toggling dreamjob", { jobId });
  clearEndpointCache("/jobs");
  return apiRequest(`/jobs/${jobId}/toggle-dreamjob`, {
    method: "PATCH",
  });
}

/**
 * Update a job post's status
 * PATCH /api/v1/jobs/:id/admin-status
 */
export async function updateJobPostStatus(jobId, status) {
  logger.debug("[jobPosts] updating status", { jobId, status });
  clearEndpointCache("/jobs");
  return apiRequest(`/jobs/${jobId}/admin-status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

/**
 * Permanently delete a job post (admin only)
 * DELETE /api/v1/jobs/:jobId
 */
export async function adminDeleteJob(jobId) {
  logger.debug("[jobPosts] admin deleting job", { jobId });
  clearEndpointCache("/jobs");
  return apiRequest(`/jobs/${jobId}`, { method: "DELETE" });
}

/**
 * Update any editable field on a job post (admin only)
 * Bypasses the restricted-fields list (jobTitle, jobType) that applies to employer edits.
 * PATCH /api/v1/jobs/:jobId/admin-update
 * Body: any subset of job model fields (partial PATCH — only send changed fields)
 */
export async function adminUpdateJobPost(jobId, payload) {
  logger.debug("[jobPosts] admin updating job fields", { jobId, fields: Object.keys(payload) });
  clearEndpointCache("/jobs");
  return apiRequest(`/jobs/${jobId}/admin-update`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}
