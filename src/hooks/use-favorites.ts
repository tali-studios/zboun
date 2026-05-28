"use client";

import { useCallback, useEffect, useState } from "react";

const KEY = "zboun_favorites";

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
      // Notify other tabs / components
      window.dispatchEvent(new Event("zboun_favorites_change"));
      return next;
    });
  }, []);

  const isFavorite = useCallback(
    (slug: string) => favorites.has(slug),
    [favorites],
  );

  // sync when another tab changes favorites
  useEffect(() => {
    const handler = () => setFavorites(readStored());
    window.addEventListener("zboun_favorites_change", handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("zboun_favorites_change", handler);
      window.removeEventListener("storage", handler);
    };
  }, []);

  return { favorites, toggle, isFavorite };
}
