"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
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
};

export type OrderRow = {
  id: string;
  customer_name: string;
  customer_phone: string | null;
  delivery_address: string | null;
  delivery_lat: number | null;
  delivery_lng: number | null;
  items: OrderNotificationItem[];
  notes: string | null;
  payment_note: string | null;
  total_usd: number;
  delivery_fee_usd: number;
  delivery_speed: DeliverySpeed;
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
  if (user) {
    const { data: profile } = await supabase
      .from("customer_profiles")
      .select("id")
      .eq("id", user.id)
      .maybeSingle();
    if (profile) customerId = user.id;
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
    return { ok: false, error: "Restaurant not found." };
  }
  if (!restaurantRow.is_active) {
    return { ok: false, error: "This restaurant is not accepting orders." };
  }
  if (restaurantRow.is_temporarily_closed) {
    return { ok: false, error: "This restaurant is temporarily closed." };
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
    return { ok: false, error: "The restaurant is closed right now. Please schedule your delivery." };
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
        error: `This restaurant only delivers within ${maxKm} km of the store. Choose a closer address.`,
      };
    }
  }

  const itemsSubtotal = input.items.reduce(
    (sum, item) => sum + Number(item.qty) * Number(item.unitPrice),
    0,
  );
  const deliverySpeed: DeliverySpeed = input.deliverySpeed === "fast" ? "fast" : "standard";
  let deliveryFeeUsd = 0;
  if (deliverySpeed === "fast") {
    if (!restaurantRow.fast_delivery_enabled) {
      return { ok: false, error: "Fast delivery is not available for this restaurant." };
    }
    deliveryFeeUsd = Math.max(0, Number(restaurantRow.fast_delivery_fee_usd) || 0);
  } else if (!restaurantRow.free_delivery) {
    deliveryFeeUsd = Math.max(0, Number(restaurantRow.delivery_fee_usd) || 0);
  }
  const expectedTotal = Math.round((itemsSubtotal + deliveryFeeUsd) * 100) / 100;
  if (Math.abs(expectedTotal - input.totalUsd) > 0.02) {
    return { ok: false, error: "Order total does not match. Please refresh and try again." };
  }

  const { data: order, error: insertError } = await insertClient
    .from("orders")
    .insert({
      restaurant_id: input.restaurantId,
      customer_id: customerId,
      customer_name: customerName,
      customer_phone: input.customerPhone?.trim() || null,
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
    })
    .select("id")
    .single();

  if (insertError || !order) {
    console.error("[placeOrder] insert failed", insertError?.message);
    return { ok: false, error: insertError?.message ?? "Failed to place order" };
  }

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
    restaurantName: restaurant?.name ?? "Restaurant",
    restaurantEmail: restaurantEmail ?? "",
    restaurantPhone: restaurant?.phone ?? "",
    customerName: customerName,
    customerPhone: input.customerPhone,
    deliveryAddress: input.deliveryAddress,
    deliveryLat: input.deliveryLat,
    deliveryLng: input.deliveryLng,
    items: input.items,
    notes: input.notes,
    totalUsd: input.totalUsd,
    deliverySpeed,
    paymentNote: input.paymentNote?.trim() || null,
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

  const { error } = await supabase
    .from("orders")
    .update({ status: input.status })
    .eq("id", input.orderId);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/dashboard/business/orders");
  return { ok: true };
}

export async function getRestaurantOrders(restaurantId: string): Promise<OrderRow[]> {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("orders")
    .select(
      "id, customer_name, customer_phone, delivery_address, delivery_lat, delivery_lng, items, notes, payment_note, total_usd, delivery_fee_usd, delivery_speed, status, whatsapp_sent, created_at, updated_at",
    )
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
  restaurant_avg_rating: number | null;
  restaurant_rating_count: number;
};

export async function getCustomerOrder(orderId: string): Promise<CustomerOrderRow | null> {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("orders")
    .select(
      "id, restaurant_id, customer_name, customer_phone, delivery_address, delivery_lat, delivery_lng, items, notes, payment_note, total_usd, delivery_fee_usd, delivery_speed, status, whatsapp_sent, created_at, updated_at, restaurants(name, slug, is_active)",
    )
    .eq("id", orderId)
    .eq("customer_id", user.id)
    .maybeSingle();

  if (!data) return null;
  const r = data as unknown as Record<string, unknown>;
  const rest = r.restaurants as { name: string; slug: string; is_active?: boolean } | null;
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
  return {
    ...(r as unknown as OrderRow),
    restaurant_id: restaurantId,
    restaurant_name: rest?.name ?? "Restaurant",
    restaurant_slug: rest?.slug ?? "",
    restaurant_is_active: rest?.is_active !== false,
    restaurant_avg_rating,
    restaurant_rating_count,
  };
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
      "id, restaurant_id, customer_name, customer_phone, delivery_address, delivery_lat, delivery_lng, items, notes, payment_note, total_usd, delivery_fee_usd, delivery_speed, status, whatsapp_sent, created_at, updated_at, restaurants(name, slug, is_active)",
    )
    .eq("customer_id", user.id)
    .order("created_at", { ascending: false })
    .limit(100);

  return ((data ?? []) as unknown[]).map((row) => {
    const r = row as Record<string, unknown>;
    const rest = r.restaurants as { name: string; slug: string; is_active?: boolean } | null;
    return {
      ...(r as unknown as OrderRow),
      restaurant_id: String(r.restaurant_id ?? ""),
      restaurant_name: rest?.name ?? "Restaurant",
      restaurant_slug: rest?.slug ?? "",
      restaurant_is_active: rest?.is_active !== false,
      restaurant_avg_rating: null,
      restaurant_rating_count: 0,
    };
  });
}
