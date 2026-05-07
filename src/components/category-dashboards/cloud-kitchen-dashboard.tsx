import {
  DashboardShell,
  ModuleGrid,
  OpsHighlights,
  ProfileReadiness,
  QuickActions,
} from "@/components/category-dashboards/shared";
import type { CloudKitchenDashboardProps } from "@/components/category-dashboards/types";

export function CloudKitchenDashboard(props: CloudKitchenDashboardProps) {
  const dispatchPressure =
    props.ecommerceActiveOrders > 0
      ? Math.round((props.ecommercePendingOrders / props.ecommerceActiveOrders) * 100)
      : 0;

  return (
    <DashboardShell title="Cloud kitchen dashboard" businessTypeLabel={props.businessTypeLabel} restaurantName={props.restaurantName}>
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <article className="panel p-5"><p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Online orders</p><p className="mt-2 text-3xl font-bold tracking-tight text-violet-700">{props.ecommerceActiveOrders}</p></article>
        <article className="panel p-5"><p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Pending online</p><p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{props.ecommercePendingOrders}</p></article>
        <article className="panel p-5"><p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Active deliveries</p><p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{props.fleetActiveDeliveries}</p></article>
      </section>

      <QuickActions
        actions={[
          { label: "Order control tower", href: "/dashboard/business/ecommerce", hint: "Prioritize urgent and delayed orders", enabled: props.ecommerceEnabled },
          { label: "Dispatch center", href: "/dashboard/business/fleet", hint: "Assign drivers and routes", enabled: props.fleetEnabled },
          { label: "POS fallback", href: "/dashboard/business/pos", hint: "Handle direct walk-in calls", enabled: props.posEnabled },
          { label: "Inventory sync", href: "/dashboard/business/inventory", hint: "Prevent item overselling", enabled: props.inventoryEnabled },
        ]}
      />

      <OpsHighlights
        items={[
          { label: "Dispatch pressure", value: `${dispatchPressure}%`, tone: dispatchPressure <= 35 ? "good" : "warn" },
          { label: "Active deliveries", value: String(props.fleetActiveDeliveries) },
          { label: "Enabled modules", value: String(props.enabledModuleCount) },
          { label: "Profile completion", value: `${props.profileCompleteness}/3`, tone: props.profileCompleteness === 3 ? "good" : "warn" },
        ]}
      />

      <ProfileReadiness profileCompleteness={props.profileCompleteness} enabledModuleCount={props.enabledModuleCount} />
      <ModuleGrid {...props} />
    </DashboardShell>
  );
}
