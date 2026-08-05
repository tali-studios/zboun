"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

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

/**
 * Favorites require a signed-in account when adding/removing.
 * Pass `isLoggedIn={false}` on public pages so ♥ taps go to login.
 * Omit the arg (e.g. footer badge) to only read local storage.
 */
export function useFavorites(isLoggedIn?: boolean) {
  const router = useRouter();
  const pathname = usePathname();
  const guestBlocked = isLoggedIn === false;
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (guestBlocked) {
      setFavorites(new Set());
      return;
    }
    setFavorites(readStored());
  }, [guestBlocked]);

  const toggle = useCallback(
    (slug: string) => {
      if (guestBlocked) {
        const next =
          pathname && pathname !== "/login"
            ? `/login?next=${encodeURIComponent(pathname)}`
            : "/login";
        router.push(next);
        return;
      }

      setFavorites((prev) => {
        const next = new Set(prev);
        if (next.has(slug)) next.delete(slug);
        else next.add(slug);
        writeStored(next);
        return next;
      });
      queueMicrotask(() => {
        window.dispatchEvent(new Event(CHANGE_EVENT));
      });
    },
    [guestBlocked, pathname, router],
  );

  const isFavorite = useCallback(
    (slug: string) => (guestBlocked ? false : favorites.has(slug)),
    [favorites, guestBlocked],
  );

  useEffect(() => {
    if (guestBlocked) return;
    const handler = () => setFavorites(readStored());
    window.addEventListener(CHANGE_EVENT, handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener(CHANGE_EVENT, handler);
      window.removeEventListener("storage", handler);
    };
  }, [guestBlocked]);

  return {
    favorites: guestBlocked ? new Set<string>() : favorites,
    toggle,
    isFavorite,
  };
}
