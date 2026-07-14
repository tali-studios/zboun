import Link from "next/link";
import { AuthPageLogo } from "@/components/auth-page-logo";
import { UserLoginForm } from "@/components/user-login-form";
import { getSafeRedirectPath } from "@/lib/auth-redirect";
import { ZBOUN_OPS_EMAIL } from "@/lib/zboun-contact";

type Props = {
  searchParams: Promise<{ error?: string; next?: string; success?: string }>;
};

const ERROR_MESSAGES: Record<string, string> = {
  invalid_credentials: "Incorrect email or password. Please try again.",
  missing_fields: "Please fill in all fields.",
  account_not_found: "No account found for this email. Please sign up first.",
  email_not_verified: "Please verify your email with the 6-digit code before signing in.",
  missing_profile: `Account exists but has no app profile. Please contact ${ZBOUN_OPS_EMAIL}.`,
  missing_restaurant_link: "No restaurant linked to your account. Please contact support.",
  account_deactivated: `Your account is deactivated. Please contact ${ZBOUN_OPS_EMAIL} to renew your subscription.`,
  captcha_failed: "Security check failed. Please try again.",
  captcha_missing: "Security check is still loading. Please wait a moment and try again.",
  captcha_unavailable: "Security check is unavailable. Please try again later.",
};

export default async function LoginPage({ searchParams }: Props) {
  const { error, success, next: nextRaw } = await searchParams;
  const next = getSafeRedirectPath(nextRaw, "/");

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

      <div className="relative w-full max-w-sm">
        <div className="rounded-[28px] border border-violet-100/80 bg-white p-8 shadow-[0_24px_64px_rgba(120,84,255,0.18)]">
          <div className="mb-8 flex w-full justify-center">
            <AuthPageLogo />
          </div>

          <div className="mb-6">
            <p className="text-[10px] font-bold uppercase tracking-widest text-violet-600">Welcome back</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">Sign in</h1>
            <p className="mt-1 text-sm text-slate-500">
              One login for customers and store admins.
            </p>
          </div>

          {success === "email_verified" ? (
            <div className="mb-5 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
              Email verified successfully. You can now sign in.
            </div>
          ) : null}
          {success === "account_deleted" ? (
            <div className="mb-5 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
              Your account has been deleted.
            </div>
          ) : null}
          {error && ERROR_MESSAGES[error] ? (
            <div
              className={`mb-5 rounded-2xl border px-4 py-3 text-sm font-medium ${
                error === "account_deactivated"
                  ? "border-amber-200 bg-amber-50 text-amber-800"
                  : "border-red-100 bg-red-50 text-red-700"
              }`}
            >
              {error === "missing_profile" || error === "account_deactivated" ? (
                <>
                  {error === "missing_profile"
                    ? "Account exists but has no app profile. Please contact "
                    : "Your account is deactivated. Please contact "}
                  <a href={`mailto:${ZBOUN_OPS_EMAIL}`} className="underline">
                    {ZBOUN_OPS_EMAIL}
                  </a>
                  {error === "account_deactivated" ? " to renew your subscription." : "."}
                </>
              ) : (
                ERROR_MESSAGES[error]
              )}
            </div>
          ) : null}

          <UserLoginForm next={next} />

          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-100" />
            <span className="text-xs text-slate-400">or</span>
            <div className="h-px flex-1 bg-slate-100" />
          </div>

          <p className="text-center text-sm text-slate-500">
            New customer?{" "}
            <Link
              href={next === "/" ? "/signup" : `/signup?next=${encodeURIComponent(next)}`}
              className="font-semibold text-violet-600 transition hover:text-violet-700"
            >
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
