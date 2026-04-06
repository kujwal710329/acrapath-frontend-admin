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
