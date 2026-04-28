/**
 * Utilities for salary input sanitization, formatting, and blocking non-numeric input.
 */
export function sanitizeSalaryInput(value) {
  if (value == null) return "";
  return String(value).replace(/\D+/g, "");
}

// Format a raw number/digit string to Indian comma format: 1660000 → "16,60,000"
export function formatIndianNumber(value) {
  if (!value && value !== 0) return "";
  const num = String(value).replace(/,/g, "");
  if (!num || isNaN(num)) return "";
  const lastThree = num.slice(-3);
  const remaining = num.slice(0, -3);
  if (!remaining) return lastThree;
  return remaining.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + "," + lastThree;
}

// Strip commas and return integer — use before sending to API
export function parseSalaryNumber(formattedValue) {
  if (!formattedValue) return 0;
  return parseInt(String(formattedValue).replace(/,/g, ""), 10) || 0;
}

// Return human-readable shorthand: 1660000 → "16.6 lakh"
export function salaryInWords(rawValue) {
  if (!rawValue) return "";
  const num = parseInt(String(rawValue).replace(/,/g, ""), 10);
  if (!num || num <= 0) return "";
  if (num >= 10000000) {
    const val = num / 10000000;
    return `${val % 1 === 0 ? val : parseFloat(val.toFixed(2))} crore`;
  }
  if (num >= 100000) {
    const val = num / 100000;
    return `${val % 1 === 0 ? val : parseFloat(val.toFixed(2))} lakh`;
  }
  if (num >= 1000) {
    const val = num / 1000;
    return `${val % 1 === 0 ? val : parseFloat(val.toFixed(2))} thousand`;
  }
  return `${num}`;
}

export function handleSalaryKeyDown(e) {
  const allowedKeys = ["Backspace", "Tab", "ArrowLeft", "ArrowRight", "Delete", "Home", "End"];
  if (allowedKeys.includes(e.key)) return;
  if ((e.ctrlKey || e.metaKey) && ["a", "c", "v", "x", "A", "C", "V", "X"].includes(e.key)) return;
  if (!/^[0-9]$/.test(e.key)) e.preventDefault();
}
