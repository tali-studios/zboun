"use server";

import { profilePhoneToE164 } from "@/lib/customer-phone";
import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";
import { revalidatePath } from "next/cache";
import {
  isRestaurantOpenNow,
  isScheduledTimeValid,
  parseOpeningHours,
} from "@/lib/opening-hours";
import {
  sendNewOrderEmailNotification,
  buildRestaurantWhatsAppNotifyUrl,
  type OrderNotificationItem,
} from "@/lib/order-notifications";
import {
  isWithinRestaurantDeliveryRange,
  normalizeRestaurantDeliveryRadiusKm,
} from "@/lib/delivery-radius";
import { getRestaurantMenu } from "@/lib/data";
import { buildMenuItemPricingMap, validateOrderLinesPricing } from "@/lib/menu-promotions";
import { computeOrderCouponDiscount } from "@/lib/menu-coupon-codes";
import { lookupCouponForOrder } from "@/app-actions/menu-coupon-codes";
import { decrementMenuItemStockForOrder } from "@/lib/menu-item-stock-alerts";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export type DeliverySpeed = "standard" | "fast";

export type PlaceOrderInput = {
  restaurantId: string;
  restaurantSlug: string;
  customerName: string;
  customerPhone?: string | null;
  deliveryAddress?: string | null;
  deliveryLat?: number | null;
  deliveryLng?: number | null;
  items: OrderNotificationItem[];
  notes?: string | null;
  paymentNote?: string | null;
  totalUsd: number;
  couponCode?: string | null;
  scheduledFor?: string | null;
  deliverySpeed?: DeliverySpeed;
};

export type PlaceOrderResult =
  | {
      ok: true;
      orderId: string;
      whatsappNotifyUrl: string | null;
    }
  | { ok: false; error: string };

export type OrderStatusUpdate = {
  orderId: string;
  status: "confirmed" | "preparing" | "ready" | "out_for_delivery" | "delivered" | "cancelled";
  expectedDeliveryTime?: string | null;
};

export type RestaurantOrderUpdateInput = {
  orderId: string;
  customerName: string;
  customerPhone?: string | null;
  deliveryAddress?: string | null;
  notes?: string | null;
  paymentNote?: string | null;
  totalUsd: number;
  menuAdditions?: Array<{
    menuItemId: string;
    qty: number;
    unit: "each" | "kg";
    unitPrice: number;
    name: string;
  }>;
  manualAdjustmentLabel?: string | null;
  manualAdjustmentUsd?: number | null;
};

export type OrderExpectedDeliveryTimeUpdate = {
  orderId: string;
  expectedDeliveryTime: string;
};

export type OrderDriverAssignmentUpdate = {
  orderId: string;
  driverId: string | null;
};

export type OrderRow = {
  id: string;
  customer_id: string | null;
  customer_name: string;
  customer_phone: string | null;
  delivery_address: string | null;
  delivery_lat: number | null;
  delivery_lng: number | null;
  items: OrderNotificationItem[];
  notes: string | null;
  payment_note: string | null;
  expected_delivery_time: string | null;
  expected_delivery_time_set_at: string | null;
  total_usd: number;
  delivery_fee_usd: number;
  delivery_speed: DeliverySpeed;
  scheduled_for: string | null;
  coupon_code: string | null;
  coupon_discount_usd: number;
  driver_id: string | null;
  driver_assigned_at: string | null;
  status: string;
  whatsapp_sent: boolean;
  created_at: string;
  updated_at: string;
};

function getServiceClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!env.supabaseUrl || !key) return null;
  return createClient(env.supabaseUrl, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export async function placeOrderAction(input: PlaceOrderInput): Promise<PlaceOrderResult> {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let customerId: string | null = null;
  let profilePhoneE164: string | null = null;
  if (user) {
    const { data: profile } = await supabase
      .from("customer_profiles")
      .select("id, phone, country_code")
      .eq("id", user.id)
      .maybeSingle();
    if (profile) {
      customerId = user.id;
      profilePhoneE164 = profilePhoneToE164(profile.phone, profile.country_code);
    }
  }

  const serviceClient = getServiceClient();
  const insertClient = serviceClient ?? supabase;

  let { data: restaurantRow, error: restaurantError } = await insertClient
    .from("restaurants")
    .select(
      "is_active, is_temporarily_closed, allow_guest_checkout, opening_hours, free_delivery, delivery_fee_usd, fast_delivery_enabled, fast_delivery_fee_usd, delivery_radius_km, latitude, longitude, restaurant_locations(latitude, longitude)",
    )
    .eq("id", input.restaurantId)
    .maybeSingle();

  if (restaurantError && /allow_guest_checkout/i.test(restaurantError.message ?? "")) {
    const retry = await insertClient
      .from("restaurants")
      .select(
        "is_active, is_temporarily_closed, opening_hours, free_delivery, delivery_fee_usd, fast_delivery_enabled, fast_delivery_fee_usd, delivery_radius_km, latitude, longitude, restaurant_locations(latitude, longitude)",
      )
      .eq("id", input.restaurantId)
      .maybeSingle();
    restaurantRow = retry.data ? { ...retry.data, allow_guest_checkout: false } : null;
    restaurantError = retry.error;
  }

  if (restaurantError || !restaurantRow) {
    return { ok: false, error: "Store not found." };
  }
  if (!restaurantRow.is_active) {
    return { ok: false, error: "This store is not accepting orders." };
  }
  if (restaurantRow.is_temporarily_closed) {
    return { ok: false, error: "This store is temporarily closed." };
  }

  if (!user && !restaurantRow.allow_guest_checkout) {
    return { ok: false, error: "Please sign in to place an order from this store." };
  }

  const hours = parseOpeningHours(restaurantRow.opening_hours);
  const scheduledFor = input.scheduledFor?.trim() || null;

  if (scheduledFor) {
    if (!isScheduledTimeValid(hours, scheduledFor, { maxDays: 5 })) {
      return { ok: false, error: "Please choose a valid scheduled delivery time during opening hours." };
    }
  } else if (!isRestaurantOpenNow(hours, { isTemporarilyClosed: false })) {
    return { ok: false, error: "The store is closed right now. Please schedule your delivery." };
  }

  if (!input.items.length) {
    return { ok: false, error: "Invalid order details." };
  }

  const isGuestOrder = !user && restaurantRow.allow_guest_checkout;
  const customerName =
    input.customerName.trim() || (isGuestOrder ? "Guest" : "");
  if (!customerName) {
    return { ok: false, error: "Invalid order details." };
  }

  if (input.deliveryLat != null && input.deliveryLng != null) {
    const branches = Array.isArray(restaurantRow.restaurant_locations)
      ? restaurantRow.restaurant_locations
      : [];
    const withinRange = isWithinRestaurantDeliveryRange(
      { lat: input.deliveryLat, lng: input.deliveryLng },
      {
        latitude: restaurantRow.latitude,
        longitude: restaurantRow.longitude,
        branches,
        delivery_radius_km: restaurantRow.delivery_radius_km,
      },
    );
    if (withinRange === false) {
      const maxKm = normalizeRestaurantDeliveryRadiusKm(restaurantRow.delivery_radius_km);
      return {
        ok: false,
        error: `This store only delivers within ${maxKm} km of the store. Choose a closer address.`,
      };
    }
  }

  const categories = await getRestaurantMenu(input.restaurantId);
  const menuById = buildMenuItemPricingMap(categories);
  const pricingCheck = validateOrderLinesPricing(input.items, menuById);
  if (!pricingCheck.ok) {
    return { ok: false, error: pricingCheck.error };
  }

  const itemsSubtotal = pricingCheck.subtotal;
  const deliverySpeed: DeliverySpeed = input.deliverySpeed === "fast" ? "fast" : "standard";
  let deliveryFeeUsd = 0;
  if (deliverySpeed === "fast") {
    if (!restaurantRow.fast_delivery_enabled) {
      return { ok: false, error: "Fast delivery is not available for this store." };
    }
    deliveryFeeUsd = Math.max(0, Number(restaurantRow.fast_delivery_fee_usd) || 0);
  } else if (!restaurantRow.free_delivery) {
    deliveryFeeUsd = Math.max(0, Number(restaurantRow.delivery_fee_usd) || 0);
  }
  const expectedTotalBeforeCoupon = Math.round((itemsSubtotal + deliveryFeeUsd) * 100) / 100;

  let couponDiscountUsd = 0;
  let couponCodeId: string | null = null;
  let couponCodeStored: string | null = null;

  const couponCodeRaw = input.couponCode?.trim();
  if (couponCodeRaw) {
    const couponResult = await lookupCouponForOrder(serviceClient, input.restaurantId, couponCodeRaw);
    if (!couponResult.ok) {
      return { ok: false, error: couponResult.error };
    }
    const discount = computeOrderCouponDiscount({
      percentOff: couponResult.coupon.percent_off,
      itemsSubtotalUsd: itemsSubtotal,
      deliveryFeeUsd,
    });
    couponDiscountUsd = discount.discountUsd;
    couponCodeId = couponResult.coupon.id;
    couponCodeStored = couponResult.coupon.code;
  }

  const expectedTotal = Math.round((expectedTotalBeforeCoupon - couponDiscountUsd) * 100) / 100;
  if (Math.abs(expectedTotal - input.totalUsd) > 0.02) {
    return { ok: false, error: "Order total does not match. Please refresh and try again." };
  }

  const orderInsert: Record<string, unknown> = {
      restaurant_id: input.restaurantId,
      customer_id: customerId,
      customer_name: customerName,
      customer_phone: input.customerPhone?.trim() || profilePhoneE164,
      delivery_address: input.deliveryAddress?.trim() || null,
      delivery_lat: input.deliveryLat ?? null,
      delivery_lng: input.deliveryLng ?? null,
      items: input.items,
      notes: input.notes?.trim() || null,
      payment_note: input.paymentNote?.trim() || null,
      total_usd: expectedTotal,
      delivery_fee_usd: deliveryFeeUsd,
      delivery_speed: deliverySpeed,
      scheduled_for: scheduledFor,
      status: "pending",
      whatsapp_sent: false,
      coupon_code: couponCodeStored,
      coupon_discount_usd: couponDiscountUsd,
      coupon_code_id: couponCodeId,
  };

  const { data: order, error: insertError } = await insertClient.from("orders").insert(orderInsert).select("id, created_at").single();

  if (!insertError && couponCodeId && serviceClient) {
    const { data: redeemed, error: redeemError } = await serviceClient.rpc("increment_menu_coupon_usage", {
      p_coupon_id: couponCodeId,
    });
    if (redeemError || !redeemed) {
      console.warn("[placeOrder] coupon usage increment failed", couponCodeId, redeemError?.message);
    }
  }

  if (insertError || !order) {
    console.error("[placeOrder] insert failed", insertError?.message);
    return { ok: false, error: insertError?.message ?? "Failed to place order" };
  }

  void decrementMenuItemStockForOrder(insertClient, input.restaurantId, input.items);
  revalidatePath("/dashboard/business");

  revalidatePath(`/dashboard/business/orders`);

  // Fetch restaurant info for notifications
  const { data: restaurant } = await insertClient
    .from("restaurants")
    .select("name, phone")
    .eq("id", input.restaurantId)
    .maybeSingle();

  // Fetch restaurant admin email
  let restaurantEmail: string | null = null;
  if (serviceClient) {
    const { data: adminUser } = await serviceClient
      .from("users")
      .select("email")
      .eq("restaurant_id", input.restaurantId)
      .limit(1)
      .maybeSingle();
    restaurantEmail = adminUser?.email ?? null;
  }

  const notificationParams = {
    orderId: order.id,
    restaurantName: restaurant?.name ?? "Store",
    restaurantEmail: restaurantEmail ?? "",
    restaurantPhone: restaurant?.phone ?? "",
    customerName: customerName,
    customerPhone: input.customerPhone,
    deliveryAddress: input.deliveryAddress,
    deliveryLat: input.deliveryLat,
    deliveryLng: input.deliveryLng,
    items: input.items,
    notes: input.notes,
    totalUsd: expectedTotal,
    deliverySpeed,
    paymentNote: input.paymentNote?.trim() || null,
    couponCode: couponCodeStored,
    couponDiscountUsd: couponDiscountUsd > 0 ? couponDiscountUsd : null,
    placedAt: order.created_at,
  };

  // Fire-and-forget email notification
  if (restaurantEmail) {
    void sendNewOrderEmailNotification(notificationParams);
  }

  // Build WhatsApp notification URL so client can optionally also ping restaurant
  const whatsappNotifyUrl =
    restaurant?.phone
      ? buildRestaurantWhatsAppNotifyUrl(restaurant.phone, notificationParams)
      : null;

  return { ok: true, orderId: order.id, whatsappNotifyUrl };
}

export async function updateOrderStatusAction(input: OrderStatusUpdate): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createServerSupabaseClient();
  const updatePayload: Record<string, unknown> = { status: input.status };
  const expectedDeliveryTime = input.expectedDeliveryTime?.trim();
  if (input.status === "confirmed" && expectedDeliveryTime) {
    updatePayload.expected_delivery_time = expectedDeliveryTime;
    updatePayload.expected_delivery_time_set_at = new Date().toISOString();
  }

  if (input.status === "confirmed") {
    const { data: order } = await supabase
      .from("orders")
      .select("restaurant_id, driver_id")
      .eq("id", input.orderId)
      .maybeSingle();

    if (order && !order.driver_id) {
      const { data: restaurant } = await supabase
        .from("restaurants")
        .select("driver_management_enabled")
        .eq("id", order.restaurant_id)
        .maybeSingle();

      if (restaurant?.driver_management_enabled) {
        const { data: activeDrivers } = await supabase
          .from("restaurant_drivers")
          .select("id")
          .eq("restaurant_id", order.restaurant_id)
          .eq("is_active", true)
          .limit(2);

        if ((activeDrivers ?? []).length === 1) {
          updatePayload.driver_id = activeDrivers?.[0]?.id;
          updatePayload.driver_assigned_at = new Date().toISOString();
        }
      }
    }
  }

  const { error } = await supabase
    .from("orders")
    .update(updatePayload)
    .eq("id", input.orderId);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/dashboard/business/orders");
  return { ok: true };
}

