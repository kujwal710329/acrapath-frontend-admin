/**
 * Testimonials API service
 * Wraps the admin testimonials endpoints
 */

import { apiRequest, clearEndpointCache } from "@/utilities/api";
import { logger } from "@/utilities/logger";

/**
 * Fetch paginated list of all testimonials (admin)
 * GET /api/v1/testimonials/admin/all?page=1&limit=20&search=
 * Response: { success, count, total, data: [...], pagination: {...} }
 */
export async function fetchAllTestimonials({ page = 1, limit = 20, search = "" } = {}) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  if (search.trim()) params.set("search", search.trim());

  const endpoint = `/testimonials/admin/all?${params.toString()}`;
  logger.debug("[testimonials] fetching all", { page, limit, search });

  return apiRequest(endpoint, {}, { useCache: false });
}

/**
 * Fetch paginated list of featured testimonials (public)
 * GET /api/v1/testimonials?featured=true&page=1&limit=20
 * Response: { success, count, total, data: [...] }
 */
export async function fetchFeaturedTestimonials({ page = 1, limit = 20 } = {}) {
  const params = new URLSearchParams({
    featured: "true",
    page: String(page),
    limit: String(limit),
  });

  const endpoint = `/testimonials?${params.toString()}`;
  logger.debug("[testimonials] fetching featured", { page, limit });

  return apiRequest(endpoint, {}, { useCache: false });
}

/**
 * Toggle featured status for a testimonial
 * PATCH /api/v1/testimonials/:id/toggle-featured
 * Response: { success, message, data: { _id, isFeatured, ... } }
 */
export async function toggleFeaturedStatus(testimonialId) {
  logger.debug("[testimonials] toggling featured status", { testimonialId });
  clearEndpointCache("/testimonials");
  return apiRequest(`/testimonials/${testimonialId}/toggle-featured`, {
    method: "PATCH",
  });
}

/**
 * Create a new testimonial (admin)
 * POST /api/v1/testimonials
 * Body: { title, content, rating, userName, designation, companyName, userRole }
 * Response: { success, message, data: { _id, title, content, ... } }
 */
export async function adminCreateTestimonial({ title, content, rating, userName, designation, companyName, userRole }) {
  logger.debug("[testimonials] creating testimonial", { title });
  clearEndpointCache("/testimonials");
  return apiRequest("/testimonials", {
    method: "POST",
    body: JSON.stringify({ title, content, rating, userName, designation, companyName, userRole }),
  }, { useCache: false });
}

/**
 * Permanently delete a testimonial (admin)
 * DELETE /api/v1/testimonials/:id/admin-delete
 * Response: { success, message: "Testimonial permanently deleted." }
 */
export async function adminDeleteTestimonial(testimonialId) {
  logger.debug("[testimonials] deleting testimonial", { testimonialId });
  clearEndpointCache("/testimonials");
  return apiRequest(`/testimonials/${testimonialId}/admin-delete`, {
    method: "DELETE",
  });
}
