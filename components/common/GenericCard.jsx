"use client";

import React from "react";

export default function GenericCard({
  children,
  size = "xl",          // predefined sizes
  width,                // custom width (w-[])
  height,               // custom height (h-[])
  padding = "p-6 md:p-8", // override to "p-0" for image-flush cards
  className = "",
}) {
  const sizeMap = {
    sm: "max-w-md",
    md: "max-w-3xl",
    lg: "max-w-5xl",
    xl: "max-w-7xl",
    full: "max-w-full",
  };

  return (
    <div
      className={`
        mx-auto
        ${width ? width : `w-full ${sizeMap[size]}`}
        ${height ? height : ""}
        rounded-2xl
        border border-(--color-black-shade-200)
        bg-(--pure-white)
        ${padding}
        shadow-sm
        transition-all duration-300
        hover:shadow-md
        ${className}
      `}
    >
      {children}
    </div>
  );
}
