/**
 * Filters an options array to remove already-selected values.
 *
 * @param {string[]} options - Full list of option strings to display.
 * @param {string[] | {name: string}[]} selected - Already-selected values.
 *   Accepts either a flat string array or an array of objects with a `name` property
 *   (as used in ResumeTab skills).
 * @returns {string[]} Options with already-selected items removed.
 */
export function filterSelectedOptions(options, selected) {
  if (!selected.length) return options;
  const selectedSet = new Set(
    selected.map((s) => (typeof s === "string" ? s.toLowerCase() : s.name.toLowerCase()))
  );
  return options.filter((opt) => !selectedSet.has(opt.toLowerCase()));
}