export async function assignRestaurantOrderDriverAction(
  input: OrderDriverAssignmentUpdate,
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createServerSupabaseClient();
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("restaurant_id")
    .eq("id", input.orderId)
    .maybeSingle();

  if (orderError) return { ok: false, error: orderError.message };
  if (!order) return { ok: false, error: "Order not found or not allowed." };

  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("driver_management_enabled")
    .eq("id", order.restaurant_id)
    .maybeSingle();

  if (!restaurant?.driver_management_enabled) {
    return { ok: false, error: "Driver management is disabled for this store." };
  }

  const driverId = input.driverId?.trim() || null;
  if (driverId) {
    const { data: driver, error: driverError } = await supabase
      .from("restaurant_drivers")
      .select("id")
      .eq("id", driverId)
      .eq("restaurant_id", order.restaurant_id)
      .eq("is_active", true)
      .maybeSingle();

    if (driverError) return { ok: false, error: driverError.message };
    if (!driver) return { ok: false, error: "Choose an active driver for this store." };
  }

  const { error } = await supabase
    .from("orders")
    .update({
      driver_id: driverId,
      driver_assigned_at: driverId ? new Date().toISOString() : null,
    })
    .eq("id", input.orderId);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/dashboard/business/orders");
  revalidatePath("/dashboard/business/drivers");
  return { ok: true };
}

