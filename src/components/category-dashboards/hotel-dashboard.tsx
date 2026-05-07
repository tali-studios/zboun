import {
  DashboardShell,
  ModuleGrid,
  OpsHighlights,
  ProfileReadiness,
  QuickActions,
} from "@/components/category-dashboards/shared";
import type { HotelDashboardProps } from "@/components/category-dashboards/types";

export function HotelDashboard(props: HotelDashboardProps) {
  const occupiedRooms = Math.round((props.pmsActiveRooms * props.pmsOccupancyRate) / 100);

  return (
    <DashboardShell title="Hotel dashboard" businessTypeLabel={props.businessTypeLabel} restaurantName={props.restaurantName}>
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <article className="panel p-5"><p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Active rooms</p><p className="mt-2 text-3xl font-bold tracking-tight text-violet-700">{props.pmsActiveRooms}</p></article>
        <article className="panel p-5"><p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Occupancy</p><p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{props.pmsOccupancyRate}%</p></article>
        <article className="panel p-5"><p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">CRM guests</p><p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{props.crmTotalCustomers}</p></article>
      </section>

      <QuickActions
        actions={[
          { label: "New reservation", href: "/dashboard/business/pms", hint: "Add booking and assign room", enabled: props.pmsEnabled },
          { label: "Front desk board", href: "/dashboard/business/pms", hint: "7-day arrivals, departures, no-shows", enabled: props.pmsEnabled },
          { label: "Event planning", href: "/dashboard/business/events", hint: "Manage venue bookings", enabled: props.eventsEnabled },
          { label: "Guest CRM", href: "/dashboard/business/crm", hint: "Track VIP guests and notes", enabled: props.crmEnabled },
        ]}
      />

      <OpsHighlights
        items={[
          { label: "Occupied rooms", value: String(occupiedRooms) },
          { label: "Occupancy health", value: props.pmsOccupancyRate >= 70 ? "Strong" : "Needs boost", tone: props.pmsOccupancyRate >= 70 ? "good" : "warn" },
          { label: "Enabled modules", value: String(props.enabledModuleCount) },
          { label: "Profile completion", value: `${props.profileCompleteness}/3`, tone: props.profileCompleteness === 3 ? "good" : "warn" },
        ]}
      />

      <ProfileReadiness profileCompleteness={props.profileCompleteness} enabledModuleCount={props.enabledModuleCount} />
      <ModuleGrid {...props} />
    </DashboardShell>
  );
}
