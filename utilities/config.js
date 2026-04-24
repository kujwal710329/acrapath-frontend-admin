/**
 * Centralized Configuration Constants for SaaS Dashboard
 * This is the single source of truth for all app configurations
 */

// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api/v1",
  S3_BASE_URL: process.env.NEXT_PUBLIC_S3_BASE_URL || "",
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
  EXPONENTIAL_BACKOFF: true,
  BACKOFF_MULTIPLIER: 2,
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  JOBS_PAGE_SIZE: 6,
  MAX_PAGE_SIZE: 100,
};

// Cache Configuration
export const CACHE_CONFIG = {
  PROFILE_CACHE_TIME: 5 * 60 * 1000, // 5 minutes
  JOBS_CACHE_TIME: 2 * 60 * 1000, // 2 minutes
  SEARCH_CACHE_TIME: 1 * 60 * 1000, // 1 minute
  STALE_WHILE_REVALIDATE: true,
};

// Debounce Configuration
export const DEBOUNCE_CONFIG = {
  SEARCH_DELAY: 500, // ms
  FILTER_DELAY: 300, // ms
  INPUT_DELAY: 300, // ms
};

// Filter Options (Centralized from FilterDrawer)
export const FILTER_OPTIONS = {
  jobLocationType: [
    { label: "Onsite", value: "onsite" },
    { label: "Remote", value: "remote" },
    { label: "Hybrid", value: "hybrid" },
  ],
  city: [
    { label: "Delhi", value: "Delhi" },
    { label: "Mumbai", value: "Mumbai" },
    { label: "Gurugram", value: "Gurugram" },
    { label: "Hyderabad", value: "Hyderabad" },
    { label: "Bangalore", value: "Bangalore" },
  ],
  experienceLevel: [
    { label: "Entry Level", value: "entry-level" },
    { label: "Mid Level", value: "mid-level" },
    { label: "Senior Level", value: "senior-level" },
  ],
  companyName: [
    { label: "PixelCraft Solutions", value: "PixelCraft Solutions" },
    { label: "Google", value: "Google" },
    { label: "Amazon", value: "Amazon" },
    { label: "Oracle", value: "Oracle" },
  ],
};

// Filter Menu Structure
export const FILTER_MENU = [
  { label: "Work Mode", key: "jobLocationType" },
  { label: "Location", key: "city" },
  { label: "Experience", key: "experienceLevel" },
  { label: "Company", key: "companyName" },
];

// Dashboard Menu Items
export const DASHBOARD_MENU = [
  {
    name: "Home",
    icon: "static/Icons/Dashboard/Group 1231.svg",
    href: "/dashboard/home",
  },
  {
    name: "Profile",
    icon: "static/Icons/Dashboard/Group 1232.svg",
    href: "/dashboard/profile",
  },
  {
    name: "Jobs",
    icon: "static/Icons/Dashboard/Group 1233.svg",
    href: "/dashboard/jobs",
  },
  {
    name: "Library",
    icon: "static/Icons/Dashboard/Group 1234.svg",
    href: "/dashboard/library",
  },
  {
    name: "Support",
    icon: "static/Icons/Dashboard/Group 1236.svg",
    href: "/dashboard/support",
  },
];

// Admin Dashboard Menu Items
export const ADMIN_MENU = [
  { name: "Overview", href: "/admin/overview" },
  { name: "Professionals", href: "/admin/professionals" },
  { name: "Employer", href: "/admin/employer" },
  { name: "Job Post", href: "/admin/job-post" },
  { name: "Support", href: "/admin/support" },
  { name: "Testimonials", href: "/admin/testimonials" },
  { name: "Library", href: "/admin/library" },
  { name: "Metadata", href: "/admin/metadata" },
];

// Error Messages
export const ERROR_MESSAGES = {
  API_ERROR: "Something went wrong. Please try again.",
  NETWORK_ERROR: "Network connection failed. Please check your internet.",
  AUTH_ERROR: "Authentication failed. Please login again.",
  NOT_FOUND: "Resource not found.",
  VALIDATION_ERROR: "Please check your input and try again.",
  SERVER_ERROR: "Server error. Please try again later.",
  TIMEOUT_ERROR: "Request timed out. Please try again.",
  FILE_UPLOAD_ERROR: "File upload failed. Please try again.",
  PERMISSION_ERROR: "You don't have permission to perform this action.",
};

// Success Messages
export const SUCCESS_MESSAGES = {
  SAVE_SUCCESS: "Saved successfully!",
  UPDATE_SUCCESS: "Updated successfully!",
  DELETE_SUCCESS: "Deleted successfully!",
  UPLOAD_SUCCESS: "Uploaded successfully!",
};

// Local Storage Keys
export const STORAGE_KEYS = {
  TOKEN: "token",
  USER: "user",
  RECENT_JOBS: "recentJobs",
  PROFILE_DATA: "profileData",
  SEARCH_HISTORY: "searchHistory",
};

// Profile Tabs
export const PROFILE_TABS = [
  { key: "profile", label: "Profile" },
  { key: "resume", label: "Resume" },
  { key: "documents", label: "Documents" },
  { key: "analytics", label: "Analytics" },
];

// Job Tabs
export const JOB_TABS = [
  { key: "recommended", label: "Recommended" },
  { key: "applied", label: "Applied" },
  { key: "bookmarked", label: "Bookmarked" },
];

// File Upload Configuration
export const FILE_UPLOAD_CONFIG = {
  RESUME_TYPES: [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
  IMAGE_TYPES: ["image/jpeg", "image/jpg", "image/png"],
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_EXTENSIONS: [".pdf", ".doc", ".docx", ".jpg", ".jpeg", ".png"],
};

// Animation Durations
export const ANIMATIONS = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
};

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  TOO_MANY_REQUESTS: 429,
  SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
};
