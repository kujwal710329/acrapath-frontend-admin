"use client";

import { useState, useEffect, useMemo } from "react";
import ClientOnly from "@/components/common/ClientOnly";
import ProfessionalHeader from "./ProfessionalHeader";
import ProfessionalStepOneForm from "./steps/ProfessionalStepOneForm";
import ProfessionalStepTwoForm from "./steps/ProfessionalStepTwoForm";
import ProfessionalStepThreeForm from "./steps/ProfessionalStepThreeForm";
import ProfessionalStepFourForm from "./steps/ProfessionalStepFourForm";
import ProfessionalStepFiveForm from "./steps/ProfessionalStepFiveForm";
import ProfessionalStepSixForm from "./steps/ProfessionalStepSixForm";
import ProfessionalStepSevenForm from "./steps/ProfessionalStepSevenForm";
import { createAdminProfessional } from "@/services/professionals.service";
import { showPromise } from "@/utilities/toast";

// localStorage keys — one per step
const KEYS = {
  step1: "adminProfessional_step1",
  step2: "adminProfessional_step2",
  step3: "adminProfessional_step3",
  step4: "adminProfessional_step4",
  step5: "adminProfessional_step5",
  step6: "adminProfessional_step6",
};

function clearStorage() {
  Object.values(KEYS).forEach((k) => localStorage.removeItem(k));
}

function load(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function save(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    // ignore storage errors
  }
}

// Stable temp ID per browser session — scopes S3 uploads before user creation
function getOrCreateTempId() {
  const existing = sessionStorage.getItem("adminProfessional_tempId");
  if (existing) return existing;
  const id = `tmp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  sessionStorage.setItem("adminProfessional_tempId", id);
  return id;
}

// Slug → step number map for Review screen "Edit" links
const SLUG_TO_STEP = {
  "personal-info": 1,
  "professional-details": 2,
  skills: 3,
  "work-experience": 4,
  education: 5,
  documents: 6,
};

function buildPayload(s1, s2, s3, s4, s5, s6) {
  return {
    // Auth identity
    email: s1.email,
    firstName: s1.firstName,
    middleName: s1.middleName,
    lastName: s1.lastName,

    // Personal info (merged with step 2 profession fields)
    personalInfo: {
      ...s1.personalInfo,
      ...s2.personalInfo,
    },

    // Professional category / roles / experience (top-level for backend convenience)
    professionalCategory: s2.professionalCategory,
    openToRoles: s2.openToRoles,
    yearsOfExperience: s2.yearsOfExperience,

    // Professional info
    skills: s3.skills || [],
    profileSummary: s3.profileSummary,
    workExperience: s4.workExperience || [],
    educationDetails: s5.educationDetails || [],

    // Documents
    documents: s6.documents || {},

    // Default verification status — admin can change it after creation
    profileVerificationStatus: "pending",
  };
}

export default function AddNewProfessional({ onBack }) {
  const tempId = useMemo(() => getOrCreateTempId(), []);

  const [step, setStep] = useState(1);
  const [stepOneData, setStepOneData] = useState({});
  const [stepTwoData, setStepTwoData] = useState({});
  const [stepThreeData, setStepThreeData] = useState({});
  const [stepFourData, setStepFourData] = useState({});
  const [stepFiveData, setStepFiveData] = useState({});
  const [stepSixData, setStepSixData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Hydrate from localStorage on mount
  useEffect(() => {
    setStepOneData(load(KEYS.step1));
    setStepTwoData(load(KEYS.step2));
    setStepThreeData(load(KEYS.step3));
    setStepFourData(load(KEYS.step4));
    setStepFiveData(load(KEYS.step5));
    setStepSixData(load(KEYS.step6));
  }, []);

  // Scroll to top on step change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [step]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const payload = buildPayload(
        stepOneData, stepTwoData, stepThreeData,
        stepFourData, stepFiveData, stepSixData
      );

      const req = createAdminProfessional(payload);

      await showPromise(req, {
        loading: "Creating professional profile…",
        success: "Professional profile created successfully!",
        error: "Failed to create professional profile.",
      });

      clearStorage();
      sessionStorage.removeItem("adminProfessional_tempId");
      onBack?.();
    } catch {
      setIsSubmitting(false);
    }
  };

  const goToStep = (slug) => {
    const n = SLUG_TO_STEP[slug];
    if (n) setStep(n);
  };

  const handleBack = () => {
    if (step === 1) onBack?.();
    else setStep(step - 1);
  };

  return (
    <div className="min-h-screen bg-white px-4 pt-6 sm:px-6">
      <ClientOnly>
        <ProfessionalHeader currentStep={step} />

        <div className={step !== 7 ? "max-w-2xl" : ""}>
          {step === 1 && (
            <ProfessionalStepOneForm
              defaultValues={stepOneData}
              onBack={handleBack}
              onNext={(data) => {
                save(KEYS.step1, data);
                setStepOneData(data);
                setStep(2);
              }}
            />
          )}

          {step === 2 && (
            <ProfessionalStepTwoForm
              defaultValues={{ ...stepTwoData, ...stepTwoData.personalInfo }}
              onBack={handleBack}
              onNext={(data) => {
                save(KEYS.step2, data);
                setStepTwoData(data);
                setStep(3);
              }}
            />
          )}

          {step === 3 && (
            <ProfessionalStepThreeForm
              defaultValues={stepThreeData}
              professionalCategory={stepTwoData.professionalCategory}
              onBack={handleBack}
              onNext={(data) => {
                save(KEYS.step3, data);
                setStepThreeData(data);
                setStep(4);
              }}
            />
          )}

          {step === 4 && (
            <ProfessionalStepFourForm
              defaultValues={stepFourData}
              professionalCategory={stepTwoData.professionalCategory}
              yearsOfExperience={stepTwoData.yearsOfExperience}
              onBack={handleBack}
              onNext={(data) => {
                save(KEYS.step4, data);
                setStepFourData(data);
                setStep(5);
              }}
            />
          )}

          {step === 5 && (
            <ProfessionalStepFiveForm
              defaultValues={stepFiveData}
              onBack={handleBack}
              onNext={(data) => {
                save(KEYS.step5, data);
                setStepFiveData(data);
                setStep(6);
              }}
            />
          )}

          {step === 6 && (
            <ProfessionalStepSixForm
              defaultValues={stepSixData}
              tempId={tempId}
              onBack={handleBack}
              onNext={(data) => {
                save(KEYS.step6, data);
                setStepSixData(data);
                setStep(7);
              }}
            />
          )}

          {step === 7 && (
            <ProfessionalStepSevenForm
              stepOneData={stepOneData}
              stepTwoData={stepTwoData}
              stepThreeData={stepThreeData}
              stepFourData={stepFourData}
              stepFiveData={stepFiveData}
              stepSixData={stepSixData}
              onGoToStep={goToStep}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
            />
          )}
        </div>
      </ClientOnly>
    </div>
  );
}
