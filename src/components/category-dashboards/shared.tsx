import { signOutAction } from "@/app-actions/auth";
import type { CategoryDashboardSharedProps } from "@/components/category-dashboards/types";

export function DashboardShell({
  title,
  businessTypeLabel,
  restaurantName,
  children,
}: {
  title: string;
  businessTypeLabel: string;
  restaurantName: string;
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-[#f8f8ff] p-3 sm:p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-5">
        <header className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-700 via-violet-600 to-fuchsia-600 p-5 text-white shadow-lg shadow-violet-600/30 md:p-6">
          <div aria-hidden className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
          <div className="relative flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-violet-200">{title}</p>
              <h1 className="mt-1 text-xl font-bold md:text-2xl">{restaurantName}</h1>
              <p className="mt-0.5 text-xs text-violet-200 md:text-sm">{businessTypeLabel}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <a href="/dashboard/change-password" className="btn rounded-full border border-white/30 bg-white/10 text-white hover:bg-white/20">Password</a>
              <form action={signOutAction}>
                <button className="btn rounded-full border border-white/30 bg-white/10 text-white hover:bg-white/20">Sign out</button>
              </form>
            </div>
          </div>
        </header>
        {children}
      </div>
    </main>
  );
}

export function ProfileReadiness({
  profileCompleteness,
  enabledModuleCount,
}: Pick<CategoryDashboardSharedProps, "profileCompleteness" | "enabledModuleCount">) {
  return (
    <section className="grid gap-3 sm:grid-cols-2">
      <article className="panel p-5">
        <h2 className="panel-title">Profile readiness</h2>
        <p className="mt-1 text-sm text-slate-600">Keep your business profile complete to improve trust and conversion.</p>
        <p className="mt-3 inline-flex rounded-full bg-violet-100 px-3 py-1 text-sm font-semibold text-violet-700">
          {profileCompleteness}/3 profile fields completed
        </p>
      </article>
      <article className="panel p-5">
        <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Enabled modules</p>
        <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{enabledModuleCount}</p>
      </article>
    </section>
  );
}

export function QuickActions({
  title = "Quick actions",
  actions,
}: {
  title?: string;
  actions: Array<{ label: string; href: string; hint: string; enabled?: boolean }>;
}) {
  const visibleActions = actions.filter((action) => action.enabled !== false);
  return (
    <section className="panel p-5">
      <h2 className="panel-title">{title}</h2>
      {visibleActions.length > 0 ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {visibleActions.map((action) => (
            <a
              key={action.label}
              href={action.href}
              className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-violet-300 hover:shadow-md"
            >
              <p className="text-sm font-semibold text-slate-900 group-hover:text-violet-700">{action.label}</p>
              <p className="mt-1 text-xs text-slate-500">{action.hint}</p>
            </a>
          ))}
        </div>
      ) : (
        <p className="mt-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
          No quick actions available yet. Enable modules from super admin add-ons to unlock workflows.
        </p>
      )}
    </section>
  );
}

export function OpsHighlights({
  items,
}: {
  items: Array<{ label: string; value: string; tone?: "neutral" | "good" | "warn" }>;
}) {
  return (
    <section className="panel p-5">
      <h2 className="panel-title">Operations highlights</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {items.map((item) => {
          const toneClass =
            item.tone === "good"
              ? "text-emerald-700"
              : item.tone === "warn"
                ? "text-amber-700"
                : "text-slate-900";
          return (
            <article key={item.label} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">{item.label}</p>
              <p className={`mt-2 text-2xl font-bold tracking-tight ${toneClass}`}>{item.value}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export function ModuleGrid({
  inventoryEnabled,
  accountingEnabled,
  posEnabled,
  crmEnabled,
  loyaltyEnabled,
  eventsEnabled,
  pmsEnabled,
  ecommerceEnabled,
  fleetEnabled,
  clubEnabled,
}: Pick<
  CategoryDashboardSharedProps,
  | "inventoryEnabled"
  | "accountingEnabled"
  | "posEnabled"
  | "crmEnabled"
  | "loyaltyEnabled"
  | "eventsEnabled"
  | "pmsEnabled"
  | "ecommerceEnabled"
  | "fleetEnabled"
  | "clubEnabled"
>) {
  const moduleCount = [
    clubEnabled,
    pmsEnabled,
    crmEnabled,
    accountingEnabled,
    eventsEnabled,
    fleetEnabled,
    ecommerceEnabled,
    posEnabled,
    inventoryEnabled,
    loyaltyEnabled,
  ].filter(Boolean).length;

  return (
    <section className="panel p-5">
      <h2 className="panel-title">Active modules</h2>
      {moduleCount > 0 ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {clubEnabled && <a href="/dashboard/restaurant/club" className="rounded-2xl border border-purple-200 bg-purple-50 p-4 text-sm font-semibold text-purple-800">Club Management</a>}
          {pmsEnabled && <a href="/dashboard/restaurant/pms" className="rounded-2xl border border-sky-200 bg-sky-50 p-4 text-sm font-semibold text-sky-800">Property Management</a>}
          {crmEnabled && <a href="/dashboard/restaurant/crm" className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-800">CRM</a>}
          {accountingEnabled && <a href="/dashboard/restaurant/accounting" className="rounded-2xl border border-indigo-200 bg-indigo-50 p-4 text-sm font-semibold text-indigo-800">Accounting & Payroll</a>}
          {eventsEnabled && <a href="/dashboard/restaurant/events" className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">Event Management</a>}
          {fleetEnabled && <a href="/dashboard/restaurant/fleet" className="rounded-2xl border border-cyan-200 bg-cyan-50 p-4 text-sm font-semibold text-cyan-800">Fleet Management</a>}
          {ecommerceEnabled && <a href="/dashboard/restaurant/ecommerce" className="rounded-2xl border border-orange-200 bg-orange-50 p-4 text-sm font-semibold text-orange-800">E-commerce</a>}
          {posEnabled && <a href="/dashboard/restaurant/pos" className="rounded-2xl border border-cyan-200 bg-cyan-50 p-4 text-sm font-semibold text-cyan-800">POS</a>}
          {inventoryEnabled && <a href="/dashboard/restaurant/inventory" className="rounded-2xl border border-teal-200 bg-teal-50 p-4 text-sm font-semibold text-teal-800">Inventory</a>}
          {loyaltyEnabled && <a href="/dashboard/restaurant/loyalty" className="rounded-2xl border border-violet-200 bg-violet-50 p-4 text-sm font-semibold text-violet-800">Loyalty</a>}
        </div>
      ) : (
        <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4">
          <p className="text-sm font-semibold text-slate-800">No modules enabled yet</p>
          <p className="mt-1 text-xs text-slate-500">
            Ask super admin to enable modules for this business type to activate advanced workflows.
          </p>
        </div>
      )}
    </section>
  );
}
