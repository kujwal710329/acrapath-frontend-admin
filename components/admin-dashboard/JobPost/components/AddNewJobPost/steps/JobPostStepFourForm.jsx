"use client";

import { useState } from "react";
import Button from "@/components/common/Button";
import Heading from "@/components/common/Heading";
import Text from "@/components/common/Text";
import Icon from "@/components/common/Icon";
import InfoTooltip from "@/components/common/InfoTooltip";

// ── Sub-components ────────────────────────────────────────────────────────────

// Section icon — uses job_review.svg for all three section headers
function SectionIcon() {
  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
      <Icon
        name="statics/Employer-Dashboard/job_review.svg"
        width={20}
        height={20}
        alt=""
      />
    </div>
  );
}

// Chevron for collapse/expand
function ChevronIcon({ open }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={`transition-transform ${open ? "rotate-0" : "-rotate-90"}`}
    >
      <polyline points="18 15 12 9 6 15" />
    </svg>
  );
}

// Collapsible review section — card layout matching Figma
function ReviewSection({ title, onEdit, children }) {
  const [open, setOpen] = useState(true);

  return (
    <div className="mb-4 overflow-hidden rounded-2xl border border-(--color-black-shade-100) bg-white">
      {/* Header row */}
      <div
        className={`flex items-center justify-between px-5 py-4 ${open ? "border-b border-(--color-black-shade-100)" : ""}`}
      >
        <div className="flex items-center gap-3">
          <SectionIcon />
          <h3 className="text-[1rem] font-semibold text-black">{title}</h3>
        </div>
        <div className="flex items-center gap-2.5">
          {onEdit && (
            <button
              type="button"
              onClick={onEdit}
              className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-(--color-black-shade-200) px-3 py-1.5 text-sm font-medium text-(--color-black-shade-700) transition-colors hover:border-(--color-primary) hover:text-(--color-primary)"
              aria-label={`Edit ${title}`}
            >
              <Icon
                name="statics/Employee-Dashboard/pencil.svg"
                width={14}
                height={14}
                alt="Edit"
              />
              Edit
            </button>
          )}
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-(--color-black-shade-200) text-(--color-black-shade-500) transition-colors hover:border-(--color-black-shade-400) hover:text-black"
            aria-label={open ? "Collapse" : "Expand"}
          >
            <ChevronIcon open={open} />
          </button>
        </div>
      </div>

      {/* Content */}
      {open && (
        <div className="px-6">
          <div className="flex flex-col">{children}</div>
        </div>
      )}
    </div>
  );
}

