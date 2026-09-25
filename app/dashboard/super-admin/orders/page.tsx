import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import {
  SuperAdminHeader,
  SuperAdminMetric,
  SuperAdminMetricsBlock,
  SuperAdminSection,
  SuperAdminShell,
} from "@/components/super-admin-chrome";
import { SuperAdminOrdersByStore } from "@/components/super-admin-orders-by-store";
import { getCurrentUserRole } from "@/lib/data";
import { env } from "@/lib/env";
import { loadSuperAdminOrderStats } from "@/lib/super-admin-orders-data";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function SuperAdminOrdersPage() {
  const appUser = await getCurrentUserRole();
  if (!appUser || appUser.role !== "superadmin") {
    redirect("/dashboard/login");
  }

  const supabase = await createServerSupabaseClient();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const dataClient =
    env.supabaseUrl && serviceRoleKey
      ? createClient(env.supabaseUrl, serviceRoleKey, {
          auth: { autoRefreshToken: false, persistSession: false },
        })
      : supabase;

  const stats = await loadSuperAdminOrderStats(dataClient);

  return (
    <SuperAdminShell>
      <SuperAdminHeader
        title="Orders"
        subtitle="Every customer order placed on zboun.net, across all stores."
      />

      <SuperAdminMetricsBlock
        id="orders"
        title="Platform orders"
        description="Counts include pending, in-progress, delivered, and cancelled. GMV excludes cancelled orders."
        columns={5}
      >
        <SuperAdminMetric label="All time" value={stats.total} tone="accent" />
        <SuperAdminMetric label="Today" value={stats.today} tone="neutral" />
        <SuperAdminMetric label="This month" value={stats.thisMonth} tone="neutral" />
        <SuperAdminMetric
          label="Delivered"
          value={stats.delivered}
          hint={`${stats.inProgress} in progress`}
          tone="success"
        />
        <SuperAdminMetric
          label="Cancelled"
          value={stats.cancelled}
          tone={stats.cancelled > 0 ? "warning" : "neutral"}
        />
      </SuperAdminMetricsBlock>

      <SuperAdminMetricsBlock title="Order volume" description="Merchandise + delivery fees on non-cancelled orders">
        <SuperAdminMetric
          label="GMV (all time)"
          value={`$${stats.gmvUsd.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          tone="accent"
        />
        <SuperAdminMetric label="Stores with orders" value={stats.byStore.length} tone="neutral" />
        <SuperAdminMetric label="In progress" value={stats.inProgress} tone="neutral" />
        <SuperAdminMetric
          label="Completion rate"
          value={
            stats.total === 0
              ? "—"
              : `${Math.round((stats.delivered / stats.total) * 100)}%`
          }
          hint="Delivered ÷ all orders"
          tone="success"
        />
      </SuperAdminMetricsBlock>

      <SuperAdminSection
        title="Orders by store"
        description="Sorted by total orders. Use this to see which businesses generate the most activity."
      >
        <SuperAdminOrdersByStore stores={stats.byStore} />
      </SuperAdminSection>
    </SuperAdminShell>
  );
}
