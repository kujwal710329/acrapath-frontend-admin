/**
 * Display helpers for the Professionals admin section
 */

import { API_CONFIG } from "@/utilities/config";

/** ISO date → "7 days ago" / "2h ago" / "Just now" */
export function formatRelativeTime(isoDate) {
  if (!isoDate) return "N/A";
  const diff = Date.now() - new Date(isoDate).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return "Just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d} day${d === 1 ? "" : "s"} ago`;
  const mo = Math.floor(d / 30);
  if (mo < 12) return `${mo} month${mo === 1 ? "" : "s"} ago`;
  return `${Math.floor(mo / 12)}y ago`;
}

/** ISO date → "21 Feb 2026" */
export function formatShortDate(isoDate) {
  if (!isoDate) return "N/A";
  return new Date(isoDate).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** countryCode + contactNo → "+917060061991" */
export function formatContact(countryCode, contactNo) {
  if (!contactNo) return "N/A";
  return countryCode ? `+${countryCode}${contactNo}` : contactNo;
}

/** Numeric years → "Fresher" or "3.2 Years" */
export function formatExperience(exp) {
  const n = Number(exp);
  if (exp === null || exp === undefined || exp === "") return "N/A";
  if (n === 0) return "Fresher";
  return `${exp} Year${n === 1 ? "" : "s"}`;
}

/** cityPreference array → "New Delhi, Ghaziabad" or "N/A" */
export function formatCities(cityArray) {
  if (!Array.isArray(cityArray) || cityArray.length === 0) return "N/A";
  return cityArray.join(", ");
}

/** S3 path → filename only: "1771913817751_SEO_.pdf" */
export function getResumeName(s3Path) {
  if (!s3Path) return null;
  return s3Path.split("/").pop() || null;
}

/** S3 path → full URL or null if base URL not configured */
export function getResumeUrl(s3Path) {
  if (!s3Path || !API_CONFIG.S3_BASE_URL) return null;
  return `${API_CONFIG.S3_BASE_URL}/${s3Path}`;
}

/**
 * Best-effort "open to roles" label from the user object.
 * Uses designation → skills → "N/A"
 */
export function getOpenToRoles(row) {
  const { designation, skills } = row ?? {};
  if (designation && designation !== "N/A") return designation;
  if (Array.isArray(skills) && skills.length > 0) {
    return skills.map((s) => s.name).join(", ");
  }
  return "N/A";
}
