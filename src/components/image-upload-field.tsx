"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState, type DragEvent } from "react";

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

type PasteTarget = {
  el: HTMLElement;
  hovered: boolean;
  accept: (file: File) => void;
};

/**
 * One document-level paste listener shared by all mounted fields. Many fields can be
 * mounted at once (hidden edit modals, logo + banner), so a paste goes to the hovered
 * field, else the one containing focus, else the only visible one.
 */
const pasteTargets = new Set<PasteTarget>();
let globalListenersInstalled = false;

function isVisible(el: HTMLElement) {
  return el.getClientRects().length > 0;
}

function isEditableElement(el: Element | null) {
  if (!el) return false;
  if (el instanceof HTMLTextAreaElement) return true;
  if (el instanceof HTMLInputElement) {
    return !["file", "checkbox", "radio", "button", "submit", "reset"].includes(el.type);
  }
  return (el as HTMLElement).isContentEditable;
}

function imageFromClipboard(data: DataTransfer | null): File | null {
  if (!data) return null;
  for (const item of Array.from(data.items ?? [])) {
    if (item.kind === "file" && item.type.startsWith("image/")) {
      const blob = item.getAsFile();
      if (!blob) continue;
      const ext = blob.type.split("/")[1]?.replace("jpeg", "jpg") || "png";
      return new File([blob], `pasted-image-${Date.now()}.${ext}`, { type: blob.type });
    }
  }
  return null;
}

