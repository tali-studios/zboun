import Link from "next/link";
import { AuthPageLogo } from "@/components/auth-page-logo";
import { DashboardLoginForm } from "@/components/dashboard-login-form";
import { ZBOUN_OPS_EMAIL } from "@/lib/zboun-contact";

type Props = {
  searchParams: Promise<{ error?: string }>;
};

export default async function LoginPage({ searchParams }: Props) {
  const { error } = await searchParams;

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
          <div className="mb-8 flex w-full justify-center">
            <AuthPageLogo />
            {/* <BackButton
              fallbackHref="/"
              className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-500 transition hover:border-violet-300 hover:text-violet-700"
            >
              ← Back
            </BackButton> */}
          </div>

          {/* Heading */}
          <div className="mb-6">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-violet-600">
              <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              Store Admin
            </span>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">Welcome back</h1>
            <p className="mt-1 text-sm text-slate-500">Sign in to manage your store and orders.</p>
          </div>

          {/* Errors */}
          {error === "invalid_credentials" && (
            <div className="mb-5 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              Invalid credentials. Please try again.
            </div>
          )}
          {error === "missing_profile" && (
            <div className="mb-5 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
              Account exists but has no app profile. Please contact{" "}
              <a href={`mailto:${ZBOUN_OPS_EMAIL}`} className="underline">{ZBOUN_OPS_EMAIL}</a>.
            </div>
          )}
          {error === "missing_restaurant_link" && (
            <div className="mb-5 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
              No restaurant linked to your account. Please contact support.
            </div>
          )}
          {error === "account_deactivated" && (
            <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
              Your account is deactivated. Please contact{" "}
              <a href={`mailto:${ZBOUN_OPS_EMAIL}`} className="underline">{ZBOUN_OPS_EMAIL}</a>{" "}
              to renew your subscription.
            </div>
          )}

          {/* Form */}
          <DashboardLoginForm />
        </div>

        {/* Customer login note */}
        <p className="mt-5 text-center text-xs text-slate-400">
          Customer?{" "}
          <Link href="/login" className="text-slate-500 underline underline-offset-2 hover:text-slate-700">
            Customer Login
          </Link>
        </p>
      </div>
    </main>
  );
}
