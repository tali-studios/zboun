"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { customerSignUpAction } from "@/app-actions/customer-auth";
import { PhoneNumberField } from "@/components/phone-number-field";
import { TurnstileField } from "@/components/turnstile-field";

function CreateAccountButton({ captchaReady }: { captchaReady: boolean }) {
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
        ? "Creating…"
        : siteKeyConfigured && !captchaReady
          ? "Checking security…"
          : "Create account"}
    </button>
  );
}

type Props = {
  next: string;
};

export function CustomerSignupForm({ next }: Props) {
  const [captchaReady, setCaptchaReady] = useState(
    !process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim(),
  );

  return (
    <form action={customerSignUpAction} className="space-y-3">
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
      <PhoneNumberField required compact labelClassName="mb-1.5 block text-xs font-semibold text-slate-600" />
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
      <TurnstileField onToken={() => setCaptchaReady(true)} />
      <CreateAccountButton captchaReady={captchaReady} />
    </form>
  );
}
