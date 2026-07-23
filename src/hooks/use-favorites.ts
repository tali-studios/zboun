"use client";

import { useCallback, useEffect, useState } from "react";

const KEY = "zboun_favorites";
const CHANGE_EVENT = "zboun_favorites_change";

function readStored(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(KEY);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

function writeStored(favs: Set<string>) {
  try {
    localStorage.setItem(KEY, JSON.stringify([...favs]));
  } catch {
    // ignore quota errors
  }
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  // hydrate from localStorage after mount
  useEffect(() => {
    setFavorites(readStored());
  }, []);

  const toggle = useCallback((slug: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      writeStored(next);
      return next;
    });
    // Defer broadcast so sibling hooks (e.g. footer) never setState during this update.
    queueMicrotask(() => {
      window.dispatchEvent(new Event(CHANGE_EVENT));
    });
  }, []);

  const isFavorite = useCallback(
    (slug: string) => favorites.has(slug),
    [favorites],
  );

  // sync when another tab / component changes favorites
  useEffect(() => {
    const handler = () => setFavorites(readStored());
    window.addEventListener(CHANGE_EVENT, handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener(CHANGE_EVENT, handler);
      window.removeEventListener("storage", handler);
    };
  }, []);

  return { favorites, toggle, isFavorite };
}
