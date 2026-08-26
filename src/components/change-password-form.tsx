"use client";

import { useEffect, useState } from "react";
import { changeDashboardPasswordAction } from "@/app-actions/auth";
import { DashboardAlertModal } from "@/components/dashboard-alert-modal";
import { PasswordInput } from "@/components/password-input";
import { PendingSubmitButton } from "@/components/pending-submit-button";
import { ValidatedActionForm } from "@/components/validated-action-form";

const ERROR_MESSAGES: Record<string, string> = {
  missing_fields: "Please fill in all fields.",
  password_too_short: "New password must be at least 8 characters.",
  password_mismatch: "New passwords do not match.",
  wrong_current_password: "Your current password is incorrect.",
  missing_email: "Could not read your account email. Please sign in again.",
};

type Props = {
  initialError?: string | null;
  initialSuccess?: boolean;
};

export function ChangePasswordForm({ initialError = null, initialSuccess = false }: Props) {
  const [alert, setAlert] = useState<{
    heading: string;
    message: string;
    variant: "success" | "warning";
  } | null>(null);

  useEffect(() => {
    if (initialSuccess) {
      setAlert({
        heading: "Password updated",
        message: "Your password was changed successfully.",
        variant: "success",
      });
      return;
    }
    if (!initialError) return;
    const message =
      ERROR_MESSAGES[initialError] ??
      decodeURIComponent(initialError).replaceAll("_", " ");
    setAlert({
      heading: "Couldn’t update password",
      message,
      variant: "warning",
    });
  }, [initialError, initialSuccess]);

  return (
    <>
      <ValidatedActionForm
        action={changeDashboardPasswordAction}
        className="mt-6 space-y-3"
        alertHeading="Couldn’t update password"
        validate={(formData) => {
          const currentPassword = String(formData.get("current_password") ?? "");
          const password = String(formData.get("password") ?? "");
          const confirmPassword = String(formData.get("confirm_password") ?? "");
          if (!currentPassword || !password || !confirmPassword) {
            return "Please fill in all fields.";
          }
          if (password.length < 8) {
            return "New password must be at least 8 characters.";
          }
          if (password !== confirmPassword) {
            return "New passwords do not match.";
          }
          return null;
        }}
      >
        <div>
          <label htmlFor="current_password" className="mb-1.5 block text-xs font-semibold text-slate-600">
            Current password
          </label>
          <PasswordInput
            id="current_password"
            name="current_password"
            required
            placeholder="••••••••"
            autoComplete="current-password"
          />
        </div>
        <div>
          <label htmlFor="password" className="mb-1.5 block text-xs font-semibold text-slate-600">
            New password
          </label>
          <PasswordInput
            id="password"
            name="password"
            required
            placeholder="At least 8 characters"
            autoComplete="new-password"
          />
        </div>
        <div>
          <label htmlFor="confirm_password" className="mb-1.5 block text-xs font-semibold text-slate-600">
            Confirm new password
          </label>
          <PasswordInput
            id="confirm_password"
            name="confirm_password"
            required
            placeholder="••••••••"
            autoComplete="new-password"
          />
        </div>
        <PendingSubmitButton
          pendingLabel="Updating…"
          className="btn btn-primary mt-2 w-full rounded-2xl py-3.5 text-sm"
        >
          Update password
        </PendingSubmitButton>
      </ValidatedActionForm>

      <DashboardAlertModal
        open={alert != null}
        heading={alert?.heading ?? ""}
        message={alert?.message ?? ""}
        variant={alert?.variant ?? "warning"}
        onClose={() => setAlert(null)}
      />
    </>
  );
}
