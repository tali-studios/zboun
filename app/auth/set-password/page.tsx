"use client";

import { Suspense, useEffect, useState, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { PasswordInput } from "@/components/password-input";
import { setPasswordAction } from "@/app-actions/set-password";

type Status = "checking" | "ready" | "invalid";

const ERROR_MESSAGES: Record<string, string> = {
  missing_fields: "Please fill in all fields.",
  password_too_short: "Password must be at least 8 characters.",
  password_mismatch: "Passwords do not match.",
  update_failed: "Failed to set password. Please try again.",
};

function SetPasswordShell({ children }: { children: ReactNode }) {
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
              Welcome
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
              Set Your Password
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Choose a secure password for your Zboun dashboard.
            </p>
          </div>
          {children}
        </div>
      </div>
    </main>
  );
}

function CheckingState() {
  return (
    <div className="flex flex-col items-center gap-3 py-10 text-sm text-slate-500">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-violet-200 border-t-violet-600" />
      Verifying your invite link…
    </div>
  );
}

export default function SetPasswordPage() {
  return (
    <Suspense
      fallback={
        <SetPasswordShell>
          <CheckingState />
        </SetPasswordShell>
      }
    >
      <SetPasswordInner />
    </Suspense>
  );
}

function SetPasswordInner() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<Status>("checking");

  const linkError = searchParams.get("error") || searchParams.get("error_code");
  const formError = searchParams.get("error");
  const errorMessage =
    formError && ERROR_MESSAGES[formError]
      ? ERROR_MESSAGES[formError]
      : formError && !linkError
        ? decodeURIComponent(formError).replaceAll("_", " ")
        : null;

  useEffect(() => {
    // If Supabase already redirected back with an error (e.g. expired/used link), don't bother checking.
    if (linkError) {
      setStatus("invalid");
      return;
    }

    const supabase = createClient();
    let cancelled = false;
    let fallbackTimer: ReturnType<typeof setTimeout> | undefined;

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (cancelled) return;
      if (session) setStatus("ready");
    });

    supabase.auth.getSession().then(({ data }) => {
      if (cancelled) return;
      if (data.session) {
        setStatus("ready");
        return;
      }
      // The PKCE code exchange (from the ?code= param) can take a moment on first load.
      fallbackTimer = setTimeout(() => {
        if (cancelled) return;
        supabase.auth.getSession().then(({ data: retryData }) => {
          if (cancelled) return;
          setStatus(retryData.session ? "ready" : "invalid");
        });
      }, 1800);
    });

    return () => {
      cancelled = true;
      if (fallbackTimer) clearTimeout(fallbackTimer);
      sub.subscription.unsubscribe();
    };
  }, [linkError]);

  return (
    <SetPasswordShell>
      {status === "checking" ? (
        <CheckingState />
      ) : status === "invalid" ? (
        <div className="space-y-4">
          <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            This link is invalid or has expired. Please ask your administrator to send a new
            invite, or use “Forgot password” from the login page.
          </div>
          <a
            href="/login"
            className="flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 py-3.5 text-sm font-bold text-white shadow-md shadow-violet-400/30 transition hover:brightness-110 active:scale-[0.98]"
          >
            Go to login
          </a>
        </div>
      ) : (
        <>
          {errorMessage ? (
            <div className="mb-5 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {errorMessage}
            </div>
          ) : null}

          <form action={setPasswordAction} className="space-y-3">
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
              <label
                htmlFor="confirm_password"
                className="mb-1.5 block text-xs font-semibold text-slate-600"
              >
                Confirm password
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
              Set Password & Continue
            </button>
          </form>

          <div className="mt-5 rounded-xl border border-violet-100 bg-violet-50 px-4 py-3 text-xs text-violet-700">
            <strong>Tip:</strong> Use a strong, unique password that you don&apos;t use elsewhere.
          </div>
        </>
      )}
    </SetPasswordShell>
  );
}
