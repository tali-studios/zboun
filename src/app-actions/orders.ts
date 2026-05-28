"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";
import { revalidatePath } from "next/cache";
import {
  sendNewOrderEmailNotification,
  buildRestaurantWhatsAppNotifyUrl,
  type OrderNotificationItem,
} from "@/lib/order-notifications";

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
  totalUsd: number;
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
  total_usd: number;
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

  const { data: order, error: insertError } = await insertClient
    .from("orders")
    .insert({
      restaurant_id: input.restaurantId,
      customer_id: customerId,
      customer_name: input.customerName.trim(),
      customer_phone: input.customerPhone?.trim() || null,
      delivery_address: input.deliveryAddress?.trim() || null,
      delivery_lat: input.deliveryLat ?? null,
      delivery_lng: input.deliveryLng ?? null,
      items: input.items,
      notes: input.notes?.trim() || null,
      total_usd: input.totalUsd,
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
    customerName: input.customerName,
    customerPhone: input.customerPhone,
    deliveryAddress: input.deliveryAddress,
    deliveryLat: input.deliveryLat,
    deliveryLng: input.deliveryLng,
    items: input.items,
    notes: input.notes,
    totalUsd: input.totalUsd,
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
      "id, customer_name, customer_phone, delivery_address, delivery_lat, delivery_lng, items, notes, total_usd, status, whatsapp_sent, created_at, updated_at",
    )
    .eq("restaurant_id", restaurantId)
    .order("created_at", { ascending: false })
    .limit(200);

  return (data ?? []) as OrderRow[];
}

export type CustomerOrderRow = OrderRow & {
  restaurant_name: string;
  restaurant_slug: string;
};

export async function getCustomerOrder(orderId: string): Promise<CustomerOrderRow | null> {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("orders")
    .select(
      "id, customer_name, customer_phone, delivery_address, delivery_lat, delivery_lng, items, notes, total_usd, status, whatsapp_sent, created_at, updated_at, restaurants(name, slug)",
    )
    .eq("id", orderId)
    .eq("customer_id", user.id)
    .maybeSingle();

  if (!data) return null;
  const r = data as unknown as Record<string, unknown>;
  const rest = r.restaurants as { name: string; slug: string } | null;
  return {
    ...(r as unknown as OrderRow),
    restaurant_name: rest?.name ?? "Restaurant",
    restaurant_slug: rest?.slug ?? "",
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
      "id, customer_name, customer_phone, delivery_address, delivery_lat, delivery_lng, items, notes, total_usd, status, whatsapp_sent, created_at, updated_at, restaurants(name, slug)",
    )
    .eq("customer_id", user.id)
    .order("created_at", { ascending: false })
    .limit(100);

  return ((data ?? []) as unknown[]).map((row) => {
    const r = row as Record<string, unknown>;
    const rest = r.restaurants as { name: string; slug: string } | null;
    return {
      ...(r as unknown as OrderRow),
      restaurant_name: rest?.name ?? "Restaurant",
      restaurant_slug: rest?.slug ?? "",
    };
  });
}
