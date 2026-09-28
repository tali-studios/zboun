"use client";

import { useEffect } from "react";

const SCROLL_KEY = "zboun:menu-items-scroll-y";
const HOLD_SAFETY_MS = 15000;
const RELEASE_AFTER_RENDER_MS = 500;

type ScrollHold = { y: number; release: () => void };
let activeHold: ScrollHold | null = null;

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
 * Pin the window scroll position from submit until the redirected page has rendered.
 * Scroll events fire before paint, so Next's scroll-to-top is undone without a visible jump.
 * Released by RestoreMenuItemsScroll after the next server render, on user input, or by a safety timeout.
 */
export function beginMenuItemsScrollHold() {
  if (typeof window === "undefined") return;
  endMenuItemsScrollHold(0);

  const y = window.scrollY;
  const onScroll = () => {
    if (Math.abs(window.scrollY - y) > 1) window.scrollTo(0, y);
  };
  const release = () => {
    window.clearTimeout(safety);
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("wheel", release);
    window.removeEventListener("touchstart", release);
    window.removeEventListener("keydown", release);
    if (activeHold?.release === release) activeHold = null;
  };
  const safety = window.setTimeout(release, HOLD_SAFETY_MS);
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("wheel", release, { passive: true });
  window.addEventListener("touchstart", release, { passive: true });
  window.addEventListener("keydown", release);
  activeHold = { y, release };
}

export function endMenuItemsScrollHold(delayMs = RELEASE_AFTER_RENDER_MS) {
  const hold = activeHold;
  if (!hold) return;
  if (delayMs <= 0) {
    hold.release();
    return;
  }
  window.setTimeout(hold.release, delayMs);
}

/**
 * After create/update redirects, Next resets scroll to top.
 * `renderKey` changes on every server render, so this re-runs after soft navigations too.
 * Restores the pre-submit position unless a ?jump= target is handling it.
 */
export function RestoreMenuItemsScroll({
  jump,
  renderKey,
}: {
  jump?: string | null;
  renderKey?: string;
}) {
  useEffect(() => {
    if (jump) {
      endMenuItemsScrollHold(0);
      return;
    }

    if (activeHold) {
      const { y } = activeHold;
      readSavedScroll();
      window.scrollTo(0, y);
      endMenuItemsScrollHold();
      return;
    }

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
  }, [jump, renderKey]);

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
