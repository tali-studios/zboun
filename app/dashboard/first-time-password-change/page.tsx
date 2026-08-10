import { redirect } from "next/navigation";
import { changeFirstTimePasswordAction } from "@/app-actions/first-time-password";
import { PasswordInput } from "@/components/password-input";
import { getCurrentUserRole } from "@/lib/data";
import { getSafeRedirectPath } from "@/lib/auth-redirect";

type Props = {
  searchParams: Promise<{ error?: string; next?: string }>;
};

const ERROR_MESSAGES: Record<string, string> = {
  missing_fields: "Please fill in all fields.",
  password_too_short: "Password must be at least 8 characters.",
  password_mismatch: "Passwords do not match.",
};

export const dynamic = "force-dynamic";

export default async function FirstTimePasswordChangePage({ searchParams }: Props) {
  const appUser = await getCurrentUserRole();
  if (!appUser) {
    redirect("/login");
  }
  if (appUser.role !== "restaurant_admin" && appUser.role !== "superadmin") {
    redirect("/login");
  }

  const { error, next: nextRaw } = await searchParams;
  const next = getSafeRedirectPath(nextRaw, "/");
  const errorMessage =
    error && ERROR_MESSAGES[error]
      ? ERROR_MESSAGES[error]
      : error
        ? decodeURIComponent(error).replaceAll("_", " ")
        : null;

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-white to-violet-50 px-4 py-12">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-gradient-to-br from-violet-300/30 via-fuchsia-200/20 to-transparent blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 right-0 h-72 w-72 rounded-full bg-fuchsia-300/15 blur-3xl"
      />

      <div className="relative w-full max-w-md">
        <div className="rounded-[28px] border border-violet-100/80 bg-white p-8 shadow-[0_24px_64px_rgba(120,84,255,0.18)]">
          <div className="mb-6">
            <p className="text-[10px] font-bold uppercase tracking-widest text-violet-600">
              Required
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
              Change Your Password
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              For security reasons, you must change your temporary password before continuing.
            </p>
          </div>

          {errorMessage ? (
            <div className="mb-5 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {errorMessage}
            </div>
          ) : null}

          <form action={changeFirstTimePasswordAction} className="space-y-3">
            <input type="hidden" name="next" value={next} />
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
                autoFocus
              />
            </div>
            <div>
              <label
                htmlFor="confirm_password"
                className="mb-1.5 block text-xs font-semibold text-slate-600"
              >
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
            <button
              type="submit"
              className="mt-2 flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 py-3.5 text-sm font-bold text-white shadow-md shadow-violet-400/30 transition hover:brightness-110 active:scale-[0.98]"
            >
              Change Password & Continue
            </button>
          </form>

          <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
            <strong>Important:</strong> After changing your password, you will be redirected to your dashboard.
            Please delete the email containing your temporary password.
          </div>
        </div>
      </div>
    </main>
  );
}
