"use client";

import Icon from "@/components/common/Icon";

const STEPS = [
  { label: "Personal Info" },
  { label: "Professional Details" },
  { label: "Skills" },
  { label: "Work Experience" },
  { label: "Education" },
  { label: "Documents" },
  { label: "Review & Submit" },
];

export default function ProfessionalHeader({ currentStep }) {
  return (
    <div className="mb-5 w-full">
      <div className="mb-3">
        <h1 className="text-2xl font-semibold text-black">Add Professional</h1>
        <p className="mt-0.5 text-sm text-(--color-black-shade-600)">
          Manually onboard a professional without requiring user sign-up.
        </p>
      </div>

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

                {isActive && (
                  <span className="hidden whitespace-nowrap text-xs font-medium text-(--color-black) sm:inline">
                    {step.label}
                  </span>
                )}
              </div>

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

      <p className="mt-2 text-xs font-medium text-(--color-black-shade-700) sm:hidden">
        Step {currentStep} of {STEPS.length} — {STEPS[currentStep - 1]?.label}
      </p>
    </div>
  );
}
