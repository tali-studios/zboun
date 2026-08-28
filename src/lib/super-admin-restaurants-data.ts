import type { SupabaseClient } from "@supabase/supabase-js";
import { backfillMissingSubscriptions } from "@/lib/subscription-billing";

export type SuperAdminRestaurantRow = {
  id: string;
  name: string;
  slug: string;
  phone: string;
  business_type: string | null;
  is_active: boolean;
  billing_exempt: boolean;
  show_on_home: boolean;
  browse_sections: string[] | null;
  created_at: string;
  category_count: number;
  item_count: number;
  admin_email: string;
  subscription_id: string | null;
  plan_name: string | null;
  subscription_status: string | null;
  next_due_at: string | null;
  billing_cycle_price: number;
  last_payment_at: string | null;
  outstanding_balance: number;
  addons: Record<string, boolean>;
};

export async function loadSuperAdminRestaurantsWithDetails(
  dataClient: SupabaseClient,
): Promise<SuperAdminRestaurantRow[]> {
  const { data: restaurants } = await dataClient
    .from("restaurants")
    .select(
      "id, name, slug, phone, business_type, is_active, billing_exempt, show_on_home, browse_sections, created_at",
    )
    .order("created_at", { ascending: false });

  if (restaurants?.length) {
    try {
      await backfillMissingSubscriptions(dataClient, restaurants);
    } catch {
      // Dashboard still loads if backfill fails (e.g. plans table missing).
    }
  }

  const [
    { data: categories },
    { data: items },
    { data: admins },
    { data: plans },
    { data: subscriptions },
    { data: invoices },
    { data: payments },
    { data: addons },
  ] = await Promise.all([
    dataClient.from("categories").select("id, restaurant_id"),
    dataClient.from("menu_items").select("id, restaurant_id"),
    dataClient.from("users").select("restaurant_id, email").eq("role", "restaurant_admin"),
    dataClient
      .from("subscription_plans")
      .select("id, name, interval, price, is_active")
      .eq("is_active", true)
      .order("price", { ascending: true }),
    dataClient
      .from("restaurant_subscriptions")
      .select("id, restaurant_id, plan_id, status, start_at, next_due_at, billing_cycle_price, created_at"),
    dataClient
      .from("invoices")
      .select("id, restaurant_id, subscription_id, amount_due, amount_paid, status, due_at, created_at"),
    dataClient
      .from("payments")
      .select("id, invoice_id, restaurant_id, amount_paid, paid_at, method, reference_note, created_at")
      .order("paid_at", { ascending: false }),
    dataClient.from("restaurant_addons").select("restaurant_id, addon_key, is_enabled"),
  ]);

  const categoryCountByRestaurant = (categories ?? []).reduce<Record<string, number>>((acc, category) => {
    acc[category.restaurant_id] = (acc[category.restaurant_id] ?? 0) + 1;
    return acc;
  }, {});

  const itemCountByRestaurant = (items ?? []).reduce<Record<string, number>>((acc, item) => {
    acc[item.restaurant_id] = (acc[item.restaurant_id] ?? 0) + 1;
    return acc;
  }, {});

  const adminEmailByRestaurant = (admins ?? []).reduce<Record<string, string>>((acc, admin) => {
    if (admin.restaurant_id && admin.email) {
      acc[admin.restaurant_id] = admin.email;
    }
    return acc;
  }, {});

  const planById = (plans ?? []).reduce<Record<string, { name: string }>>((acc, plan) => {
    acc[plan.id] = { name: plan.name };
    return acc;
  }, {});

  const latestSubscriptionByRestaurant = (subscriptions ?? []).reduce<
    Record<
      string,
      {
        id: string;
        status: string;
        start_at: string | null;
        next_due_at: string | null;
        billing_cycle_price: number;
        created_at: string;
        plan_name: string | null;
      }
    >
  >((acc, sub) => {
    const existing = acc[sub.restaurant_id];
    const next = {
      id: sub.id,
      status: sub.status,
      start_at: sub.start_at ?? null,
      next_due_at: sub.next_due_at,
      billing_cycle_price: Number(sub.billing_cycle_price ?? 0),
      created_at: sub.created_at,
      plan_name: sub.plan_id ? (planById[sub.plan_id]?.name ?? null) : null,
    };
    if (!existing || new Date(next.created_at) > new Date(existing.created_at)) {
      acc[sub.restaurant_id] = next;
    }
    return acc;
  }, {});

  const lastPaymentByRestaurant = (payments ?? []).reduce<Record<string, string>>((acc, payment) => {
    if (!acc[payment.restaurant_id]) {
      acc[payment.restaurant_id] = payment.paid_at;
    }
    return acc;
  }, {});

  const outstandingByRestaurant = (invoices ?? []).reduce<Record<string, number>>((acc, invoice) => {
    const due = Number(invoice.amount_due ?? 0);
    const paid = Number(invoice.amount_paid ?? 0);
    const outstanding = Math.max(0, due - paid);
    if (invoice.status === "unpaid" || invoice.status === "partial") {
      acc[invoice.restaurant_id] = (acc[invoice.restaurant_id] ?? 0) + outstanding;
    }
    return acc;
  }, {});

  const addonsByRestaurant = (addons ?? []).reduce<Record<string, Record<string, boolean>>>(
    (acc, row) => {
      if (!acc[row.restaurant_id]) acc[row.restaurant_id] = {};
      acc[row.restaurant_id][row.addon_key] = row.is_enabled;
      return acc;
    },
    {},
  );

  return (restaurants ?? []).map((restaurant) => ({
    ...restaurant,
    category_count: categoryCountByRestaurant[restaurant.id] ?? 0,
    item_count: itemCountByRestaurant[restaurant.id] ?? 0,
    admin_email: adminEmailByRestaurant[restaurant.id] ?? "No admin linked",
    subscription_id: latestSubscriptionByRestaurant[restaurant.id]?.id ?? null,
    plan_name: latestSubscriptionByRestaurant[restaurant.id]?.plan_name ?? null,
    subscription_status: latestSubscriptionByRestaurant[restaurant.id]?.status ?? null,
    next_due_at: latestSubscriptionByRestaurant[restaurant.id]?.next_due_at ?? null,
    billing_cycle_price: latestSubscriptionByRestaurant[restaurant.id]?.billing_cycle_price ?? 0,
    last_payment_at: lastPaymentByRestaurant[restaurant.id] ?? null,
    outstanding_balance: outstandingByRestaurant[restaurant.id] ?? 0,
    addons: addonsByRestaurant[restaurant.id] ?? {},
  }));
}
