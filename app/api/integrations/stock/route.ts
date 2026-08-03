import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";
import { applyInboundStockUpdate } from "@/lib/stock-sync";
import { notifyMenuItemStockAlerts, type MenuItemStockAlertRow } from "@/lib/menu-item-stock-alerts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MENU_ITEM_ALERT_SELECT =
  "id, name, restaurant_id, track_stock, stock_quantity, is_available, stock_alert_warning_qty, stock_alert_urgent_qty, stock_alert_critical_qty, stock_alert_warning_sent_at, stock_alert_urgent_sent_at, stock_alert_critical_sent_at, stock_alert_out_sent_at";

function getServiceClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!env.supabaseUrl || !key) return null;
  return createClient(env.supabaseUrl, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

function extractApiKey(request: Request): string {
  const auth = request.headers.get("authorization") ?? "";
  const bearerMatch = /^Bearer\s+(.+)$/i.exec(auth);
  if (bearerMatch) return bearerMatch[1].trim();
  return request.headers.get("x-zboun-api-key")?.trim() ?? "";
}

/**
 * Stock sync inbound endpoint — a store's own website (Shopify, WooCommerce,
 * or a custom backend) calls this whenever a product's stock changes there.
 *
 *   POST /api/integrations/stock
 *   Authorization: Bearer <restaurant's inbound API key>
 *   { "sku": "COKE-330", "quantity": 12 }
 *
 * Zboun finds the menu item mapped to that SKU (set in the Stock sync
 * dashboard page) and updates its quantity + availability immediately.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Request body must be valid JSON." }, { status: 400 });
  }

  const apiKey = extractApiKey(request);
  const record = (body ?? {}) as Record<string, unknown>;
  const sku = String(record.sku ?? "").trim();
  const quantityRaw = record.quantity;
  const quantity = typeof quantityRaw === "number" ? quantityRaw : Number(quantityRaw);
  const isAvailable = typeof record.is_available === "boolean" ? record.is_available : undefined;

  const result = await applyInboundStockUpdate({ apiKey, sku, quantity, isAvailable });

  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: result.status });
  }

  // Best-effort: trigger low-stock email alerts using the same rules as the dashboard.
  try {
    const client = getServiceClient();
    if (client) {
      const { data: fullItem } = await client
        .from("menu_items")
        .select(MENU_ITEM_ALERT_SELECT)
        .eq("id", result.itemId)
        .maybeSingle();
      if (fullItem?.track_stock) {
        void notifyMenuItemStockAlerts(client, fullItem as MenuItemStockAlertRow);
      }
    }
  } catch (err) {
    console.error("[POST /api/integrations/stock] alert notification failed", err);
  }

  return NextResponse.json({
    ok: true,
    item: { id: result.itemId, name: result.itemName, quantity: result.quantity, is_available: result.isAvailable },
  });
}
