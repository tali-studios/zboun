import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";
import { sendMail, isSmtpConfigured } from "@/lib/mail";
import {
  getMenuItemStockAlertLevel,
  resolveStockAlertThresholds,
  STOCK_ALERT_LEVEL_LABELS,
  type MenuItemStockFields,
  type StockAlertLevel,
} from "@/lib/menu-item-stock";

export type MenuItemStockAlertRow = MenuItemStockFields & {
  id: string;
  name: string;
  restaurant_id: string;
  stock_alert_warning_sent_at?: string | null;
  stock_alert_urgent_sent_at?: string | null;
  stock_alert_critical_sent_at?: string | null;
  stock_alert_out_sent_at?: string | null;
};

type NotifyLevel = "warning" | "urgent" | "critical" | "out";

const LEVEL_RANK: Record<NotifyLevel, number> = {
  warning: 1,
  urgent: 2,
  critical: 3,
  out: 4,
};

function getServiceClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!env.supabaseUrl || !key) return null;
  return createClient(env.supabaseUrl, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

async function getRestaurantAdminEmail(
  client: SupabaseClient,
  restaurantId: string,
): Promise<string | null> {
  const serviceClient = getServiceClient();
  const lookupClient = serviceClient ?? client;
  const { data: adminUser } = await lookupClient
    .from("users")
    .select("email")
    .eq("restaurant_id", restaurantId)
    .eq("role", "restaurant_admin")
    .limit(1)
    .maybeSingle();
  return adminUser?.email?.trim() || null;
}

function levelForQuantity(qty: number, thresholds: ReturnType<typeof resolveStockAlertThresholds>): NotifyLevel | null {
  if (qty <= 0) return "out";
  if (qty <= thresholds.critical_qty) return "critical";
  if (qty <= thresholds.urgent_qty) return "urgent";
  if (qty <= thresholds.warning_qty) return "warning";
  return null;
}

function sentAtForLevel(item: MenuItemStockAlertRow, level: NotifyLevel): string | null {
  switch (level) {
    case "warning":
      return item.stock_alert_warning_sent_at ?? null;
    case "urgent":
      return item.stock_alert_urgent_sent_at ?? null;
    case "critical":
      return item.stock_alert_critical_sent_at ?? null;
    case "out":
      return item.stock_alert_out_sent_at ?? null;
    default:
      return null;
  }
}

function buildFlagResets(qty: number, thresholds: ReturnType<typeof resolveStockAlertThresholds>) {
  return {
    stock_alert_warning_sent_at: qty > thresholds.warning_qty ? null : undefined,
    stock_alert_urgent_sent_at: qty > thresholds.urgent_qty ? null : undefined,
    stock_alert_critical_sent_at: qty > thresholds.critical_qty ? null : undefined,
    stock_alert_out_sent_at: qty > 0 ? null : undefined,
  };
}

function pickNotifyLevel(item: MenuItemStockAlertRow, qty: number): NotifyLevel | null {
  const thresholds = resolveStockAlertThresholds(item);
  const currentLevel = levelForQuantity(qty, thresholds);
  if (!currentLevel) return null;

  const levels: NotifyLevel[] = ["warning", "urgent", "critical", "out"];
  const applicable = levels.filter((level) => LEVEL_RANK[level] <= LEVEL_RANK[currentLevel]);
  for (let i = applicable.length - 1; i >= 0; i -= 1) {
    const level = applicable[i];
    if (!sentAtForLevel(item, level)) return level;
  }
  return null;
}

function buildStockAlertEmail(params: {
  restaurantName: string;
  itemName: string;
  quantity: number;
  level: NotifyLevel;
  thresholds: ReturnType<typeof resolveStockAlertThresholds>;
  dashboardUrl: string;
}) {
  const levelLabel =
    params.level === "out"
      ? "Out of stock"
      : params.level === "critical"
        ? "Very urgent"
        : params.level === "urgent"
          ? "Urgent"
          : "Warning";

  const subjectPrefix =
    params.level === "out"
      ? "🛑 Out of stock"
      : params.level === "critical"
        ? "🔴 Very urgent stock"
        : params.level === "urgent"
          ? "🟠 Urgent stock"
          : "🟡 Low stock";

  const subject = `${subjectPrefix}: ${params.itemName} — ${params.restaurantName}`;
  const thresholdHint =
    params.level === "out"
      ? "Customers can no longer order this item until you restock."
      : params.level === "critical"
        ? `Very urgent threshold: ${params.thresholds.critical_qty} or fewer`
        : params.level === "urgent"
          ? `Urgent threshold: ${params.thresholds.urgent_qty} or fewer`
          : `Warning threshold: ${params.thresholds.warning_qty} or fewer`;

  const text = [
    `${levelLabel} — ${params.restaurantName}`,
    "",
    `Item: ${params.itemName}`,
    `Quantity remaining: ${params.quantity}`,
    thresholdHint,
    "",
    `Manage stock: ${params.dashboardUrl}`,
    "",
    "— Zboun",
  ].join("\n");

  const badgeColor =
    params.level === "out"
      ? "#dc2626"
      : params.level === "critical"
        ? "#b91c1c"
        : params.level === "urgent"
          ? "#ea580c"
          : "#ca8a04";

  const html = `<!DOCTYPE html>
<html lang="en"><body style="margin:0;padding:24px;background:#f4f4f5;font-family:Segoe UI,Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;border:1px solid #e4e4e7;overflow:hidden;">
<tr><td style="background:${badgeColor};padding:20px 24px;color:#fff;">
<p style="margin:0;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;opacity:0.9;">${levelLabel}</p>
<h1 style="margin:8px 0 0;font-size:20px;">${params.itemName}</h1>
</td></tr>
<tr><td style="padding:24px;color:#27272a;line-height:1.6;">
<p style="margin:0 0 12px"><strong>Store:</strong> ${params.restaurantName}</p>
<p style="margin:0 0 12px"><strong>Remaining:</strong> ${params.quantity}</p>
<p style="margin:0 0 20px;color:#52525b;">${thresholdHint}</p>
<a href="${params.dashboardUrl}" style="display:inline-block;background:#4c1d95;color:#fff;text-decoration:none;padding:12px 18px;border-radius:10px;font-weight:600;">Update stock</a>
</td></tr>
</table>
</body></html>`;

  return { subject, text, html };
}

export async function notifyMenuItemStockAlerts(
  client: SupabaseClient,
  item: MenuItemStockAlertRow,
  options?: { restaurantName?: string; adminEmail?: string | null },
): Promise<void> {
  if (!item.track_stock) return;

  const qty = Math.max(0, Math.floor(Number(item.stock_quantity ?? 0)));
  const thresholds = resolveStockAlertThresholds(item);
  const flagResets = buildFlagResets(qty, thresholds);
  const notifyLevel = pickNotifyLevel(item, qty);
  const now = new Date().toISOString();

  const flagUpdate: Record<string, string | null> = {};
  if (flagResets.stock_alert_warning_sent_at === null) flagUpdate.stock_alert_warning_sent_at = null;
  if (flagResets.stock_alert_urgent_sent_at === null) flagUpdate.stock_alert_urgent_sent_at = null;
  if (flagResets.stock_alert_critical_sent_at === null) flagUpdate.stock_alert_critical_sent_at = null;
  if (flagResets.stock_alert_out_sent_at === null) flagUpdate.stock_alert_out_sent_at = null;

  if (notifyLevel) {
    switch (notifyLevel) {
      case "warning":
        flagUpdate.stock_alert_warning_sent_at = now;
        break;
      case "urgent":
        flagUpdate.stock_alert_urgent_sent_at = now;
        break;
      case "critical":
        flagUpdate.stock_alert_critical_sent_at = now;
        break;
      case "out":
        flagUpdate.stock_alert_out_sent_at = now;
        break;
      default:
        break;
    }
  }

  if (Object.keys(flagUpdate).length > 0) {
    const serviceClient = getServiceClient() ?? client;
    await serviceClient
      .from("menu_items")
      .update(flagUpdate)
      .eq("id", item.id)
      .eq("restaurant_id", item.restaurant_id);
  }

  if (!notifyLevel || !isSmtpConfigured()) return;

  const [restaurantName, adminEmail] = await Promise.all([
    options?.restaurantName
      ? Promise.resolve(options.restaurantName)
      : client
          .from("restaurants")
          .select("name")
          .eq("id", item.restaurant_id)
          .maybeSingle()
          .then((res) => res.data?.name ?? "Your store"),
    options?.adminEmail !== undefined
      ? Promise.resolve(options.adminEmail)
      : getRestaurantAdminEmail(client, item.restaurant_id),
  ]);

  if (!adminEmail) return;

  const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "https://zboun.net").replace(/\/$/, "");
  const email = buildStockAlertEmail({
    restaurantName,
    itemName: item.name,
    quantity: qty,
    level: notifyLevel,
    thresholds,
    dashboardUrl: `${appUrl}/dashboard/business`,
  });

  try {
    await sendMail({
      to: adminEmail,
      subject: email.subject,
      text: email.text,
      html: email.html,
    });
  } catch (error) {
    console.error("[notifyMenuItemStockAlerts] email failed", item.id, error);
  }
}

