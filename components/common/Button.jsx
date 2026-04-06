"use client";

import { useEnterKey } from "@/hooks/useEnterKey";

const baseClasses = `
  flex items-center justify-center gap-2
  font-semibold transition-all duration-200 active:scale-[0.98]
  cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed
  focus:outline-none focus:ring-2 focus:ring-(--color-primary) focus:ring-offset-2
`;

export default function Button({
  children,
  className = "",
  variant = "primary",
  enterKey = false,
  onClick,
  isActive = false,
  type = "button",
  ...props
}) {
  const variants = {
    primary:
      "h-12 w-full rounded-xl px-5 text-14 bg-(--color-primary) text-white hover:bg-(--color-primary-shade-700)",
    secondary:
      "h-12 w-full rounded-xl px-5 text-14 bg-(--color-secondary) text-white hover:bg-(--color-secondary-shade-700)",
    outline:
      "h-12 w-full rounded-xl px-5 text-14 bg-(--pure-white) border border-(--color-primary) text-(--color-primary) hover:bg-(--color-primary-shade-100)",
    subcategory: isActive
      ? "rounded-full px-5 py-2 text-14 border bg-(--color-primary) text-white border-(--color-primary)"
      : "rounded-full px-5 py-2 text-14 border bg-(--pure-white) text-(--color-black-shade-700) border-(--color-black-shade-300) hover:border-(--color-primary) hover:text-(--color-primary)",
  };

  useEnterKey(onClick ?? (() => {}), {
    enabled: enterKey && !props.disabled && !!onClick,
  });

  return (
    <button
      {...props}
      type={type}
      onClick={onClick}
      className={`${baseClasses} ${variants[variant] ?? variants.primary} ${className}`}
    >
      {children}
    </button>
  );
}
