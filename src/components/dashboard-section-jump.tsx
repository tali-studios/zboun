"use client";

import { useEffect } from "react";
import { clearMenuItemsScrollPosition } from "@/components/restore-menu-items-scroll";

type Props = {
  target?: string | null;
  itemId?: string | null;
};

/** Scroll to a dashboard section when `?jump=items` / `?jump=sections` / `?jump=item` is present. */
export function DashboardSectionJump({ target, itemId }: Props) {
  useEffect(() => {
    if (!target) return;

    const id =
      target === "items"
        ? "items-toolbar"
        : target === "sections"
          ? "sections"
          : target === "add-item"
            ? "add-item"
            : target === "item" && itemId
              ? `menu-item-${itemId}`
              : target;

    clearMenuItemsScrollPosition();

    const scrollToTarget = () => {
      const el = document.getElementById(id);
      if (!el) return false;
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      return true;
    };

    // Soft navigation remounts gradually — retry until the node exists.
    if (scrollToTarget()) return;

    let attempts = 0;
    const timer = window.setInterval(() => {
      attempts += 1;
      if (scrollToTarget() || attempts >= 20) {
        window.clearInterval(timer);
      }
    }, 50);

    return () => window.clearInterval(timer);
  }, [target, itemId]);

  return null;
}
