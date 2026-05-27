"use client";

import type { ReactNode } from "react";

type Props = {
  message: string;
  className?: string;
  children: ReactNode;
};

export function ConfirmSubmitButton({ message, className, children }: Props) {
  return (
    <button
      type="submit"
      className={className}
      onClick={(e) => {
        if (!confirm(message)) e.preventDefault();
      }}
    >
      {children}
    </button>
  );
}
