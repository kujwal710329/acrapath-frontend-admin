"use client";

/**
 * Display-only star rating component.
 * Props:
 *   rating — number 1–5
 */
export default function StarRating({ rating = 0 }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className={i < rating ? "text-amber-400" : "text-(--color-black-shade-200)"}
          aria-hidden="true"
        >
          {i < rating ? "★" : "☆"}
        </span>
      ))}
    </span>
  );
}