// Label : Value row — whitespace-only separation, no row borders
function ReviewRow({ label, value, fallback = "—" }) {
  const display = Array.isArray(value)
    ? value.length > 0
      ? value.join(", ")
      : null
    : value;

  return (
    <div className="flex flex-col gap-1 py-4 sm:flex-row sm:items-start sm:gap-0">
      <span className="w-full shrink-0 text-[0.9375rem] font-medium text-(--color-black-shade-400) sm:w-52">
        {label}
      </span>
      <span className="flex-1 text-[0.9375rem] font-medium text-black">
        {display || fallback}
      </span>
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatSalary(min, max) {
  if (!min && !max) return null;
  const fmt = (n) => `₹ ${Number(n).toLocaleString("en-IN")}`;
  if (min && max) return `${fmt(min)} to ${fmt(max)} per annum`;
  if (min) return `From ${fmt(min)} per annum`;
  return `Up to ${fmt(max)} per annum`;
}

function formatInterviewProcess(stages) {
  const filled = stages?.filter(Boolean) ?? [];
  if (filled.length === 0) return null;
  return filled.map((s, i) => `Stage ${i + 1}: ${s}`).join(" › ");
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function JobPostStepFourForm({
  stepOneData = {},
  stepTwoData = {},
  stepThreeData = {},
  onBack,
  onGoToStep,
  onPublish,
  isSubmitting = false,
}) {
  const fixedSalary = formatSalary(
    stepOneData.fixedSalaryMin,
    stepOneData.fixedSalaryMax,
  );
  const variableSalary = stepOneData.variableSalary
    ? `Up to ₹ ${Number(stepOneData.variableSalary).toLocaleString("en-IN")} per annum`
    : null;

  const totalCTC = (() => {
    const fixed = Number(stepOneData.fixedSalaryMax) || 0;
    const variable = Number(stepOneData.variableSalary) || 0;
    if (!fixed && !variable) return null;
    return `₹ ${(fixed + variable).toLocaleString("en-IN")} per annum`;
  })();

  const interviewProcess = formatInterviewProcess(stepThreeData.interviewStages);

  return (
    <div>
      {/* Page title */}
      <div className="mb-6">
        <Heading as="h2" className="text-lg">
          Job Review
        </Heading>
        <Text className="mt-1 text-sm font-medium">
          Review all details before publishing. You can edit any section if
          needed.
        </Text>
      </div>

      {/* ── Job Details ───────────────────────────────────────────────────── */}
      <ReviewSection
        title="Job Details"
        onEdit={() => onGoToStep?.("job-details")}
      >
        <ReviewRow label="Company Name" value={stepOneData.companyName} />
        {stepOneData.companyDescription && (
          <div className="flex flex-col gap-1 py-4 sm:flex-row sm:items-start sm:gap-0">
            <span className="w-full shrink-0 text-[0.9375rem] font-medium text-(--color-black-shade-400) sm:w-52">
              Company Description
            </span>
            <div
              className="rte-content flex-1 text-[0.9375rem] font-medium text-black"
              dangerouslySetInnerHTML={{ __html: stepOneData.companyDescription }}
            />
          </div>
        )}
        <ReviewRow
          label="Job Title / Designation"
          value={stepOneData.jobTitle}
        />
        <ReviewRow label="Job Role / Category" value={stepOneData.jobCategory} />
        <ReviewRow label="Job Type" value={stepOneData.jobType} />
        <ReviewRow
          label="Night Shift"
          value={stepOneData.isNightShift ? "Yes" : "No"}
        />
        <ReviewRow label="Work Type" value={stepOneData.workType} />
        <ReviewRow label="Working Location" value={stepOneData.workingLocation?.address} />
        {(stepOneData.city || stepOneData.state) && (
          <ReviewRow
            label="City, State"
            value={[stepOneData.city, stepOneData.state].filter(Boolean).join(", ")}
          />
        )}
        {stepOneData.pincode && (
          <ReviewRow label="Pincode" value={stepOneData.pincode} />
        )}
        {stepOneData.workingLocation?.floorPlotShop && (
          <ReviewRow label="Floor / Plot No." value={stepOneData.workingLocation.floorPlotShop} />
        )}

        {/* Outside applications info chip */}
        {stepOneData.workingLocation?.address && (
          <div className="flex items-center justify-between gap-3 rounded-xl bg-(--color-primary-shade-100) px-4 py-2.5">
            <p className="text-sm font-medium text-(--color-primary)">
              {stepOneData.receiveOutsideApplications
                ? "You will receive applications from all over India"
                : `You will not be receiving applications outside ${stepOneData.city || "the job location"}`}
            </p>
            <InfoTooltip align="left" text="This reflects the preference set in Step 1. When enabled, candidates from anywhere in India can apply if they are willing to relocate." />
          </div>
        )}

        <ReviewRow label="Pay Type" value={stepOneData.payType} />
        {fixedSalary && <ReviewRow label="Fixed Salary" value={fixedSalary} />}
        {variableSalary && (
          <ReviewRow label="Variable Salary" value={variableSalary} />
        )}
        {totalCTC && <ReviewRow label="Total CTC" value={totalCTC} />}
        {stepOneData.perks?.length > 0 && (
          <ReviewRow label="Additional Perks" value={stepOneData.perks} />
        )}
      </ReviewSection>

      {/* ── Professional Requirements ──────────────────────────────────────── */}
      <ReviewSection
        title="Professional Requirements"
        onEdit={() => onGoToStep?.("professional-requirements")}
      >
        <ReviewRow
          label="Minimum Education"
          value={stepTwoData.minimumEducation}
        />
        <ReviewRow label="Education Stream" value={stepTwoData.educationStream} />
        <ReviewRow
          label="Years of Full-time Experience"
          value={stepTwoData.yearsExperience}
        />
        <ReviewRow label="English Level" value={stepTwoData.englishLevel} />
        {stepTwoData.additionalRequirements?.includes("Gender") && (
          <ReviewRow label="Gender" value={stepTwoData.gender} />
        )}
        {stepTwoData.additionalRequirements?.includes("Age") &&
          (stepTwoData.ageMin || stepTwoData.ageMax) && (
            <ReviewRow
              label="Age"
              value={
                stepTwoData.ageMin && stepTwoData.ageMax
                  ? `${stepTwoData.ageMin} – ${stepTwoData.ageMax} years`
                  : stepTwoData.ageMin
                    ? `Min ${stepTwoData.ageMin} years`
                    : `Max ${stepTwoData.ageMax} years`
              }
            />
          )}
        {stepTwoData.additionalRequirements?.includes("Assets") &&
          stepTwoData.assets?.length > 0 && (
            <ReviewRow label="Assets" value={stepTwoData.assets} />
          )}
        {stepTwoData.additionalRequirements?.includes("Regional Languages") &&
          stepTwoData.regionalLanguages?.length > 0 && (
            <ReviewRow label="Regional Languages" value={stepTwoData.regionalLanguages} />
          )}
        {stepTwoData.technicalSkills?.length > 0 && (
          <ReviewRow
            label="Technical Skills"
            value={stepTwoData.technicalSkills}
          />
        )}
        {stepTwoData.strategicSkills?.length > 0 && (
          <ReviewRow
            label="Strategic Skills"
            value={stepTwoData.strategicSkills}
          />
        )}
      </ReviewSection>

      {/* ── Interview Information ──────────────────────────────────────────── */}
      <ReviewSection
        title="Interview Information"
        onEdit={() => onGoToStep?.("interview-information")}
      >
        <ReviewRow
          label="Interview Location"
          value={stepThreeData.interviewLocationType}
        />
        {interviewProcess && (
          <ReviewRow label="Interview Process" value={interviewProcess} />
        )}
        {stepThreeData.jobDescription && (
          <div className="flex flex-col gap-1 py-4 sm:flex-row sm:items-start sm:gap-0">
            <span className="w-full shrink-0 text-[0.9375rem] font-medium text-(--color-black-shade-400) sm:w-52">
              Job Description
            </span>
            <div
              className="rte-content flex-1 text-[0.9375rem] font-medium text-black"
              dangerouslySetInnerHTML={{ __html: stepThreeData.jobDescription }}
            />
          </div>
        )}
      </ReviewSection>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <div className="mt-10 flex flex-col-reverse gap-3 pb-10 sm:flex-row sm:items-center sm:justify-between">
        <Button
          variant="outline"
          type="button"
          onClick={onBack}
          disabled={isSubmitting}
          className="sm:w-52!"
        >
          Back
        </Button>
        <Button
          variant="primary"
          type="button"
          onClick={onPublish}
          disabled={isSubmitting}
          className="sm:w-52!"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <svg
                className="h-5 w-5 animate-spin"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                aria-hidden="true"
              >
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
              Publishing…
            </span>
          ) : (
            "Publish Job"
          )}
        </Button>
      </div>
    </div>
  );
}
