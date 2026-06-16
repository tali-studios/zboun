"use client";

import { useEffect } from "react";

/** Registers the PWA service worker so browsers can offer “Add to Home Screen”. */
export function PwaRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Non-fatal — install UI still shows manual steps.
    });
  }, []);

  return null;
}
