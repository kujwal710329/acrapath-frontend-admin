"use client";

import { useRouter } from "next/navigation";
import Icon from "@/components/common/Icon";

/**
 * FixedBackButton
 *
 * A circular back button that stays fixed on screen while scrolling.
 *
 * Props:
 *   variant  — "default"   (public pages, no sidebar)
 *              "admin"     (admin panel: sidebar w-42 + header h-18)
 *              "dashboard" (dashboard: sidebar md:ml-17.5 + header pt-20)
 *   onClick  — optional override; defaults to router.back()
 */
const POSITION_CLASSES = {
  default:   "top-6 left-6",
  admin:     "top-[calc(4.5rem+0.75rem)] left-4 lg:top-[calc(4.5rem+1.25rem)] lg:left-[calc(10.5rem+1.5rem)]",
  dashboard: "top-[calc(5rem+0.75rem)] left-4 lg:top-[calc(5rem+1.25rem)] lg:left-[calc(4.375rem+1.5rem)]",
};

export default function FixedBackButton({ variant = "default", onClick }) {
  const router = useRouter();

  const positionClass = POSITION_CLASSES[variant] ?? POSITION_CLASSES.default;

  return (
    <button
      onClick={onClick ?? (() => router.back())}
      aria-label="Go back"
      className={`fixed z-50 w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95 ${positionClass}`}
      style={{
        background: "var(--color-black-shade-100)",
        border: "1px solid var(--color-black-shade-200)",
        boxShadow: "0 2px 8px rgba(0,0,0,0.10)",
      }}
    >
      <Icon name="statics/login/back-icon.svg" width={10} height={10} alt="Back" />
    </button>
  );
}
