"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ClipboardList, User, Heart } from "lucide-react";
import { useFavorites } from "@/hooks/use-favorites";

const ITEMS = [
  { href: "/",                label: "Home",       icon: Home,          match: (p: string) => p === "/" },
  { href: "/favorites",       label: "Favorites",      icon: Heart,         match: (p: string) => p.startsWith("/favorites") },
  { href: "/account/orders",  label: "Orders",     icon: ClipboardList, match: (p: string) => p.startsWith("/account/orders") },
  { href: "/account",         label: "Account",    icon: User,          match: (p: string) => p.startsWith("/account") },
] as const;

export function CustomerMobileFooterNav() {
  const pathname = usePathname();
  const { favorites } = useFavorites();
  const activeHref = ITEMS.find((item) => item.match(pathname))?.href ?? null;

  return (
    <nav
      aria-label="Customer mobile navigation"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur md:hidden"
    >
      <div className="mx-auto grid max-w-md grid-cols-4 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1">
        {ITEMS.map((item) => {
          const active = item.href === activeHref;
          const Icon = item.icon;
          const isFavoritesItem = item.href === "/favorites";
          const showDot = isFavoritesItem && favorites.size > 0 && !active;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-col items-center justify-center rounded-xl px-1 py-2 text-[11px] font-semibold transition ${
                active
                  ? "text-violet-700"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
              }`}
              aria-current={active ? "page" : undefined}
            >
              <div className="relative mb-1">
                <Icon
                  className={`h-5 w-5 ${
                    active ? "text-violet-600" : "text-slate-500"
                  } ${isFavoritesItem ? "fill-none" : ""}`}
                />
                {showDot ? (
                  <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-violet-500" aria-hidden />
                ) : null}
              </div>
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
