"use client";

import { useEffect } from "react";

type Props = {
  target?: string | null;
};

/** Scroll to a dashboard section when `?jump=items` (etc.) is present. */
export function DashboardSectionJump({ target }: Props) {
  useEffect(() => {
    if (!target) return;
    const id = target === "items" ? "items-toolbar" : target;
    const timer = window.setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
    return () => window.clearTimeout(timer);
  }, [target]);

  return null;
}
