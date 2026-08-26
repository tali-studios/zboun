"use client";

import { useEffect } from "react";

type Props = {
  target?: string | null;
};

/** Scroll to a dashboard section when `?jump=items` / `?jump=sections` is present. */
export function DashboardSectionJump({ target }: Props) {
  useEffect(() => {
    if (!target) return;
    const id =
      target === "items"
        ? "items-toolbar"
        : target === "sections"
          ? "sections"
          : target === "add-item"
            ? "add-item"
            : target;
    const timer = window.setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 120);
    return () => window.clearTimeout(timer);
  }, [target]);

  return null;
}
