"use client";

import { useState, useEffect } from "react";
import ClientOnly from "@/components/common/ClientOnly";
import JobPostHeader from "./JobPostHeader";
import JobPostStepOneForm from "./steps/JobPostStepOneForm";
import JobPostStepTwoForm from "./steps/JobPostStepTwoForm";
import JobPostStepThreeForm from "./steps/JobPostStepThreeForm";
import JobPostStepFourForm from "./steps/JobPostStepFourForm";
import { apiRequest } from "@/utilities/api";
import { showPromise } from "@/utilities/toast";
import { useMetadataData } from "@/hooks/useMetadata";

const KEYS = {
  step1: "adminJobPost_step1",
  step2: "adminJobPost_step2",
  step3: "adminJobPost_step3",
};

function clearJobPostStorage() {
  Object.values(KEYS).forEach((k) => localStorage.removeItem(k));
}

function loadFromStorage(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

// ── Field-name & value mapping: frontend → backend schema ─────────────────────
const JOB_TYPE_MAP = {
  "Full-time": "full time",
  "Part-time": "part time",
  Freelance: "contractual",
  Contract: "contractual",
};

const LOCATION_TYPE_MAP = {
  "In-office": "onsite",
  Remote: "remote",
  Hybrid: "hybrid",
  "Field Job": "onsite",
};

const EXPERIENCE_MAP = {
  "Fresher / 0 years": "Entry",
  "0–1 year": "Entry",
  "1–2 years": "Entry",
  "2–3 years": "Mid",
  "3–5 years": "Mid",
  "5–7 years": "Senior",
  "7–10 years": "Senior",
  "10+ years": "Senior",
};

function buildPayload(step1, step2, step3, categoryApiMap = {}) {
  // Merge technical + strategic skills into a single array
  const skills = [
    ...(step2.technicalSkills || []),
    ...(step2.strategicSkills || []),
  ];

  // Send all perks directly as benefits — backend now accepts any string
  const benefits = (step1.perks || []).length > 0 ? step1.perks : undefined;
  const supplementPay = undefined;

  // Build qualifications array
  const qualifications = [];
  if (step2.minimumEducation) {
    qualifications.push(
      step2.educationStream
        ? `${step2.minimumEducation} in ${step2.educationStream}`
        : step2.minimumEducation
    );
  }

  // Build hiringProcess string from non-empty stages
  const hiringProcess =
    (step3.interviewStages || []).filter(Boolean).join(" → ") || undefined;

  return {
    // Identity
    jobTitle: step1.jobTitle,
    jobCategory: categoryApiMap[step1.jobCategory],
    companyName: step1.companyName,
    companyDescription: step1.companyDescription,

    // Description
    jobDescription: step3.jobDescription,

    // Location
    jobLocationType: LOCATION_TYPE_MAP[step1.workType] || "onsite",
    city: step1.city,
    state: step1.state,
    pincode: step1.pincode,
    streetAddress1: step1.workingLocation?.address || undefined,
    streetAddress2: step1.workingLocation?.floorPlotShop || undefined,

    // Employment
    jobType: JOB_TYPE_MAP[step1.jobType] || "full time",
    jobSource: step1.jobSource || "internal",
    ...(step1.jobSource === "external" && step1.externalJobUrl
      ? { externalJobUrl: step1.externalJobUrl }
      : {}),
    jobSchedule: step1.isNightShift ? "night shift" : "day shift",

    // Requirements
    experienceLevel:
      EXPERIENCE_MAP[step2.yearsExperience] || step2.yearsExperience,
    qualifications,
    skills,
    culturalPreference:
      step2.additionalRequirements?.includes("Gender") && step2.gender
        ? step2.gender
        : undefined,
    ...(step2.additionalRequirements?.includes("Age") && step2.ageMin
      ? { ageMin: Number(step2.ageMin) }
      : {}),
    ...(step2.additionalRequirements?.includes("Age") && step2.ageMax
      ? { ageMax: Number(step2.ageMax) }
      : {}),
    ...(step2.additionalRequirements?.includes("Assets") && step2.assets?.length > 0
      ? { assets: step2.assets }
      : {}),
    ...(step2.additionalRequirements?.includes("Regional Languages") && step2.regionalLanguages?.length > 0
      ? { regionalLanguages: step2.regionalLanguages }
      : {}),

    // Compensation
    payMinRange: Number(step1.fixedSalaryMin) || 0,
    payMaxRange: Number(step1.fixedSalaryMax) || 0,
    payRateType: "per year",
    supplementPay,
    benefits: benefits.length > 0 ? benefits : undefined,

    // Interview
    hiringProcess,
  };
}

export default function AddNewJobPost({ onBack }) {
  const { metadata } = useMetadataData();
  const [step, setStep] = useState(1);
  // Load synchronously on first client render so step forms see the data immediately.
  // typeof window guard prevents crashes during SSR.
  const [stepOneData, setStepOneData] = useState(() =>
    typeof window !== "undefined" ? loadFromStorage(KEYS.step1) : {}
  );
  const [stepTwoData, setStepTwoData] = useState(() =>
    typeof window !== "undefined" ? loadFromStorage(KEYS.step2) : {}
  );
  const [stepThreeData, setStepThreeData] = useState(() =>
    typeof window !== "undefined" ? loadFromStorage(KEYS.step3) : {}
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [step]);

  const handlePublish = async () => {
    setIsSubmitting(true);
    try {
      const payload = buildPayload(stepOneData, stepTwoData, stepThreeData, metadata.jobCategoryApiMap);
      const req = apiRequest("/jobs", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      await showPromise(req, {
        loading: "Publishing job…",
        success: "Job published successfully!",
        error: "Failed to publish job.",
      });

      clearJobPostStorage();
      onBack?.();
    } catch {
      setIsSubmitting(false);
    }
  };

  const goToStep = (slug) => {
    const slugMap = {
      "job-details": 1,
      "professional-requirements": 2,
      "interview-information": 3,
    };
    setStep(slugMap[slug] || 1);
  };

  return (
    <div className="min-h-screen bg-white px-4 pt-6 sm:px-6">
      <ClientOnly>
        <JobPostHeader
          currentStep={step}
          onBack={() => {
            if (step === 1) {
              onBack?.();
            } else {
              setStep(step - 1);
            }
          }}
          onUseTemplate={step === 1 ? () => {} : undefined}
        />

        <div className={step !== 4 ? "max-w-2xl" : ""}>
          {step === 1 && (
            <JobPostStepOneForm
              defaultValues={stepOneData}
              onBack={() => onBack?.()}
              onNext={(data) => {
                localStorage.setItem(KEYS.step1, JSON.stringify(data));
                setStepOneData(data);
                setStep(2);
              }}
            />
          )}
          {step === 2 && (
            <JobPostStepTwoForm
              defaultValues={stepTwoData}
              jobCategory={stepOneData.jobCategory}
              onBack={() => setStep(1)}
              onNext={(data) => {
                localStorage.setItem(KEYS.step2, JSON.stringify(data));
                setStepTwoData(data);
                setStep(3);
              }}
            />
          )}
          {step === 3 && (
            <JobPostStepThreeForm
              defaultValues={stepThreeData}
              onBack={() => setStep(2)}
              onNext={(data) => {
                localStorage.setItem(KEYS.step3, JSON.stringify(data));
                setStepThreeData(data);
                setStep(4);
              }}
            />
          )}
          {step === 4 && (
            <JobPostStepFourForm
              stepOneData={stepOneData}
              stepTwoData={stepTwoData}
              stepThreeData={stepThreeData}
              onBack={() => setStep(3)}
              onGoToStep={goToStep}
              onPublish={handlePublish}
              isSubmitting={isSubmitting}
            />
          )}
        </div>
      </ClientOnly>
    </div>
  );
}
