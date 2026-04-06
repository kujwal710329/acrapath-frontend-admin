import { API_CONFIG, CACHE_CONFIG, ERROR_MESSAGES, HTTP_STATUS } from "./config";
import { logger } from "./logger";
import { retryWithBackoff, createCacheKey } from "./helpers";
import { showError } from "./toast";

/**
 * Enhanced API Request Utility for SaaS Applications
 * Features: Caching, Retry Logic, Request Cancellation, Error Handling
 */

class APIClient {
  constructor() {
    this.cache = new Map();
    this.pendingRequests = new Map();
    this.abortControllers = new Map();
  }

  /**
   * Get cached data if available and not stale
   */
  getFromCache(cacheKey, cacheDuration) {
    const cached = this.cache.get(cacheKey);
    if (!cached) return null;

    const isStale = Date.now() - cached.timestamp > cacheDuration;
    if (isStale && !CACHE_CONFIG.STALE_WHILE_REVALIDATE) {
      this.cache.delete(cacheKey);
      return null;
    }

    return cached.data;
  }

  /**
   * Set cache with timestamp
   */
  setCache(cacheKey, data, cacheDuration) {
    this.cache.set(cacheKey, {
      data,
      timestamp: Date.now(),
      duration: cacheDuration,
    });
  }

  /**
   * Get pending request to avoid duplicates
   */
  getPendingRequest(cacheKey) {
    return this.pendingRequests.get(cacheKey);
  }

  /**
   * Set pending request
   */
  setPendingRequest(cacheKey, promise) {
    this.pendingRequests.set(cacheKey, promise);
  }

  /**
   * Clear pending request
   */
  clearPendingRequest(cacheKey) {
    this.pendingRequests.delete(cacheKey);
  }

  /**
   * Abort ongoing request
   */
  abortRequest(endpoint) {
    const controller = this.abortControllers.get(endpoint);
    if (controller) {
      controller.abort();
      this.abortControllers.delete(endpoint);
    }
  }

  /**
   * Main API request method with all features
   */
  async request(
    endpoint,
    options = {},
    { useCache = true, cacheDuration = CACHE_CONFIG.JOBS_CACHE_TIME } = {}
  ) {
    const cacheKey = createCacheKey(endpoint, options.params);

    // Check cache first
    if (useCache && options.method !== "PATCH" && options.method !== "POST") {
      const cachedData = this.getFromCache(cacheKey, cacheDuration);
      if (cachedData) {
        logger.debug("Returning cached data", { endpoint });
        return cachedData;
      }
    }

    // Check for duplicate pending requests
    const pendingRequest = this.getPendingRequest(cacheKey);
    if (pendingRequest) {
      logger.debug("Returning pending request", { endpoint });
      return pendingRequest;
    }

    // Create new request
    const requestPromise = this._executeRequest(endpoint, options, cacheKey, cacheDuration);

    // Store pending request
    this.setPendingRequest(cacheKey, requestPromise);

    try {
      const data = await requestPromise;
      this.clearPendingRequest(cacheKey);

      // Cache the response
      if (useCache && options.method !== "PATCH" && options.method !== "POST") {
        this.setCache(cacheKey, data, cacheDuration);
      }

      return data;
    } catch (error) {
      this.clearPendingRequest(cacheKey);
      throw error;
    }
  }

