"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiRequest } from "@/utilities/api";
import Icon from "@/components/common/Icon";
import FixedBackButton from "@/components/common/FixedBackButton";
import ProfileSectionCard from "@/components/common/ProfileSectionCard";
import { SpecificJobSkeleton } from "@/components/common/Skeleton";
import JobPostStatusDropdown from "@/components/AdminDashboard/JobPost/components/JobPostStatusDropdown";
import { updateJobPostStatus } from "@/services/jobPost.service";
import { showSuccess } from "@/utilities/toast";

const STATUS_BADGE_COLORS = {
  active: "bg-green-100 text-green-700",
  requests: "bg-blue-100 text-(--color-primary)",
  rejected: "bg-red-100 text-red-600",
};

const STATUS_LABELS = {
  active: "Active",
  requests: "Requested",
  rejected: "Rejected",
};

export default function AdminJobDetailPage() {
  const { jobId } = useParams();
  const router = useRouter();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    if (!jobId) return;
    const fetchJob = async () => {
      try {
        const res = await apiRequest(`/jobs/${jobId}`);
        setJob(res.data);
      } catch {
        setJob(null);
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [jobId]);

  const handleStatusChange = async (val) => {
    setUpdatingStatus(true);
    try {
      await updateJobPostStatus(jobId, val);
      setJob((prev) => ({ ...prev, status: val }));
      showSuccess("Status updated successfully");
    } catch {
      // toast already shown by apiRequest
    } finally {
      setUpdatingStatus(false);
    }
  };

  const formatSalaryLPA = () => {
    if (!job?.payMinRange || !job?.payMaxRange) return "Not disclosed";
    const min = (job.payMinRange / 100000).toFixed(0);
    const max = (job.payMaxRange / 100000).toFixed(0);
    return `${min}–${max} LPA`;
  };

  if (loading) return <SpecificJobSkeleton />;

  if (!job)
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Icon
          name="statics/login/cross-icon.svg"
          width={48}
          height={48}
          className="mx-auto mb-4 opacity-50"
        />
        <h2 className="text-xl font-semibold text-(--color-black-shade-800)">
          Job not found
        </h2>
        <p className="text-(--color-black-shade-600) mt-2">
          This job may have been removed or the link is invalid.
        </p>
        <button
          onClick={() => router.back()}
          className="mt-6 px-4 py-2 bg-(--color-primary) text-white rounded-lg hover:opacity-90 transition cursor-pointer"
        >
          Go Back
        </button>
      </div>
    );

  return (
    <>
    <FixedBackButton variant="admin" />
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 md:p-8 space-y-6 md:space-y-8 pb-16">

      <ProfileSectionCard>
        <div className="flex flex-col gap-4">
          {/* Title + status badge + logo */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-col gap-2 min-w-0">
              <h1 className="text-xl sm:text-2xl font-semibold text-(--color-black-shade-900)">
                {job.jobTitle}
              </h1>
              <span
                className={`w-fit px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_BADGE_COLORS[job.status] ?? "bg-(--color-black-shade-100) text-(--color-black-shade-600)"}`}
              >
                {STATUS_LABELS[job.status] ?? job.status}
              </span>
            </div>
            <div className="flex flex-col items-center gap-2 shrink-0">
              <div className="h-14 w-14 rounded-xl bg-(--color-black-shade-300)" />
              <p className="text-xs font-semibold text-(--color-black-shade-700) text-center max-w-24">
                {job.companyName}
              </p>
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-(--color-black-shade-500)">Status:</span>
                <JobPostStatusDropdown
                  value={job.status ?? "requests"}
                  onChange={handleStatusChange}
                  disabled={updatingStatus}
                />
              </div>
            </div>
          </div>

          <p className="text-sm font-medium text-(--color-black-shade-700)">
            {job.companyName}
          </p>

          {/* Meta row — full width */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-medium text-(--color-black-shade-700)">
            <div className="flex items-center gap-1.5">
              <Icon name="static/Icons/bag.svg" width={16} height={16} />
              <span>{job.experienceLevel}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Icon name="static/Icons/rupee.svg" width={16} height={16} />
              <span>{formatSalaryLPA()}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Icon name="static/Icons/location.svg" width={16} height={16} />
              <span>{job.city}, {job.state}</span>
            </div>
          </div>

          <div className="h-px w-full bg-(--color-black-shade-100)" />

          {/* Job details — Job ID on its own line, rest in a row */}
          <div className="flex flex-col gap-2 text-sm font-medium text-(--color-black-shade-700)">
            <div className="flex items-center gap-2">
              <span className="text-(--color-black-shade-500)">Job ID:</span>
              <span className="font-semibold font-mono text-xs tracking-wide">{job.jobId}</span>
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <span>Openings: <span className="font-semibold">{job.numberOfOpenings}</span></span>
              <div className="h-4 w-px bg-(--color-black-shade-300)" />
              <span>Applicants: <span className="font-semibold">{job.applicationCount}</span></span>
              <div className="h-4 w-px bg-(--color-black-shade-300)" />
              <span>Type: <span className="font-semibold capitalize">{job.jobType}</span></span>
              <div className="h-4 w-px bg-(--color-black-shade-300)" />
              <span>Mode: <span className="font-semibold capitalize">{job.jobLocationType}</span></span>
            </div>
          </div>
        </div>
      </ProfileSectionCard>

      <ProfileSectionCard>
        <div className="flex items-center gap-3 mb-6">
          <h2 className="text-lg font-semibold text-(--color-black-shade-900)">
            Skills Required
          </h2>
          <div className="flex items-center gap-1 text-xs text-(--color-black-shade-600)">
            <span>Required key skills are highlighted with</span>
            <Icon
              name="statics/Employee-Dashboard/Star.svg"
              width={14}
              height={14}
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          {job?.skills?.length > 0 ? (
            job.skills.map((skill, index) => (
              <span
                key={index}
                className={`rounded-full px-4 py-1.5 text-xs font-medium bg-(--color-primary-shade-100) text-(--color-black-shade-800) ${index === 0 ? "flex items-center gap-1" : ""}`}
              >
                {index === 0 && (
                  <Icon
                    name="statics/Employee-Dashboard/Star.svg"
                    width={12}
                    height={12}
                  />
                )}
                {skill}
              </span>
            ))
          ) : (
            <p className="text-sm text-(--color-black-shade-600)">
              No skills mentioned
            </p>
          )}
        </div>
      </ProfileSectionCard>

      <ProfileSectionCard>
        <h2 className="mb-6 text-lg font-semibold">Job Description</h2>
        <p className="text-sm leading-6 text-(--color-black-shade-700)">
          {job.jobDescription}
        </p>

        {job.qualifications?.length > 0 && (
          <>
            <h3 className="mt-8 mb-3 text-sm font-semibold">Qualifications</h3>
            <ul className="list-disc pl-5 text-sm text-(--color-black-shade-700) space-y-2">
              {job.qualifications.map((q, i) => (
                <li key={i}>{q}</li>
              ))}
            </ul>
          </>
        )}
      </ProfileSectionCard>

      <ProfileSectionCard>
        <h2 className="mb-6 text-lg font-semibold text-(--color-black-shade-900)">
          About the Company
        </h2>
        <div className="flex gap-4 mb-4">
          <div className="h-14 w-14 rounded-xl bg-(--color-black-shade-300) shrink-0" />
          <div>
            <h3 className="text-base font-semibold text-(--color-black-shade-900)">
              {job.companyName}
            </h3>
            <p className="mt-3 text-sm leading-6 text-(--color-black-shade-700)">
              {job.companyDescription}
            </p>
          </div>
        </div>
      </ProfileSectionCard>
    </div>
    </>
  );
}
