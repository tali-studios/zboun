"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { DashboardAlertModal } from "@/components/dashboard-alert-modal";

type Props = {
  children: ReactNode;
  className?: string;
  action?: (formData: FormData) => void | Promise<void>;
  /** Return an error message to block submit, or null to proceed. */
  validate: (formData: FormData) => string | null;
  alertHeading?: string;
  id?: string;
  noValidate?: boolean;
};

/**
 * Server-action form that shows a popup when client validation fails.
 * When valid, the default form action runs (no preventDefault).
 */
export function ValidatedActionForm({
  children,
  className,
  action,
  validate,
  alertHeading = "Couldn’t save yet",
  id,
  noValidate = true,
}: Props) {
  const [alert, setAlert] = useState<{ heading: string; message: string } | null>(null);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    const formData = new FormData(event.currentTarget);
    const error = validate(formData);
    if (error) {
      event.preventDefault();
      setAlert({ heading: alertHeading, message: error });
    }
  }

  return (
    <>
      <form id={id} action={action} onSubmit={onSubmit} className={className} noValidate={noValidate}>
        {children}
      </form>
      <DashboardAlertModal
        open={alert != null}
        heading={alert?.heading ?? ""}
        message={alert?.message ?? ""}
        variant="warning"
        onClose={() => setAlert(null)}
      />
    </>
  );
}
