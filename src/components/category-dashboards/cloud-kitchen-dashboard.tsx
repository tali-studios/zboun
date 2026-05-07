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
  const fulfillmentLoad = props.ecommercePendingOrders + props.fleetActiveDeliveries;
  const orderFlowHealth =
    dispatchPressure <= 35 ? "Healthy" : dispatchPressure <= 55 ? "Watch" : "At risk";
  const orderFlowTone = dispatchPressure <= 35 ? "good" : dispatchPressure <= 55 ? "neutral" : "warn";
  const moduleReadiness = Math.round((props.enabledModuleCount / 10) * 100);
  const omnichannelExposure = props.ecommerceActiveOrders + props.posOpenOrders;
  const openOrderSplit =
    omnichannelExposure > 0 ? Math.round((props.ecommerceActiveOrders / omnichannelExposure) * 100) : 0;

  return (
    <DashboardShell title="Cloud kitchen dashboard" businessTypeLabel={props.businessTypeLabel} restaurantName={props.restaurantName}>
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <article className="panel p-5">
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Online orders</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-violet-700">{props.ecommerceActiveOrders}</p>
        </article>
        <article className="panel p-5">
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Pending online</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{props.ecommercePendingOrders}</p>
        </article>
        <article className="panel p-5">
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Active deliveries</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{props.fleetActiveDeliveries}</p>
        </article>
        <article className="panel p-5">
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Kitchen queue load</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{fulfillmentLoad}</p>
        </article>
      </section>

      <section className="panel p-5">
        <h2 className="panel-title">Control tower status</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <article className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Order flow health</p>
            <p className={`mt-2 text-2xl font-bold ${dispatchPressure > 55 ? "text-amber-700" : "text-emerald-700"}`}>{orderFlowHealth}</p>
            <p className="mt-1 text-xs text-slate-500">Based on pending-to-active order pressure.</p>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Dispatch pressure</p>
            <p className={`mt-2 text-2xl font-bold ${dispatchPressure <= 35 ? "text-emerald-700" : dispatchPressure <= 55 ? "text-slate-900" : "text-amber-700"}`}>
              {dispatchPressure}%
            </p>
            <p className="mt-1 text-xs text-slate-500">Lower is better for SLA reliability.</p>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Omnichannel split</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{openOrderSplit}% online</p>
            <p className="mt-1 text-xs text-slate-500">Online vs POS open order share.</p>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Module readiness</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{moduleReadiness}%</p>
            <p className="mt-1 text-xs text-slate-500">{props.enabledModuleCount} modules active.</p>
          </article>
        </div>
      </section>

      <QuickActions
        title="Cloud kitchen quick actions"
        actions={[
          { label: "Order control tower", href: "/dashboard/business/cloud-kitchen", hint: "SLA bands and auto-priority queue", enabled: props.ecommerceEnabled || props.fleetEnabled },
          { label: "Dispatch center", href: "/dashboard/business/cloud-kitchen", hint: "Rider assignment visibility and load", enabled: props.fleetEnabled },
          { label: "POS fallback", href: "/dashboard/business/pos", hint: "Capture overflow phone/walk-in demand", enabled: props.posEnabled },
          { label: "Inventory sync", href: "/dashboard/business/inventory", hint: "Avoid overselling across channels", enabled: props.inventoryEnabled },
          { label: "Customer reactivation", href: "/dashboard/business/crm", hint: "Win back repeat customers", enabled: props.crmEnabled },
          { label: "Loyalty campaigns", href: "/dashboard/business/loyalty", hint: "Boost repeat order frequency", enabled: props.loyaltyEnabled },
        ]}
      />

      <OpsHighlights
        items={[
          { label: "Dispatch pressure", value: `${dispatchPressure}%`, tone: orderFlowTone },
          { label: "Active deliveries", value: String(props.fleetActiveDeliveries) },
          { label: "CRM base", value: String(props.crmTotalCustomers) },
          { label: "Profile completion", value: `${props.profileCompleteness}/3`, tone: props.profileCompleteness === 3 ? "good" : "warn" },
        ]}
      />

      <ProfileReadiness profileCompleteness={props.profileCompleteness} enabledModuleCount={props.enabledModuleCount} />
      <ModuleGrid {...props} />
    </DashboardShell>
  );
}
