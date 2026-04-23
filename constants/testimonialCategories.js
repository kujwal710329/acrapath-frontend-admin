// Exact enum values from job.model.js jobCategory field
export const TESTIMONIAL_CATEGORY_VALUES = [
  "development",
  "marketing",
  "sales",
  "design",
  "consultancy",
];

// Human-readable labels for each category value
export const CATEGORY_LABELS = {
  development: "Development",
  marketing: "Marketing",
  sales: "Sales",
  design: "Design",
  consultancy: "Management Consultancy",
};

// Display labels for use in CreatableSelect options array
export const CATEGORY_OPTIONS = TESTIMONIAL_CATEGORY_VALUES.map(
  (v) => CATEGORY_LABELS[v]
);

// Reverse map: display label → enum value (for form submission)
export const LABEL_TO_CATEGORY = Object.fromEntries(
  TESTIMONIAL_CATEGORY_VALUES.map((v) => [CATEGORY_LABELS[v], v])
);

// Badge color styles per category (for table display)
export const CATEGORY_BADGE_STYLES = {
  development:
    "bg-blue-50 text-blue-700 border border-blue-200",
  marketing:
    "bg-purple-50 text-purple-700 border border-purple-200",
  sales:
    "bg-green-50 text-green-700 border border-green-200",
  design:
    "bg-pink-50 text-pink-700 border border-pink-200",
  consultancy:
    "bg-amber-50 text-amber-700 border border-amber-200",
};
