"use client";

import Icon from "@/components/common/Icon";
import Button from "@/components/common/Button";

// 5 steps matching Figma exactly
const STEPS = [
  { label: "Job Details" },
  { label: "Professional Requirements" },
  { label: "Interview Information" },
  { label: "Job Review" },
  { label: "Publish" },
];

export default function JobPostHeader({
  currentStep = 1,
  onUseTemplate,
}) {
  return (
    <div className="mb-5 w-full">
      {/* ── Row 1: Title + Use Template ─────────────────────────────────── */}
      <div className="mb-3 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-black">Post a job</h1>
        {currentStep === 1 && onUseTemplate && (
          <Button
            variant="outline"
            type="button"
            onClick={onUseTemplate}
            className="h-8! w-auto! min-w-0! rounded-md! px-4! text-xs! font-semibold!"
          >
            Use Template
          </Button>
        )}
      </div>

      {/* ── Row 2: Steps progress bar (full width) ───────────────────────── */}
      <div className="flex w-full items-center">
        {STEPS.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isActive = stepNumber === currentStep;
          const isLast = index === STEPS.length - 1;

          return (
            <div
              key={step.label}
              className={`flex items-center ${!isLast ? "min-w-0 flex-1" : "shrink-0"}`}
            >
              {/* Circle + optional label */}
              <div className="flex shrink-0 items-center gap-1.5">
                <div
                  aria-current={isActive ? "step" : undefined}
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors
                    ${
                      isCompleted
                        ? "bg-(--color-secondary) text-(--pure-white)"
                        : isActive
                          ? "bg-(--color-primary) text-(--pure-white)"
                          : "border border-(--color-black-shade-300) bg-(--pure-white) text-(--color-black-shade-600)"
                    }`}
                >
                  {isCompleted ? (
                    <Icon
                      name="statics/login/right-icon.svg"
                      width={10}
                      height={10}
                      alt="Done"
                    />
                  ) : (
                    <span>{stepNumber}</span>
                  )}
                </div>

                {/* Label only for the active step */}
                {isActive && (
                  <span className="hidden whitespace-nowrap text-xs font-medium text-(--color-black) sm:inline">
                    {step.label}
                  </span>
                )}
              </div>

              {/* Connector line stretches to fill remaining space */}
              {!isLast && (
                <div
                  className={`mx-2 h-px flex-1 transition-colors ${
                    isCompleted
                      ? "bg-(--color-secondary)"
                      : "bg-(--color-black-shade-200)"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile: current step name below bar */}
      <p className="mt-2 text-xs font-medium text-(--color-black-shade-700) sm:hidden">
        Step {currentStep} of {STEPS.length} — {STEPS[currentStep - 1]?.label}
      </p>
    </div>
  );
}
