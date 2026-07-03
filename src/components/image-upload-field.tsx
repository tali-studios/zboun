"use client";

import Image from "next/image";
import { useMemo, useState, type DragEvent } from "react";

type Props = {
  name: string;
  label?: string;
  initialImageUrl?: string | null;
  /** When true, show “(optional)” next to the label (menu item image). Logo/banner omit this. */
  optional?: boolean;
  /** Tighter layout for inline brand rows in admin tables. */
  compact?: boolean;
  /** Form-field layout that visually matches text inputs. */
  inline?: boolean;
  /** Associate file input with a form elsewhere (e.g. table row). */
  formId?: string;
  /** Accessible name when label is hidden. */
  uploadAriaLabel?: string;
};

export function ImageUploadField({
  name,
  label = "Item image",
  initialImageUrl = null,
  optional = false,
  compact = false,
  inline = false,
  formId,
  uploadAriaLabel,
}: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState("");

  const previewUrl = useMemo(() => {
    if (file) return URL.createObjectURL(file);
    return initialImageUrl;
  }, [file, initialImageUrl]);

  function validateAndSet(nextFile: File | null) {
    if (!nextFile) return;
    if (!nextFile.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }
    if (nextFile.size > 5 * 1024 * 1024) {
      setError("Image must be under 5MB.");
      return;
    }
    setError("");
    setFile(nextFile);
  }

  function onDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setIsDragging(false);
    const nextFile = event.dataTransfer.files?.[0] ?? null;
    validateAndSet(nextFile);
  }

  return (
    <div className={compact ? "space-y-1.5" : inline ? "space-y-1" : "space-y-2"}>
      {label ? (
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          {label}
          {optional ? <span className="ml-1 font-normal normal-case text-slate-500">(optional)</span> : null}
        </p>
      ) : null}

      <label
        aria-label={uploadAriaLabel || label || "Upload image"}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        className={`flex cursor-pointer transition ${
          compact
            ? `flex-col items-center gap-2 rounded-xl border border-dashed p-2.5 text-center ${
                isDragging ? "border-violet-500 bg-violet-50" : "border-slate-200 bg-slate-50/80"
              }`
            : inline
              ? `min-h-[3rem] items-center gap-3 rounded-xl border px-3 py-2 shadow-sm ${
                  isDragging ? "border-violet-400 bg-violet-50 ring-2 ring-violet-100" : "border-slate-200 bg-white"
                }`
            : `items-center gap-3 rounded-xl border-2 border-dashed p-3 ${
                isDragging ? "border-violet-500 bg-violet-50" : "border-slate-300 bg-white"
              }`
        }`}
      >
        {previewUrl ? (
          <Image
            src={previewUrl}
            alt="Preview"
            width={compact ? 56 : 64}
            height={compact ? 56 : 64}
            className={
              compact
                ? "h-14 w-full max-w-[7rem] rounded-lg object-contain"
                : inline
                  ? "h-10 w-10 rounded-lg object-cover ring-1 ring-slate-200"
                : "h-16 w-16 rounded-lg object-cover"
            }
            unoptimized
          />
        ) : (
          <div
            className={
              compact
                ? "flex h-14 w-full max-w-[7rem] items-center justify-center rounded-lg bg-white text-[10px] text-slate-400 ring-1 ring-slate-200"
                : inline
                  ? "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-[10px] font-medium text-slate-400 ring-1 ring-slate-200"
                : "flex h-16 w-16 items-center justify-center rounded-lg bg-slate-100 text-xs text-slate-500"
            }
          >
            {compact || inline ? "No logo" : "No image"}
          </div>
        )}

        <div className={compact ? "min-w-0 px-1" : "min-w-0 flex-1"}>
          <p
            className={
              compact
                ? "text-[11px] font-semibold text-slate-700"
                : inline
                  ? "truncate text-sm font-semibold text-slate-700"
                  : "text-sm font-semibold text-slate-800"
            }
          >
            {compact ? "Click to change logo" : inline ? "Click to upload brand logo" : "Drag & drop or click to upload"}
          </p>
          {!compact && !inline ? (
            <p className="text-xs text-slate-500">PNG/JPG/WebP, max 5MB</p>
          ) : (
            <p className={inline ? "text-xs text-slate-500" : "text-[10px] text-slate-400"}>
              PNG/JPG/WebP · 5MB max
            </p>
          )}
          {file ? (
            <p className={`mt-0.5 truncate text-violet-700 ${compact ? "text-[10px]" : "text-xs"}`}>{file.name}</p>
          ) : null}
        </div>

        <input
          name={name}
          type="file"
          accept="image/*"
          className="hidden"
          form={formId}
          onChange={(event) => validateAndSet(event.target.files?.[0] ?? null)}
        />
      </label>

      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
