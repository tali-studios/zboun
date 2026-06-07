import type { OrderNotificationItem } from "@/lib/order-notifications";
import type { CategoryWithItems } from "@/lib/data";
import type { DeliverySpeed } from "@/app-actions/orders";

export type ReorderCartLine = {
  key: string;
  itemId: string;
  name: string;
  imageUrl: string | null;
  qty: number;
  unit: "each" | "kg";
  unitPrice: number;
  removedIngredients: string[];
  addedIngredients: Array<{ name: string; price: number; qty: number }>;
  specialInstructions: string;
};

export type MenuReorderPayload = {
  items: OrderNotificationItem[];
  customerName?: string;
  deliveryAddress?: string | null;
  deliverySpeed?: DeliverySpeed;
  deliveryNotes?: string | null;
  paymentNote?: string | null;
};

export function splitOrderNotes(notes: string | null | undefined): {
  deliveryNotes: string | null;
} {
  if (!notes?.trim()) return { deliveryNotes: null };
  const deliveryNotes = notes
    .split("\n")
    .filter((line) => !line.trim().startsWith("Scheduled delivery:"))
    .join("\n")
    .trim();
  return { deliveryNotes: deliveryNotes || null };
}

function findMenuItemByName(categories: CategoryWithItems[], name: string) {
  const normalized = name.trim().toLowerCase();
  return categories
    .flatMap((category) => category.menu_items)
    .find((item) => item.name.trim().toLowerCase() === normalized);
}

function buildLineKey(
  itemId: string,
  removed: string[],
  added: Array<{ name: string; qty: number }>,
  note: string,
) {
  return [
    itemId,
    [...removed].sort().join("|"),
    added
      .map((entry) => `${entry.name}:${entry.qty}`)
      .sort()
      .join("|"),
    note.trim(),
  ].join("::");
}

export function buildCartFromReorder(
  items: OrderNotificationItem[],
  categories: CategoryWithItems[],
): Record<string, ReorderCartLine> {
  const cart: Record<string, ReorderCartLine> = {};

  for (const item of items) {
    const menuItem = findMenuItemByName(categories, item.name);
    const itemId = menuItem?.id ?? `reorder-${item.name.trim().toLowerCase().replace(/\s+/g, "-")}`;
    const removed = item.removedIngredients ?? [];
    const added = (item.addedIngredients ?? []).map((entry) => ({
      name: entry.name,
      price: Number(entry.price ?? 0),
      qty: Number(entry.qty ?? 0),
    }));
    const note = item.specialInstructions?.trim() ?? "";
    const key = buildLineKey(itemId, removed, added, note);
    const soldByWeight = Boolean((menuItem as { sold_by_weight?: boolean } | undefined)?.sold_by_weight);
    const unit: "each" | "kg" = item.unit === "kg" || soldByWeight ? "kg" : "each";

    cart[key] = {
      key,
      itemId,
      name: item.name,
      imageUrl: menuItem?.image_url ?? null,
      qty: Number(item.qty) || 1,
      unit,
      unitPrice: Number(item.unitPrice) || 0,
      removedIngredients: [...removed],
      addedIngredients: added,
      specialInstructions: note,
    };
  }

  return cart;
}

export function orderToReorderPayload(order: {
  items: OrderNotificationItem[];
  customer_name: string;
  delivery_address: string | null;
  delivery_speed?: DeliverySpeed | null;
  notes: string | null;
  payment_note?: string | null;
}): MenuReorderPayload {
  const { deliveryNotes } = splitOrderNotes(order.notes);
  return {
    items: order.items,
    customerName: order.customer_name,
    deliveryAddress: order.delivery_address,
    deliverySpeed: order.delivery_speed === "fast" ? "fast" : "standard",
    deliveryNotes,
    paymentNote: order.payment_note?.trim() || null,
  };
}
