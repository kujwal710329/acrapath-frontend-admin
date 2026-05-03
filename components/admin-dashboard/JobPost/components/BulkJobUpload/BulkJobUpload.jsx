"use client";

import { useState, useCallback, useRef } from "react";
import { useBulkJobUpload } from "@/hooks/useBulkJobUpload";

// ── Sub-components ─────────────────────────────────────────────────────────────

function WarningBanner() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: "12px",
        padding: "16px",
        borderRadius: "12px",
        background: "color-mix(in srgb, var(--color-star) 12%, transparent)",
        border: "1px solid color-mix(in srgb, var(--color-star) 40%, transparent)",
      }}
    >
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ flexShrink: 0, marginTop: "2px" }}>
        <path d="M9 1.5L16.5 15H1.5L9 1.5Z" stroke="#D97706" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9 7v3.5M9 12.5v.5" stroke="#D97706" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      <div>
        <p className="text-14 font-semibold" style={{ color: "#92400e" }}>Information</p>
        <p className="text-13" style={{ color: "#b45309", marginTop: "2px" }}>
          All uploaded jobs will be created with status &quot;Request&quot; and will require review
          before going live. Maximum 50 jobs per upload.
        </p>
      </div>
    </div>
  );
}

function SchemaReference() {
  const [open, setOpen] = useState(false);
  const schema = `[
  {
    "jobTitle": "string — required",
    "jobCategory": "development | marketing | sales | design | consultancy — required",
    "companyName": "string — required",
    "companyDescription": "string (HTML, min 50 chars) — required",
    "jobDescription": "string (HTML, min 10 chars) — required",
    "jobLocationType": "remote | onsite | hybrid — required",
    "city": "string — required",
    "state": "string — required",
    "pincode": "6-digit string — optional",
    "streetAddress1": "string — optional",
    "jobType": "full time | part time | contractual — required",
    "jobSource": "internal | external — required",
    "externalJobUrl": "URL string — required only when jobSource is 'external'",
    "jobSchedule": "string — optional",
    "experienceLevel": "Entry | Mid | Senior — required",
    "qualifications": ["string"] — optional,
    "skills": ["string", min 4] — required,
    "payMinRange": "number — required",
    "payMaxRange": "number > payMinRange — required",
    "payRateType": "per hour | per day | per month | per week | per year — required",
    "benefits": ["string"] — optional (e.g. "PF", "Health insurance", "ESOPs"),
    "supplementPay": ["string"] — optional (e.g. "Performance bonus", "Joining bonus"),
    "numberOfOpenings": "number — optional (default 1)",
    "jobExpireDate": "ISO date string — optional",
    "dreamjob": "boolean — optional (default false)"
  }
]`;

  return (
    <div
      style={{
        borderRadius: "12px",
        border: "1px solid var(--color-black-shade-100)",
        overflow: "hidden",
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          padding: "12px 16px",
          background: "var(--color-black-shade-50)",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        <span className="text-14 font-semibold" style={{ color: "var(--color-black-shade-700)" }}>
          Expected JSON shape
        </span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          style={{
            transform: open ? "rotate(0deg)" : "rotate(-90deg)",
            transition: "transform 0.2s",
            color: "var(--color-black-shade-400)",
          }}
        >
          <polyline points="18 15 12 9 6 15" />
        </svg>
      </button>
      {open && (
        <pre
          className="text-12"
          style={{
            margin: 0,
            padding: "16px",
            background: "var(--color-black-shade-50)",
            borderTop: "1px solid var(--color-black-shade-100)",
            color: "var(--color-black-shade-600)",
            overflowX: "auto",
            fontFamily: "monospace",
            lineHeight: 1.6,
          }}
        >
          {schema}
        </pre>
      )}
    </div>
  );
}

function UploadInputTabs({ onJsonChange }) {
  const [inputTab, setInputTab] = useState("file");
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState("");
  const [pasteText, setPasteText] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const processFile = useCallback(
    (file) => {
      if (!file) return;
      if (!file.name.endsWith(".json")) {
        onJsonChange("", "Only .json files are accepted");
        return;
      }
      if (file.size > 1024 * 1024) {
        onJsonChange("", "File size must not exceed 1MB");
        return;
      }
      setFileName(file.name);
      setFileSize((file.size / 1024).toFixed(1) + " KB");
      const reader = new FileReader();
      reader.onload = (e) => onJsonChange(e.target.result);
      reader.readAsText(file);
    },
    [onJsonChange]
  );

  const handleFileChange = (e) => processFile(e.target.files[0]);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    processFile(e.dataTransfer.files[0]);
  };

  const handleRemoveFile = () => {
    setFileName("");
    setFileSize("");
    if (fileInputRef.current) fileInputRef.current.value = "";
    onJsonChange("");
  };

  const handlePasteChange = (e) => {
    setPasteText(e.target.value);
    onJsonChange(e.target.value);
  };

  const tabStyle = (active) => ({
    padding: "6px 16px",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "500",
    background: active ? "var(--color-primary)" : "transparent",
    color: active ? "var(--pure-white)" : "var(--color-black-shade-500)",
    transition: "all 0.15s",
  });

  return (
    <div
      style={{
        borderRadius: "12px",
        border: "1px solid var(--color-black-shade-200)",
        overflow: "hidden",
      }}
    >
      {/* Tab switcher */}
      <div
        style={{
          display: "flex",
          gap: "4px",
          padding: "8px",
          background: "var(--color-black-shade-50)",
          borderBottom: "1px solid var(--color-black-shade-100)",
        }}
      >
        <button type="button" style={tabStyle(inputTab === "file")} onClick={() => setInputTab("file")}>
          Upload JSON File
        </button>
        <button type="button" style={tabStyle(inputTab === "paste")} onClick={() => setInputTab("paste")}>
          Paste JSON
        </button>
      </div>

      <div style={{ padding: "16px" }}>
        {inputTab === "file" ? (
          fileName ? (
            /* File selected state */
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 16px",
                borderRadius: "10px",
                background: "var(--color-primary-shade-100)",
                border: "1px solid var(--color-primary)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
                <div>
                  <p className="text-14 font-medium" style={{ color: "var(--color-primary)" }}>{fileName}</p>
                  <p className="text-12" style={{ color: "var(--color-black-shade-400)" }}>{fileSize}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleRemoveFile}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  padding: "4px 10px",
                  borderRadius: "6px",
                  border: "1px solid var(--color-black-shade-200)",
                  background: "var(--pure-white)",
                  cursor: "pointer",
                  fontSize: "12px",
                  color: "var(--color-black-shade-600)",
                }}
              >
                × Remove
              </button>
            </div>
          ) : (
            /* Drop zone */
            <label
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                padding: "40px 20px",
                borderRadius: "10px",
                border: `2px dashed ${dragOver ? "var(--color-primary)" : "var(--color-black-shade-200)"}`,
                background: dragOver ? "var(--color-primary-shade-100)" : "var(--color-black-shade-50)",
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--color-black-shade-300)" strokeWidth="1.5">
                <polyline points="16 16 12 12 8 16" />
                <line x1="12" y1="12" x2="12" y2="21" />
                <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
              </svg>
              <p className="text-14 font-medium" style={{ color: "var(--color-black-shade-700)" }}>
                Drag &amp; drop your JSON file here
              </p>
              <p className="text-13" style={{ color: "var(--color-black-shade-400)" }}>
                or click to browse
              </p>
              <p className="text-12" style={{ color: "var(--color-black-shade-300)" }}>
                Accepts: .json files only · Max size: 1MB
              </p>
              <input ref={fileInputRef} type="file" accept=".json" style={{ display: "none" }} onChange={handleFileChange} />
            </label>
          )
        ) : (
          /* Paste area */
          <textarea
            rows={12}
            value={pasteText}
            onChange={handlePasteChange}
            placeholder={'[\n  {\n    "jobTitle": "Software Engineer",\n    "jobCategory": "development",\n    ...\n  }\n]'}
            style={{
              width: "100%",
              borderRadius: "10px",
              border: "1px solid var(--color-black-shade-200)",
              padding: "12px 14px",
              fontSize: "13px",
              fontFamily: "monospace",
              color: "var(--color-black-shade-800)",
              outline: "none",
              resize: "vertical",
              background: "var(--pure-white)",
              lineHeight: 1.5,
            }}
          />
        )}
      </div>
    </div>
  );
}

