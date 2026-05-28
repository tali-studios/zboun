import Image from "next/image";
import Link from "next/link";
import { resendCustomerSignupOtpAction, verifyCustomerSignupOtpAction } from "@/app-actions/customer-auth";
import { getSafeRedirectPath } from "@/lib/auth-redirect";

type Props = {
  searchParams: Promise<{ email?: string; next?: string; error?: string; success?: string }>;
};

const ERROR_MESSAGES: Record<string, string> = {
  missing_email: "Missing email address.",
  invalid_otp: "Invalid code. Please check and try again.",
  otp_not_found_or_expired: "Code expired. Request a new one.",
  account_not_found: "Account not found. Please sign up again.",
  signup_unavailable: "Signup is temporarily unavailable. Please try again shortly.",
  otp_send_failed: "Could not send OTP email. Please try again.",
};

export default async function VerifySignupPage({ searchParams }: Props) {
  const { email = "", next: nextRaw, error, success } = await searchParams;
  const next = getSafeRedirectPath(nextRaw, "/");

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-white to-violet-50 px-4 py-12">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-gradient-to-br from-violet-300/30 via-fuchsia-200/20 to-transparent blur-3xl"
      />

      <div className="relative w-full max-w-sm rounded-[28px] border border-violet-100/80 bg-white p-8 shadow-[0_24px_64px_rgba(120,84,255,0.18)]">
        <div className="mb-8 flex items-center justify-between">
          <Link href="/" className="outline-none transition-opacity hover:opacity-80">
            <Image
              src="/Logo.svg"
              alt="Zboun"
              width={120}
              height={36}
              className="h-8 w-auto object-contain"
              priority
              unoptimized
            />
          </Link>
          <Link
            href={`/signup?next=${encodeURIComponent(next)}`}
            className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-500 transition hover:border-violet-300 hover:text-violet-700"
          >
            ← Back
          </Link>
        </div>

        <div className="mb-6">
          <p className="text-[10px] font-bold uppercase tracking-widest text-violet-600">Verify email</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">Enter 6-digit code</h1>
          <p className="mt-1 text-sm text-slate-500">
            We sent a verification code to{" "}
            <span className="font-semibold text-slate-700">{email || "your email"}</span>.
          </p>
        </div>

        {success === "otp_sent" ? (
          <div className="mb-5 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
            New code sent successfully.
          </div>
        ) : null}
        {error ? (
          <div className="mb-5 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {ERROR_MESSAGES[error] ?? decodeURIComponent(error).replaceAll("_", " ")}
          </div>
        ) : null}

        <form action={verifyCustomerSignupOtpAction} className="space-y-3">
          <input type="hidden" name="email" value={email} />
          <input type="hidden" name="next" value={next} />
          <input
            name="otp"
            required
            inputMode="numeric"
            pattern="\d{6}"
            maxLength={6}
            placeholder="6-digit OTP"
            className="ui-input text-center text-lg tracking-[0.2em]"
          />
          <button
            type="submit"
            className="mt-2 flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 py-3.5 text-sm font-bold text-white shadow-md shadow-violet-400/30 transition hover:brightness-110 active:scale-[0.98]"
          >
            Verify code
          </button>
        </form>

        <form action={resendCustomerSignupOtpAction} className="mt-3">
          <input type="hidden" name="email" value={email} />
          <input type="hidden" name="next" value={next} />
          <button
            type="submit"
            className="w-full rounded-2xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Resend code
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-slate-400">
          You can login only after successful verification.
        </p>
      </div>
    </main>
  );
}
