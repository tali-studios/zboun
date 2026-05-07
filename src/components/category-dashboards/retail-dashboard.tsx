import {
  DashboardShell,
  ModuleGrid,
  OpsHighlights,
  ProfileReadiness,
  QuickActions,
} from "@/components/category-dashboards/shared";
import type { RetailDashboardProps } from "@/components/category-dashboards/types";

export function RetailDashboard(props: RetailDashboardProps) {
  const omniChannelOrders = props.posOpenOrders + props.ecommerceActiveOrders;

  return (
    <DashboardShell title="Retail dashboard" businessTypeLabel={props.businessTypeLabel} restaurantName={props.restaurantName}>
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <article className="panel p-5"><p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Open POS orders</p><p className="mt-2 text-3xl font-bold tracking-tight text-violet-700">{props.posOpenOrders}</p></article>
        <article className="panel p-5"><p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Online orders</p><p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{props.ecommerceActiveOrders}</p></article>
        <article className="panel p-5"><p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">CRM customers</p><p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{props.crmTotalCustomers}</p></article>
      </section>

      <QuickActions
        actions={[
          { label: "Retail ops console", href: "/dashboard/business/retail", hint: "Executive control center for retail operations", enabled: props.posEnabled || props.inventoryEnabled || props.ecommerceEnabled },
          { label: "Start POS sale", href: "/dashboard/business/pos", hint: "Serve in-store customers quickly", enabled: props.posEnabled },
          { label: "Review stock", href: "/dashboard/business/inventory", hint: "Detect low stock before stockouts", enabled: props.inventoryEnabled },
          { label: "Process online", href: "/dashboard/business/ecommerce", hint: "Manage omnichannel orders", enabled: props.ecommerceEnabled },
          { label: "Customer campaigns", href: "/dashboard/business/crm", hint: "Target repeat customer segments", enabled: props.crmEnabled },
        ]}
      />

      <OpsHighlights
        items={[
          { label: "Omnichannel load", value: String(omniChannelOrders) },
          { label: "CRM base", value: String(props.crmTotalCustomers), tone: props.crmTotalCustomers > 100 ? "good" : "neutral" },
          { label: "Enabled modules", value: String(props.enabledModuleCount) },
          { label: "Profile completion", value: `${props.profileCompleteness}/3`, tone: props.profileCompleteness === 3 ? "good" : "warn" },
        ]}
      />

      <ProfileReadiness profileCompleteness={props.profileCompleteness} enabledModuleCount={props.enabledModuleCount} />
      <ModuleGrid {...props} />
    </DashboardShell>
  );
}
