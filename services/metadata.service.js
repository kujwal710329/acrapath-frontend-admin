/**
 * Metadata API service
 * Wraps /api/v1/metadata endpoints for admin metadata management
 */

import { apiRequest, clearEndpointCache } from "@/utilities/api";
import { logger } from "@/utilities/logger";

const BASE = "/metadata";

function clearMetadataCache() {
  clearEndpointCache(BASE);
}

// Fetch options that bypass both the JS-level cache and the browser's HTTP cache.
// "cache: no-store" prevents Chrome from serving a stale cached response
// (visible as "Provisional headers are shown" in DevTools).
const NO_CACHE_OPTS = { cache: "no-store" };

/**
 * Fetch all metadata types at once
 * GET /api/v1/metadata/all
 */
export async function getAllMetadata() {
  logger.debug("[metadata] fetching all");
  return apiRequest(`${BASE}/all`, NO_CACHE_OPTS, { useCache: false });
}

/**
 * Fetch a single metadata type
 * GET /api/v1/metadata/:type
 */
export async function getMetadataByType(type) {
  logger.debug("[metadata] fetching type", { type });
  return apiRequest(`${BASE}/${type}`, NO_CACHE_OPTS, { useCache: false });
}

/**
 * Create or upsert a single metadata type
 * POST /api/v1/metadata/seed
 */
export async function seedMetadata(type, values) {
  logger.debug("[metadata] seeding type", { type });
  clearMetadataCache();
  return apiRequest(`${BASE}/seed`, {
    method: "POST",
    body: JSON.stringify({ type, values }),
  });
}

/**
 * Full replace of a metadata type's values
 * PUT /api/v1/metadata/:type
 */
export async function updateMetadata(type, values) {
  logger.debug("[metadata] replacing type", { type });
  clearMetadataCache();
  return apiRequest(`${BASE}/${type}`, {
    method: "PUT",
    body: JSON.stringify({ values }),
  });
}

/**
 * Add a single item to a metadata type.
 * - Array types  → body: { item: "string value" }
 * - Object types → body: { category: "...", value: "..." }  (sent as-is)
 * PATCH /api/v1/metadata/:type/add
 */
export async function addMetadataItem(type, item) {
  logger.debug("[metadata] adding item", { type, item });
  clearMetadataCache();
  const body = typeof item === "string" ? { item } : item;
  return apiRequest(`${BASE}/${type}/add`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

/**
 * Remove a single item from a metadata type.
 * - Array types  → body: { item: "string value" }
 * - Object types → body: { category: "...", value: "..." }  (sent as-is)
 * PATCH /api/v1/metadata/:type/remove
 */
export async function removeMetadataItem(type, item) {
  logger.debug("[metadata] removing item", { type, item });
  clearMetadataCache();
  const body = typeof item === "string" ? { item } : item;
  return apiRequest(`${BASE}/${type}/remove`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

/**
 * Bulk upsert all metadata types at once
 * POST /api/v1/metadata/seed-all
 */
export async function seedAllMetadata(payload) {
  logger.debug("[metadata] seeding all types");
  clearMetadataCache();
  return apiRequest(`${BASE}/seed-all`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
