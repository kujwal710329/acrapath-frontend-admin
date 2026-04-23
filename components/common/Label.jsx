"use client";

export default function Label({
  children,
  required = false,
  subText,
  rightText,
  className = "",
}) {
  return (
    <div className={`mb-2 flex items-start justify-between ${className}`}>
      <div>
        <label className="block text-[0.9375rem] font-medium text-(--color-black-shade-900)">
          {children}
          {required && <span className="ml-1 text-red-500">*</span>}
        </label>

        {subText && (
          <p className="mt-1 text-xs leading-5 text-(--color-black-shade-600)">
            {subText}
          </p>
        )}
      </div>

      {rightText && (
        <span className="text-xs font-medium text-(--color-black-shade-600)">
          {rightText}
        </span>
      )}
    </div>
  );
}