const RESTAURANT_ORDER_SELECT =
  "id, customer_id, customer_name, customer_phone, delivery_address, delivery_lat, delivery_lng, items, notes, payment_note, expected_delivery_time, expected_delivery_time_set_at, total_usd, delivery_fee_usd, delivery_speed, scheduled_for, coupon_code, coupon_discount_usd, driver_id, driver_assigned_at, status, whatsapp_sent, created_at, updated_at";

export async function getRestaurantOrderDefaultEtaLabel(restaurantId: string): Promise<string | null> {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("restaurants")
    .select("eta_label")
    .eq("id", restaurantId)
    .maybeSingle();

  return data?.eta_label?.trim() || null;
}

export async function updateOrderExpectedDeliveryTimeAction(
  input: OrderExpectedDeliveryTimeUpdate,
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createServerSupabaseClient();
  const expectedDeliveryTime = input.expectedDeliveryTime.trim();

  if (!expectedDeliveryTime) {
    return { ok: false, error: "Expected delivery time is required." };
  }

  const { data: orderStatus, error: statusError } = await supabase
    .from("orders")
    .select("status")
    .eq("id", input.orderId)
    .maybeSingle();

  if (statusError) return { ok: false, error: statusError.message };
  if (!orderStatus) return { ok: false, error: "Order not found or not allowed." };
  if (["delivered", "cancelled"].includes(orderStatus.status)) {
    return { ok: false, error: "Delivered or cancelled orders cannot update ETA." };
  }

  const { error } = await supabase
    .from("orders")
    .update({
      expected_delivery_time: expectedDeliveryTime,
      expected_delivery_time_set_at: new Date().toISOString(),
    })
    .eq("id", input.orderId);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/dashboard/business/orders");
  return { ok: true };
}

