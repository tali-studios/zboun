import {
  DashboardShell,
  ModuleGrid,
  OpsHighlights,
  ProfileReadiness,
  QuickActions,
} from "@/components/category-dashboards/shared";
import type { GymDashboardProps } from "@/components/category-dashboards/types";

export function GymDashboard(props: GymDashboardProps) {
  const conversionRate =
    props.crmTotalCustomers > 0
      ? Math.round((props.clubActiveMembers / props.crmTotalCustomers) * 100)
      : 0;

  return (
    <DashboardShell title="Gym dashboard" businessTypeLabel={props.businessTypeLabel} restaurantName={props.restaurantName}>
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <article className="panel p-5"><p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Active members</p><p className="mt-2 text-3xl font-bold tracking-tight text-violet-700">{props.clubActiveMembers}</p></article>
        <article className="panel p-5"><p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">CRM customers</p><p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{props.crmTotalCustomers}</p></article>
        <article className="panel p-5"><p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Monthly expense</p><p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">${props.accountingMonthExpenses.toFixed(2)}</p></article>
      </section>

      <QuickActions
        actions={[
          { label: "Gym operations", href: "/dashboard/business/gym", hint: "Manage trainers, PT sessions, and payroll", enabled: true },
          { label: "New member", href: "/dashboard/business/club", hint: "Create or upgrade membership plans", enabled: props.clubEnabled },
          { label: "Track check-ins", href: "/dashboard/business/club", hint: "Monitor attendance and engagement", enabled: props.clubEnabled },
          { label: "Launch campaign", href: "/dashboard/business/crm", hint: "Target members with offers", enabled: props.crmEnabled },
          { label: "Review payroll", href: "/dashboard/business/accounting", hint: "Approve payroll and expenses", enabled: props.accountingEnabled },
        ]}
      />

      <OpsHighlights
        items={[
          { label: "Member conversion", value: `${conversionRate}%`, tone: conversionRate >= 40 ? "good" : "warn" },
          { label: "Profile completion", value: `${props.profileCompleteness}/3`, tone: props.profileCompleteness === 3 ? "good" : "warn" },
          { label: "Enabled modules", value: String(props.enabledModuleCount) },
          { label: "Monthly spend", value: `$${props.accountingMonthExpenses.toFixed(2)}` },
        ]}
      />

      <ProfileReadiness profileCompleteness={props.profileCompleteness} enabledModuleCount={props.enabledModuleCount} />
      <ModuleGrid {...props} />
    </DashboardShell>
  );
}
