import { customerSignInAction } from "@/app-actions/customer-auth";
import { getSafeRedirectPath } from "@/lib/auth-redirect";
import Image from "next/image";
import Link from "next/link";
import { BackButton } from "@/components/back-button";

type Props = {
  searchParams: Promise<{ error?: string; next?: string }>;
};

const ERROR_MESSAGES: Record<string, string> = {
  invalid_credentials: "Incorrect email or password. Please try again.",
  missing_fields: "Please fill in all fields.",
  account_not_found:
    "No customer account found for this email. Please sign up first.",
  use_dashboard_login:
    "This account is a restaurant admin. Please use the dashboard login instead.",
};

export default async function CustomerLoginPage({ searchParams }: Props) {
  const { error, next: nextRaw } = await searchParams;
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
        className="pointer-events-none absolute bottom-0 right-0 h-72 w-72 rounded-full bg-fuchsia-300/15 blur-3xl"
      />

      <div className="relative w-full max-w-sm">
        {/* Card */}
        <div className="rounded-[28px] border border-violet-100/80 bg-white p-8 shadow-[0_24px_64px_rgba(120,84,255,0.18)]">
          {/* Logo + nav */}
          <div className="mb-8 flex items-center justify-between">
            <Image
                src="/Logo.svg"
                alt="Zboun"
                width={120}
                height={36}
                className="h-8 w-auto object-contain"
                priority
                unoptimized
              />
            {/* <BackButton
              fallbackHref="/"
              className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-500 transition hover:border-violet-300 hover:text-violet-700"
            >
              ← Back
            </BackButton> */}
          </div>

          {/* Heading */}
          <div className="mb-6">
            <p className="text-[10px] font-bold uppercase tracking-widest text-violet-600">Welcome back</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">Sign in</h1>
            <p className="mt-1 text-sm text-slate-500">
              Order from your favourite restaurants.
            </p>
          </div>

          {/* Error */}
          {error && ERROR_MESSAGES[error] ? (
            <div className="mb-5 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {ERROR_MESSAGES[error]}
            </div>
          ) : null}

          {/* Form */}
          <form action={customerSignInAction} className="space-y-3">
            <input type="hidden" name="next" value={next} />
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
                placeholder="••••••••"
                autoComplete="current-password"
                className="ui-input"
              />
            </div>
            <button
              type="submit"
              className="mt-2 flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 py-3.5 text-sm font-bold text-white shadow-md shadow-violet-400/30 transition hover:brightness-110 active:scale-[0.98]"
            >
              Sign in
            </button>
          </form>

          {/* Divider */}
          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-100" />
            <span className="text-xs text-slate-400">or</span>
            <div className="h-px flex-1 bg-slate-100" />
          </div>

          {/* Sign up link */}
          <p className="text-center text-sm text-slate-500">
            Don&apos;t have an account?{" "}
            <Link
              href={next === "/" ? "/signup" : `/signup?next=${encodeURIComponent(next)}`}
              className="font-semibold text-violet-600 transition hover:text-violet-700"
            >
              Create one free
            </Link>
          </p>
        </div>

        {/* Admin login note */}
        <p className="mt-5 text-center text-xs text-slate-400">
          Restaurant admin?{" "}
          <Link href="/dashboard/login" className="text-slate-500 underline underline-offset-2 hover:text-slate-700">
            Sign in to your dashboard
          </Link>
        </p>
      </div>
    </main>
  );
}
