// Exact enum values from adminBook.model.js category field
export const BOOK_CATEGORY_VALUES = [
  "Popular",
  "Marketing",
  "Development",
  "Sales",
  "Consultancy",
];

export const BOOK_CATEGORY_LABELS = {
  Popular: "Popular",
  Marketing: "Marketing",
  Development: "Development",
  Sales: "Sales",
  Consultancy: "Consultancy",
};

// For CreatableSelect options (array of display labels)
export const BOOK_CATEGORY_OPTIONS = BOOK_CATEGORY_VALUES.map(
  (v) => BOOK_CATEGORY_LABELS[v]
);

// Reverse map: display label → enum value (for form submission)
export const LABEL_TO_BOOK_CATEGORY = Object.fromEntries(
  BOOK_CATEGORY_VALUES.map((v) => [BOOK_CATEGORY_LABELS[v], v])
);

// Badge color styles per category (for table display)
export const BOOK_CATEGORY_BADGE_STYLES = {
  Popular: "bg-amber-50 text-amber-700 border border-amber-200",
  Marketing: "bg-purple-50 text-purple-700 border border-purple-200",
  Development: "bg-blue-50 text-blue-700 border border-blue-200",
  Sales: "bg-green-50 text-green-700 border border-green-200",
  Consultancy: "bg-pink-50 text-pink-700 border border-pink-200",
};