function installGlobalListeners() {
  if (globalListenersInstalled || typeof document === "undefined") return;
  globalListenersInstalled = true;

  document.addEventListener("paste", (event) => {
    const file = imageFromClipboard(event.clipboardData);
    if (!file) return;
    const active = document.activeElement;
    if (isEditableElement(active)) return;

    const visible = [...pasteTargets].filter((t) => isVisible(t.el));
    const target =
      visible.find((t) => t.hovered) ??
      visible.find((t) => active && t.el.contains(active)) ??
      (visible.length === 1 ? visible[0] : undefined);
    if (!target) return;

    event.preventDefault();
    target.accept(file);
  });

  // A file dropped just outside a drop zone would make the browser open it and lose the form.
  const blockStrayFileDrop = (event: globalThis.DragEvent) => {
    if (!event.dataTransfer?.types.includes("Files")) return;
    const overZone = [...pasteTargets].some((t) => t.el.contains(event.target as Node));
    if (!overZone) event.preventDefault();
  };
  window.addEventListener("dragover", blockStrayFileDrop);
  window.addEventListener("drop", blockStrayFileDrop);
}

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
  const zoneRef = useRef<HTMLLabelElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const previewUrl = useMemo(() => {
    if (file) return URL.createObjectURL(file);
    return initialImageUrl;
  }, [file, initialImageUrl]);

  function validate(nextFile: File | null): nextFile is File {
    if (!nextFile) return false;
    if (!nextFile.type.startsWith("image/")) {
      setError("Please select an image file.");
      return false;
    }
    if (nextFile.size > 5 * 1024 * 1024) {
      setError("Image must be under 5MB.");
      return false;
    }
    setError("");
    return true;
  }

  /** Dropped/pasted files must be written into the real input, or the form submits without them. */
  function applyExternalFile(nextFile: File | null) {
    if (!validate(nextFile)) return;
    const input = inputRef.current;
    if (input) {
      const transfer = new DataTransfer();
      transfer.items.add(nextFile);
      input.files = transfer.files;
    }
    setFile(nextFile);
  }

  const acceptRef = useRef(applyExternalFile);
  useEffect(() => {
    acceptRef.current = applyExternalFile;
  });

  useEffect(() => {
    const el = zoneRef.current;
    if (!el) return;
    installGlobalListeners();
    const target: PasteTarget = {
      el,
      hovered: false,
      accept: (f) => acceptRef.current(f),
    };
    const onEnter = () => {
      target.hovered = true;
    };
    const onLeave = () => {
      target.hovered = false;
    };
    el.addEventListener("mouseenter", onEnter);
    el.addEventListener("mouseleave", onLeave);
    pasteTargets.add(target);
    return () => {
      el.removeEventListener("mouseenter", onEnter);
      el.removeEventListener("mouseleave", onLeave);
      pasteTargets.delete(target);
    };
  }, []);

  function clearAttachedFile() {
    if (inputRef.current) inputRef.current.value = "";
    setFile(null);
    setError("");
  }

  function onDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setIsDragging(false);
    applyExternalFile(event.dataTransfer.files?.[0] ?? null);
  }

  return (
    <div className={compact ? "min-w-0 space-y-1.5" : inline ? "min-w-0 space-y-1.5" : "min-w-0 space-y-2"}>
      {label ? (
        <p className={inline
          ? "text-[11px] font-bold uppercase tracking-[0.1em] text-slate-500"
          : "text-xs font-semibold uppercase tracking-wide text-slate-500"
        }>
          {label}
          {optional ? (
            <span className={`ml-1 font-normal normal-case ${inline ? "text-[10px] tracking-normal text-slate-400" : "text-slate-500"}`}>
              (optional)
            </span>
          ) : (
            <span className="ml-1 text-red-500">*</span>
          )}
        </p>
      ) : null}

      <label
        ref={zoneRef}
        aria-label={uploadAriaLabel || label || "Upload image"}
        title="Click, drag & drop, or paste an image (Ctrl+V)"
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
            setIsDragging(false);
          }
        }}
        onDrop={onDrop}
        className={`relative flex w-full min-w-0 cursor-pointer overflow-hidden transition ${
          compact
            ? `flex-col items-center gap-2 rounded-xl border border-dashed p-2.5 text-center ${
                error
                  ? "border-red-400 bg-red-50"
                  : isDragging
                    ? "border-violet-500 bg-violet-50"
                    : "border-slate-200 bg-slate-50/80"
              }`
            : inline
              ? `box-border h-11 items-center gap-2.5 rounded-[0.85rem] border-[1.5px] px-3 shadow-sm ${
                  error
                    ? "border-red-400 bg-red-50 ring-2 ring-red-100"
                    : isDragging
                      ? "border-violet-400 bg-violet-50 ring-2 ring-violet-100"
                      : "border-[#e2e5f5] bg-white"
                }`
            : `items-center gap-3 rounded-xl border-2 border-dashed p-3 ${
                error
                  ? "border-red-400 bg-red-50"
                  : isDragging
                    ? "border-violet-500 bg-violet-50"
                    : "border-slate-300 bg-white"
              }`
        }`}
      >
        {previewUrl ? (
          <Image
            src={previewUrl}
            alt="Preview"
            width={compact ? 56 : inline ? 32 : 64}
            height={compact ? 56 : inline ? 32 : 64}
            className={
              compact
                ? "h-14 w-full max-w-[7rem] rounded-lg object-contain"
                : inline
                  ? "h-8 w-8 shrink-0 rounded-lg object-cover ring-1 ring-slate-200"
                : "h-16 w-16 shrink-0 rounded-lg object-cover"
            }
            unoptimized
          />
        ) : (
          <div
            className={
              compact
                ? "flex h-14 w-full max-w-[7rem] items-center justify-center rounded-lg bg-white text-[10px] text-slate-400 ring-1 ring-slate-200"
                : inline
                  ? "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-[8px] font-medium leading-tight text-slate-400 ring-1 ring-slate-200"
                : "flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs text-slate-500"
            }
          >
            {compact ? "No logo" : inline ? "Logo" : "No image"}
          </div>
        )}

        <div className="min-w-0 flex-1 overflow-hidden">
          <p
            className={
              compact
                ? "text-[11px] font-semibold text-slate-700"
                : inline
                  ? "truncate text-sm font-semibold leading-tight text-slate-700"
                  : "truncate text-sm font-semibold text-slate-800"
            }
          >
            {isDragging
              ? "Drop image here"
              : compact
                ? "Click to change"
                : inline
                  ? "Click to upload photo"
                  : "Drag & drop or click to upload"}
          </p>
          {!compact && !inline ? (
            <p className="truncate text-xs text-slate-500">
              <span className="hidden md:inline">Or paste a copied image (Ctrl+V) · </span>
              PNG/JPG/WebP, max 5MB
            </p>
          ) : (
            <p className={`truncate leading-tight ${inline ? "text-[11px] text-slate-500" : "text-[10px] text-slate-400"}`}>
              PNG/JPG/WebP · 5MB max
            </p>
          )}
          {file ? (
            <p className={`mt-0.5 truncate text-violet-700 ${compact ? "text-[10px]" : inline ? "text-[11px]" : "text-xs"}`}>{file.name}</p>
          ) : null}
        </div>

        {file ? (
          <button
            type="button"
            aria-label="Remove attached image"
            title="Remove attached image"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              clearAttachedFile();
            }}
            className={`flex shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 ring-1 ring-slate-200 transition hover:bg-red-50 hover:text-red-600 hover:ring-red-200 ${
              compact ? "absolute right-1.5 top-1.5 h-5 w-5 text-xs" : inline ? "h-6 w-6 text-sm" : "h-7 w-7 text-base"
            }`}
          >
            <span aria-hidden className="leading-none">×</span>
          </button>
        ) : null}

        <input
          ref={inputRef}
          name={name}
          type="file"
          accept="image/*"
          // `hidden` + required is silently blocked by browsers (no focusable control).
          // Use sr-only when an upload is required so validation can surface.
          className={!optional && !previewUrl ? "sr-only" : "hidden"}
          form={formId}
          required={!optional && !previewUrl}
          onInvalid={(event) => {
            event.preventDefault();
            setError("Please upload an image before saving.");
            (event.currentTarget as HTMLInputElement).closest("div")?.scrollIntoView({
              behavior: "smooth",
              block: "center",
            });
          }}
          onChange={(event) => {
            const y = window.scrollY;
            const next = event.target.files?.[0] ?? null;
            if (validate(next)) setFile(next);
            // File inputs / Next Image preview can yank the viewport — keep place.
            requestAnimationFrame(() => {
              window.scrollTo(0, y);
              requestAnimationFrame(() => window.scrollTo(0, y));
            });
          }}
        />
      </label>

      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
