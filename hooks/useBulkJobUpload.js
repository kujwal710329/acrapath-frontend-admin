"use client";

import { useState, useCallback } from "react";
import { apiRequest } from "@/utilities/api";

const MAX_JOBS = 50;

/**
 * Manages all state and API logic for bulk job uploads.
 * Status machine: idle → validating → uploading → success | error
 */
export function useBulkJobUpload() {
  const [status, setStatus] = useState("idle"); // idle | validating | uploading | success | error
  const [parsedJobs, setParsedJobs] = useState(null);
  const [parseError, setParseError] = useState("");
  const [validationErrors, setValidationErrors] = useState([]);
  const [uploadResult, setUploadResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const parseJson = useCallback((text) => {
    setValidationErrors([]);

    if (!text || !text.trim()) {
      setParsedJobs(null);
      setParseError("");
      setStatus("idle");
      return;
    }

    setStatus("validating");
    try {
      const parsed = JSON.parse(text);
      if (!Array.isArray(parsed)) {
        setParseError("JSON must be an array of job objects");
        setParsedJobs(null);
        setStatus("idle");
        return;
      }
      if (parsed.length > MAX_JOBS) {
        setParseError(`Maximum ${MAX_JOBS} jobs allowed. Your file contains ${parsed.length} jobs.`);
        setParsedJobs(parsed);
        setStatus("idle");
        return;
      }

      // Client-side pre-validation for jobSource and externalJobUrl
      const clientErrors = [];
      parsed.forEach((job, i) => {
        const errs = [];
        if (!job.jobSource) {
          errs.push('jobSource is required (must be "internal" or "external")');
        } else if (!["internal", "external"].includes(job.jobSource)) {
          errs.push(`jobSource must be "internal" or "external" — got "${job.jobSource}"`);
        } else if (job.jobSource === "external" && !job.externalJobUrl) {
          errs.push('externalJobUrl is required when jobSource is "external"');
        }
        if (errs.length > 0) {
          clientErrors.push({ index: i, jobTitle: job.jobTitle || `Job #${i + 1}`, errors: errs });
        }
      });

      setParsedJobs(parsed);
      setParseError("");
      setValidationErrors(clientErrors);
      setStatus("idle");
    } catch {
      setParseError("Invalid JSON — please check your file format");
      setParsedJobs(null);
      setStatus("idle");
    }
  }, []);

  const uploadJobs = useCallback(async () => {
    if (!parsedJobs || parsedJobs.length === 0 || parseError) return;

    setStatus("uploading");
    setValidationErrors([]);
    setErrorMessage("");

    try {
      const data = await apiRequest(
        "/jobs/bulk-upload",
        {
          method: "POST",
          body: JSON.stringify({ jobs: parsedJobs }),
        },
        { useCache: false }
      );

      if (data?.success === false && data?.errors) {
        setValidationErrors(data.errors);
        setStatus("error");
        setErrorMessage(data.message || "Validation failed for some jobs");
        return;
      }

      setUploadResult(data?.data ?? { totalUploaded: parsedJobs.length });
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setErrorMessage(err?.message || "Upload failed. Please try again.");
    }
  }, [parsedJobs, parseError]);

  const reset = useCallback(() => {
    setStatus("idle");
    setParsedJobs(null);
    setParseError("");
    setValidationErrors([]);
    setUploadResult(null);
    setErrorMessage("");
  }, []);

  const isReadyToUpload =
    status === "idle" &&
    parsedJobs !== null &&
    parsedJobs.length > 0 &&
    !parseError &&
    validationErrors.length === 0;

  return {
    status,
    parsedJobs,
    parseError,
    validationErrors,
    uploadResult,
    errorMessage,
    isReadyToUpload,
    parseJson,
    uploadJobs,
    reset,
    MAX_JOBS,
  };
}
