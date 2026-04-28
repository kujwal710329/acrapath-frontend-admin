"use client";

import Button from "@/components/common/Button";
import { formatIndianNumber } from "@/utilities/salaryValidation";

function ReviewSection({ title, children, onEdit, slug }) {
  return (
    <div className="mb-4 rounded-2xl border border-(--color-black-shade-150) bg-(--pure-white) p-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-(--color-black-shade-800)">{title}</h3>
        <button
          type="button"
          onClick={() => onEdit(slug)}
          className="text-xs cursor-pointer font-semibold text-(--color-primary) hover:underline"
        >
          Edit
        </button>
      </div>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function Row({ label, value }) {
  if (!value && value !== 0) return null;
  return (
    <div className="flex items-start gap-2 text-sm">
      <span className="min-w-32 shrink-0 font-medium text-(--color-black-shade-500)">{label}</span>
      <span className="text-(--color-black-shade-900) break-words">{String(value)}</span>
    </div>
  );
}

function Chip({ label }) {
  return (
    <span className="inline-flex items-center rounded-full border border-(--color-primary-shade-200) bg-(--color-primary-shade-100) px-3 py-0.5 text-xs font-medium text-(--color-primary)">
      {label}
    </span>
  );
}

export default function ProfessionalStepSevenForm({
  stepOneData = {},
  stepTwoData = {},
  stepThreeData = {},
  stepFourData = {},
  stepFiveData = {},
  stepSixData = {},
  onGoToStep,
  onSubmit,
  isSubmitting,
}) {
  const personal = stepOneData.personalInfo || {};
  const profDetail = stepTwoData.personalInfo || {};
  const skills = stepThreeData.skills || [];
  const workExp = stepFourData.workExperience || [];
  const education = stepFiveData.educationDetails || [];
  const docs = stepSixData.documents || {};

  const fullName = [stepOneData.firstName, stepOneData.middleName, stepOneData.lastName]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="max-w-2xl py-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-(--color-black-shade-900)">Review & Submit</h2>
        <p className="mt-0.5 text-sm font-medium text-(--color-black-shade-500)">
          Review all information before creating the professional profile.
        </p>
      </div>

      {/* Step 1 — Personal */}
      <ReviewSection title="Personal Information" onEdit={onGoToStep} slug="personal-info">
        <Row label="Full Name" value={fullName} />
        <Row label="Email" value={stepOneData.email} />
        <Row label="Contact" value={personal.contactNo ? `+${personal.countryCode} ${personal.contactNo}` : undefined} />
        <Row label="Gender" value={personal.gender} />
        <Row label="Date of Birth" value={personal.dateOfBirth} />
        <Row label="City" value={personal.currentCity} />
        <Row label="State" value={personal.address?.state} />
        <Row label="Country" value={personal.address?.country} />
        <Row label="LinkedIn" value={personal.linkedin} />
        <Row label="GitHub" value={personal.github} />
        <Row label="Website" value={personal.website} />
      </ReviewSection>

      {/* Step 2 — Professional Details */}
      <ReviewSection title="Professional Details" onEdit={onGoToStep} slug="professional-details">
        <Row label="Category" value={stepTwoData.professionalCategory} />
        <Row label="Designation" value={profDetail.currentDesignation} />
        <Row label="Current Company" value={profDetail.currentCompany} />
        <Row label="Experience" value={stepTwoData.yearsOfExperience} />
        <Row label="Currently Working" value={profDetail.isCurrentlyWorking ? "Yes" : "No"} />
        <Row label="Current CTC" value={profDetail.currentCTC ? `₹ ${profDetail.currentCTC} LPA` : undefined} />
        <Row label="Expected CTC" value={profDetail.expectedCTC ? `₹ ${profDetail.expectedCTC} LPA` : undefined} />
        <Row label="Notice Period" value={profDetail.noticePeriod} />
        <Row label="Employment Type" value={profDetail.preferredEmploymentType} />
        {(stepTwoData.openToRoles || []).length > 0 && (
          <div>
            <span className="block text-xs font-medium text-(--color-black-shade-500) mb-1">Open to Roles</span>
            <div className="flex flex-wrap gap-1.5">
              {stepTwoData.openToRoles.map((r) => <Chip key={r} label={r} />)}
            </div>
          </div>
        )}
      </ReviewSection>

      {/* Step 3 — Skills */}
      <ReviewSection title="Skills & Summary" onEdit={onGoToStep} slug="skills">
        {skills.length > 0 ? (
          <div>
            <span className="block text-xs font-medium text-(--color-black-shade-500) mb-1">Skills ({skills.length})</span>
            <div className="flex flex-wrap gap-1.5">
              {skills.map((s) => <Chip key={s} label={s} />)}
            </div>
          </div>
        ) : (
          <p className="text-sm text-(--color-black-shade-400) italic">No skills added.</p>
        )}
        {stepThreeData.profileSummary && (
          <div className="mt-2">
            <span className="block text-xs font-medium text-(--color-black-shade-500) mb-1">Profile Summary</span>
            <p className="text-sm text-(--color-black-shade-800) leading-relaxed">{stepThreeData.profileSummary}</p>
          </div>
        )}
      </ReviewSection>

      {/* Step 4 — Work Experience */}
      <ReviewSection title="Work Experience" onEdit={onGoToStep} slug="work-experience">
        {workExp.length === 0 ? (
          <p className="text-sm text-(--color-black-shade-400) italic">No work experience added.</p>
        ) : (
          workExp.map((w, i) => (
            <div key={i} className={`${i > 0 ? "mt-3 border-t border-(--color-black-shade-100) pt-3" : ""}`}>
              <p className="text-sm font-semibold text-(--color-black-shade-900)">{w.role} @ {w.companyName}</p>
              <p className="text-xs text-(--color-black-shade-500)">
                {w.joiningDate} — {w.currentlyWorking ? "Present" : w.relievingDate}
                {w.salary ? ` · ₹ ${formatIndianNumber(w.salary)} p.a.` : ""}
              </p>
              {w.points?.length > 0 && (
                <ul className="mt-1 space-y-0.5">
                  {w.points.map((pt, j) => (
                    <li key={j} className="flex gap-1.5 text-xs text-(--color-black-shade-700)">
                      <span>•</span><span>{pt}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))
        )}
      </ReviewSection>

      {/* Step 5 — Education */}
      <ReviewSection title="Education" onEdit={onGoToStep} slug="education">
        {education.length === 0 ? (
          <p className="text-sm text-(--color-black-shade-400) italic">No education added.</p>
        ) : (
          education.map((e, i) => (
            <div key={i} className={`${i > 0 ? "mt-3 border-t border-(--color-black-shade-100) pt-3" : ""}`}>
              <p className="text-sm font-semibold text-(--color-black-shade-900)">
                {e.degreeLevel} in {e.fieldOfStudy}
              </p>
              <p className="text-xs text-(--color-black-shade-500)">
                {e.collegeName} · {e.startDate} — {e.currentlyStudying ? "Present" : e.endDate}
                {e.grade ? ` · ${e.gradeType}: ${e.grade}` : ""}
              </p>
            </div>
          ))
        )}
      </ReviewSection>

      {/* Step 6 — Documents */}
      <ReviewSection title="Documents" onEdit={onGoToStep} slug="documents">
        <Row
          label="Resume / CV"
          value={stepSixData.resumeName || (docs.resumeCV ? "Uploaded" : "Not uploaded")}
        />
        <Row
          label="Profile Photo"
          value={stepSixData.photoName || (docs.profilePhoto ? "Uploaded" : "Not uploaded")}
        />
      </ReviewSection>

      {/* Submit */}
      <div className="mt-8 rounded-2xl border border-(--color-primary-shade-200) bg-(--color-primary-shade-100)/30 p-5">
        <h3 className="mb-1 text-sm font-semibold text-(--color-black-shade-900)">Ready to create this profile?</h3>
        <p className="text-xs text-(--color-black-shade-500) mb-4">
          A login account will be created for this professional. They can reset their password via the "Forgot Password" flow on the main site.
        </p>
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => onGoToStep("documents")}
            className="w-auto! min-w-32! px-6!"
            disabled={isSubmitting}
          >
            Back
          </Button>
          <Button
            onClick={onSubmit}
            disabled={isSubmitting}
            className="min-w-48!"
          >
            {isSubmitting ? "Creating Profile…" : "Create Professional"}
          </Button>
        </div>
      </div>
    </div>
  );
}
