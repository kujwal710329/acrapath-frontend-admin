/**
 * Library API service
 * Wraps the admin-library endpoints. All write calls clear the endpoint cache.
 *
 * Upload flow for books (S3 presigned URLs):
 *   1. POST /admin-library/books → backend returns presigned PUT URLs + bookId
 *   2. PUT files directly to S3 via uploadToS3() (raw fetch — no auth header)
 */

import { apiRequest, clearEndpointCache } from "@/utilities/api";
import { logger } from "@/utilities/logger";

const BASE = "/admin-library/books";

/**
 * Admin: fetch all books (active + inactive) with optional filters.
 * GET /api/v1/admin-library/books/manage-all
 */
export async function fetchBooksAdmin({
  page = 1,
  limit = 20,
  category,
  isActive,
  sort,
} = {}) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  if (category && category !== "all") params.set("category", category);
  if (isActive !== undefined && isActive !== null)
    params.set("isActive", String(isActive));
  if (sort) params.set("sort", sort);

  logger.debug("[library] fetching books", { page, limit, category, isActive });
  return apiRequest(`${BASE}/manage-all?${params.toString()}`, {}, { useCache: false });
}

/**
 * Create a new book and receive S3 presigned upload URLs.
 * POST /api/v1/admin-library/books
 * Response: { bookId, documentUploadUrl, documentKey, coverUploadUrl?, coverImageKey?, expiresIn }
 */
export async function createBook({
  title,
  authorName,
  category,
  pages,
  description,
  documentFileName,
  coverFileName,
}) {
  const body = { title, authorName, category, documentFileName };
  if (pages !== undefined && pages !== "" && pages !== null)
    body.pages = Number(pages);
  if (description?.trim()) body.description = description.trim();
  if (coverFileName) body.coverFileName = coverFileName;

  logger.debug("[library] creating book", { title });
  clearEndpointCache(BASE);
  return apiRequest(BASE, { method: "POST", body: JSON.stringify(body) }, { useCache: false });
}

/**
 * Update book metadata (title, authorName, category, pages, description, isActive).
 * PATCH /api/v1/admin-library/books/:bookId
 */
export async function updateBook(bookId, updates) {
  logger.debug("[library] updating book", { bookId, updates });
  clearEndpointCache(BASE);
  return apiRequest(
    `${BASE}/${bookId}`,
    { method: "PATCH", body: JSON.stringify(updates) },
    { useCache: false }
  );
}

/**
 * Replace cover image — returns a new S3 presigned PUT URL.
 * PATCH /api/v1/admin-library/books/:bookId/cover
 * Response: { coverUploadUrl, coverImageKey, expiresIn }
 */
export async function updateBookCover(bookId, { coverFileName }) {
  logger.debug("[library] updating book cover", { bookId });
  return apiRequest(
    `${BASE}/${bookId}/cover`,
    { method: "PATCH", body: JSON.stringify({ coverFileName }) },
    { useCache: false }
  );
}

/**
 * Soft-delete a book (sets isActive = false).
 * DELETE /api/v1/admin-library/books/:bookId
 */
export async function deleteBook(bookId) {
  logger.debug("[library] deleting book", { bookId });
  clearEndpointCache(BASE);
  return apiRequest(`${BASE}/${bookId}`, { method: "DELETE" }, { useCache: false });
}

/**
 * Upload a file directly to S3 using a presigned PUT URL.
 * Must NOT go through apiRequest — presigned URLs need no auth header
 * and expect the file binary as the body with matching Content-Type.
 */
export async function uploadToS3(presignedUrl, file) {
  const response = await fetch(presignedUrl, {
    method: "PUT",
    body: file,
    headers: { "Content-Type": file.type },
  });
  if (!response.ok) {
    throw new Error(`S3 upload failed (status ${response.status})`);
  }
}
