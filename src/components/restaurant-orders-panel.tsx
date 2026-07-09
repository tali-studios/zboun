"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Pencil, Trash2 } from "lucide-react";
import { createClient as createBrowserSupabaseClient } from "@/lib/supabase/client";
import {
  assignRestaurantOrderDriverAction,
  deleteRestaurantOrderAction,
  updateOrderExpectedDeliveryTimeAction,
  updateOrderStatusAction,
  updateRestaurantOrderAction,
  type OrderRow,
} from "@/app-actions/orders";
import { buildCustomerWhatsAppUrl } from "@/lib/whatsapp-url";
import type { RestaurantDriver } from "@/app-actions/drivers";
import type { CategoryWithItems } from "@/lib/data";

function shortId(id: string) {
  return id.slice(0, 8).toUpperCase();
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.884 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function orderCustomerWhatsAppUrl(order: OrderRow, restaurantName?: string | null) {
  if (!order.customer_phone) return null;
  return buildCustomerWhatsAppUrl(order.customer_phone, {
    customerName: order.customer_name,
    orderShortId: shortId(order.id),
    restaurantName: restaurantName ?? undefined,
  });
}

const ORDER_ACTION_BTN =
  "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition disabled:cursor-not-allowed";

const EDIT_ICON_BUTTON_CLASS = `${ORDER_ACTION_BTN} border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-100`;
const DELETE_ICON_BUTTON_CLASS = `${ORDER_ACTION_BTN} border-red-200 bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-60`;
const WHATSAPP_ICON_BUTTON_CLASS = `${ORDER_ACTION_BTN} border-[#25D366]/40 bg-[#25D366]/10 text-[#128C7E] hover:border-[#25D366] hover:bg-[#25D366]/20 disabled:opacity-50`;

const STATUS_META: Record<
  string,
  { label: string; color: string; bg: string; border: string; dot: string }
> = {
  pending: {
    label: "Pending",
    color: "text-amber-700",
    bg: "bg-amber-50",
    border: "border-amber-200",
    dot: "bg-amber-400",
  },
  confirmed: {
    label: "Confirmed",
    color: "text-blue-700",
    bg: "bg-blue-50",
    border: "border-blue-200",
    dot: "bg-blue-500",
  },
  preparing: {
    label: "Preparing",
    color: "text-violet-700",
    bg: "bg-violet-50",
    border: "border-violet-200",
    dot: "bg-violet-500",
  },
  ready: {
    label: "Ready",
    color: "text-emerald-700",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    dot: "bg-emerald-500",
  },
  out_for_delivery: {
    label: "Out for Delivery",
    color: "text-indigo-700",
    bg: "bg-indigo-50",
    border: "border-indigo-200",
    dot: "bg-indigo-500",
  },
  delivered: {
    label: "Delivered",
    color: "text-slate-600",
    bg: "bg-slate-100",
    border: "border-slate-200",
    dot: "bg-slate-400",
  },
  cancelled: {
    label: "Cancelled",
    color: "text-red-600",
    bg: "bg-red-50",
    border: "border-red-200",
    dot: "bg-red-400",
  },
};

const STATUS_TRANSITIONS: Record<string, string[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["preparing", "cancelled"],
  preparing: ["ready", "cancelled"],
  ready: ["out_for_delivery", "delivered", "cancelled"],
  out_for_delivery: ["delivered", "cancelled"],
  delivered: [],
  cancelled: [],
};

const STATUS_TRANSITION_LABELS: Record<string, string> = {
  confirmed: "Confirm",
  preparing: "Start Preparing",
  ready: "Mark Ready",
  out_for_delivery: "Out for Delivery",
  delivered: "Mark Delivered",
  cancelled: "Cancel",
};

const DATE_PRESETS = [
  { key: "all", label: "All loaded" },
  { key: "today", label: "Today" },
  { key: "7d", label: "Last 7 days" },
  { key: "30d", label: "Last 30 days" },
  { key: "month", label: "This month" },
] as const;

const ETA_QUICK_CHOICES = ["15 min", "30 min", "45 min", "1 hour"] as const;

type DatePresetKey = (typeof DATE_PRESETS)[number]["key"] | "custom";

type DateRange = {
  label: string;
  start: Date | null;
  end: Date | null;
};

type AnalyticsItem = {
  name: string;
  qty: number;
  revenue: number;
};

type AnalyticsCustomer = {
  key: string;
  name: string;
  phone: string | null;
  orders: number;
  total: number;
  average: number;
  lastOrderAt: string;
};

type OrderAnalytics = {
  totalOrders: number;
  deliveredOrders: number;
  activeOrders: number;
  cancelledOrders: number;
  cancellationRate: number;
  revenueOrders: number;
  totalSales: number;
  averageOrderValue: number;
  deliveryFees: number;
  couponDiscounts: number;
  fastDeliveryOrders: number;
  guestOrders: number;
  loggedInOrders: number;
  repeatCustomers: number;
  recentCustomers: number;
  scheduledOrders: number;
  pendingOrders: number;
  preparingOrders: number;
  bestCustomer: AnalyticsCustomer | null;
  topCustomers: AnalyticsCustomer[];
  topItem: AnalyticsItem | null;
  topItems: AnalyticsItem[];
  busiestDay: string;
  busiestHour: string;
};

type OrderItemSummary = {
  name: string;
  qty: number;
  unit?: string;
  unitPrice?: number;
  selectedOption?: string | null;
};

function startOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function endOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(23, 59, 59, 999);
  return next;
}

function parseDateInput(value: string, boundary: "start" | "end") {
  if (!value) return null;
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return null;
  return boundary === "start" ? startOfDay(date) : endOfDay(date);
}

function getDateRange(preset: DatePresetKey, customStart: string, customEnd: string): DateRange {
  if (preset === "custom") {
    const start = parseDateInput(customStart, "start");
    const end = parseDateInput(customEnd, "end");
    if (start && end) return { label: `${customStart} to ${customEnd}`, start, end };
    if (start) return { label: `Since ${customStart}`, start, end: null };
    if (end) return { label: `Until ${customEnd}`, start: null, end };
    return { label: "Custom period", start: null, end: null };
  }

  const now = new Date();
  if (preset === "today") {
    return { label: "Today", start: startOfDay(now), end: endOfDay(now) };
  }
  if (preset === "7d") {
    const start = startOfDay(now);
    start.setDate(start.getDate() - 6);
    return { label: "Last 7 days", start, end: endOfDay(now) };
  }
  if (preset === "30d") {
    const start = startOfDay(now);
    start.setDate(start.getDate() - 29);
    return { label: "Last 30 days", start, end: endOfDay(now) };
  }
  if (preset === "month") {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    return { label: "This month", start, end: endOfDay(now) };
  }
  return { label: "All loaded orders", start: null, end: null };
}

function orderIsInRange(order: OrderRow, range: DateRange) {
  if (!range.start && !range.end) return true;
  const createdAt = new Date(order.created_at).getTime();
  if (Number.isNaN(createdAt)) return false;
  if (range.start && createdAt < range.start.getTime()) return false;
  if (range.end && createdAt > range.end.getTime()) return false;
  return true;
}

function normalizePhone(phone: string | null) {
  const digits = phone?.replace(/\D/g, "") ?? "";
  return digits || null;
}

