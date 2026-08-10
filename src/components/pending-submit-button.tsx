"use client";

import { useFormStatus } from "react-dom";
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  pendingLabel?: string;
  className?: string;
};

/**
 * Submit button that disables itself and shows a pending label while its
 * parent form is submitting, preventing duplicate/rapid re-clicks.
 * Only this button needs to be a client component — the enclosing <form>
 * and page can stay server components.
 */
export function PendingSubmitButton({ children, pendingLabel = "Please wait…", className }: Props) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className={`${className ?? ""} disabled:cursor-wait disabled:opacity-70`}
    >
      {pending ? pendingLabel : children}
    </button>
  );
}
