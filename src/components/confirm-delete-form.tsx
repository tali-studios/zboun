"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type ReactNode } from "react";
import { flushSync } from "react-dom";
import { DashboardAlertModal } from "@/components/dashboard-alert-modal";

type Props = {
  action: (formData: FormData) => void | Promise<void>;
  heading: string;
  message: string;
  confirmLabel?: string;
  /** Shown on the trigger while the delete is in progress. */
  pendingLabel?: string;
  /** Fields included in the submitted FormData (hidden inputs). */
  hiddenFields?: ReactNode;
  /** Always merged into FormData (e.g. when hidden inputs are easy to miss). */
  formFields?: Record<string, string>;
  triggerClassName?: string;
  triggerTitle?: string;
  triggerAriaLabel?: string;
  children: ReactNode;
};

export function ConfirmDeleteForm({
  action,
  heading,
  message,
  confirmLabel = "Yes, delete",
  pendingLabel = "Deleting…",
  hiddenFields,
  formFields,
  triggerClassName,
  triggerTitle,
  triggerAriaLabel,
  children,
}: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [fieldsEl, setFieldsEl] = useState<HTMLDivElement | null>(null);

  function submitDelete() {
    const formData = new FormData();
    if (fieldsEl) {
      const inputs = fieldsEl.querySelectorAll("input, select, textarea");
      inputs.forEach((el) => {
        const input = el as HTMLInputElement;
        if (!input.name) return;
        formData.set(input.name, input.value);
      });
    }
    if (formFields) {
      for (const [key, value] of Object.entries(formFields)) {
        formData.set(key, value);
      }
    }
    // Close modal and show pending on the trigger immediately.
    flushSync(() => setOpen(false));
    startTransition(async () => {
      await action(formData);
      router.refresh();
    });
  }

  const busyClass = isPending
    ? `${triggerClassName ?? ""} pointer-events-none cursor-not-allowed opacity-70`.trim()
    : triggerClassName;

  return (
    <>
      <div ref={setFieldsEl} className="hidden" aria-hidden>
        {hiddenFields}
      </div>
      <button
        type="button"
        title={isPending ? pendingLabel : triggerTitle}
        aria-label={isPending ? pendingLabel : triggerAriaLabel}
        aria-busy={isPending}
        disabled={isPending}
        className={busyClass}
        onClick={() => {
          if (!isPending) setOpen(true);
        }}
      >
        {isPending ? (
          <span className="inline-flex items-center justify-center gap-1.5">
            <span
              className="h-3.5 w-3.5 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent opacity-80"
              aria-hidden
            />
            {pendingLabel ? (
              <span className="text-[11px] font-semibold leading-none">{pendingLabel}</span>
            ) : null}
          </span>
        ) : (
          children
        )}
      </button>
      <DashboardAlertModal
        open={open}
        heading={heading}
        message={message}
        variant="warning"
        confirmLabel={confirmLabel}
        confirmTone="danger"
        busy={isPending}
        onClose={() => {
          if (!isPending) setOpen(false);
        }}
        onConfirm={submitDelete}
      />
    </>
  );
}