function customerKey(order: OrderRow) {
  const phone = normalizePhone(order.customer_phone);
  if (phone) return `phone:${phone}`;
  return `name:${order.customer_name.trim().toLowerCase() || order.id}`;
}

function safeItems(order: OrderRow): OrderItemSummary[] {
  return Array.isArray(order.items) ? (order.items as OrderItemSummary[]) : [];
}

function buildAnalytics(orders: OrderRow[]): OrderAnalytics {
  const revenueOrders = orders.filter((order) => order.status !== "cancelled");
  const customerMap = new Map<string, AnalyticsCustomer>();
  const itemMap = new Map<string, AnalyticsItem>();
  const dayMap = new Map<string, number>();
  const hourMap = new Map<string, number>();
  const now = Date.now();
  const recentCutoff = now - 30 * 24 * 60 * 60 * 1000;

  for (const order of orders) {
    const createdAt = new Date(order.created_at);
    const createdTime = createdAt.getTime();
    const dayKey = Number.isNaN(createdTime)
      ? "Unknown day"
      : createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const hour = Number.isNaN(createdTime) ? null : createdAt.getHours();
    const hourKey = hour == null ? "Unknown time" : `${hour}:00-${(hour + 1) % 24}:00`;

    dayMap.set(dayKey, (dayMap.get(dayKey) ?? 0) + 1);
    hourMap.set(hourKey, (hourMap.get(hourKey) ?? 0) + 1);

    const key = customerKey(order);
    const existingCustomer = customerMap.get(key);
    const nextOrders = (existingCustomer?.orders ?? 0) + 1;
    const nextTotal = (existingCustomer?.total ?? 0) + (order.status === "cancelled" ? 0 : Number(order.total_usd) || 0);
    const lastOrderAt =
      existingCustomer && new Date(existingCustomer.lastOrderAt).getTime() > createdTime
        ? existingCustomer.lastOrderAt
        : order.created_at;

    customerMap.set(key, {
      key,
      name: existingCustomer?.name || order.customer_name || "Guest",
      phone: existingCustomer?.phone || order.customer_phone,
      orders: nextOrders,
      total: nextTotal,
      average: nextTotal / nextOrders,
      lastOrderAt,
    });

    for (const item of safeItems(order)) {
      if (!item.name) continue;
      const itemName = item.selectedOption ? `${item.name} (${item.selectedOption})` : item.name;
      const itemKey = itemName.trim().toLowerCase();
      const qty = Number(item.qty) || 0;
      const revenue = qty * (Number(item.unitPrice) || 0);
      const existingItem = itemMap.get(itemKey);
      itemMap.set(itemKey, {
        name: existingItem?.name || itemName,
        qty: (existingItem?.qty ?? 0) + qty,
        revenue: (existingItem?.revenue ?? 0) + revenue,
      });
    }
  }

  const topCustomers = Array.from(customerMap.values()).sort((a, b) => {
    if (b.orders !== a.orders) return b.orders - a.orders;
    return b.total - a.total;
  });
  const topItems = Array.from(itemMap.values()).sort((a, b) => {
    if (b.qty !== a.qty) return b.qty - a.qty;
    return b.revenue - a.revenue;
  });
  const busiestDay = Array.from(dayMap.entries()).sort((a, b) => b[1] - a[1])[0];
  const busiestHour = Array.from(hourMap.entries()).sort((a, b) => b[1] - a[1])[0];
  const totalSales = revenueOrders.reduce((sum, order) => sum + (Number(order.total_usd) || 0), 0);

  return {
    totalOrders: orders.length,
    deliveredOrders: orders.filter((order) => order.status === "delivered").length,
    activeOrders: orders.filter((order) => !["delivered", "cancelled"].includes(order.status)).length,
    cancelledOrders: orders.filter((order) => order.status === "cancelled").length,
    cancellationRate: orders.length ? orders.filter((order) => order.status === "cancelled").length / orders.length : 0,
    revenueOrders: revenueOrders.length,
    totalSales,
    averageOrderValue: revenueOrders.length ? totalSales / revenueOrders.length : 0,
    deliveryFees: revenueOrders.reduce((sum, order) => sum + (Number(order.delivery_fee_usd) || 0), 0),
    couponDiscounts: revenueOrders.reduce((sum, order) => sum + (Number(order.coupon_discount_usd) || 0), 0),
    fastDeliveryOrders: orders.filter((order) => order.delivery_speed === "fast").length,
    guestOrders: orders.filter((order) => !order.customer_id).length,
    loggedInOrders: orders.filter((order) => Boolean(order.customer_id)).length,
    repeatCustomers: topCustomers.filter((customer) => customer.orders > 1).length,
    recentCustomers: topCustomers.filter((customer) => {
      const lastOrderTime = new Date(customer.lastOrderAt).getTime();
      return !Number.isNaN(lastOrderTime) && lastOrderTime >= recentCutoff;
    }).length,
    scheduledOrders: orders.filter((order) => Boolean(order.scheduled_for)).length,
    pendingOrders: orders.filter((order) => order.status === "pending").length,
    preparingOrders: orders.filter((order) => order.status === "preparing").length,
    bestCustomer: topCustomers[0] ?? null,
    topCustomers: topCustomers.slice(0, 3),
    topItem: topItems[0] ?? null,
    topItems: topItems.slice(0, 3),
    busiestDay: busiestDay ? `${busiestDay[0]} (${busiestDay[1]} orders)` : "No data",
    busiestHour: busiestHour ? `${busiestHour[0]} (${busiestHour[1]} orders)` : "No data",
  };
}

type Props = {
  initialOrders: OrderRow[];
  restaurantId: string;
  restaurantName?: string;
  defaultDeliveryTimeLabel: string | null;
  menuCategories: CategoryWithItems[];
  drivers?: RestaurantDriver[];
  driverManagementEnabled?: boolean;
};

type EditOrderForm = {
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  notes: string;
  paymentNote: string;
  totalUsd: string;
  menuSearch: string;
  selectedMenuItemId: string;
  menuItemQty: string;
  manualAdjustmentLabel: string;
  manualAdjustmentUsd: string;
};

type MenuPickerItem = {
  id: string;
  categoryName: string;
  name: string;
  unit: "each" | "kg";
  unitPrice: number;
  isAvailable: boolean;
};

type EditMenuAddition = MenuPickerItem & {
  qty: number;
};

function getOrderEtaLabel(order: OrderRow | null, defaultDeliveryTimeLabel: string | null) {
  return order?.expected_delivery_time?.trim() || defaultDeliveryTimeLabel?.trim() || "";
}

function getMenuPickerItems(categories: CategoryWithItems[]): MenuPickerItem[] {
  return categories.flatMap((category) =>
    category.menu_items.map((item) => {
      const soldByWeight = Boolean(item.sold_by_weight);
      return {
        id: item.id,
        categoryName: category.name,
        name: item.name,
        unit: soldByWeight ? "kg" : "each",
        unitPrice: Number(
          soldByWeight
            ? item.sale_price_per_kg ?? item.price_per_kg ?? item.price
            : item.sale_price ?? item.price,
        ),
        isAvailable: item.is_available !== false,
      };
    }),
  );
}

