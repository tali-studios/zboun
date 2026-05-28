"use client";

import { useRouter } from "next/navigation";

type Props = {
  fallbackHref?: string;
  className?: string;
  children?: React.ReactNode;
};

export function BackButton({ fallbackHref = "/", className, children }: Props) {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => {
        if (window.history.length > 1) {
          router.back();
        } else {
          router.push(fallbackHref);
        }
      }}
      className={className}
    >
      {children}
    </button>
  );
}