export async function updateRestaurantOrderAction(
  input: RestaurantOrderUpdateInput,
): Promise<{ ok: true; order: OrderRow } | { ok: false; error: string }> {
  const supabase = await createServerSupabaseClient();
  const customerName = input.customerName.trim();
  const totalUsd = Math.round(Number(input.totalUsd) * 100) / 100;
  const manualAdjustmentUsd = Math.round(Number(input.manualAdjustmentUsd ?? 0) * 100) / 100;

  if (!customerName) {
    return { ok: false, error: "Customer name is required." };
  }
  if (!Number.isFinite(totalUsd) || totalUsd < 0) {
    return { ok: false, error: "Enter a valid order total." };
  }
  if (!Number.isFinite(manualAdjustmentUsd) || manualAdjustmentUsd < 0) {
    return { ok: false, error: "Enter a valid extra charge." };
  }

  const { data: currentOrder, error: fetchError } = await supabase
    .from("orders")
    .select("restaurant_id, items")
    .eq("id", input.orderId)
    .maybeSingle();

  if (fetchError) return { ok: false, error: fetchError.message };
  if (!currentOrder) return { ok: false, error: "Order not found or not allowed." };

  const items = Array.isArray(currentOrder.items)
    ? ([...currentOrder.items] as OrderNotificationItem[])
    : [];

  const menuAdditions = (input.menuAdditions ?? [])
    .map((addition) => ({
      menuItemId: addition.menuItemId,
      name: addition.name.trim(),
      qty: Math.round(Number(addition.qty) * 1000) / 1000,
      unit: addition.unit === "kg" ? "kg" as const : "each" as const,
      unitPrice: Math.round(Number(addition.unitPrice) * 100) / 100,
    }))
    .filter(
      (addition) =>
        addition.menuItemId &&
        addition.name &&
        Number.isFinite(addition.qty) &&
        addition.qty > 0 &&
        Number.isFinite(addition.unitPrice) &&
        addition.unitPrice >= 0,
    );

  if (menuAdditions.length) {
    const menuItemIds = [...new Set(menuAdditions.map((addition) => addition.menuItemId))];
    const { data: menuRows, error: menuError } = await supabase
      .from("menu_items")
      .select("id, name")
      .eq("restaurant_id", currentOrder.restaurant_id)
      .in("id", menuItemIds);

    if (menuError) return { ok: false, error: menuError.message };

    const validMenuItems = new Map((menuRows ?? []).map((item) => [item.id, item.name]));
    for (const addition of menuAdditions) {
      const menuName = validMenuItems.get(addition.menuItemId);
      if (!menuName) {
        return { ok: false, error: "One of the selected menu items is no longer available." };
      }
      items.push({
        menuItemId: addition.menuItemId,
        name: menuName,
        qty: addition.qty,
        unit: addition.unit,
        unitPrice: addition.unitPrice,
        specialInstructions: "Added by the store from the menu.",
      });
    }
  }

  if (manualAdjustmentUsd > 0) {
    items.push({
      name: input.manualAdjustmentLabel?.trim() || "Manual order adjustment",
      qty: 1,
      unit: "each",
      unitPrice: manualAdjustmentUsd,
      specialInstructions: "Added by the store after customer request.",
    });
  }

  const { data: updatedOrder, error: updateError } = await supabase
    .from("orders")
    .update({
      customer_name: customerName,
      customer_phone: input.customerPhone?.trim() || null,
      delivery_address: input.deliveryAddress?.trim() || null,
      notes: input.notes?.trim() || null,
      payment_note: input.paymentNote?.trim() || null,
      total_usd: totalUsd,
      items,
    })
    .eq("id", input.orderId)
    .select(RESTAURANT_ORDER_SELECT)
    .single();

  if (updateError || !updatedOrder) {
    return { ok: false, error: updateError?.message ?? "Failed to update order." };
  }

  revalidatePath("/dashboard/business");
  revalidatePath("/dashboard/business/orders");
  return { ok: true, order: updatedOrder as OrderRow };
}