  /**
   * Execute the actual API request
   */
  async _executeRequest(endpoint, options, cacheKey, cacheDuration) {
    const token = this._getToken();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

    // Store controller for potential cancellation
    this.abortControllers.set(endpoint, controller);

    try {
      const response = await retryWithBackoff(
        async () => {
          const res = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, {
            ...options,
            signal: controller.signal,
            headers: {
              "Content-Type": "application/json",
              ...(token && { Authorization: `Bearer ${token}` }),
              ...(options.headers || {}),
            },
          });

          return res;
        },
        API_CONFIG.RETRY_ATTEMPTS,
        API_CONFIG.RETRY_DELAY
      );

      clearTimeout(timeoutId);

      let data;
      try {
        data = await response.json();
      } catch (e) {
        logger.warn("Failed to parse response JSON", { endpoint, error: e.message });
        data = null;
      }

      // Handle non-2xx responses
      if (!response.ok) {
        this._handleError(response.status, data);
      }

      logger.debug("API request successful", {
        endpoint,
        status: response.status,
      });

      // Emit global event for bookmark toggles so UI can update in real-time
      try {
        if (typeof window !== "undefined" && endpoint.includes("/jobs/toggle-save") && data && typeof data.action === "string") {
          let jobId = null;
          try {
            // attempt to extract jobId from response or request body
            jobId = data.jobId || data?.data?.jobId || null;
            if (!jobId && options && typeof options.body === "string") {
              const parsed = JSON.parse(options.body);
              jobId = parsed?.jobId || parsed?._id || parsed?.id || null;
            }
          } catch (e) {
            // ignore parse errors
          }

          // clear ALL saved jobs caches so lists fetch fresh data
          try {
            // Clear various cache patterns for saved jobs
            this.clearCacheForEndpoint("/jobs/saved");
            // Also try with trailing slashes and variations
            const keysToDelete = Array.from(this.cache.keys()).filter((key) =>
              key.includes("/jobs/saved") || key.includes("toggle-save")
            );
            keysToDelete.forEach((key) => this.cache.delete(key));
          } catch (e) {
            // Non-fatal
          }

          window.dispatchEvent(
            new CustomEvent("job:bookmark-changed", {
              detail: { jobId, action: data.action },
              bubbles: true,
              composed: true,
            })
          );
        }
      } catch (e) {
        // non-fatal
      }

      // Emit global event for job applications so UI can update in real-time
      try {
        if (typeof window !== "undefined" && endpoint.includes("/jobs/apply") && data && data.jobId) {
          let jobId = null;
          try {
            // attempt to extract jobId from response or request body
            jobId = data.jobId || data?.data?.jobId || null;
            if (!jobId && options && typeof options.body === "string") {
              const parsed = JSON.parse(options.body);
              jobId = parsed?.jobId || parsed?._id || parsed?.id || null;
            }
          } catch (e) {
            // ignore parse errors
          }

          // clear applied jobs caches so lists fetch fresh data
          try {
            this.clearCacheForEndpoint("/jobs/applied");
            // Also clear specific user applied jobs if userId is available
            const keysToDelete = Array.from(this.cache.keys()).filter((key) =>
              key.includes("/jobs/applied")
            );
            keysToDelete.forEach((key) => this.cache.delete(key));
          } catch (e) {
            // Non-fatal
          }

          window.dispatchEvent(
            new CustomEvent("job:apply-changed", {
              detail: { jobId, action: "applied" },
              bubbles: true,
              composed: true,
            })
          );
        }
      } catch (e) {
        // non-fatal
      }

      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      this.abortControllers.delete(endpoint);

      if (error.name === "AbortError") {
        logger.error("Request timeout", { endpoint });
        showError(ERROR_MESSAGES.TIMEOUT_ERROR);
        throw new Error(ERROR_MESSAGES.TIMEOUT_ERROR);
      }

      logger.error("API request failed", {
        endpoint,
        error: error.message,
      });

      // isApiError means _handleError already showed a toast — don't double-fire
      if (!error.isApiError) {
        showError(error.message || ERROR_MESSAGES.API_ERROR);
      }

      throw error;
    }
  }

  /**
   * Handle API errors based on status code
   */
  _handleError(status, data) {
    const errorMessage = data?.message || ERROR_MESSAGES.API_ERROR;

    // Helper: create an error that is already toast-handled so the outer
    // _executeRequest catch does not fire showError a second time.
    const apiError = (message) => {
      const err = new Error(message);
      err.isApiError = true;
      return err;
    };

    switch (status) {
      case HTTP_STATUS.UNAUTHORIZED: {
        // Don't redirect when on auth pages (login / otp / onboarding) — wrong
        // On every other route (dashboard, etc.) a 401 means the session is gone
        // or was never present, so always send the user back to login.
        const isAuthPage =
          typeof window !== "undefined" &&
          (window.location.pathname === "/login" ||
            window.location.pathname.startsWith("/otp") ||
            window.location.pathname.startsWith("/onboarding"));

        if (!isAuthPage) {
          this._handleUnauthorized();
          showError(ERROR_MESSAGES.AUTH_ERROR);
        }
        throw apiError(data?.message || ERROR_MESSAGES.AUTH_ERROR);
      }

      case HTTP_STATUS.FORBIDDEN:
        showError(ERROR_MESSAGES.PERMISSION_ERROR);
        throw apiError(ERROR_MESSAGES.PERMISSION_ERROR);

      case HTTP_STATUS.NOT_FOUND:
        showError(ERROR_MESSAGES.NOT_FOUND);
        throw apiError(ERROR_MESSAGES.NOT_FOUND);

      case HTTP_STATUS.CONFLICT:
        showError(errorMessage || "Resource conflict");
        throw apiError(errorMessage || "Resource conflict");

      case HTTP_STATUS.TOO_MANY_REQUESTS:
        logger.warn("Rate limited", { retryAfter: data?.retryAfter });
        showError("Too many requests. Please try again later.");
        throw apiError("Too many requests. Please try again later.");

      case HTTP_STATUS.BAD_REQUEST:
        showError(ERROR_MESSAGES.VALIDATION_ERROR);
        throw apiError(ERROR_MESSAGES.VALIDATION_ERROR);

      default:
        if (status >= 500) {
          showError(ERROR_MESSAGES.SERVER_ERROR);
          throw apiError(ERROR_MESSAGES.SERVER_ERROR);
        }
        showError(errorMessage);
        throw apiError(errorMessage);
    }
  }

  /**
   * Handle unauthorized errors (token expired, etc)
   */
  _handleUnauthorized() {
    // Clear auth data
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      // Redirect to login
      window.location.href = "/login";
    }
  }

  /**
   * Get token from storage
   */
  _getToken() {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("token");
  }

  /**
   * Clear all cache
   */
  clearCache() {
    this.cache.clear();
    logger.debug("Cache cleared");
  }

  /**
   * Clear cache for specific endpoint
   */
  clearCacheForEndpoint(endpoint) {
    const keysToDelete = Array.from(this.cache.keys()).filter((key) =>
      key.startsWith(endpoint)
    );

    keysToDelete.forEach((key) => this.cache.delete(key));
    logger.debug("Cache cleared for endpoint", { endpoint });
  }
}

// Export singleton instance
const apiClient = new APIClient();

/**
 * Public API to make requests
 * @param {string} endpoint - API endpoint
 * @param {Object} options - Fetch options (method, body, headers, etc)
 * @param {Object} cacheOptions - Cache configuration {useCache, cacheDuration}
 */
export async function apiRequest(endpoint, options = {}, cacheOptions = {}) {
  return apiClient.request(endpoint, options, cacheOptions);
}

/**
 * Cancel ongoing request
 */
export function cancelRequest(endpoint) {
  apiClient.abortRequest(endpoint);
}

/**
 * Clear all API cache
 */
export function clearAPICache() {
  apiClient.clearCache();
}

/**
 * Clear cache for specific endpoint
 */
export function clearEndpointCache(endpoint) {
  apiClient.clearCacheForEndpoint(endpoint);
}
