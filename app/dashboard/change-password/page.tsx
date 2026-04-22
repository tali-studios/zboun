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
    <main className="flex min-h-screen items-center justify-center bg-[#f8f8ff] px-4 py-12">
      <div className="w-full max-w-md rounded-3xl border border-violet-100 bg-white p-7 shadow-[0_12px_40px_rgba(120,84,255,0.14)] sm:p-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Change password</h1>
          <Link href={dashboardHref} className="btn btn-secondary text-xs">
            ← Back
          </Link>
        </div>
        <p className="mt-1.5 text-sm text-slate-500">
          Request a one-time code by email, then use it to set a new password.
        </p>

        {success === "otp_sent" && (
          <div className="mt-4 rounded-xl border border-violet-100 bg-violet-50 px-3.5 py-3 text-sm text-violet-800">
            OTP sent to your email address.
          </div>
        )}
        {success === "password_changed" && (
          <div className="mt-4 rounded-xl border border-violet-100 bg-violet-50 px-3.5 py-3 text-sm text-violet-800">
            Password changed successfully.
          </div>
        )}
        {error && (
          <div className="mt-4 rounded-xl border border-red-100 bg-red-50 px-3.5 py-3 text-sm text-red-700">
            {decodeURIComponent(error).replaceAll("_", " ")}
          </div>
        )}

        <form action={requestPasswordChangeOtpAction} className="mt-6">
          <button className="btn btn-secondary w-full rounded-2xl py-3 text-sm">
            Send OTP to my email
          </button>
        </form>

        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-slate-100" />
          <span className="text-xs text-slate-400">then verify below</span>
          <div className="h-px flex-1 bg-slate-100" />
        </div>

        <form action={verifyOtpAndChangePasswordAction} className="space-y-3">
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
          <button className="btn btn-primary w-full rounded-2xl py-3.5 text-sm">
            Verify OTP &amp; change password
          </button>
        </form>
      </div>
    </main>
  );
}
