"use client";

import { FormEvent, useState } from "react";
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
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <h1 className="text-2xl font-bold text-slate-900">Set your password</h1>
        <p className="mt-1 text-sm text-slate-600">
          Finish your restaurant admin account setup.
        </p>

        {!isDone ? (
          <form onSubmit={onSubmit} className="mt-4 space-y-3">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="New password"
              required
              className="w-full rounded-xl border border-slate-300 px-4 py-3"
            />
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm password"
              required
              className="w-full rounded-xl border border-slate-300 px-4 py-3"
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-slate-900 py-3 font-semibold text-white disabled:opacity-70"
            >
              {isSubmitting ? "Saving..." : "Set password"}
            </button>
          </form>
        ) : (
          <div className="mt-4 space-y-3">
            <p className="rounded-lg bg-green-50 p-3 text-sm text-green-700">
              Password set successfully. You can now sign in to your dashboard.
            </p>
            <button
              onClick={() => router.push("/dashboard/login")}
              className="w-full rounded-xl bg-green-600 py-3 font-semibold text-white"
            >
              Go to dashboard login
            </button>
            <p className="text-center text-xs text-slate-500">
              Dashboard URL:{" "}
              <Link href="/dashboard/login" className="underline">
                {dashboardUrl}
              </Link>
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
