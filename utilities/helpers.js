/**
 * Utility Helpers for Common Operations
 * Includes: debouncing, formatting, validation, etc.
 */

/**
 * Debounce function - delays function execution after repeated calls
 * @param {Function} func - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Debounced function
 */
export const debounce = (func, delay) => {
  let timeoutId;

  return function debounced(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

/**
 * Throttle function - limits function execution to once per interval
 * @param {Function} func - Function to throttle
 * @param {number} limit - Limit in milliseconds
 * @returns {Function} Throttled function
 */
export const throttle = (func, limit) => {
  let inThrottle;
  return function throttled(...args) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

/**
 * Format salary range
 * @param {number} min - Minimum salary
 * @param {number} max - Maximum salary
 * @param {string} type - Rate type (e.g., "per year")
 * @returns {string} Formatted salary string
 */
export const formatSalary = (min, max, type = "per year") => {
  if (!min || !max) return "Not disclosed";

  const minLacs = (min / 100000).toFixed(0);
  const maxLacs = (max / 100000).toFixed(0);
  const suffix = type === "per year" ? " PA" : "";

  return `${minLacs}–${maxLacs} Lacs${suffix}`;
};

/**
 * Format date to readable format
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date string
 */
export const formatDate = (date) => {
  if (!date) return "";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

/**
 * Format date for time ago display
 * @param {string|Date} date - Date to format
 * @returns {string} Time ago string (e.g., "2 days ago")
 */
export const formatTimeAgo = (date) => {
  if (!date) return "";

  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  let interval = seconds / 31536000;

  if (interval > 1) return Math.floor(interval) + " years ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " months ago";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " days ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " hours ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " minutes ago";

  return Math.floor(seconds) + " seconds ago";
};

/**
 * Safely parse JSON from localStorage
 * @param {string} key - Storage key
 * @param {any} defaultValue - Default value if parsing fails
 * @returns {any} Parsed value or default
 */
export const getFromStorage = (key, defaultValue = null) => {
  try {
    if (typeof window === "undefined") return defaultValue;

    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.warn(`Failed to get ${key} from storage:`, error);
    return defaultValue;
  }
};

/**
 * Safely save to localStorage
 * @param {string} key - Storage key
 * @param {any} value - Value to save
 * @returns {boolean} Success status
 */
export const saveToStorage = (key, value) => {
  try {
    if (typeof window === "undefined") return false;

    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.warn(`Failed to save ${key} to storage:`, error);
    return false;
  }
};

/**
 * Validate email
 * @param {string} email - Email to validate
 * @returns {boolean} Validation result
 */
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number (Indian format)
 * @param {string} phone - Phone number to validate
 * @returns {boolean} Validation result
 */
export const validatePhone = (phone) => {
  const phoneRegex = /^[6-9]\d{9}$/;
  return phoneRegex.test(phone.replace(/\D/g, ""));
};

/**
 * Truncate text to specified length
 * @param {string} text - Text to truncate
 * @param {number} length - Maximum length
 * @param {string} suffix - Suffix (default: "...")
 * @returns {string} Truncated text
 */
export const truncateText = (text, length = 100, suffix = "...") => {
  if (!text) return "";
  return text.length > length ? text.substring(0, length) + suffix : text;
};

/**
 * Check if array has duplicates
 * @param {Array} arr - Array to check
 * @returns {boolean} True if duplicates exist
 */
export const hasDuplicates = (arr) => {
  return new Set(arr).size !== arr.length;
};

/**
 * Remove duplicates from array
 * @param {Array} arr - Array to process
 * @param {string} key - Key for object arrays (optional)
 * @returns {Array} Array without duplicates
 */
export const removeDuplicates = (arr, key = null) => {
  if (key) {
    return [...new Map(arr.map((item) => [item[key], item])).values()];
  }
  return [...new Set(arr)];
};

/**
 * Generate unique ID
 * @returns {string} Unique ID
 */
export const generateId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Deep clone object
 * @param {Object} obj - Object to clone
 * @returns {Object} Cloned object
 */
export const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

/**
 * Merge URL search parameters
 * @param {URLSearchParams} params - Current params
 * @param {Object} updates - Updates to apply
 * @returns {URLSearchParams} Updated params
 */
export const mergeSearchParams = (params, updates) => {
  const newParams = new URLSearchParams(params.toString());

  Object.entries(updates).forEach(([key, value]) => {
    if (value === null || value === undefined) {
      newParams.delete(key);
    } else if (Array.isArray(value)) {
      newParams.delete(key);
      value.forEach((v) => newParams.append(key, v));
    } else {
      newParams.set(key, value);
    }
  });

  return newParams;
};

/**
 * Wait function (like sleep in other languages)
 * @param {number} ms - Milliseconds to wait
 * @returns {Promise} Promise that resolves after delay
 */
export const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Retry function with exponential backoff
 * @param {Function} fn - Function to retry
 * @param {number} maxAttempts - Maximum attempts
 * @param {number} delay - Initial delay in ms
 * @returns {Promise} Result of function
 */
export const retryWithBackoff = async (
  fn,
  maxAttempts = 3,
  delay = 1000
) => {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxAttempts) throw error;

      const backoffDelay = delay * Math.pow(2, attempt - 1);
      await wait(backoffDelay);
    }
  }
};

/**
 * Create a cache key from parameters
 * @param {string} endpoint - API endpoint
 * @param {Object} params - Query parameters
 * @returns {string} Cache key
 */
export const createCacheKey = (endpoint, params = {}) => {
  const sortedParams = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");

  return `${endpoint}?${sortedParams}`;
};
