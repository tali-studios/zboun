import Link from "next/link";
import { redirect } from "next/navigation";
import {
  requestPasswordChangeOtpAction,
  verifyOtpAndChangePasswordAction,
} from "@/app-actions/auth";
import { getCurrentUserRole } from "@/lib/data";

type Props = {
  searchParams: Promise<{ success?: string; error?: string }>;
};

export const dynamic = "force-dynamic";

export default async function ChangePasswordPage({ searchParams }: Props) {
  const appUser = await getCurrentUserRole();
  if (!appUser) {
    redirect("/dashboard/login");
  }

  const { success, error } = await searchParams;
  const dashboardHref =
    appUser.role === "superadmin" ? "/dashboard/super-admin" : "/dashboard/restaurant";

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <div className="panel w-full max-w-lg rounded-3xl p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">Change password</h1>
          <Link href={dashboardHref} className="btn btn-secondary">
            Back
          </Link>
        </div>
        <p className="mt-1 text-sm text-slate-600">
          For security, request a one-time code by email, then confirm it to set a new password.
        </p>

        {success === "otp_sent" && (
          <p className="mt-4 rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-700">
            OTP sent to your email.
          </p>
        )}
        {success === "password_changed" && (
          <p className="mt-4 rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-700">
            Password changed successfully.
          </p>
        )}
        {error && (
          <p className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {decodeURIComponent(error).replaceAll("_", " ")}
          </p>
        )}

        <form action={requestPasswordChangeOtpAction} className="mt-5">
          <button className="btn btn-primary w-full rounded-xl py-3">Send OTP to email</button>
        </form>

        <form action={verifyOtpAndChangePasswordAction} className="mt-4 space-y-3">
          <input
            name="otp"
            required
            inputMode="numeric"
            pattern="\d{6}"
            placeholder="6-digit OTP"
            className="ui-input"
          />
          <input
            name="password"
            type="password"
            minLength={8}
            required
            placeholder="New password"
            className="ui-input"
          />
          <input
            name="confirm_password"
            type="password"
            minLength={8}
            required
            placeholder="Confirm new password"
            className="ui-input"
          />
          <button className="btn btn-success w-full rounded-xl py-3">Verify OTP and change password</button>
        </form>
      </div>
    </main>
  );
}