export async function deleteRestaurantOrderAction(
  orderId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from("orders").delete().eq("id", orderId);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/dashboard/business");
  revalidatePath("/dashboard/business/orders");
  return { ok: true };
}

export async function getRestaurantOrders(restaurantId: string): Promise<OrderRow[]> {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("orders")
    .select(RESTAURANT_ORDER_SELECT)
    .eq("restaurant_id", restaurantId)
    .order("created_at", { ascending: false })
    .limit(200);

  return (data ?? []) as OrderRow[];
}

export type CustomerOrderRow = OrderRow & {
  restaurant_id: string;
  restaurant_name: string;
  restaurant_slug: string;
  restaurant_is_active: boolean;
  restaurant_logo_url: string | null;
  restaurant_lbp_rate: number;
  restaurant_avg_rating: number | null;
  restaurant_rating_count: number;
};

type RestaurantEmbed = {
  name: string;
  slug: string;
  is_active?: boolean;
  logo_url?: string | null;
  lbp_rate?: number | null;
};

function mapCustomerOrderRow(
  r: Record<string, unknown>,
  extras?: { restaurant_avg_rating?: number | null; restaurant_rating_count?: number },
): CustomerOrderRow {
  const rest = r.restaurants as RestaurantEmbed | null;
  const lbp = Number(rest?.lbp_rate);
  return {
    ...(r as unknown as OrderRow),
    restaurant_id: String(r.restaurant_id ?? ""),
    restaurant_name: rest?.name ?? "Store",
    restaurant_slug: rest?.slug ?? "",
    restaurant_is_active: rest?.is_active !== false,
    restaurant_logo_url: rest?.logo_url ?? null,
    restaurant_lbp_rate: Number.isFinite(lbp) && lbp > 0 ? lbp : 89500,
    restaurant_avg_rating: extras?.restaurant_avg_rating ?? null,
    restaurant_rating_count: extras?.restaurant_rating_count ?? 0,
  };
}

export async function getCustomerOrder(orderId: string): Promise<CustomerOrderRow | null> {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("orders")
    .select(
      "id, restaurant_id, customer_id, customer_name, customer_phone, delivery_address, delivery_lat, delivery_lng, items, notes, payment_note, expected_delivery_time, expected_delivery_time_set_at, total_usd, delivery_fee_usd, delivery_speed, scheduled_for, coupon_code, coupon_discount_usd, driver_id, driver_assigned_at, status, whatsapp_sent, created_at, updated_at, restaurants(name, slug, is_active, logo_url, lbp_rate)",
    )
    .eq("id", orderId)
    .eq("customer_id", user.id)
    .maybeSingle();

  if (!data) return null;
  const r = data as unknown as Record<string, unknown>;
  const restaurantId = String(r.restaurant_id ?? "");
  let restaurant_avg_rating: number | null = null;
  let restaurant_rating_count = 0;
  if (restaurantId) {
    const { data: ratingRows } = await supabase.rpc("restaurant_rating_stats", {
      p_ids: [restaurantId],
    });
    const row = Array.isArray(ratingRows) ? ratingRows[0] : null;
    if (row) {
      const avg = Number((row as { avg_rating: unknown }).avg_rating);
      const cnt = Number((row as { rating_count: unknown }).rating_count);
      if (Number.isFinite(avg)) restaurant_avg_rating = Math.round(avg * 10) / 10;
      if (Number.isFinite(cnt)) restaurant_rating_count = cnt;
    }
  }
  return mapCustomerOrderRow(r, { restaurant_avg_rating, restaurant_rating_count });
}

export async function getCustomerOrders(): Promise<CustomerOrderRow[]> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("orders")
    .select(
      "id, restaurant_id, customer_id, customer_name, customer_phone, delivery_address, delivery_lat, delivery_lng, items, notes, payment_note, expected_delivery_time, expected_delivery_time_set_at, total_usd, delivery_fee_usd, delivery_speed, scheduled_for, coupon_code, coupon_discount_usd, status, whatsapp_sent, created_at, updated_at, restaurants(name, slug, is_active, logo_url, lbp_rate)",
    )
    .eq("customer_id", user.id)
    .order("created_at", { ascending: false })
    .limit(100);

  return ((data ?? []) as unknown[]).map((row) =>
    mapCustomerOrderRow(row as Record<string, unknown>),
  );
}
