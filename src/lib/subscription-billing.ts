import type { SupabaseClient } from "@supabase/supabase-js";
import { ZBOUN_PRICING } from "@/lib/pricing";

export const SUBSCRIPTION_PERIOD_MONTHS = 1;
export const REMINDER_DAYS_BEFORE_DUE = 10;
export const REMINDER_DAYS_FINAL = 3;

export type SubscriptionReminderKind =
  | "ten_day_expiry"
  | "three_day_expiry"
  | "expired_deactivated";

export function addMonths(date: Date, months: number) {
  const next = new Date(date);
  next.setMonth(next.getMonth() + months);
  return next;
}

export function startOfUtcDay(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

export function formatDateLong(date: Date) {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export async function getOrCreateMonthlyPlanId(supabase: SupabaseClient) {
  const { data: existing } = await supabase
    .from("subscription_plans")
    .select("id, price")
    .eq("interval", "monthly")
    .eq("is_active", true)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (existing?.id) return { planId: existing.id, price: Number(existing.price) };

  const { data: created, error } = await supabase
    .from("subscription_plans")
    .insert({
      name: "Monthly",
      interval: "monthly",
      price: ZBOUN_PRICING.monthly,
      is_active: true,
    })
    .select("id, price")
    .single();

  if (error || !created) {
    throw new Error(error?.message ?? "Could not create monthly subscription plan.");
  }
  return { planId: created.id, price: Number(created.price) };
}

export async function createInitialSubscription(
  supabase: SupabaseClient,
  restaurantId: string,
) {
  const { planId, price } = await getOrCreateMonthlyPlanId(supabase);
  const startAt = new Date();
  const nextDueAt = addMonths(startAt, SUBSCRIPTION_PERIOD_MONTHS);

  const { data, error } = await supabase
    .from("restaurant_subscriptions")
    .insert({
      restaurant_id: restaurantId,
      plan_id: planId,
      status: "active",
      start_at: startAt.toISOString(),
      next_due_at: nextDueAt.toISOString(),
      billing_cycle_price: price,
      notes: "Initial subscription created with restaurant account.",
    })
    .select("id, next_due_at, billing_cycle_price")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Could not create subscription.");
  }

  return {
    subscriptionId: data.id as string,
    nextDueAt: new Date(data.next_due_at as string),
    billingPrice: Number(data.billing_cycle_price),
    periodStart: startAt,
    periodEnd: nextDueAt,
  };
}

export async function getLatestSubscription(
  supabase: SupabaseClient,
  restaurantId: string,
) {
  const { data } = await supabase
    .from("restaurant_subscriptions")
    .select("id, status, next_due_at, billing_cycle_price, start_at")
    .eq("restaurant_id", restaurantId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return data;
}

export async function renewRestaurantSubscription(
  supabase: SupabaseClient,
  restaurantId: string,
) {
  const existing = await getLatestSubscription(supabase, restaurantId);
  const now = new Date();

  if (!existing) {
    const created = await createInitialSubscription(supabase, restaurantId);
    return { ...created, renewed: true as const };
  }

  const currentDue = existing.next_due_at ? new Date(existing.next_due_at) : now;
  const base = currentDue.getTime() > now.getTime() ? currentDue : now;
  const periodStart = new Date(base);
  const nextDueAt = addMonths(periodStart, SUBSCRIPTION_PERIOD_MONTHS);

  const { error } = await supabase
    .from("restaurant_subscriptions")
    .update({
      status: "active",
      ended_at: null,
      next_due_at: nextDueAt.toISOString(),
      updated_at: now.toISOString(),
    })
    .eq("id", existing.id);

  if (error) {
    throw new Error(error.message);
  }

  return {
    subscriptionId: existing.id as string,
    nextDueAt,
    billingPrice: Number(existing.billing_cycle_price ?? ZBOUN_PRICING.monthly),
    periodStart,
    periodEnd: nextDueAt,
    renewed: true as const,
  };
}

/** Create subscription rows for restaurants that pre-date billing (idempotent). */
export async function backfillMissingSubscriptions(
  supabase: SupabaseClient,
  restaurants: { id: string; created_at: string; is_active: boolean }[],
) {
  if (restaurants.length === 0) return 0;

  const { planId, price } = await getOrCreateMonthlyPlanId(supabase);
  const restaurantIds = restaurants.map((r) => r.id);

  const { data: existing, error: listError } = await supabase
    .from("restaurant_subscriptions")
    .select("restaurant_id")
    .in("restaurant_id", restaurantIds);

  if (listError) {
    throw new Error(listError.message);
  }

  const hasSubscription = new Set((existing ?? []).map((row) => row.restaurant_id));
  const missing = restaurants.filter((r) => !hasSubscription.has(r.id));
  if (missing.length === 0) return 0;

  const now = new Date();
  const rows = missing.map((restaurant) => {
    const startAt = new Date(restaurant.created_at);
    const nextDueAt = addMonths(startAt, SUBSCRIPTION_PERIOD_MONTHS);
    const expired = nextDueAt.getTime() < now.getTime();
    const status = expired ? "overdue" : restaurant.is_active ? "active" : "overdue";

    return {
      restaurant_id: restaurant.id,
      plan_id: planId,
      status,
      start_at: startAt.toISOString(),
      next_due_at: nextDueAt.toISOString(),
      billing_cycle_price: price,
      ended_at: expired ? nextDueAt.toISOString() : null,
      notes: "Backfilled subscription for existing business.",
    };
  });

  const { error: insertError } = await supabase.from("restaurant_subscriptions").insert(rows);
  if (insertError) {
    throw new Error(insertError.message);
  }

  return missing.length;
}

export async function getRestaurantAdminEmail(
  supabase: SupabaseClient,
  restaurantId: string,
) {
  const { data } = await supabase
    .from("users")
    .select("email, name")
    .eq("restaurant_id", restaurantId)
    .eq("role", "restaurant_admin")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  return data?.email ?? null;
}
