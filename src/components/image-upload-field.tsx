"use client";

import Image from "next/image";
import { useMemo, useState, type DragEvent } from "react";

type Props = {
  name: string;
  label?: string;
  initialImageUrl?: string | null;
};

export function ImageUploadField({ name, label = "Item image", initialImageUrl = null }: Props) {
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
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>

      <label
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 border-dashed p-3 transition ${
          isDragging ? "border-emerald-500 bg-emerald-50" : "border-slate-300 bg-white"
        }`}
      >
        {previewUrl ? (
          <Image
            src={previewUrl}
            alt="Preview"
            width={64}
            height={64}
            className="h-16 w-16 rounded-lg object-cover"
            unoptimized
          />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-slate-100 text-xs text-slate-500">
            No image
          </div>
        )}

        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-800">Drag & drop or click to upload</p>
          <p className="text-xs text-slate-500">PNG/JPG/WebP, max 5MB</p>
          {file ? <p className="mt-1 truncate text-xs text-emerald-700">{file.name}</p> : null}
        </div>

        <input
          name={name}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(event) => validateAndSet(event.target.files?.[0] ?? null)}
        />
      </label>

      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
