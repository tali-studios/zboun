"use client";

import { FormEvent, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const dashboardUrl = "/dashboard/login";

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setIsSubmitting(true);
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) {
        setError(updateError.message);
        return;
      }
      setIsDone(true);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f8f8ff] px-4 py-12">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 h-[400px] w-[700px] rounded-full bg-gradient-to-br from-violet-300/30 via-fuchsia-200/18 to-transparent blur-3xl"
      />

      <div className="relative w-full max-w-sm rounded-3xl border border-violet-100 bg-white p-7 shadow-[0_20px_60px_rgba(120,84,255,0.16)] sm:p-8">
        {/* Logo */}
        <div className="mb-7 flex items-center justify-between">
          <Link href="/" className="flex rounded-xl outline-none transition-opacity hover:opacity-80">
            <Image
              src="/Logo.svg"
              alt="Zboun"
              width={110}
              height={32}
              className="h-7 w-auto object-contain"
              unoptimized
            />
          </Link>
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Set your password</h1>
        <p className="mt-1 text-sm text-slate-500">Complete your restaurant admin account setup.</p>

        {!isDone ? (
          <form onSubmit={onSubmit} className="mt-5 space-y-3">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="New password"
              required
              className="ui-input"
            />
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm password"
              required
              className="ui-input"
            />
            {error ? (
              <p className="rounded-xl border border-red-100 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
                {error}
              </p>
            ) : null}
            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-1 flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 py-3.5 text-sm font-bold text-white shadow-md shadow-violet-400/30 transition hover:brightness-110 disabled:opacity-50"
            >
              {isSubmitting ? "Saving…" : "Set password"}
            </button>
          </form>
        ) : (
          <div className="mt-5 space-y-3">
            <p className="rounded-xl border border-violet-100 bg-violet-50 px-3.5 py-3 text-sm text-violet-800">
              Password set successfully. You can now sign in to your dashboard.
            </p>
            <button
              onClick={() => router.push("/dashboard/login")}
              className="flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 py-3.5 text-sm font-bold text-white shadow-md shadow-violet-400/30 transition hover:brightness-110"
            >
              Go to dashboard login
            </button>
            <p className="text-center text-xs text-slate-400">
              Dashboard URL:{" "}
              <Link href="/dashboard/login" className="text-violet-600 underline-offset-2 hover:underline">
                {dashboardUrl}
              </Link>
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
