import Link from "next/link";
import { AuthPageLogo } from "@/components/auth-page-logo";
import { ForgotPasswordForm } from "@/components/forgot-password-form";

type Props = {
  searchParams: Promise<{ error?: string; success?: string }>;
};

const ERROR_MESSAGES: Record<string, string> = {
  missing_email: "Please enter your email address.",
  captcha_failed: "Security check failed. Please try again.",
  captcha_missing: "Security check is still loading. Please wait a moment and try again.",
  captcha_unavailable: "Security check is unavailable. Please try again later.",
  reset_failed: "We could not send a reset email. Please try again.",
};

export default async function ForgotPasswordPage({ searchParams }: Props) {
  const { error, success } = await searchParams;

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-white to-violet-50 px-4 py-12">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-gradient-to-br from-violet-300/30 via-fuchsia-200/20 to-transparent blur-3xl"
      />

      <div className="relative w-full max-w-sm">
        <div className="rounded-[28px] border border-violet-100/80 bg-white p-8 shadow-[0_24px_64px_rgba(120,84,255,0.18)]">
          <div className="mb-8 flex w-full justify-center">
            <AuthPageLogo />
          </div>

          <div className="mb-6">
            <p className="text-[10px] font-bold uppercase tracking-widest text-violet-600">Account</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">Forgot password</h1>
            <p className="mt-1 text-sm text-slate-500">
              Enter your email and we&apos;ll send a link to reset your password.
            </p>
          </div>

          {success === "email_sent" ? (
            <div className="mb-5 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
              If an account exists for that email, you&apos;ll receive a reset link shortly. Check your
              inbox and spam folder.
            </div>
          ) : null}

          {error && ERROR_MESSAGES[error] ? (
            <div className="mb-5 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {ERROR_MESSAGES[error]}
            </div>
          ) : null}

          {success !== "email_sent" ? <ForgotPasswordForm /> : null}

          <p className="mt-5 text-center text-sm text-slate-500">
            Remembered it?{" "}
            <Link href="/login" className="font-semibold text-violet-600 transition hover:text-violet-700">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