export async function decrementMenuItemStockForOrder(
  client: SupabaseClient,
  restaurantId: string,
  lines: Array<{ menuItemId?: string | null; qty: number; unit: "each" | "kg" }>,
): Promise<void> {
  const serviceClient = getServiceClient() ?? client;
  const decrements = new Map<string, number>();

  for (const line of lines) {
    if (!line.menuItemId || line.unit !== "each") continue;
    const qty = Math.max(0, Math.floor(line.qty));
    if (qty <= 0) continue;
    decrements.set(line.menuItemId, (decrements.get(line.menuItemId) ?? 0) + qty);
  }

  if (decrements.size === 0) return;

  const { data: restaurant } = await serviceClient
    .from("restaurants")
    .select("name")
    .eq("id", restaurantId)
    .maybeSingle();
  const adminEmail = await getRestaurantAdminEmail(serviceClient, restaurantId);

  for (const [itemId, decrementBy] of decrements) {
    const { data: item } = await serviceClient
      .from("menu_items")
      .select(
        "id, name, restaurant_id, track_stock, stock_quantity, is_available, stock_alert_warning_qty, stock_alert_urgent_qty, stock_alert_critical_qty, stock_alert_warning_sent_at, stock_alert_urgent_sent_at, stock_alert_critical_sent_at, stock_alert_out_sent_at",
      )
      .eq("id", itemId)
      .eq("restaurant_id", restaurantId)
      .maybeSingle();

    if (!item?.track_stock) continue;

    const currentQty = Math.max(0, Math.floor(Number(item.stock_quantity ?? 0)));
    const newQty = Math.max(0, currentQty - decrementBy);

    const { data: updated, error } = await serviceClient
      .from("menu_items")
      .update({
        stock_quantity: newQty,
        is_available: newQty > 0,
      })
      .eq("id", itemId)
      .eq("restaurant_id", restaurantId)
      .select(
        "id, name, restaurant_id, track_stock, stock_quantity, is_available, stock_alert_warning_qty, stock_alert_urgent_qty, stock_alert_critical_qty, stock_alert_warning_sent_at, stock_alert_urgent_sent_at, stock_alert_critical_sent_at, stock_alert_out_sent_at",
      )
      .maybeSingle();

    if (error || !updated) {
      console.error("[decrementMenuItemStockForOrder] update failed", itemId, error?.message);
      continue;
    }

    void notifyMenuItemStockAlerts(serviceClient, updated as MenuItemStockAlertRow, {
      restaurantName: restaurant?.name ?? "Your store",
      adminEmail,
    });
  }
}

export function stockAlertBadgeClass(level: StockAlertLevel | null): string {
  switch (level) {
    case "out":
    case "critical":
      return "bg-red-100 text-red-800";
    case "urgent":
      return "bg-orange-100 text-orange-800";
    case "warning":
      return "bg-amber-100 text-amber-800";
    default:
      return "bg-emerald-100 text-emerald-700";
  }
}

export function stockAlertBadgeLabel(item: MenuItemStockFields): string {
  const level = getMenuItemStockAlertLevel(item);
  if (!item.track_stock || item.stock_quantity == null) {
    return item.is_available ? "In stock" : "Out of stock";
  }
  if (!level || level === "ok") return `${item.stock_quantity} in stock`;
  return `${item.stock_quantity} · ${STOCK_ALERT_LEVEL_LABELS[level]}`;
}
