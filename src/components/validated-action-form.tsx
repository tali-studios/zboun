"use client";

import { useRef, useState, type FormEvent, type ReactNode } from "react";
import { flushSync } from "react-dom";
import { isRedirectError } from "next/dist/client/components/redirect-error";
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
  /** Fires as soon as a valid submit starts / ends (for parent saving UI). */
  onPendingChange?: (pending: boolean) => void;
};

/**
 * Server-action form that shows a popup when client validation fails.
 * Always preventDefault + awaits the action so pending UI can paint before save.
 */
export function ValidatedActionForm({
  children,
  className,
  action,
  validate,
  alertHeading = "Couldn’t save yet",
  id,
  noValidate = true,
  onPendingChange,
}: Props) {
  const [alert, setAlert] = useState<{ heading: string; message: string } | null>(null);
  const submittingRef = useRef(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submittingRef.current) return;

    const formData = new FormData(event.currentTarget);
    const error = validate(formData);
    if (error) {
      setAlert({ heading: alertHeading, message: error });
      return;
    }
    if (!action) return;

    submittingRef.current = true;
    // Force React to paint "Saving…" before the server round-trip starts
    flushSync(() => {
      onPendingChange?.(true);
    });

    try {
      await action(formData);
    } catch (err) {
      if (isRedirectError(err)) {
        // Soft navigation keeps this component mounted — clear overlay before rethrow.
        submittingRef.current = false;
        flushSync(() => {
          onPendingChange?.(false);
        });
        throw err;
      }
      submittingRef.current = false;
      flushSync(() => {
        onPendingChange?.(false);
      });
      setAlert({
        heading: alertHeading,
        message: err instanceof Error ? err.message : "Something went wrong. Please try again.",
      });
      return;
    }

    // Action returned without redirect
    submittingRef.current = false;
    onPendingChange?.(false);
  }

  return (
    <>
      <form id={id} onSubmit={onSubmit} className={className} noValidate={noValidate}>
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
