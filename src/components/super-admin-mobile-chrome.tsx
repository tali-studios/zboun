"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Images,
  LayoutDashboard,
  LockKeyhole,
  LogOut,
  ReceiptText,
  Sparkles,
  Store,
  Users,
  type LucideIcon,
} from "lucide-react";
import { signOutAction } from "@/app-actions/auth";

const NAV_ITEMS: { href: string; label: string; icon: LucideIcon; match?: "exact" | "prefix" }[] = [
  { href: "/dashboard/super-admin", label: "Overview", icon: LayoutDashboard, match: "exact" },
  { href: "/dashboard/super-admin#businesses", label: "Businesses", icon: Store },
  { href: "/dashboard/super-admin#users", label: "Users", icon: Users },
  { href: "/dashboard/super-admin#billing", label: "Billing", icon: ReceiptText },
  { href: "/dashboard/super-admin/banners", label: "Banners", icon: Images, match: "prefix" },
  { href: "/dashboard/super-admin/visit-kit", label: "Visit kit", icon: Sparkles, match: "prefix" },
  { href: "/dashboard/change-password", label: "Password", icon: LockKeyhole, match: "prefix" },
];

function isActive(pathname: string, href: string, match?: "exact" | "prefix") {
  const path = href.split("#")[0] ?? href;
  if (match === "exact") return pathname === path;
  if (match === "prefix") return pathname === path || pathname.startsWith(`${path}/`);
  return false;
}

export function SuperAdminMobileChrome() {
  const pathname = usePathname();

  return (
    <div className="sticky top-0 z-40 -mx-3 -mt-3 mb-4 border-b border-slate-200/80 bg-white/95 px-3 pb-3 pt-2.5 backdrop-blur-xl sm:-mx-4 sm:-mt-4 sm:px-4 lg:hidden print:hidden">
      <div className="flex items-center justify-between gap-3">
        <Link href="/dashboard/super-admin" className="flex min-w-0 items-center gap-2.5">
          <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-2xl bg-white shadow-md shadow-violet-600/20 ring-1 ring-slate-200">
            <Image
              src="/zbounlogo.png"
              alt="Zboun"
              fill
              sizes="40px"
              className="scale-110 object-cover"
              priority
            />
          </span>
          <span className="min-w-0">
            <span className="block text-[15px] font-bold leading-none tracking-tight text-slate-950">
              Zboun
            </span>
            <span className="mt-1 block text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
              Super admin
            </span>
          </span>
        </Link>
        <form action={signOutAction}>
          <button
            type="submit"
            aria-label="Sign out"
            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-rose-200 bg-rose-50 text-rose-600 shadow-sm transition active:bg-rose-100"
          >
            <LogOut className="h-4 w-4" strokeWidth={2.25} />
          </button>
        </form>
      </div>

      <nav
        className="mt-3 grid grid-cols-4 gap-1.5"
        aria-label="Super admin navigation"
      >
        {NAV_ITEMS.map((item) => {
          const active = isActive(pathname, item.href, item.match);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 rounded-2xl px-1.5 py-2.5 text-center transition ${
                active
                  ? "bg-violet-600 text-white shadow-sm shadow-violet-500/30"
                  : "bg-slate-50 text-slate-600 ring-1 ring-slate-200/80 active:bg-slate-100"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" strokeWidth={2.25} aria-hidden />
              <span className="text-[10px] font-semibold leading-none tracking-tight">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
