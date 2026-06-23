import { cache } from "react";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { env } from "@/lib/env";
import {
  getLatestSubscription,
  getRestaurantAdminEmail,
  isRestaurantBillingExempt,
  isSubscriptionAccessValid,
  type SubscriptionReminderKind,
} from "@/lib/subscription-billing";
import { sendSubscriptionDeactivatedEmail } from "@/lib/subscription-emails";

export function getServiceSupabaseClient(): SupabaseClient | null {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!env.supabaseUrl || !key) return null;
  return createClient(env.supabaseUrl, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

function toUtcDateString(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function revalidateRestaurantPublicCaches() {
  revalidatePath("/");
}

async function wasReminderSent(
  supabase: SupabaseClient,
  subscriptionId: string,
  kind: SubscriptionReminderKind,
  dueDate: string,
) {
  const { data } = await supabase
    .from("subscription_reminder_log")
    .select("id")
    .eq("subscription_id", subscriptionId)
    .eq("reminder_kind", kind)
    .eq("due_at", dueDate)
    .maybeSingle();
  return Boolean(data?.id);
}

async function logReminder(
  supabase: SupabaseClient,
  subscriptionId: string,
  kind: SubscriptionReminderKind,
  dueDate: string,
) {
  return supabase.from("subscription_reminder_log").insert({
    subscription_id: subscriptionId,
    reminder_kind: kind,
    due_at: dueDate,
  });
}

export type DeactivateResult = {
  deactivated: boolean;
  emailSent: boolean;
  error?: string;
};

/** Restore business access when subscription is valid but is_active drifted false after renewal. */
async function syncRestaurantActiveIfSubscriptionValid(
  supabase: SupabaseClient,
  restaurantId: string,
  restaurantIsActive: boolean,
  sub: Awaited<ReturnType<typeof getLatestSubscription>>,
): Promise<void> {
  if (restaurantIsActive || !isSubscriptionAccessValid(sub)) return;

  const nowIso = new Date().toISOString();
  if (sub?.id && sub.status === "overdue") {
    await supabase
      .from("restaurant_subscriptions")
      .update({ status: "active", ended_at: null, updated_at: nowIso })
      .eq("id", sub.id);
  }

  const { error } = await supabase
    .from("restaurants")
    .update({ is_active: true })
    .eq("id", restaurantId);

  if (!error) {
    revalidateRestaurantPublicCaches();
  }
}

/** Deactivate restaurant + sync subscription (expired or manual). */
export async function deactivateRestaurantForSubscription(
  supabase: SupabaseClient,
  params: {
    restaurantId: string;
    subscriptionId: string;
    restaurantName: string;
    dueAt: Date;
    billingPrice: number;
    reason: "expired" | "manual";
    sendEmail: boolean;
    subscriptionStatus: "overdue" | "paused";
  },
): Promise<DeactivateResult> {
  if (params.reason === "expired") {
    if (await isRestaurantBillingExempt(supabase, params.restaurantId)) {
      return { deactivated: false, emailSent: false };
    }

    const latest = await getLatestSubscription(supabase, params.restaurantId);
    if (!latest || latest.id !== params.subscriptionId) {
      return { deactivated: false, emailSent: false };
    }
    if (isSubscriptionAccessValid(latest)) {
      return { deactivated: false, emailSent: false };
    }
  }

  const nowIso = new Date().toISOString();
  const dueDate = toUtcDateString(params.dueAt);

  const { error: restaurantError } = await supabase
    .from("restaurants")
    .update({ is_active: false })
    .eq("id", params.restaurantId);

  if (restaurantError) {
    return { deactivated: false, emailSent: false, error: restaurantError.message };
  }

  const { error: subError } = await supabase
    .from("restaurant_subscriptions")
    .update({
      status: params.subscriptionStatus,
      ended_at: params.reason === "expired" ? params.dueAt.toISOString() : nowIso,
      updated_at: nowIso,
      notes:
        params.reason === "manual"
          ? "Deactivated manually by super admin."
          : "Deactivated automatically after subscription expired.",
    })
    .eq("id", params.subscriptionId);

  if (subError) {
    return { deactivated: false, emailSent: false, error: subError.message };
  }

  let emailSent = false;
  if (params.sendEmail) {
    const adminEmail = await getRestaurantAdminEmail(supabase, params.restaurantId);
    if (adminEmail) {
      try {
        await sendSubscriptionDeactivatedEmail({
          restaurantName: params.restaurantName,
          adminEmail,
          expiredAt: params.dueAt,
          monthlyPrice: params.billingPrice,
        });
        emailSent = true;
        if (params.reason === "expired") {
          await logReminder(supabase, params.subscriptionId, "expired_deactivated", dueDate);
        }
      } catch {
        emailSent = false;
      }
    }
  }

  revalidateRestaurantPublicCaches();
  return { deactivated: true, emailSent };
}

/** Enforce expiry for one restaurant (runs on dashboard/menu access + cron). */
export async function enforceSubscriptionExpiryForRestaurant(
  restaurantId: string,
): Promise<boolean> {
  const supabase = getServiceSupabaseClient();
  if (!supabase) return false;

  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("id, name, is_active, billing_exempt")
    .eq("id", restaurantId)
    .maybeSingle();

  if (!restaurant) return false;
  if (restaurant.billing_exempt) return false;

  const sub = await getLatestSubscription(supabase, restaurantId);
  if (!sub?.next_due_at) return false;

  const dueAt = new Date(sub.next_due_at);
  if (dueAt.getTime() >= Date.now()) {
    await syncRestaurantActiveIfSubscriptionValid(
      supabase,
      restaurantId,
      restaurant.is_active,
      sub,
    );
    return false;
  }
  if (!["active", "trial", "overdue"].includes(sub.status)) return false;
  if (!restaurant.is_active && sub.status === "overdue") return false;

  const dueDate = toUtcDateString(dueAt);
  const alreadyEmailed = await wasReminderSent(
    supabase,
    sub.id as string,
    "expired_deactivated",
    dueDate,
  );

  const result = await deactivateRestaurantForSubscription(supabase, {
    restaurantId,
    subscriptionId: sub.id as string,
    restaurantName: restaurant.name,
    dueAt,
    billingPrice: Number(sub.billing_cycle_price ?? 20),
    reason: "expired",
    sendEmail: !alreadyEmailed,
    subscriptionStatus: "overdue",
  });

  return result.deactivated;
}

function isRestaurantDashboardBlockedFromState(
  restaurant: { is_active: boolean; billing_exempt?: boolean | null } | null | undefined,
  sub: Awaited<ReturnType<typeof getLatestSubscription>>,
): boolean {
  if (restaurant?.billing_exempt) {
    return !restaurant.is_active;
  }

  if (sub?.status === "paused" || sub?.status === "cancelled") return true;
  if (isSubscriptionAccessValid(sub)) return false;

  if (sub?.next_due_at && new Date(sub.next_due_at).getTime() < Date.now()) {
    return true;
  }

  return !restaurant?.is_active;
}

/**
 * Whether a restaurant admin should be blocked from the business dashboard.
 * Uses service role so RLS (active-only restaurant reads) cannot hide deactivated rows.
 * Returns null when service role is unavailable (caller may use a weaker fallback).
 */
export const isRestaurantDashboardBlocked = cache(async function isRestaurantDashboardBlocked(
  restaurantId: string,
): Promise<boolean | null> {
  const supabase = getServiceSupabaseClient();
  if (!supabase) return null;

  const [{ data: restaurant }, sub] = await Promise.all([
    supabase
      .from("restaurants")
      .select("is_active, billing_exempt")
      .eq("id", restaurantId)
      .maybeSingle(),
    getLatestSubscription(supabase, restaurantId),
  ]);

  return isRestaurantDashboardBlockedFromState(restaurant, sub);
});

/** Super admin manual deactivation — sync subscription + email. */
export async function deactivateRestaurantManually(restaurantId: string) {
  const supabase = getServiceSupabaseClient();
  if (!supabase) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is required for manual deactivation.");
  }

  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("id, name, is_active")
    .eq("id", restaurantId)
    .single();

  if (!restaurant?.is_active) return { deactivated: false as const, emailSent: false };

  const sub = await getLatestSubscription(supabase, restaurantId);
  const now = new Date();

  if (sub?.id) {
    return deactivateRestaurantForSubscription(supabase, {
      restaurantId,
      subscriptionId: sub.id as string,
      restaurantName: restaurant.name,
      dueAt: sub.next_due_at ? new Date(sub.next_due_at) : now,
      billingPrice: Number(sub.billing_cycle_price ?? 20),
      reason: "manual",
      sendEmail: true,
      subscriptionStatus: "paused",
    });
  }

  await supabase.from("restaurants").update({ is_active: false }).eq("id", restaurantId);
  const adminEmail = await getRestaurantAdminEmail(supabase, restaurantId);
  let emailSent = false;
  if (adminEmail) {
    try {
      await sendSubscriptionDeactivatedEmail({
        restaurantName: restaurant.name,
        adminEmail,
        expiredAt: now,
        monthlyPrice: 20,
      });
      emailSent = true;
    } catch {
      emailSent = false;
    }
  }
  revalidateRestaurantPublicCaches();
  return { deactivated: true as const, emailSent };
}
