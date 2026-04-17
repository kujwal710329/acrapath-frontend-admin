/**
 * Support Tickets API service
 * Wraps all admin support endpoints
 */

import { apiRequest, clearEndpointCache } from "@/utilities/api";
import { logger } from "@/utilities/logger";

const BASE = "/support";

// ─── Admin helpers ────────────────────────────────────────────────────────────

/**
 * Fetch all tickets with optional filters (admin only)
 * GET /support/admin/all?status=open&category=...&page=1&limit=20&sort=-createdAt
 * Response: { success, data: [...], pagination: {...} }
 */
export async function fetchAllTickets({
  page = 1,
  limit = 20,
  status = "",
  category = "",
  sort = "-createdAt",
} = {}) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    sort,
  });
  if (status) params.set("status", status);
  if (category) params.set("category", category);

  const endpoint = `${BASE}/admin/all?${params.toString()}`;
  logger.debug("[support] fetching all tickets", { page, limit, status, category });

  return apiRequest(endpoint, {}, { useCache: false });
}

/**
 * Fetch single ticket with full replies (admin or owner)
 * GET /support/:ticketId
 * Response: { success, data: { ...ticket, replies: [...] } }
 */
export async function fetchTicketById(ticketId) {
  logger.debug("[support] fetching ticket by id", { ticketId });
  return apiRequest(`${BASE}/${ticketId}`, {}, { useCache: false });
}

/**
 * Add admin reply to a ticket
 * POST /support/admin/:ticketId/reply
 * Body: { message }
 * Response: { success, message, data: { ticketId, status, repliesCount } }
 */
export async function addAdminReply(ticketId, message) {
  logger.debug("[support] adding admin reply", { ticketId });
  clearEndpointCache(BASE);
  return apiRequest(`${BASE}/admin/${ticketId}/reply`, {
    method: "POST",
    body: JSON.stringify({ message }),
  }, { useCache: false });
}

/**
 * Update ticket status (admin only)
 * PATCH /support/admin/:ticketId/status
 * Body: { status: "open" | "in-progress" | "resolved" | "closed" }
 * Response: { success, message, data: { ticketId, status, resolvedAt } }
 */
export async function updateTicketStatus(ticketId, status) {
  logger.debug("[support] updating ticket status", { ticketId, status });
  clearEndpointCache(BASE);
  return apiRequest(`${BASE}/admin/${ticketId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  }, { useCache: false });
}
