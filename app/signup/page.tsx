import { customerSignUpAction } from "@/app-actions/customer-auth";
import { getSafeRedirectPath } from "@/lib/auth-redirect";
import Image from "next/image";
import Link from "next/link";
import { BackButton } from "@/components/back-button";

type Props = {
  searchParams: Promise<{ error?: string; success?: string; next?: string }>;
};

const ERROR_MESSAGES: Record<string, string> = {
  missing_fields: "Please fill in all required fields.",
  password_too_short: "Password must be at least 8 characters.",
  password_mismatch: "Passwords do not match.",
  signup_failed: "Something went wrong. Please try again.",
  smtp_failed:
    "We could not send the confirmation email and your account was not created. Ask the site admin to fix Supabase SMTP (sender email must match SMTP username + valid app password), or disable “Confirm email” in Supabase → Authentication → Providers → Email.",
};

export default async function CustomerSignupPage({ searchParams }: Props) {
  const { error, success, next: nextRaw } = await searchParams;
  const next = getSafeRedirectPath(nextRaw, "/");

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-white to-violet-50 px-4 py-12">
      {/* Background orbs */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-gradient-to-br from-violet-300/30 via-fuchsia-200/20 to-transparent blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-0 h-72 w-72 rounded-full bg-emerald-200/15 blur-3xl"
      />

      <div className="relative w-full max-w-sm">
        {/* Card */}
        <div className="rounded-[28px] border border-violet-100/80 bg-white p-8 shadow-[0_24px_64px_rgba(120,84,255,0.18)]">
          {/* Logo + nav */}
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
            <BackButton
              fallbackHref="/"
              className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-500 transition hover:border-violet-300 hover:text-violet-700"
            >
              ← Back
            </BackButton>
          </div>

          {/* Heading */}
          <div className="mb-6">
            <p className="text-[10px] font-bold uppercase tracking-widest text-violet-600">Join Zboun</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">Create account</h1>
            <p className="mt-1 text-sm text-slate-500">
              Save your addresses and order faster.
            </p>
          </div>

          {/* Success: check email */}
          {success === "check_email" ? (
            <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-800">
              <p className="font-bold">Almost there! Check your email 📬</p>
              <p className="mt-1 text-emerald-700">
                We sent a confirmation link to your inbox. Click it to activate your account, then{" "}
                <Link
                  href={next === "/" ? "/login" : `/login?next=${encodeURIComponent(next)}`}
                  className="font-semibold underline underline-offset-2 hover:text-emerald-900"
                >
                  sign in here
                </Link>
                .
              </p>
            </div>
          ) : null}

          {/* Error */}
          {error ? (
            <div className="mb-5 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {ERROR_MESSAGES[error] ?? decodeURIComponent(error)}
            </div>
          ) : null}

          {/* Form — hide if confirmation email was just sent */}
          <form action={customerSignUpAction} className={`space-y-3 ${success === "check_email" ? "hidden" : ""}`}>
            <input type="hidden" name="next" value={next} />
            <div>
              <label htmlFor="name" className="mb-1.5 block text-xs font-semibold text-slate-600">
                Full name
              </label>
              <input
                id="name"
                type="text"
                name="name"
                required
                placeholder="Your name"
                autoComplete="name"
                className="ui-input"
              />
            </div>
            <div>
              <label htmlFor="email" className="mb-1.5 block text-xs font-semibold text-slate-600">
                Email address
              </label>
              <input
                id="email"
                type="email"
                name="email"
                required
                placeholder="you@example.com"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                autoComplete="email"
                className="ui-input"
              />
            </div>
            <div>
              <label htmlFor="password" className="mb-1.5 block text-xs font-semibold text-slate-600">
                Password
              </label>
              <input
                id="password"
                type="password"
                name="password"
                required
                placeholder="Min. 8 characters"
                autoComplete="new-password"
                className="ui-input"
              />
            </div>
            <div>
              <label htmlFor="confirm_password" className="mb-1.5 block text-xs font-semibold text-slate-600">
                Confirm password
              </label>
              <input
                id="confirm_password"
                type="password"
                name="confirm_password"
                required
                placeholder="Repeat password"
                autoComplete="new-password"
                className="ui-input"
              />
            </div>
            <button
              type="submit"
              className="mt-2 flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 py-3.5 text-sm font-bold text-white shadow-md shadow-violet-400/30 transition hover:brightness-110 active:scale-[0.98]"
            >
              Create account
            </button>
          </form>

          {/* Divider */}
          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-100" />
            <span className="text-xs text-slate-400">or</span>
            <div className="h-px flex-1 bg-slate-100" />
          </div>

          {/* Sign in link */}
          <p className="text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link
              href={next === "/" ? "/login" : `/login?next=${encodeURIComponent(next)}`}
              className="font-semibold text-violet-600 transition hover:text-violet-700"
            >
              Sign in
            </Link>
          </p>
        </div>

        <p className="mt-4 text-center text-xs text-slate-400">
          By creating an account you agree to our{" "}
          <Link href="/for-restaurants" className="underline underline-offset-2 hover:text-slate-600">
            terms
          </Link>
          .
        </p>
      </div>
    </main>
  );
}
