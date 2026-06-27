"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { getCurrentUserRole } from "@/lib/data";
import { env } from "@/lib/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  computeOrderCouponDiscount,
  couponInactiveReason,
  isCouponCodeValidFormat,
  normalizeCouponCode,
  type MenuCouponCode,
} from "@/lib/menu-coupon-codes";

async function requireRestaurantAdmin() {
  const user = await getCurrentUserRole();
  if (!user || user.role !== "restaurant_admin" || !user.restaurant_id) {
    redirect("/dashboard/login");
  }
  return user;
}

function getServiceClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!env.supabaseUrl || !key) return null;
  return createClient(env.supabaseUrl, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

function parsePercentOff(raw: FormDataEntryValue | null): number | null {
  const value = Number(String(raw ?? "").trim());
  if (!Number.isFinite(value) || value <= 0 || value > 100) return null;
  return Math.round(value * 100) / 100;
}

function parseOptionalDate(raw: FormDataEntryValue | null): string | null {
  const value = String(raw ?? "").trim();
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

function parseOptionalMaxUses(raw: FormDataEntryValue | null): number | null {
  const value = String(raw ?? "").trim();
  if (!value) return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  return Math.floor(parsed);
}

function revalidateStorePaths(slug?: string | null) {
  revalidatePath("/dashboard/business");
  revalidatePath("/");
  if (slug) {
    revalidatePath(`/${slug}`);
    revalidatePath(`/${slug}/menu`);
  }
}

function mapCouponRow(row: {
  id: string;
  restaurant_id: string;
  code: string;
  percent_off: number | string;
  max_uses: number | null;
  times_used: number | string;
  starts_at: string | null;
  ends_at: string | null;
  is_active: boolean;
}): MenuCouponCode {
  return {
    id: row.id,
    restaurant_id: row.restaurant_id,
    code: row.code,
    percent_off: Number(row.percent_off),
    max_uses: row.max_uses != null ? Number(row.max_uses) : null,
    times_used: Number(row.times_used ?? 0),
    starts_at: row.starts_at,
    ends_at: row.ends_at,
    is_active: Boolean(row.is_active),
  };
}

export async function lookupCouponForOrder(
  client: ReturnType<typeof getServiceClient>,
  restaurantId: string,
  rawCode: string,
): Promise<{ ok: true; coupon: MenuCouponCode } | { ok: false; error: string }> {
  if (!client) {
    return { ok: false, error: "Promo codes are temporarily unavailable. Try again without a code." };
  }

  const code = normalizeCouponCode(rawCode);
  if (!isCouponCodeValidFormat(code)) {
    return { ok: false, error: "Invalid promo code." };
  }

  const { data, error } = await client
    .from("menu_coupon_codes")
    .select(
      "id, restaurant_id, code, percent_off, max_uses, times_used, starts_at, ends_at, is_active",
    )
    .eq("restaurant_id", restaurantId)
    .eq("code", code)
    .maybeSingle();

  if (error || !data) {
    return { ok: false, error: "Promo code not found." };
  }

  const coupon = mapCouponRow(data);
  const inactiveReason = couponInactiveReason(coupon);
  if (inactiveReason) {
    return { ok: false, error: inactiveReason };
  }

  return { ok: true, coupon };
}

export type ValidateCouponCodeResult =
  | {
      ok: true;
      code: string;
      couponId: string;
      percentOff: number;
      discountUsd: number;
      invoiceBeforeDiscount: number;
      totalAfterDiscount: number;
    }
  | { ok: false; error: string };

export async function validateCouponCodeAction(input: {
  restaurantId: string;
  code: string;
  itemsSubtotalUsd: number;
  deliveryFeeUsd: number;
}): Promise<ValidateCouponCodeResult> {
  const serviceClient = getServiceClient();
  const lookup = await lookupCouponForOrder(serviceClient, input.restaurantId, input.code);
  if (!lookup.ok) return lookup;

  const amounts = computeOrderCouponDiscount({
    percentOff: lookup.coupon.percent_off,
    itemsSubtotalUsd: Math.max(0, input.itemsSubtotalUsd),
    deliveryFeeUsd: Math.max(0, input.deliveryFeeUsd),
  });

  return {
    ok: true,
    code: lookup.coupon.code,
    couponId: lookup.coupon.id,
    percentOff: lookup.coupon.percent_off,
    discountUsd: amounts.discountUsd,
    invoiceBeforeDiscount: amounts.invoiceBeforeDiscount,
    totalAfterDiscount: amounts.totalAfterDiscount,
  };
}

export async function createMenuCouponCodeAction(formData: FormData) {
  const user = await requireRestaurantAdmin();
  const supabase = await createServerSupabaseClient();

  const code = normalizeCouponCode(String(formData.get("code") ?? ""));
  const percentOff = parsePercentOff(formData.get("percent_off"));
  const maxUses = parseOptionalMaxUses(formData.get("max_uses"));
  const startsAt = parseOptionalDate(formData.get("starts_at"));
  const endsAt = parseOptionalDate(formData.get("ends_at"));
  const isActive = String(formData.get("is_active") ?? "true") !== "false";

  if (!isCouponCodeValidFormat(code) || percentOff == null) {
    redirect("/dashboard/business?error=invalid_coupon");
  }

  const { error } = await supabase.from("menu_coupon_codes").insert({
    restaurant_id: user.restaurant_id,
    code,
    percent_off: percentOff,
    max_uses: maxUses,
    starts_at: startsAt,
    ends_at: endsAt,
    is_active: isActive,
  });

  if (error) {
    if (/duplicate|unique/i.test(error.message ?? "")) {
      redirect("/dashboard/business?error=coupon_code_exists");
    }
    redirect("/dashboard/business?error=coupon_save_failed");
  }

  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("slug")
    .eq("id", user.restaurant_id)
    .maybeSingle();

  revalidateStorePaths(restaurant?.slug);
  redirect("/dashboard/business?toast=coupon_created&jump=coupons");
}

export async function toggleMenuCouponCodeAction(formData: FormData) {
  const user = await requireRestaurantAdmin();
  const supabase = await createServerSupabaseClient();
  const id = String(formData.get("id") ?? "").trim();
  const isActive = String(formData.get("is_active") ?? "") === "true";
  if (!id) return;

  await supabase
    .from("menu_coupon_codes")
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("restaurant_id", user.restaurant_id);

  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("slug")
    .eq("id", user.restaurant_id)
    .maybeSingle();

  revalidateStorePaths(restaurant?.slug);
  redirect("/dashboard/business?toast=coupon_updated&jump=coupons");
}

export async function deleteMenuCouponCodeAction(formData: FormData) {
  const user = await requireRestaurantAdmin();
  const supabase = await createServerSupabaseClient();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;

  await supabase.from("menu_coupon_codes").delete().eq("id", id).eq("restaurant_id", user.restaurant_id);

  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("slug")
    .eq("id", user.restaurant_id)
    .maybeSingle();

  revalidateStorePaths(restaurant?.slug);
  redirect("/dashboard/business?toast=coupon_deleted&jump=coupons");
}
