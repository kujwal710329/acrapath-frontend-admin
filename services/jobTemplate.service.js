/**
 * Job Template API service (admin)
 * Wraps all /api/v1/job-templates endpoints used by the admin panel.
 */

import { apiRequest, clearEndpointCache } from "@/utilities/api";
import { logger } from "@/utilities/logger";

const BASE = "/job-templates";

/** Bust all job-template list caches */
function bustCache() {
  clearEndpointCache(BASE);
}

/**
 * Fetch paginated list of templates with optional filters.
 * GET /api/v1/job-templates?category=&q=&status=&sort=&page=&limit=
 */
export async function fetchTemplates({ category, q, status, sort, page = 1, limit = 20 } = {}) {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (category) params.set("category", category);
  if (q?.trim()) params.set("q", q.trim());
  if (status) params.set("status", status);
  if (sort) params.set("sort", sort);

  logger.debug("[jobTemplate] fetching list", { category, q, status, page });
  return apiRequest(`${BASE}?${params.toString()}`, {}, { useCache: false });
}

/**
 * Fetch distinct categories with counts.
 * GET /api/v1/job-templates/categories
 */
export async function fetchTemplateCategories() {
  logger.debug("[jobTemplate] fetching categories");
  return apiRequest(`${BASE}/categories`, {}, { useCache: false });
}

/**
 * Fetch a single template by MongoDB _id — admin view (no usageCount increment).
 * GET /api/v1/job-templates/:id/admin
 */
export async function fetchTemplateByIdAdmin(id) {
  logger.debug("[jobTemplate] fetching by id (admin)", { id });
  return apiRequest(`${BASE}/${id}/admin`, {}, { useCache: false });
}

/**
 * Create a new template.
 * POST /api/v1/job-templates
 */
export async function createTemplate(data) {
  logger.debug("[jobTemplate] creating");
  bustCache();
  return apiRequest(BASE, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/**
 * Update a template by MongoDB _id.
 * PUT /api/v1/job-templates/:id
 */
export async function updateTemplate(id, data) {
  logger.debug("[jobTemplate] updating", { id });
  bustCache();
  return apiRequest(`${BASE}/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

/**
 * Soft-delete a template (sets isActive: false).
 * DELETE /api/v1/job-templates/:id
 */
export async function deleteTemplate(id) {
  logger.debug("[jobTemplate] soft-deleting", { id });
  bustCache();
  return apiRequest(`${BASE}/${id}`, { method: "DELETE" });
}

/**
 * Toggle isFeatured on a template.
 * PATCH /api/v1/job-templates/:id/toggle-featured
 */
export async function toggleTemplateFeatured(id) {
  logger.debug("[jobTemplate] toggling featured", { id });
  bustCache();
  return apiRequest(`${BASE}/${id}/toggle-featured`, { method: "PATCH" });
}

/**
 * Toggle isPopular on a template.
 * PATCH /api/v1/job-templates/:id/toggle-popular
 */
export async function toggleTemplatePopular(id) {
  logger.debug("[jobTemplate] toggling popular", { id });
  bustCache();
  return apiRequest(`${BASE}/${id}/toggle-popular`, { method: "PATCH" });
}

/**
 * Toggle isActive on a template.
 * PATCH /api/v1/job-templates/:id/toggle-active
 */
export async function toggleTemplateActive(id) {
  logger.debug("[jobTemplate] toggling active", { id });
  bustCache();
  return apiRequest(`${BASE}/${id}/toggle-active`, { method: "PATCH" });
}

/**
 * Fetch up to 8 template title suggestions for the search dropdown.
 * GET /api/v1/job-templates/suggestions?q=<query>
 */
export async function fetchTemplateSuggestions(q) {
  if (!q?.trim()) return { success: true, data: [] };
  logger.debug("[jobTemplate] fetching suggestions", { q });
  return apiRequest(
    `${BASE}/suggestions?q=${encodeURIComponent(q.trim())}`,
    {},
    { useCache: false }
  );
}
