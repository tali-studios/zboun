import type { SupabaseClient } from "@supabase/supabase-js";

export type SuperAdminOrderStoreRow = {
  restaurantId: string;
  name: string;
  slug: string;
  count: number;
  delivered: number;
  cancelled: number;
  gmvUsd: number;
};

export type SuperAdminOrderStats = {
  total: number;
  today: number;
  thisMonth: number;
  delivered: number;
  cancelled: number;
  inProgress: number;
  gmvUsd: number;
  byStore: SuperAdminOrderStoreRow[];
};

type OrderLite = {
  restaurant_id: string;
  status: string;
  total_usd: number | string | null;
  created_at: string;
};

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function startOfMonth(): Date {
  const d = new Date();
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
}

export async function loadSuperAdminOrderStats(
  dataClient: SupabaseClient,
): Promise<SuperAdminOrderStats> {
  const empty: SuperAdminOrderStats = {
    total: 0,
    today: 0,
    thisMonth: 0,
    delivered: 0,
    cancelled: 0,
    inProgress: 0,
    gmvUsd: 0,
    byStore: [],
  };

  const [{ data: orders, error }, { data: restaurants }] = await Promise.all([
    dataClient.from("orders").select("restaurant_id, status, total_usd, created_at"),
    dataClient.from("restaurants").select("id, name, slug"),
  ]);

  if (error) {
    console.error("[super-admin orders]", error.message);
    return empty;
  }

  const rows = (orders ?? []) as OrderLite[];
  const todayStart = startOfToday().getTime();
  const monthStart = startOfMonth().getTime();
  const nameById = new Map(
    (restaurants ?? []).map((r) => [r.id as string, { name: String(r.name ?? "Store"), slug: String(r.slug ?? "") }]),
  );

  const byStore = new Map<
    string,
    { count: number; delivered: number; cancelled: number; gmvUsd: number }
  >();

  let today = 0;
  let thisMonth = 0;
  let delivered = 0;
  let cancelled = 0;
  let inProgress = 0;
  let gmvUsd = 0;

  for (const row of rows) {
    const created = new Date(row.created_at).getTime();
    const amount = Number(row.total_usd ?? 0);
    const status = String(row.status ?? "");
    if (created >= todayStart) today += 1;
    if (created >= monthStart) thisMonth += 1;
    if (status === "delivered") delivered += 1;
    else if (status === "cancelled") cancelled += 1;
    else inProgress += 1;
    if (status !== "cancelled" && Number.isFinite(amount)) gmvUsd += amount;

    const store = byStore.get(row.restaurant_id) ?? {
      count: 0,
      delivered: 0,
      cancelled: 0,
      gmvUsd: 0,
    };
    store.count += 1;
    if (status === "delivered") store.delivered += 1;
    if (status === "cancelled") store.cancelled += 1;
    if (status !== "cancelled" && Number.isFinite(amount)) store.gmvUsd += amount;
    byStore.set(row.restaurant_id, store);
  }

  const storeRows: SuperAdminOrderStoreRow[] = [...byStore.entries()]
    .map(([restaurantId, stats]) => {
      const meta = nameById.get(restaurantId);
      return {
        restaurantId,
        name: meta?.name ?? "Unknown store",
        slug: meta?.slug ?? "",
        count: stats.count,
        delivered: stats.delivered,
        cancelled: stats.cancelled,
        gmvUsd: stats.gmvUsd,
      };
    })
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

  return {
    total: rows.length,
    today,
    thisMonth,
    delivered,
    cancelled,
    inProgress,
    gmvUsd,
    byStore: storeRows,
  };
}
