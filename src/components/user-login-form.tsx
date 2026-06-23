"use client";

import { useFormStatus } from "react-dom";
import { PasswordInput } from "@/components/password-input";
import { customerSignInAction } from "@/app-actions/customer-auth";

function SignInButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-2 flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 py-3.5 text-sm font-bold text-white shadow-md shadow-violet-400/30 transition hover:brightness-110 active:scale-[0.98] disabled:cursor-wait disabled:opacity-80"
    >
      {pending ? "Signing in…" : "Sign in"}
    </button>
  );
}

type Props = {
  next: string;
};

export function UserLoginForm({ next }: Props) {
  return (
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
        <PasswordInput
          id="password"
          name="password"
          required
          placeholder="••••••••"
          autoComplete="current-password"
        />
      </div>
      <SignInButton />
    </form>
  );
}