function PreviewCard({ parsedJobs, parseError }) {
  if (parseError) {
    return (
      <div
        style={{
          padding: "14px 16px",
          borderRadius: "12px",
          background: "color-mix(in srgb, var(--color-red) 8%, transparent)",
          border: "1px solid color-mix(in srgb, var(--color-red) 30%, transparent)",
        }}
      >
        <p className="text-13 font-medium" style={{ color: "var(--color-red)" }}>
          ✗ {parseError}
        </p>
      </div>
    );
  }

  if (!parsedJobs || parsedJobs.length === 0) return null;

  return (
    <div
      style={{
        borderRadius: "12px",
        border: "1px solid var(--color-black-shade-100)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 16px",
          background: "var(--color-black-shade-50)",
          borderBottom: "1px solid var(--color-black-shade-100)",
        }}
      >
        <p className="text-14 font-semibold" style={{ color: "var(--color-black-shade-800)" }}>
          Preview
        </p>
        <span
          style={{
            padding: "2px 10px",
            borderRadius: "20px",
            background: "color-mix(in srgb, var(--color-secondary) 15%, transparent)",
            color: "var(--color-secondary)",
            fontSize: "12px",
            fontWeight: "600",
          }}
        >
          ✓ Valid JSON · {parsedJobs.length} job{parsedJobs.length !== 1 ? "s" : ""} detected
        </span>
      </div>
      <div style={{ maxHeight: "300px", overflowY: "auto", padding: "8px 0" }}>
        {parsedJobs.map((job, i) => (
          <div
            key={i}
            style={{
              padding: "8px 16px",
              borderBottom: i < parsedJobs.length - 1 ? "1px solid var(--color-black-shade-50)" : "none",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              flexWrap: "wrap",
            }}
          >
            <span className="text-12" style={{ color: "var(--color-black-shade-400)", minWidth: "28px" }}>
              {i + 1}.
            </span>
            <span className="text-13 font-medium" style={{ color: "var(--color-black-shade-800)" }}>
              {job.jobTitle || "Untitled"}
            </span>
            {job.companyName && (
              <span className="text-13" style={{ color: "var(--color-black-shade-500)" }}>
                — {job.companyName}
              </span>
            )}
            {job.jobCategory && (
              <span className="text-12" style={{ color: "var(--color-black-shade-400)" }}>
                · {job.jobCategory}
              </span>
            )}
            {job.jobLocationType && (
              <span className="text-12" style={{ color: "var(--color-black-shade-400)" }}>
                · {job.jobLocationType}
              </span>
            )}
            <span
              className="text-12"
              style={{
                color: !job.jobSource
                  ? "var(--color-star)"
                  : "var(--color-black-shade-400)",
              }}
            >
              ·{" "}
              {job.jobSource === "internal"
                ? "Via Acrapath"
                : job.jobSource === "external"
                ? "Via careers page"
                : "⚠ jobSource missing"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ValidationErrorPanel({ errors }) {
  if (!errors || errors.length === 0) return null;
  return (
    <div
      style={{
        borderRadius: "12px",
        border: "1px solid color-mix(in srgb, var(--color-red) 30%, transparent)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "12px 16px",
          background: "color-mix(in srgb, var(--color-red) 8%, transparent)",
          borderBottom: "1px solid color-mix(in srgb, var(--color-red) 20%, transparent)",
        }}
      >
        <p className="text-14 font-semibold" style={{ color: "var(--color-red)" }}>
          ✗ Upload failed — validation errors found
        </p>
      </div>
      <div style={{ padding: "12px 0" }}>
        {errors.map((err, i) => (
          <div
            key={i}
            style={{
              padding: "8px 16px",
              borderBottom: i < errors.length - 1 ? "1px solid var(--color-black-shade-50)" : "none",
            }}
          >
            <p className="text-13 font-semibold" style={{ color: "var(--color-black-shade-800)", marginBottom: "4px" }}>
              Job #{err.index + 1} — &quot;{err.jobTitle}&quot;
            </p>
            <ul style={{ margin: 0, paddingLeft: "18px" }}>
              {err.errors.map((msg, j) => (
                <li key={j} className="text-12" style={{ color: "var(--color-red)", marginBottom: "2px" }}>
                  {msg}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div
        style={{
          padding: "10px 16px",
          background: "var(--color-black-shade-50)",
          borderTop: "1px solid var(--color-black-shade-100)",
        }}
      >
        <p className="text-12" style={{ color: "var(--color-black-shade-500)" }}>
          Fix these errors in your JSON and try again.
        </p>
      </div>
    </div>
  );
}

function SuccessBanner({ result, onViewJobs, onUploadMore }) {
  return (
    <div
      style={{
        padding: "20px",
        borderRadius: "12px",
        background: "color-mix(in srgb, var(--color-secondary) 10%, transparent)",
        border: "1px solid color-mix(in srgb, var(--color-secondary) 35%, transparent)",
      }}
    >
      <p className="text-16 font-semibold" style={{ color: "var(--color-secondary)", marginBottom: "4px" }}>
        ✓ {result?.totalUploaded ?? 0} job{result?.totalUploaded !== 1 ? "s" : ""} uploaded successfully
      </p>
      <p className="text-13" style={{ color: "color-mix(in srgb, var(--color-secondary) 70%, #000)", marginBottom: "16px" }}>
        All jobs are in &quot;Request&quot; status and pending review.
      </p>
      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
        <button
          type="button"
          onClick={onViewJobs}
          style={{
            padding: "8px 18px",
            borderRadius: "8px",
            border: "1px solid var(--color-secondary)",
            background: "var(--pure-white)",
            color: "var(--color-secondary)",
            fontSize: "13px",
            fontWeight: "600",
            cursor: "pointer",
          }}
        >
          View Jobs
        </button>
        <button
          type="button"
          onClick={onUploadMore}
          style={{
            padding: "8px 18px",
            borderRadius: "8px",
            border: "none",
            background: "var(--color-secondary)",
            color: "var(--pure-white)",
            fontSize: "13px",
            fontWeight: "600",
            cursor: "pointer",
          }}
        >
          Upload More
        </button>
      </div>
    </div>
  );
}

function ErrorBanner({ message, onRetry }) {
  return (
    <div
      style={{
        padding: "16px 20px",
        borderRadius: "12px",
        background: "color-mix(in srgb, var(--color-red) 8%, transparent)",
        border: "1px solid color-mix(in srgb, var(--color-red) 30%, transparent)",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: "12px",
      }}
    >
      <div>
        <p className="text-14 font-semibold" style={{ color: "var(--color-red)", marginBottom: "2px" }}>
          ✗ Upload failed
        </p>
        <p className="text-13" style={{ color: "var(--color-black-shade-600)" }}>{message}</p>
      </div>
      <button
        type="button"
        onClick={onRetry}
        style={{
          flexShrink: 0,
          padding: "6px 14px",
          borderRadius: "8px",
          border: "1px solid var(--color-red)",
          background: "var(--pure-white)",
          color: "var(--color-red)",
          fontSize: "13px",
          fontWeight: "600",
          cursor: "pointer",
          whiteSpace: "nowrap",
        }}
      >
        Try Again
      </button>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function BulkJobUpload({ onViewJobs }) {
  const {
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
  } = useBulkJobUpload();

  const isUploading = status === "uploading";
  const isSuccess = status === "success";
  const isError = status === "error";

  const jobCount = parsedJobs?.length ?? 0;

  return (
    <div style={{ padding: "24px", maxWidth: "800px" }}>
      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <h2 className="text-20 font-semibold" style={{ color: "var(--color-black-shade-900)", marginBottom: "4px" }}>
          Bulk Job Upload
        </h2>
        <p className="text-14" style={{ color: "var(--color-black-shade-500)" }}>
          Upload up to {MAX_JOBS} jobs at once from a single JSON file
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <WarningBanner />

        <SchemaReference />

        {!isSuccess && (
          <UploadInputTabs onJsonChange={parseJson} />
        )}

        {!isSuccess && (
          <PreviewCard parsedJobs={parsedJobs} parseError={parseError} />
        )}

        {validationErrors.length > 0 && (
          <ValidationErrorPanel errors={validationErrors} />
        )}

        {isError && validationErrors.length === 0 && (
          <ErrorBanner message={errorMessage} onRetry={reset} />
        )}

        {isSuccess && (
          <SuccessBanner
            result={uploadResult}
            onViewJobs={onViewJobs}
            onUploadMore={reset}
          />
        )}

        {!isSuccess && (
          <div>
            <button
              type="button"
              onClick={uploadJobs}
              disabled={!isReadyToUpload || isUploading}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "0 24px",
                height: "44px",
                borderRadius: "10px",
                border: "none",
                background: isReadyToUpload && !isUploading
                  ? "var(--color-primary)"
                  : "var(--color-black-shade-100)",
                color: isReadyToUpload && !isUploading
                  ? "var(--pure-white)"
                  : "var(--color-black-shade-400)",
                fontSize: "14px",
                fontWeight: "600",
                cursor: isReadyToUpload && !isUploading ? "pointer" : "not-allowed",
                transition: "all 0.15s",
              }}
            >
              {isUploading ? (
                <>
                  <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                  Uploading…
                </>
              ) : (
                `Upload${jobCount > 0 ? ` ${jobCount}` : ""} Job${jobCount !== 1 ? "s" : ""}`
              )}
            </button>
            {isUploading && (
              <p className="text-13" style={{ marginTop: "8px", color: "var(--color-black-shade-500)" }}>
                Creating jobs, please wait…
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