export function RestaurantOrdersPanel({
  initialOrders,
  restaurantId,
  restaurantName,
  defaultDeliveryTimeLabel,
  menuCategories,
  drivers = [],
  driverManagementEnabled = false,
}: Props) {
  const router = useRouter();
  const driverById = useMemo(() => new Map(drivers.map((driver) => [driver.id, driver])), [drivers]);
  const activeDrivers = useMemo(() => drivers.filter((driver) => driver.is_active), [drivers]);
  const initiallySelected =
    initialOrders.find((o) => o.status === "pending") ?? initialOrders[0] ?? null;
  const [orders, setOrders] = useState<OrderRow[]>(initialOrders);
  const ordersRef = useRef<OrderRow[]>(initialOrders);
  const [selectedId, setSelectedId] = useState<string | null>(
    initiallySelected?.id ?? null,
  );
  const [statusFilter, setStatusFilter] = useState<string>("active");
  const [datePreset, setDatePreset] = useState<DatePresetKey>("all");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [updatingKey, setUpdatingKey] = useState<string | null>(null);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EditOrderForm>({
    customerName: "",
    customerPhone: "",
    deliveryAddress: "",
    notes: "",
    paymentNote: "",
    totalUsd: "",
    menuSearch: "",
    selectedMenuItemId: "",
    menuItemQty: "1",
    manualAdjustmentLabel: "",
    manualAdjustmentUsd: "",
  });
  const [editMenuAdditions, setEditMenuAdditions] = useState<EditMenuAddition[]>([]);
  const [orderActionKey, setOrderActionKey] = useState<string | null>(null);
  const [orderActionError, setOrderActionError] = useState<string | null>(null);
  const [deliveryEtaText, setDeliveryEtaText] = useState(
    getOrderEtaLabel(initiallySelected, defaultDeliveryTimeLabel),
  );
  const [newOrderIds, setNewOrderIds] = useState<Set<string>>(new Set());
  const [deleteConfirmOrderId, setDeleteConfirmOrderId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    let client: ReturnType<typeof createBrowserSupabaseClient> | null = null;
    try {
      client = createBrowserSupabaseClient();
    } catch {
      return;
    }

    const channel = client
      .channel("orders-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
          filter: `restaurant_id=eq.${restaurantId}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const newOrder = payload.new as OrderRow;
            setOrders((prev) => {
              const next = [newOrder, ...prev];
              ordersRef.current = next;
              return next;
            });
            setNewOrderIds((prev) => new Set([...prev, newOrder.id]));
            // Clear highlight after 10s
            setTimeout(() => {
              setNewOrderIds((prev) => {
                const next = new Set(prev);
                next.delete(newOrder.id);
                return next;
              });
            }, 10_000);
            // Try to play a notification sound
            try {
              audioRef.current?.play().catch(() => {});
            } catch {}
          } else if (payload.eventType === "UPDATE") {
            setOrders((prev) => {
              const next = prev.map((o) => (o.id === payload.new.id ? (payload.new as OrderRow) : o));
              ordersRef.current = next;
              return next;
            });
          } else if (payload.eventType === "DELETE") {
            setOrders((prev) => {
              const next = prev.filter((o) => o.id !== payload.old.id);
              ordersRef.current = next;
              return next;
            });
          }
        },
      )
      .subscribe();

    return () => {
      if (client) void client.removeChannel(channel);
    };
  }, [restaurantId]);

  function selectOrder(order: OrderRow) {
    setSelectedId(order.id);
    setDeliveryEtaText(getOrderEtaLabel(order, defaultDeliveryTimeLabel));
    setOrderActionError(null);
    setUpdateError(null);
  }

  async function handleStatusUpdate(order: OrderRow, status: string) {
    const expectedDeliveryTime = status === "confirmed" ? deliveryEtaText.trim() : undefined;
    if (status === "confirmed" && !expectedDeliveryTime) {
      setUpdateError("Add an expected delivery time before accepting this order.");
      return;
    }

    const orderId = order.id;
    const key = `${orderId}:${status}`;
    setUpdatingKey(key);
    setUpdateError(null);

    // Snapshot current state for potential revert
    const snapshot = ordersRef.current;

    // Optimistic update — show change immediately
    const updated = snapshot.map((o) =>
      o.id === orderId
        ? {
            ...o,
            status,
            expected_delivery_time:
              status === "confirmed" && expectedDeliveryTime ? expectedDeliveryTime : o.expected_delivery_time,
            expected_delivery_time_set_at:
              status === "confirmed" && expectedDeliveryTime ? new Date().toISOString() : o.expected_delivery_time_set_at,
            updated_at: new Date().toISOString(),
          }
        : o,
    );
    ordersRef.current = updated;
    setOrders(updated);

    const result = await updateOrderStatusAction({
      orderId,
      status: status as Parameters<typeof updateOrderStatusAction>[0]["status"],
      expectedDeliveryTime,
    });

    if (!result.ok) {
      // Revert on failure
      ordersRef.current = snapshot;
      setOrders(snapshot);
      setUpdateError(result.error ?? "Failed to update status");
    } else {
      router.refresh();
    }
    setUpdatingKey(null);
  }

  async function handleAssignDriver(order: OrderRow, driverId: string | null) {
    const key = `${order.id}:driver`;
    setOrderActionKey(key);
    setOrderActionError(null);

    const snapshot = ordersRef.current;
    const updated = snapshot.map((current) =>
      current.id === order.id
        ? {
            ...current,
            driver_id: driverId,
            driver_assigned_at: driverId ? new Date().toISOString() : null,
          }
        : current,
    );
    ordersRef.current = updated;
    setOrders(updated);

    const result = await assignRestaurantOrderDriverAction({ orderId: order.id, driverId });
    if (!result.ok) {
      ordersRef.current = snapshot;
      setOrders(snapshot);
      setOrderActionError(result.error ?? "Failed to assign driver");
    } else {
      router.refresh();
    }
    setOrderActionKey(null);
  }

  async function handleSaveDeliveryEta(order: OrderRow) {
    const expectedDeliveryTime = deliveryEtaText.trim();
    if (!expectedDeliveryTime) {
      setOrderActionError("Expected delivery time is required.");
      return;
    }

    const key = `${order.id}:eta`;
    setOrderActionKey(key);
    setOrderActionError(null);

    const snapshot = ordersRef.current;
    const updatedAt = new Date().toISOString();
    const updated = snapshot.map((current) =>
      current.id === order.id
        ? {
            ...current,
            expected_delivery_time: expectedDeliveryTime,
            expected_delivery_time_set_at: updatedAt,
            updated_at: updatedAt,
          }
        : current,
    );
    ordersRef.current = updated;
    setOrders(updated);

    const result = await updateOrderExpectedDeliveryTimeAction({
      orderId: order.id,
      expectedDeliveryTime,
    });

    if (result.ok) {
      router.refresh();
    } else {
      ordersRef.current = snapshot;
      setOrders(snapshot);
      setOrderActionError(result.error ?? "Failed to update delivery time.");
    }

    setOrderActionKey(null);
  }

  function openEditOrder(order: OrderRow) {
    setOrderActionError(null);
    setEditingOrderId(order.id);
    setEditForm({
      customerName: order.customer_name,
      customerPhone: order.customer_phone ?? "",
      deliveryAddress: order.delivery_address ?? "",
      notes: order.notes ?? "",
      paymentNote: order.payment_note ?? "",
      totalUsd: order.total_usd.toFixed(2),
      menuSearch: "",
      selectedMenuItemId: "",
      menuItemQty: "1",
      manualAdjustmentLabel: "",
      manualAdjustmentUsd: "",
    });
    setEditMenuAdditions([]);
  }

  function updateOrderLocally(order: OrderRow) {
    setOrders((prev) => {
      const next = prev.map((current) => (current.id === order.id ? order : current));
      ordersRef.current = next;
      return next;
    });
  }

  async function handleSaveOrderUpdate(order: OrderRow) {
    const baseTotal = Number(editForm.totalUsd);
    const extraCharge = Number(editForm.manualAdjustmentUsd || 0);
    const menuAdditionsTotal = editMenuAdditions.reduce(
      (sum, addition) => sum + addition.qty * addition.unitPrice,
      0,
    );
    const finalTotal = Math.round((baseTotal + extraCharge + menuAdditionsTotal) * 100) / 100;
    const key = `${order.id}:edit`;

    setOrderActionKey(key);
    setOrderActionError(null);

    const result = await updateRestaurantOrderAction({
      orderId: order.id,
      customerName: editForm.customerName,
      customerPhone: editForm.customerPhone,
      deliveryAddress: editForm.deliveryAddress,
      notes: editForm.notes,
      paymentNote: editForm.paymentNote,
      totalUsd: finalTotal,
      menuAdditions: editMenuAdditions.map((addition) => ({
        menuItemId: addition.id,
        name: addition.name,
        qty: addition.qty,
        unit: addition.unit,
        unitPrice: addition.unitPrice,
      })),
      manualAdjustmentLabel: editForm.manualAdjustmentLabel,
      manualAdjustmentUsd: extraCharge,
    });

    if (result.ok) {
      updateOrderLocally(result.order);
      setEditingOrderId(null);
      router.refresh();
    } else {
      setOrderActionError(result.error);
    }

    setOrderActionKey(null);
  }

  async function handleDeleteOrder(order: OrderRow) {
    const key = `${order.id}:delete`;
    setOrderActionKey(key);
    setOrderActionError(null);

    const snapshot = ordersRef.current;
    const next = snapshot.filter((current) => current.id !== order.id);
    ordersRef.current = next;
    setOrders(next);

    const result = await deleteRestaurantOrderAction(order.id);
    if (result.ok) {
      setEditingOrderId(null);
      setDeleteConfirmOrderId(null);
      router.refresh();
    } else {
      ordersRef.current = snapshot;
      setOrders(snapshot);
      setOrderActionError(result.error);
    }

    setOrderActionKey(null);
  }

  const dateRange = useMemo(
    () => getDateRange(datePreset, customStart, customEnd),
    [customEnd, customStart, datePreset],
  );
  const periodOrders = useMemo(
    () => orders.filter((order) => orderIsInRange(order, dateRange)),
    [dateRange, orders],
  );
  const analytics = useMemo(() => buildAnalytics(periodOrders), [periodOrders]);

  const filteredOrders = useMemo(
    () =>
      periodOrders.filter((o) => {
        if (statusFilter === "all") return true;
        if (statusFilter === "active") {
          return !["delivered", "cancelled"].includes(o.status);
        }
        if (statusFilter === "done") {
          return ["delivered", "cancelled"].includes(o.status);
        }
        return o.status === statusFilter;
      }),
    [periodOrders, statusFilter],
  );

  useEffect(() => {
    if (selectedId && filteredOrders.some((order) => order.id === selectedId)) return;
    const nextSelected = filteredOrders[0] ?? null;
    setSelectedId(nextSelected?.id ?? null);
    setDeliveryEtaText(getOrderEtaLabel(nextSelected, defaultDeliveryTimeLabel));
  }, [defaultDeliveryTimeLabel, filteredOrders, selectedId]);

  const selected = filteredOrders.find((o) => o.id === selectedId) ?? null;
  const deleteConfirmOrder = deleteConfirmOrderId
    ? orders.find((order) => order.id === deleteConfirmOrderId) ?? null
    : null;
  const pendingCount = orders.filter((o) => o.status === "pending").length;
  const menuPickerItems = useMemo(() => getMenuPickerItems(menuCategories), [menuCategories]);
  const filteredMenuPickerItems = useMemo(() => {
    const query = editForm.menuSearch.trim().toLowerCase();
    return menuPickerItems
      .filter((item) => item.isAvailable)
      .filter((item) => {
        if (!query) return true;
        return `${item.name} ${item.categoryName}`.toLowerCase().includes(query);
      })
      .slice(0, 8);
  }, [editForm.menuSearch, menuPickerItems]);
  const selectedMenuPickerItem =
    menuPickerItems.find((item) => item.id === editForm.selectedMenuItemId) ??
    filteredMenuPickerItems[0] ??
    null;
  const selectedOrderIsClosed = selected ? ["delivered", "cancelled"].includes(selected.status) : false;

  function formatMoney(value: number) {
    return `$${value.toFixed(2)}`;
  }

  function formatPercent(value: number) {
    return `${Math.round(value * 100)}%`;
  }

  function formatCount(value: number, singular: string, plural = `${singular}s`) {
    return `${value} ${value === 1 ? singular : plural}`;
  }

  function editOrderPreviewTotal() {
    const baseTotal = Number(editForm.totalUsd);
    const extraCharge = Number(editForm.manualAdjustmentUsd || 0);
    const menuAdditionsTotal = editMenuAdditions.reduce(
      (sum, addition) => sum + addition.qty * addition.unitPrice,
      0,
    );
    if (!Number.isFinite(baseTotal) || !Number.isFinite(extraCharge)) return null;
    return Math.round((baseTotal + extraCharge + menuAdditionsTotal) * 100) / 100;
  }

  function addSelectedMenuItemToEdit() {
    if (!selectedMenuPickerItem) return;
    const qty = Math.round(Number(editForm.menuItemQty || 1) * 1000) / 1000;
    if (!Number.isFinite(qty) || qty <= 0) {
      setOrderActionError("Enter a valid menu item quantity.");
      return;
    }

    setOrderActionError(null);
    setEditMenuAdditions((prev) => [
      ...prev,
      {
        ...selectedMenuPickerItem,
        qty,
      },
    ]);
    setEditForm((prev) => ({
      ...prev,
      menuSearch: "",
      selectedMenuItemId: "",
      menuItemQty: "1",
    }));
  }

  function removeEditMenuAddition(indexToRemove: number) {
    setEditMenuAdditions((prev) => prev.filter((_, index) => index !== indexToRemove));
  }

  function deliveryEtaHelpText(order: OrderRow) {
    if (order.status === "pending") {
      return "This will be saved when you accept the order.";
    }
    if (order.status === "out_for_delivery") {
      return "Driver delayed? Update this anytime while the order is out for delivery.";
    }
    if (order.status === "delivered") {
      return "Delivered orders are closed, so the ETA is locked.";
    }
    if (order.status === "cancelled") {
      return "Cancelled orders are closed, so the ETA is locked.";
    }
    return "You can update this if preparation or delivery timing changes.";
  }

  function deliveryEtaButtonLabel(order: OrderRow) {
    if (orderActionKey === `${order.id}:eta`) return "Saving...";
    if (order.status === "out_for_delivery") return "Update delivery time";
    if (order.status === "pending") return "Save before accepting";
    return "Save ETA";
  }

  function formatTime(iso: string) {
    return new Date(iso).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  }

  function formatDate(iso: string) {
    const d = new Date(iso);
    const today = new Date();
    if (d.toDateString() === today.toDateString()) return "Today";
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }

  function mapsLink(lat: number | null, lng: number | null) {
    if (!lat || !lng) return null;
    return `https://www.google.com/maps?q=${lat},${lng}`;
  }

  const selectedWhatsAppUrl = selected ? orderCustomerWhatsAppUrl(selected, restaurantName) : null;

  return (
    <div className="flex min-h-[70vh] flex-col gap-4">
      {/* Hidden audio for notification */}
      <audio ref={audioRef} preload="none" aria-hidden>
        <source src="/notification.mp3" type="audio/mpeg" />
      </audio>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold text-slate-900">Orders</h2>
          {pendingCount > 0 ? (
            <span className="animate-pulse rounded-full bg-amber-500 px-2.5 py-0.5 text-xs font-bold text-white">
              {pendingCount} new
            </span>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-1">
          {[
            { key: "all", label: "All" },
            { key: "active", label: "Active" },
            { key: "pending", label: "Pending" },
            { key: "preparing", label: "Preparing" },
            { key: "done", label: "Done" },
          ].map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setStatusFilter(f.key)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                statusFilter === f.key
                  ? "bg-violet-600 text-white shadow"
                  : "bg-white text-slate-600 border border-slate-200 hover:border-violet-300 hover:text-violet-700"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Analytics and date filters */}
      <section className="space-y-3 rounded-2xl border border-violet-100 bg-violet-50/40 p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-violet-600">Store insights</p>
            <h3 className="mt-1 text-lg font-bold text-slate-900">{dateRange.label}</h3>
            <p className="mt-0.5 text-xs text-slate-500">
              Showing {formatCount(periodOrders.length, "order")} from the latest {orders.length} loaded.
            </p>
          </div>
          <div className="flex flex-wrap gap-1">
            {DATE_PRESETS.map((preset) => (
              <button
                key={preset.key}
                type="button"
                onClick={() => setDatePreset(preset.key)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                  datePreset === preset.key
                    ? "bg-violet-600 text-white shadow"
                    : "border border-violet-100 bg-white text-slate-600 hover:border-violet-300 hover:text-violet-700"
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          <label className="text-xs font-semibold text-slate-500">
            From
            <input
              type="date"
              value={customStart}
              onChange={(event) => {
                setCustomStart(event.target.value);
                setDatePreset("custom");
              }}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
            />
          </label>
          <label className="text-xs font-semibold text-slate-500">
            To
            <input
              type="date"
              value={customEnd}
              onChange={(event) => {
                setCustomEnd(event.target.value);
                setDatePreset("custom");
              }}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
            />
          </label>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Total sales</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{formatMoney(analytics.totalSales)}</p>
            <p className="mt-1 text-xs text-slate-500">
              {formatCount(analytics.revenueOrders, "paid/non-cancelled order")} · AOV{" "}
              {formatMoney(analytics.averageOrderValue)}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Orders</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{analytics.totalOrders}</p>
            <p className="mt-1 text-xs text-slate-500">
              {analytics.deliveredOrders} delivered · {analytics.activeOrders} active ·{" "}
              {formatPercent(analytics.cancellationRate)} cancelled
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Best customer</p>
            {analytics.bestCustomer ? (
              <>
                <p className="mt-2 truncate text-lg font-bold text-slate-900">{analytics.bestCustomer.name}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {formatCount(analytics.bestCustomer.orders, "order")} ·{" "}
                  {formatMoney(analytics.bestCustomer.total)} total · Last {formatDate(analytics.bestCustomer.lastOrderAt)}
                </p>
                {analytics.bestCustomer.phone ? (
                  <a
                    href={`tel:${analytics.bestCustomer.phone}`}
                    className="mt-2 inline-flex text-xs font-semibold text-violet-600 hover:underline"
                  >
                    {analytics.bestCustomer.phone}
                  </a>
                ) : null}
              </>
            ) : (
              <p className="mt-2 text-sm text-slate-400">No customer data in this period.</p>
            )}
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Most ordered item</p>
            {analytics.topItem ? (
              <>
                <p className="mt-2 truncate text-lg font-bold text-slate-900">{analytics.topItem.name}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {analytics.topItem.qty.toLocaleString("en-US")} sold ·{" "}
                  {formatMoney(analytics.topItem.revenue)} item revenue
                </p>
              </>
            ) : (
              <p className="mt-2 text-sm text-slate-400">No item data in this period.</p>
            )}
          </div>
        </div>

        <div className="grid gap-3 lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Customer signals</p>
            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="font-bold text-slate-900">{analytics.repeatCustomers}</p>
                <p className="text-xs text-slate-500">repeat customers</p>
              </div>
              <div>
                <p className="font-bold text-slate-900">{analytics.recentCustomers}</p>
                <p className="text-xs text-slate-500">ordered in last 30 days</p>
              </div>
              <div>
                <p className="font-bold text-slate-900">{analytics.loggedInOrders}</p>
                <p className="text-xs text-slate-500">logged-in orders</p>
              </div>
              <div>
                <p className="font-bold text-slate-900">{analytics.guestOrders}</p>
                <p className="text-xs text-slate-500">guest orders</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Operations</p>
            <div className="mt-3 space-y-2 text-sm text-slate-600">
              <p>
                <span className="font-bold text-slate-900">{analytics.pendingOrders}</span> pending ·{" "}
                <span className="font-bold text-slate-900">{analytics.preparingOrders}</span> preparing
              </p>
              <p>
                <span className="font-bold text-slate-900">{analytics.fastDeliveryOrders}</span> fast delivery ·{" "}
                <span className="font-bold text-slate-900">{analytics.scheduledOrders}</span> scheduled
              </p>
              <p>
                Delivery fees <span className="font-bold text-slate-900">{formatMoney(analytics.deliveryFees)}</span> ·
                coupons <span className="font-bold text-slate-900">{formatMoney(analytics.couponDiscounts)}</span>
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Busy windows</p>
            <div className="mt-3 space-y-2 text-sm text-slate-600">
              <p>
                Top day: <span className="font-bold text-slate-900">{analytics.busiestDay}</span>
              </p>
              <p>
                Top hour: <span className="font-bold text-slate-900">{analytics.busiestHour}</span>
              </p>
              <p className="text-xs text-slate-400">Use this to schedule staff, prep ingredients, and plan promos.</p>
            </div>
          </div>
        </div>

        <div className="grid gap-3 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Top customers</p>
            {analytics.topCustomers.length ? (
              <div className="mt-3 space-y-2">
                {analytics.topCustomers.map((customer, index) => (
                  <div key={customer.key} className="flex items-center justify-between gap-3 text-sm">
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-slate-900">
                        {index + 1}. {customer.name}
                      </p>
                      <p className="truncate text-xs text-slate-500">
                        {customer.phone ?? "No phone"} · avg {formatMoney(customer.average)}
                      </p>
                    </div>
                    <p className="shrink-0 text-right text-xs font-bold text-violet-700">
                      {formatCount(customer.orders, "order")}
                      <br />
                      {formatMoney(customer.total)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-sm text-slate-400">No customers to rank yet.</p>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Top items</p>
            {analytics.topItems.length ? (
              <div className="mt-3 space-y-2">
                {analytics.topItems.map((item, index) => (
                  <div key={`${item.name}-${index}`} className="flex items-center justify-between gap-3 text-sm">
                    <p className="min-w-0 truncate font-semibold text-slate-900">
                      {index + 1}. {item.name}
                    </p>
                    <p className="shrink-0 text-right text-xs font-bold text-violet-700">
                      {item.qty.toLocaleString("en-US")} sold
                      <br />
                      {formatMoney(item.revenue)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-sm text-slate-400">No items to rank yet.</p>
            )}
          </div>
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-[340px_1fr]">
        {/* Order list */}
        <div className="flex flex-col gap-2 overflow-y-auto lg:max-h-[75vh]">
          {filteredOrders.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 py-12 text-center">
              <p className="text-sm text-slate-400">No orders match this period and status.</p>
            </div>
          ) : (
            filteredOrders.map((order) => {
              const meta = STATUS_META[order.status] ?? STATUS_META.pending;
              const isNew = newOrderIds.has(order.id);
              return (
                <button
                  key={order.id}
                  type="button"
                  onClick={() => selectOrder(order)}
                  className={`w-full rounded-2xl border p-4 text-left transition ${
                    selectedId === order.id
                      ? "border-violet-400 bg-violet-50 shadow-sm"
                      : isNew
                        ? "border-amber-300 bg-amber-50 shadow-sm"
                        : "border-slate-200 bg-white hover:border-violet-200 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-slate-900">
                        {order.customer_name}
                        {isNew ? (
                          <span className="ml-2 rounded-full bg-amber-400 px-1.5 py-0.5 text-[10px] font-bold text-white">
                            NEW
                          </span>
                        ) : null}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-slate-500">
                        #{shortId(order.id)} · {formatDate(order.created_at)} {formatTime(order.created_at)}
                      </p>
                      {order.delivery_speed === "fast" || order.expected_delivery_time ? (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {order.delivery_speed === "fast" ? (
                            <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-800">
                              FAST
                            </span>
                          ) : null}
                          {order.expected_delivery_time ? (
                            <span className="rounded-full bg-violet-100 px-1.5 py-0.5 text-[10px] font-bold text-violet-700">
                              ETA {order.expected_delivery_time}
                            </span>
                          ) : null}
                        </div>
                      ) : null}
                    </div>
                    <div className="shrink-0 text-right">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${meta.bg} ${meta.border} ${meta.color}`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
                        {meta.label}
                      </span>
                      <p className="mt-1 text-sm font-bold text-slate-900">${order.total_usd.toFixed(2)}</p>
                    </div>
                  </div>
                  <p className="mt-1.5 line-clamp-1 text-xs text-slate-400">
                    {(order.items as unknown as Array<{ name: string; qty: number; unit: string }>)
                      .map((i) => `${i.unit === "kg" ? `${i.qty}kg` : `${i.qty}×`} ${i.name}`)
                      .join(", ")}
                  </p>
                </button>
              );
            })
          )}
        </div>

        {/* Order detail */}
        {selected ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold uppercase tracking-widest text-violet-600">Order Details</p>
                <h3 className="mt-1 text-2xl font-bold text-slate-900">#{shortId(selected.id)}</h3>
                <p className="text-xs text-slate-400">
                  {formatDate(selected.created_at)} at {formatTime(selected.created_at)}
                </p>
              </div>
              <div className="flex w-full shrink-0 items-center justify-between gap-2 sm:w-auto sm:justify-end">
                {(() => {
                  const meta = STATUS_META[selected.status] ?? STATUS_META.pending;
                  return (
                    <span
                      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-bold ${meta.bg} ${meta.border} ${meta.color}`}
                    >
                      <span className={`h-2 w-2 rounded-full ${meta.dot}`} />
                      {meta.label}
                    </span>
                  );
                })()}
                <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={() => openEditOrder(selected)}
                  className={EDIT_ICON_BUTTON_CLASS}
                  title="Edit order"
                  aria-label="Edit order"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  disabled={orderActionKey === `${selected.id}:delete`}
                  onClick={() => setDeleteConfirmOrderId(selected.id)}
                  className={DELETE_ICON_BUTTON_CLASS}
                  title="Delete order"
                  aria-label="Delete order"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                {selectedWhatsAppUrl ? (
                  <a
                    href={selectedWhatsAppUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={WHATSAPP_ICON_BUTTON_CLASS}
                    title="WhatsApp customer"
                    aria-label="WhatsApp customer"
                  >
                    <WhatsAppIcon className="h-4 w-4" />
                  </a>
                ) : (
                  <button
                    type="button"
                    disabled
                    title="No customer phone on this order"
                    aria-label="WhatsApp unavailable"
                    className={WHATSAPP_ICON_BUTTON_CLASS}
                  >
                    <WhatsAppIcon className="h-4 w-4 opacity-50" />
                  </button>
                )}
                </div>
              </div>
            </div>

            {/* Customer */}
            <div className="mb-5 rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Customer</p>
              <p className="mt-1 text-base font-semibold text-slate-900">{selected.customer_name}</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {selected.customer_phone ? (
                  <a
                    href={`tel:${selected.customer_phone}`}
                    className="text-sm text-violet-600 hover:underline"
                  >
                    {selected.customer_phone}
                  </a>
                ) : (
                  <p className="text-sm text-slate-400">No phone on file for this order.</p>
                )}
              </div>
            </div>

            {driverManagementEnabled ? (
              <div className="mb-5 rounded-xl border border-emerald-100 bg-emerald-50/60 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">Assigned driver</p>
                <div className="mt-3">
                  <div className="relative">
                    <select
                      value={selected.driver_id ?? ""}
                      disabled={
                        orderActionKey === `${selected.id}:driver` ||
                        ["delivered", "cancelled"].includes(selected.status)
                      }
                      onChange={(event) => {
                        const value = event.target.value;
                        void handleAssignDriver(selected, value || null);
                      }}
                      className="h-10 w-full min-w-0 appearance-none rounded-xl border border-emerald-200 bg-white px-3 pr-9 text-sm font-medium text-slate-800 shadow-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-60"
                    >
                      <option value="">Unassigned</option>
                      {activeDrivers.map((driver) => (
                        <option key={driver.id} value={driver.id}>
                          {driver.full_name}
                          {driver.phone ? ` · ${driver.phone}` : ""}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-600/70"
                      aria-hidden
                    />
                  </div>
                  {selected.driver_assigned_at ? (
                    <p className="mt-2 text-xs font-medium text-emerald-800">
                      Assigned {formatDate(selected.driver_assigned_at)} ·{" "}
                      {formatTime(selected.driver_assigned_at)}
                    </p>
                  ) : null}
                </div>
                {activeDrivers.length === 0 ? (
                  <p className="mt-2 text-xs text-emerald-800">
                    Add an active driver from the Drivers page to assign deliveries.
                  </p>
                ) : null}
              </div>
            ) : null}

            {/* Delivery */}
            {selected.delivery_speed === "fast" ? (
              <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-amber-700">Fast delivery</p>
                <p className="mt-1 text-sm text-amber-900">
                  Customer requested priority delivery with a dedicated driver.
                  {selected.delivery_fee_usd > 0
                    ? ` Delivery fee: $${selected.delivery_fee_usd.toFixed(2)}.`
                    : ""}
                </p>
              </div>
            ) : null}

            {selected.delivery_address || selected.delivery_lat ? (
              <div className="mb-5 rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Delivery Address</p>
                {selected.delivery_address ? (
                  <p className="mt-1 text-sm text-slate-800">{selected.delivery_address}</p>
                ) : null}
                {mapsLink(selected.delivery_lat, selected.delivery_lng) ? (
                  <a
                    href={mapsLink(selected.delivery_lat, selected.delivery_lng)!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-flex items-center gap-1.5 text-xs font-semibold text-violet-600 hover:underline"
                  >
                    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    Open in Google Maps
                  </a>
                ) : null}
              </div>
            ) : null}

            <div className="mb-5 overflow-hidden rounded-2xl border border-violet-100 bg-white shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-violet-100 bg-gradient-to-r from-violet-50 to-white p-4">
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-wide text-violet-600">Delivery promise</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-violet-600 px-3 py-1 text-sm font-bold text-white">
                      {selected.expected_delivery_time || defaultDeliveryTimeLabel || "No ETA set"}
                    </span>
                    {selected.status === "out_for_delivery" ? (
                      <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-700">
                        Can update now
                      </span>
                    ) : null}
                    {selectedOrderIsClosed ? (
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-500">
                        Locked
                      </span>
                    ) : null}
                  </div>
                </div>
                {selected.expected_delivery_time_set_at ? (
                  <p className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-slate-400">
                    Updated {formatDate(selected.expected_delivery_time_set_at)} ·{" "}
                    {formatTime(selected.expected_delivery_time_set_at)}
                  </p>
                ) : defaultDeliveryTimeLabel ? (
                  <p className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-slate-400">
                    Default from settings
                  </p>
                ) : null}
              </div>

              <div className="space-y-3 p-4">
                {!selectedOrderIsClosed ? (
                  <>
                    <div className="flex flex-wrap gap-1.5">
                      {ETA_QUICK_CHOICES.map((choice) => (
                        <button
                          key={choice}
                          type="button"
                          onClick={() => setDeliveryEtaText(choice)}
                          className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                            deliveryEtaText.trim() === choice
                              ? "bg-violet-600 text-white"
                              : "border border-slate-200 bg-slate-50 text-slate-600 hover:border-violet-200 hover:text-violet-700"
                          }`}
                        >
                          {choice}
                        </button>
                      ))}
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row">
                      <label className="min-w-0 flex-1">
                        <span className="sr-only">Expected delivery time</span>
                        <input
                          type="text"
                          value={deliveryEtaText}
                          onChange={(event) => setDeliveryEtaText(event.target.value)}
                          placeholder="e.g. 30-40 min or 7:30 PM"
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-semibold text-slate-800 outline-none transition placeholder:font-normal focus:border-violet-400 focus:bg-white focus:ring-2 focus:ring-violet-100"
                        />
                      </label>
                      <button
                        type="button"
                        disabled={orderActionKey === `${selected.id}:eta`}
                        onClick={() => void handleSaveDeliveryEta(selected)}
                        className="rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm shadow-violet-400/30 transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {deliveryEtaButtonLabel(selected)}
                      </button>
                    </div>
                  </>
                ) : null}

                <p className="text-xs font-medium text-slate-500">{deliveryEtaHelpText(selected)}</p>
              </div>
            </div>

            {/* Items */}
            <div className="mb-5">
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">Items</p>
              <div className="space-y-2">
                {(selected.items as unknown as Array<{
                  name: string;
                  qty: number;
                  unit: string;
                  unitPrice: number;
                  removedIngredients?: string[];
                  addedIngredients?: Array<{ name: string; qty: number }>;
                  specialInstructions?: string;
                  selectedOption?: string | null;
                  optionLabel?: string | null;
                }>).map((item, idx) => (
                  <div key={idx} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold text-slate-800">
                        {item.unit === "kg" ? `${item.qty} kg` : `${item.qty}×`} {item.name}
                      </p>
                      <p className="shrink-0 text-sm font-bold text-violet-700">
                        ${(item.qty * item.unitPrice).toFixed(2)}
                      </p>
                    </div>
                    {item.removedIngredients?.length ? (
                      <p className="mt-0.5 text-xs text-red-500">Remove: {item.removedIngredients.join(", ")}</p>
                    ) : null}
                    {item.addedIngredients?.length ? (
                      <p className="mt-0.5 text-xs text-emerald-600">
                        Add: {item.addedIngredients.map((a) => `${a.name} ×${a.qty}`).join(", ")}
                      </p>
                    ) : null}
                    {item.selectedOption ? (
                      <p className="mt-0.5 text-xs text-violet-600">
                        {item.optionLabel?.trim() || "Option"}: {item.selectedOption}
                      </p>
                    ) : null}
                    {item.specialInstructions ? (
                      <p className="mt-0.5 text-xs text-slate-400">Note: {item.specialInstructions}</p>
                    ) : null}
                  </div>
                ))}
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
                <p className="text-sm font-bold text-slate-900">Total</p>
                <p className="text-lg font-bold text-violet-700">${selected.total_usd.toFixed(2)}</p>
              </div>
            </div>

            {selected.payment_note ? (
              <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 p-3">
                <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">Cash payment</p>
                <p className="mt-1 text-sm font-semibold text-emerald-900">{selected.payment_note}</p>
              </div>
            ) : null}

            {/* Notes */}
            {selected.notes ? (
              <div className="mb-5 rounded-xl border border-amber-100 bg-amber-50 p-3">
                <p className="text-xs font-bold uppercase tracking-wide text-amber-600">Customer Note</p>
                <p className="mt-1 text-sm text-amber-800">{selected.notes}</p>
              </div>
            ) : null}

            {orderActionError ? (
              <p className="mb-5 rounded-xl bg-red-50 px-3 py-2 text-xs font-medium text-red-600">
                {orderActionError}
              </p>
            ) : null}

            {editingOrderId === selected.id ? (
              <div className="mb-5 rounded-2xl border border-violet-100 bg-violet-50/50 p-4">
                <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-violet-600">Edit order</p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      Use this when a customer changes the order by phone or the store needs to correct details.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditingOrderId(null)}
                    className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-500 transition hover:text-slate-800"
                  >
                    Close
                  </button>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="text-xs font-semibold text-slate-500">
                    Customer name
                    <input
                      type="text"
                      value={editForm.customerName}
                      onChange={(event) =>
                        setEditForm((prev) => ({ ...prev, customerName: event.target.value }))
                      }
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                    />
                  </label>
                  <label className="text-xs font-semibold text-slate-500">
                    Phone
                    <input
                      type="tel"
                      value={editForm.customerPhone}
                      onChange={(event) =>
                        setEditForm((prev) => ({ ...prev, customerPhone: event.target.value }))
                      }
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                    />
                  </label>
                </div>

                <label className="mt-3 block text-xs font-semibold text-slate-500">
                  Delivery address
                  <textarea
                    value={editForm.deliveryAddress}
                    onChange={(event) =>
                      setEditForm((prev) => ({ ...prev, deliveryAddress: event.target.value }))
                    }
                    rows={2}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                  />
                </label>

                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <label className="text-xs font-semibold text-slate-500">
                    Customer/order note
                    <textarea
                      value={editForm.notes}
                      onChange={(event) => setEditForm((prev) => ({ ...prev, notes: event.target.value }))}
                      rows={3}
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                    />
                  </label>
                  <label className="text-xs font-semibold text-slate-500">
                    Payment note
                    <textarea
                      value={editForm.paymentNote}
                      onChange={(event) =>
                        setEditForm((prev) => ({ ...prev, paymentNote: event.target.value }))
                      }
                      rows={3}
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                    />
                  </label>
                </div>

                <div className="mt-3 rounded-2xl border border-violet-100 bg-white p-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide text-violet-600">Add from menu</p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        Pick real menu items for changes like extra sauce, drinks, or add-ons.
                      </p>
                    </div>
                    <span className="rounded-full bg-violet-50 px-2.5 py-1 text-xs font-bold text-violet-700">
                      {formatCount(menuPickerItems.length, "item")}
                    </span>
                  </div>

                  <div className="mt-3 grid gap-2 lg:grid-cols-[1fr_120px_auto]">
                    <label className="text-xs font-semibold text-slate-500">
                      Search menu
                      <input
                        type="text"
                        value={editForm.menuSearch}
                        onChange={(event) =>
                          setEditForm((prev) => ({
                            ...prev,
                            menuSearch: event.target.value,
                            selectedMenuItemId: "",
                          }))
                        }
                        placeholder="Search item name..."
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-violet-400 focus:bg-white focus:ring-2 focus:ring-violet-100"
                      />
                    </label>
                    <label className="text-xs font-semibold text-slate-500">
                      Qty
                      <input
                        type="number"
                        min="0.001"
                        step={selectedMenuPickerItem?.unit === "kg" ? "0.001" : "1"}
                        value={editForm.menuItemQty}
                        onChange={(event) =>
                          setEditForm((prev) => ({ ...prev, menuItemQty: event.target.value }))
                        }
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-violet-400 focus:bg-white focus:ring-2 focus:ring-violet-100"
                      />
                    </label>
                    <button
                      type="button"
                      disabled={!selectedMenuPickerItem}
                      onClick={addSelectedMenuItemToEdit}
                      className="self-end rounded-xl bg-violet-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Add item
                    </button>
                  </div>

                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    {filteredMenuPickerItems.length ? (
                      filteredMenuPickerItems.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() =>
                            setEditForm((prev) => ({
                              ...prev,
                              selectedMenuItemId: item.id,
                              menuSearch: item.name,
                            }))
                          }
                          className={`rounded-xl border p-3 text-left transition ${
                            selectedMenuPickerItem?.id === item.id
                              ? "border-violet-300 bg-violet-50"
                              : "border-slate-200 bg-slate-50 hover:border-violet-200 hover:bg-white"
                          }`}
                        >
                          <p className="truncate text-sm font-bold text-slate-900">{item.name}</p>
                          <p className="mt-0.5 text-xs text-slate-500">
                            {item.categoryName} · {formatMoney(item.unitPrice)}
                            {item.unit === "kg" ? " / kg" : ""}
                          </p>
                        </button>
                      ))
                    ) : (
                      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-400 sm:col-span-2">
                        No available menu items match this search.
                      </div>
                    )}
                  </div>

                  {editMenuAdditions.length ? (
                    <div className="mt-3 space-y-2 border-t border-slate-100 pt-3">
                      {editMenuAdditions.map((addition, index) => (
                        <div
                          key={`${addition.id}-${index}`}
                          className="flex items-center justify-between gap-3 rounded-xl bg-violet-50 px-3 py-2 text-sm"
                        >
                          <div className="min-w-0">
                            <p className="truncate font-bold text-slate-900">
                              {addition.unit === "kg" ? `${addition.qty} kg` : `${addition.qty}×`} {addition.name}
                            </p>
                            <p className="text-xs text-slate-500">
                              {formatMoney(addition.qty * addition.unitPrice)}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeEditMenuAddition(index)}
                            className="shrink-0 rounded-full border border-violet-200 bg-white px-2.5 py-1 text-xs font-bold text-violet-700 transition hover:bg-violet-100"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>

                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                  <label className="text-xs font-semibold text-slate-500">
                    Current order total
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={editForm.totalUsd}
                      onChange={(event) =>
                        setEditForm((prev) => ({ ...prev, totalUsd: event.target.value }))
                      }
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                    />
                  </label>
                  <label className="text-xs font-semibold text-slate-500">
                    Extra charge
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={editForm.manualAdjustmentUsd}
                      onChange={(event) =>
                        setEditForm((prev) => ({ ...prev, manualAdjustmentUsd: event.target.value }))
                      }
                      placeholder="0.00"
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                    />
                  </label>
                  <label className="text-xs font-semibold text-slate-500">
                    Extra charge reason
                    <input
                      type="text"
                      value={editForm.manualAdjustmentLabel}
                      onChange={(event) =>
                        setEditForm((prev) => ({ ...prev, manualAdjustmentLabel: event.target.value }))
                      }
                      placeholder="Extra sauce"
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                    />
                  </label>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-violet-100 pt-3">
                  <p className="text-sm text-slate-600">
                    New total:{" "}
                    <span className="font-bold text-violet-700">
                      {editOrderPreviewTotal() == null ? "Invalid total" : formatMoney(editOrderPreviewTotal()!)}
                    </span>
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingOrderId(null)}
                      className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={orderActionKey === `${selected.id}:edit`}
                      onClick={() => void handleSaveOrderUpdate(selected)}
                      className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-violet-400/30 transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {orderActionKey === `${selected.id}:edit` ? "Saving..." : "Save updates"}
                    </button>
                  </div>
                </div>
              </div>
            ) : null}

            {/* Actions */}
            {STATUS_TRANSITIONS[selected.status]?.length ? (
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">Update Status</p>
                {updateError ? (
                  <p className="mb-2 rounded-xl bg-red-50 px-3 py-2 text-xs font-medium text-red-600">{updateError}</p>
                ) : null}
                <div className="flex flex-wrap gap-2">
                  {STATUS_TRANSITIONS[selected.status].map((nextStatus) => {
                    const key = `${selected.id}:${nextStatus}`;
                    const isThisUpdating = updatingKey === key;
                    const anyUpdating = updatingKey !== null;
                    return (
                      <button
                        key={nextStatus}
                        type="button"
                        disabled={anyUpdating}
                        onClick={() => void handleStatusUpdate(selected, nextStatus)}
                        className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                          nextStatus === "cancelled"
                            ? "border border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
                            : "bg-violet-600 text-white shadow-sm shadow-violet-400/30 hover:bg-violet-700 active:scale-[0.98]"
                        }`}
                      >
                        {isThisUpdating ? (
                          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} aria-hidden>
                            <circle cx="12" cy="12" r="10" strokeOpacity={0.25} />
                            <path d="M12 2a10 10 0 0 1 10 10" />
                          </svg>
                        ) : null}
                        {STATUS_TRANSITION_LABELS[nextStatus] ?? nextStatus}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="flex items-center justify-center rounded-2xl border border-dashed border-slate-200 py-16">
            <p className="text-sm text-slate-400">Select an order to view details</p>
          </div>
        )}
      </div>

      {deleteConfirmOrder ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900">Delete this order?</h3>
            <p className="mt-2 text-sm text-slate-500">
              Order #{shortId(deleteConfirmOrder.id)} for {deleteConfirmOrder.customer_name} will be
              removed from your orders list. This cannot be undone.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                disabled={orderActionKey === `${deleteConfirmOrder.id}:delete`}
                onClick={() => setDeleteConfirmOrderId(null)}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={orderActionKey === `${deleteConfirmOrder.id}:delete`}
                onClick={() => void handleDeleteOrder(deleteConfirmOrder)}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
              >
                {orderActionKey === `${deleteConfirmOrder.id}:delete` ? "Deleting…" : "Delete order"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
