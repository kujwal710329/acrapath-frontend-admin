"use client";

import { useState, useRef, useCallback } from "react";
import Cropper from "react-easy-crop";
import Button from "@/components/common/Button";
import Label from "@/components/common/Label";
import { getAdminProfessionalPresignedUrl } from "@/services/professionals.service";
import { showError, showSuccess } from "@/utilities/toast";
import { getCroppedImg } from "@/utilities/cropImage";

function UploadCard({
  label,
  accept,
  hint,
  required = false,
  uploadedKey,
  uploadedName,
  uploadedPreviewUrl,
  uploading,
  progress,
  onSelect,
  onClear,
  isImage = false,
}) {
  const inputRef = useRef(null);

  return (
    <div className="mb-5">
      <Label required={required}>{label}</Label>
      <div
        className={`relative flex min-h-24 w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-4 py-5 text-center transition-colors ${
          uploadedKey
            ? "border-(--color-secondary) bg-(--color-secondary)/5"
            : "border-(--color-black-shade-200) bg-(--color-black-shade-50) hover:border-(--color-primary)"
        }`}
        onClick={() => !uploadedKey && inputRef.current?.click()}
      >
        {uploading ? (
          <div className="w-full space-y-2">
            <p className="text-sm font-medium text-(--color-black-shade-700)">Uploading…</p>
            <div className="h-2 w-full overflow-hidden rounded-full bg-(--color-black-shade-200)">
              <div className="h-full rounded-full bg-(--color-primary) transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
            <p className="text-xs text-(--color-black-shade-500)">{progress}%</p>
          </div>
        ) : uploadedKey ? (
          <div className="flex w-full items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              {isImage && uploadedPreviewUrl ? (
                <img
                  src={uploadedPreviewUrl}
                  alt="Profile preview"
                  className="h-12 w-12 shrink-0 rounded-full object-cover ring-2 ring-(--color-secondary)"
                />
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="shrink-0 text-(--color-secondary)">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                </svg>
              )}
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-(--color-black-shade-900)">{uploadedName}</p>
                <p className="text-xs text-(--color-secondary)">Uploaded successfully</p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {uploadedPreviewUrl && (
                <a
                  href={uploadedPreviewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="rounded-lg border border-(--color-black-shade-200) px-3 py-1 text-xs font-medium text-(--color-primary) hover:border-(--color-primary)"
                >
                  View
                </a>
              )}
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onClear(); }}
                className="rounded-lg border border-(--color-black-shade-200) px-3 py-1 text-xs font-medium text-(--color-black-shade-600) hover:border-(--color-red) hover:text-(--color-red)"
              >
                Remove
              </button>
            </div>
          </div>
        ) : (
          <>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mb-2 text-(--color-black-shade-400)">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            <p className="text-sm font-medium text-(--color-black-shade-700)">Click to upload</p>
            <p className="mt-0.5 text-xs text-(--color-black-shade-400)">{hint}</p>
          </>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onSelect(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}

export default function ProfessionalStepSixForm({ defaultValues = {}, tempId, onBack, onNext }) {
  const [resume, setResume] = useState({
    key: defaultValues.resumeCV || "",
    name: defaultValues.resumeName || "",
    previewUrl: defaultValues.resumePreviewUrl || "",
    uploading: false,
    progress: 0,
  });

  const [photo, setPhoto] = useState({
    key: defaultValues.profilePhoto || "",
    name: defaultValues.photoName || "",
    previewUrl: defaultValues.photoPreviewUrl || "",
    uploading: false,
    progress: 0,
  });

  // Cropper state
  const [tempImage, setTempImage] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const onCropComplete = useCallback((_, pixels) => setCroppedAreaPixels(pixels), []);

  const handleImageSelect = (file) => {
    const validTypes = ["image/jpeg", "image/jpg", "image/png"];
    if (!validTypes.includes(file.type)) {
      showError("Please upload a JPG or PNG image.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showError("Photo must be smaller than 5 MB.");
      return;
    }
    setTempImage(URL.createObjectURL(file));
  };

  const handleCropUpload = async () => {
    try {
      const croppedFile = await getCroppedImg(tempImage, croppedAreaPixels, `profile_${Date.now()}.jpg`);
      setTempImage(null);
      uploadFile(croppedFile, "profilePhoto", setPhoto);
    } catch {
      showError("Failed to crop image. Please try again.");
    }
  };

  const uploadFile = async (file, documentType, setDoc, previewUrl = "") => {
    setDoc((prev) => ({ ...prev, uploading: true, progress: 0 }));
    try {
      const res = await getAdminProfessionalPresignedUrl({ documentType, fileName: file.name, tempId });
      const { uploadUrl, key } = res?.data || {};
      if (!uploadUrl) throw new Error("Failed to get upload URL.");

      await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("PUT", uploadUrl);
        xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");
        xhr.upload.onprogress = (evt) => {
          if (evt.lengthComputable) setDoc((prev) => ({ ...prev, progress: Math.round((evt.loaded / evt.total) * 100) }));
        };
        xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error(`Upload failed: ${xhr.status}`)));
        xhr.onerror = () => reject(new Error("Network error during upload."));
        xhr.send(file);
      });

      const resolvedPreview = previewUrl || (file.type.startsWith("image/") ? URL.createObjectURL(file) : "");
      setDoc({ key, name: file.name, previewUrl: resolvedPreview, uploading: false, progress: 100 });
      showSuccess(`${file.name} uploaded successfully.`);
    } catch (err) {
      setDoc((prev) => ({ ...prev, uploading: false, progress: 0 }));
      showError(err.message || "Upload failed. Please try again.");
    }
  };

  const handleResumeSelect = (file) => {
    const validTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!validTypes.includes(file.type)) {
      showError("Please upload a PDF, DOC, or DOCX file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showError("File must be smaller than 5 MB.");
      return;
    }
    const previewUrl = URL.createObjectURL(file);
    uploadFile(file, "resumeCV", setResume, previewUrl);
  };

  const handleNext = () => {
    onNext({
      documents: {
        resumeCV: resume.key || undefined,
        profilePhoto: photo.key || undefined,
      },
      resumeName: resume.name || undefined,
      resumePreviewUrl: resume.previewUrl || undefined,
      photoName: photo.name || undefined,
      photoPreviewUrl: photo.previewUrl || undefined,
    });
  };

  const busy = resume.uploading || photo.uploading || !!tempImage;

  return (
    <div className="max-w-2xl py-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-(--color-black-shade-900)">Documents</h2>
        <p className="mt-0.5 text-sm font-medium text-(--color-black-shade-500)">
          Upload the professional&apos;s resume and profile photo. Both are optional — the professional can upload them later from their dashboard.
        </p>
      </div>

      {/* Profile photo with cropper */}
      <div className="mb-5">
        <Label>Profile Photo</Label>
        <div className="mb-3 flex flex-col gap-4 sm:flex-row sm:items-center">
          <label className="relative block h-20 w-20 shrink-0 cursor-pointer rounded-full ring ring-(--color-black-shade-300) ring-offset-2">
            <input type="file" accept="image/jpeg,image/jpg,image/png" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageSelect(f); e.target.value = ""; }} />
            {photo.previewUrl ? (
              <img src={photo.previewUrl} alt="Profile" className="h-full w-full rounded-full object-cover" />
            ) : (
              <div className="h-full w-full rounded-full bg-(--color-primary-shade-100) flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-(--color-black-shade-400)">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
              </div>
            )}
          </label>

          <label className="flex h-12 flex-1 cursor-pointer items-center rounded-xl border border-(--color-black-shade-300) px-4 text-sm font-medium text-(--color-primary) hover:border-(--color-primary)">
            <input type="file" accept="image/jpeg,image/jpg,image/png" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageSelect(f); e.target.value = ""; }} />
            <span className="truncate">
              {photo.uploading ? `Uploading… ${photo.progress}%` : photo.name || "Upload a professional photo (JPG / PNG · Max 5 MB)"}
            </span>
          </label>

          {photo.previewUrl && (
            <a href={photo.previewUrl} target="_blank" rel="noopener noreferrer" className="shrink-0 rounded-lg border border-(--color-black-shade-200) px-3 py-1.5 text-xs font-medium text-(--color-primary) hover:border-(--color-primary)">
              View
            </a>
          )}
          {photo.key && (
            <button type="button" onClick={() => setPhoto({ key: "", name: "", previewUrl: "", uploading: false, progress: 0 })} className="shrink-0 rounded-lg border border-(--color-black-shade-200) px-3 py-1.5 text-xs font-medium text-(--color-black-shade-600) hover:border-(--color-red) hover:text-(--color-red)">
              Remove
            </button>
          )}
        </div>
        <p className="mt-2 text-xs text-(--color-black-shade-400)">
          Recommended: 500×500 px or higher · JPG or PNG · Square crop works best
        </p>

        {photo.uploading && (
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-(--color-black-shade-200)">
            <div className="h-full rounded-full bg-(--color-primary) transition-all duration-300" style={{ width: `${photo.progress}%` }} />
          </div>
        )}
      </div>

      {/* Resume */}
      <UploadCard
        label="Resume / CV"
        accept=".pdf,.doc,.docx"
        hint="PDF, DOC, or DOCX · Max 5 MB"
        required={false}
        uploadedKey={resume.key}
        uploadedName={resume.name}
        uploadedPreviewUrl={resume.previewUrl}
        uploading={resume.uploading}
        progress={resume.progress}
        onSelect={handleResumeSelect}
        onClear={() => setResume({ key: "", name: "", previewUrl: "", uploading: false, progress: 0 })}
        isImage={false}
      />

      {!resume.key && (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <p className="text-sm text-amber-700">
            <span className="font-semibold">Note:</span> Skipping resume upload is fine — the professional can upload it after they log in.
          </p>
        </div>
      )}

      {/* Crop modal */}
      {tempImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-[92%] max-w-sm rounded-2xl bg-white p-5 shadow-xl">
            <p className="mb-3 text-sm font-semibold text-(--color-black-shade-900)">Adjust profile photo</p>
            <div className="relative h-60 overflow-hidden rounded-xl bg-black">
              <Cropper
                image={tempImage}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>
            <div className="mt-4">
              <label className="mb-1 block text-xs font-medium text-(--color-black-shade-600)">Zoom</label>
              <input type="range" min={1} max={3} step={0.05} value={zoom} onChange={(e) => setZoom(Number(e.target.value))} className="w-full accent-(--color-primary)" />
            </div>
            <div className="mt-5 flex justify-center gap-3">
              <Button variant="outline" onClick={() => setTempImage(null)}>Cancel</Button>
              <Button onClick={handleCropUpload}>Use Photo</Button>
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 flex items-center gap-4">
        <Button variant="outline" onClick={onBack} className="w-auto! min-w-32! px-6!" disabled={busy}>Back</Button>
        <Button onClick={handleNext} disabled={busy} className="min-w-40!">Continue to Review</Button>
      </div>
    </div>
  );
}
