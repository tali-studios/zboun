"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { requestPasswordResetAction } from "@/app-actions/auth";
import { TurnstileField } from "@/components/turnstile-field";

function SubmitButton({ captchaReady }: { captchaReady: boolean }) {
  const { pending } = useFormStatus();
  const siteKeyConfigured = Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim());
  const blocked = pending || (siteKeyConfigured && !captchaReady);

  return (
    <button
      type="submit"
      disabled={blocked}
      className="mt-2 flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 py-3.5 text-sm font-bold text-white shadow-md shadow-violet-400/30 transition hover:brightness-110 active:scale-[0.98] disabled:cursor-wait disabled:opacity-80"
    >
      {pending
        ? "Sending…"
        : siteKeyConfigured && !captchaReady
          ? "Checking security…"
          : "Send reset link"}
    </button>
  );
}

export function ForgotPasswordForm() {
  const [captchaReady, setCaptchaReady] = useState(
    !process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim(),
  );

  return (
    <form action={requestPasswordResetAction} className="space-y-3">
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
      <TurnstileField onToken={() => setCaptchaReady(true)} />
      <SubmitButton captchaReady={captchaReady} />
    </form>
  );
}
