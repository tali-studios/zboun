"use client";

import { useEffect } from "react";

const SCROLL_KEY = "zboun:menu-items-scroll-y";

/** Call right before a menu-items save that will navigate/refresh. */
export function saveMenuItemsScrollPosition() {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(SCROLL_KEY, String(window.scrollY));
  } catch {
    // ignore quota / private mode
  }
}

function readSavedScroll(): number | null {
  try {
    const raw = sessionStorage.getItem(SCROLL_KEY);
    if (raw == null) return null;
    sessionStorage.removeItem(SCROLL_KEY);
    const y = Number(raw);
    return Number.isFinite(y) && y >= 0 ? y : null;
  } catch {
    return null;
  }
}

/**
 * After create/update redirects, Next resets scroll to top.
 * Restore the pre-submit position unless a ?jump= target is handling it.
 */
export function RestoreMenuItemsScroll({ jump }: { jump?: string | null }) {
  useEffect(() => {
    if (jump) return;
    const y = readSavedScroll();
    if (y == null) return;

    const restore = () => {
      window.scrollTo(0, y);
    };
    restore();
    const t1 = window.setTimeout(restore, 40);
    const t2 = window.setTimeout(restore, 160);
    const t3 = window.setTimeout(restore, 360);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
    };
  }, [jump]);

  return null;
}

/** Used when jump=item — clear saved Y so we don't fight the element scroll. */
export function clearMenuItemsScrollPosition() {
  try {
    sessionStorage.removeItem(SCROLL_KEY);
  } catch {
    // ignore
  }
}
