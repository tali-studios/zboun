"use client";

import { useState, useTransition, type ReactNode } from "react";
import { DashboardAlertModal } from "@/components/dashboard-alert-modal";

type Props = {
  action: (formData: FormData) => void | Promise<void>;
  heading: string;
  message: string;
  confirmLabel?: string;
  /** Fields included in the submitted FormData (hidden inputs). */
  hiddenFields?: ReactNode;
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
  hiddenFields,
  triggerClassName,
  triggerTitle,
  triggerAriaLabel,
  children,
}: Props) {
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
    startTransition(async () => {
      setOpen(false);
      await action(formData);
    });
  }

  return (
    <>
      <div ref={setFieldsEl} className="hidden" aria-hidden>
        {hiddenFields}
      </div>
      <button
        type="button"
        title={triggerTitle}
        aria-label={triggerAriaLabel}
        className={triggerClassName}
        onClick={() => setOpen(true)}
      >
        {children}
      </button>
      <DashboardAlertModal
        open={open}
        heading={heading}
        message={message}
        variant="warning"
        confirmLabel={confirmLabel}
        confirmTone="danger"
        busy={isPending}
        onClose={() => setOpen(false)}
        onConfirm={submitDelete}
      />
    </>
  );
}
