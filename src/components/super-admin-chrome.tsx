import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";
import {
  Images,
  LayoutDashboard,
  LockKeyhole,
  LogOut,
  Sparkles,
  Store,
  Users,
} from "lucide-react";
import { signOutAction } from "@/app-actions/auth";
import { SuperAdminMobileChrome } from "@/components/super-admin-mobile-chrome";

const NAV_ITEMS = [
  { href: "/dashboard/super-admin", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/super-admin/businesses", label: "Businesses", icon: Store },
  { href: "/dashboard/super-admin/users", label: "Users", icon: Users },
  { href: "/dashboard/super-admin/banners", label: "Home banners", icon: Images },
  { href: "/dashboard/super-admin/visit-kit", label: "Visit kit", icon: Sparkles },
] as const;

type MetricTone = "neutral" | "accent" | "success" | "warning" | "danger";

const TONE_VALUE: Record<MetricTone, string> = {
  neutral: "text-slate-900",
  accent: "text-violet-700",
  success: "text-emerald-700",
  warning: "text-amber-700",
  danger: "text-rose-700",
};

const TONE_ICON: Record<MetricTone, string> = {
  neutral: "bg-slate-100 text-slate-600",
  accent: "bg-violet-50 text-violet-700",
  success: "bg-emerald-50 text-emerald-700",
  warning: "bg-amber-50 text-amber-700",
  danger: "bg-rose-50 text-rose-700",
};

export function SuperAdminShell({
  children,
  className = "",
  layoutClassName = "",
}: {
  children: ReactNode;
  className?: string;
  layoutClassName?: string;
}) {
  return (
    <main className={`relative min-h-screen overflow-x-hidden bg-[#f5f6fa] ${className}`}>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-[radial-gradient(ellipse_at_top_left,_rgba(124,58,237,0.10),_transparent_58%)] print:hidden"
      />
      <div className={`relative mx-auto flex w-full max-w-[1500px] gap-6 p-3 sm:p-4 lg:p-6 xl:gap-8 xl:p-8 ${layoutClassName}`}>
        <aside className="sticky top-6 hidden h-[calc(100vh-3rem)] w-60 shrink-0 flex-col overflow-hidden rounded-[1.75rem] bg-slate-950 p-3 text-white shadow-2xl shadow-slate-900/15 lg:flex print:hidden">
          <Link href="/dashboard/super-admin" className="flex items-center gap-3 px-2 py-3">
            <span className="relative h-11 w-11 overflow-hidden rounded-2xl bg-white shadow-lg shadow-violet-950/40 ring-1 ring-white/10">
              <Image
                src="/zbounlogo.png"
                alt="Zboun"
                fill
                sizes="44px"
                className="scale-110 object-cover"
                priority
              />
            </span>
            <span>
              <span className="block text-base font-bold tracking-tight">Zboun</span>
              <span className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                Platform admin
              </span>
            </span>
          </Link>

          <nav className="mt-5 space-y-1" aria-label="Super admin navigation">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-white/10 hover:text-white"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/[0.07] text-xs text-slate-300 transition group-hover:bg-violet-500 group-hover:text-white">
                  <item.icon className="h-3.5 w-3.5" strokeWidth={2.25} />
                </span>
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="mt-auto space-y-1 border-t border-white/10 pt-3">
            <Link
              href="/dashboard/change-password"
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-white/10 hover:text-white"
            >
              <LockKeyhole className="h-4 w-4" />
              Change password
            </Link>
            <form action={signOutAction}>
              <button
                type="submit"
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-rose-300 transition hover:bg-rose-500/10 hover:text-rose-200"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </form>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <SuperAdminMobileChrome />

          <div className="space-y-4 sm:space-y-5 lg:space-y-6">{children}</div>
        </div>
      </div>
    </main>
  );
}

export function SuperAdminHeader({
  title = "Super admin",
  subtitle = "Manage stores, users, billing, and platform operations.",
  className = "",
  hideActions = false,
}: {
  title?: string;
  subtitle?: string;
  className?: string;
  hideActions?: boolean;
}) {
  return (
    <header className={`overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm sm:rounded-3xl ${className}`}>
      <div className="bg-gradient-to-r from-white via-white to-violet-50/70 px-4 py-4 sm:px-6 sm:py-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex min-w-0 items-start gap-3.5">
            <div className="relative hidden h-11 w-11 shrink-0 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 sm:block lg:hidden">
              <Image
                src="/zbounlogo.png"
                alt="Zboun"
                fill
                sizes="44px"
                className="scale-110 object-cover"
              />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-violet-600">
                Platform control
              </p>
              <h1 className="mt-1 text-xl font-bold tracking-tight text-slate-950 sm:text-2xl md:text-[1.75rem]">
                {title}
              </h1>
              {subtitle ? (
                <p className="mt-1 max-w-2xl text-xs leading-relaxed text-slate-500 sm:text-sm">{subtitle}</p>
              ) : null}
            </div>
          </div>

          {!hideActions ? (
            <div className="hidden flex-wrap items-center gap-1.5 rounded-2xl border border-slate-200/80 bg-white/90 p-1.5 shadow-sm md:flex lg:hidden">
                <Link
                  href="/dashboard/super-admin/banners"
                  className="rounded-xl px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
                >
                  Home banners
                </Link>
                <Link
                  href="/dashboard/super-admin/visit-kit"
                  className="rounded-xl px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
                >
                  Visit kit
                </Link>
                <Link
                  href="/dashboard/change-password"
                  className="rounded-xl px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
                >
                  Password
                </Link>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}

export function SuperAdminMetric({
  label,
  value,
  hint,
  tone = "neutral",
  icon,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  tone?: MetricTone;
  icon?: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200/70 bg-white p-3.5 shadow-[0_1px_2px_rgba(15,17,38,0.04)] transition hover:-translate-y-0.5 hover:border-slate-300/80 hover:shadow-md sm:p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            {label}
          </p>
          <p
            className={`mt-1.5 text-xl font-bold tracking-tight tabular-nums sm:text-2xl ${TONE_VALUE[tone]}`}
          >
            {value}
          </p>
          {hint ? <p className="mt-1 text-xs text-slate-400">{hint}</p> : null}
        </div>
        {icon ? (
          <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${TONE_ICON[tone]}`}
          >
            {icon}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function SuperAdminMetricsBlock({
  id,
  title,
  description,
  columns = 4,
  children,
}: {
  id?: string;
  title: string;
  description?: string;
  columns?: 4 | 5;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      className="scroll-mt-28 rounded-2xl border border-slate-200/70 bg-white/80 p-3.5 shadow-sm backdrop-blur-sm sm:rounded-3xl sm:p-5"
    >
      <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-sm font-bold tracking-tight text-slate-900">{title}</h2>
          {description ? (
            <p className="mt-0.5 text-xs text-slate-500">{description}</p>
          ) : null}
        </div>
      </div>
      <div
        className={
          columns === 5
            ? "grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
            : "grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
        }
      >
        {children}
      </div>
    </section>
  );
}

export function SuperAdminSection({
  title,
  description,
  children,
  className = "",
}: {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`panel p-4 md:p-5 ${className}`}>
      <div className="mb-4 border-b border-slate-100 pb-3">
        <h2 className="panel-title">{title}</h2>
        {description ? (
          <p className="mt-1 text-sm leading-relaxed text-slate-500">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}
