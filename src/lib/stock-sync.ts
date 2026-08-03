import crypto from "node:crypto";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

/**
 * Two-way stock sync between a store's own website (Shopify / WooCommerce /
 * custom) and Zboun. Items are matched by `menu_items.external_sku`.
 *
 *  Inbound  (their website → Zboun): they POST to /api/integrations/stock
 *           with their restaurant's inbound API key.
 *  Outbound (Zboun → their website): whenever stock changes inside Zboun
 *           (manual edit or a WhatsApp order consuming stock), we POST a
 *           signed payload to their configured webhook URL.
 *
 * This file intentionally does NOT import from menu-item-stock-alerts.ts to
 * avoid a circular dependency (that file calls pushOutboundStockUpdate).
 */

export type StockSyncPlatform = "shopify" | "woocommerce" | "custom";

export type StockSyncSettingsRow = {
  id: string;
  restaurant_id: string;
  platform: StockSyncPlatform;
  is_enabled: boolean;
  inbound_api_key: string;
  outbound_webhook_url: string | null;
  outbound_secret: string;
  last_inbound_at: string | null;
  last_outbound_at: string | null;
  created_at: string;
  updated_at: string;
};

export type StockSyncEventRow = {
  id: string;
  restaurant_id: string;
  menu_item_id: string | null;
  direction: "inbound" | "outbound";
  sku: string | null;
  quantity: number | null;
  status: "success" | "error";
  error_message: string | null;
  created_at: string;
};

export type InboundStockUpdateResult =
  | { ok: true; itemId: string; itemName: string; restaurantId: string; quantity: number; isAvailable: boolean }
  | { ok: false; status: number; error: string };

function getServiceClient(): SupabaseClient | null {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!env.supabaseUrl || !key) return null;
  return createClient(env.supabaseUrl, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export function generateApiKey(): string {
  return `zbn_live_${crypto.randomBytes(24).toString("hex")}`;
}

export function generateWebhookSecret(): string {
  return crypto.randomBytes(32).toString("hex");
}

export function signStockPayload(secret: string, rawBody: string): string {
  return crypto.createHmac("sha256", secret).update(rawBody, "utf8").digest("hex");
}

export function verifyStockSignature(
  secret: string,
  rawBody: string,
  signature: string | null | undefined,
): boolean {
  if (!signature) return false;
  const expected = signStockPayload(secret, rawBody);
  const expectedBuf = Buffer.from(expected, "utf8");
  const givenBuf = Buffer.from(signature, "utf8");
  if (expectedBuf.length !== givenBuf.length) return false;
  return crypto.timingSafeEqual(expectedBuf, givenBuf);
}

async function logStockSyncEvent(
  client: SupabaseClient,
  params: {
    restaurant_id: string;
    menu_item_id?: string | null;
    direction: "inbound" | "outbound";
    sku?: string | null;
    quantity?: number | null;
    status: "success" | "error";
    error_message?: string | null;
  },
) {
  try {
    await client.from("stock_sync_events").insert({
      restaurant_id: params.restaurant_id,
      menu_item_id: params.menu_item_id ?? null,
      direction: params.direction,
      sku: params.sku ?? null,
      quantity: params.quantity ?? null,
      status: params.status,
      error_message: params.error_message ?? null,
    });
  } catch (err) {
    console.error("[logStockSyncEvent] failed", err);
  }
}

/** Ensures a restaurant has stock-sync settings (creates disabled defaults on first visit). */
export async function getOrCreateStockSyncSettings(
  client: SupabaseClient,
  restaurantId: string,
): Promise<StockSyncSettingsRow | null> {
  const { data: existing } = await client
    .from("restaurant_stock_sync")
    .select("*")
    .eq("restaurant_id", restaurantId)
    .maybeSingle();
  if (existing) return existing as StockSyncSettingsRow;

  const { data: created, error } = await client
    .from("restaurant_stock_sync")
    .insert({
      restaurant_id: restaurantId,
      platform: "custom",
      is_enabled: false,
      inbound_api_key: generateApiKey(),
      outbound_secret: generateWebhookSecret(),
    })
    .select("*")
    .maybeSingle();

  if (error || !created) {
    console.error("[getOrCreateStockSyncSettings] failed", restaurantId, error?.message);
    return null;
  }
  return created as StockSyncSettingsRow;
}

/**
 * Called from the inbound API route (their website → Zboun). Matches by SKU,
 * updates the mapped menu item's stock, and logs the event. Does not raise —
 * callers should surface `error` to the caller as an HTTP response.
 */
export async function applyInboundStockUpdate(input: {
  apiKey: string;
  sku: string;
  quantity: number;
  isAvailable?: boolean;
}): Promise<InboundStockUpdateResult> {
  const client = getServiceClient();
  if (!client) return { ok: false, status: 500, error: "Server is not configured for stock sync." };

  const apiKey = input.apiKey.trim();
  if (!apiKey) return { ok: false, status: 401, error: "Missing API key." };

  const { data: settings } = await client
    .from("restaurant_stock_sync")
    .select("*")
    .eq("inbound_api_key", apiKey)
    .maybeSingle();

  if (!settings) return { ok: false, status: 401, error: "Invalid API key." };
  if (!settings.is_enabled) {
    return { ok: false, status: 403, error: "Stock sync is disabled for this store." };
  }

  const sku = input.sku.trim();
  if (!sku) return { ok: false, status: 400, error: "\"sku\" is required." };
  if (!Number.isFinite(input.quantity)) {
    return { ok: false, status: 400, error: "\"quantity\" must be a number." };
  }
  const quantity = Math.max(0, Math.floor(input.quantity));

  const { data: item } = await client
    .from("menu_items")
    .select("id, name, restaurant_id")
    .eq("restaurant_id", settings.restaurant_id)
    .eq("external_sku", sku)
    .maybeSingle();

  if (!item) {
    await logStockSyncEvent(client, {
      restaurant_id: settings.restaurant_id,
      direction: "inbound",
      sku,
      quantity,
      status: "error",
      error_message: `No menu item is mapped to SKU "${sku}".`,
    });
    return { ok: false, status: 404, error: `No menu item is mapped to SKU "${sku}".` };
  }

  const isAvailable = input.isAvailable ?? quantity > 0;

  const { error } = await client
    .from("menu_items")
    .update({
      track_stock: true,
      stock_quantity: quantity,
      is_available: isAvailable,
    })
    .eq("id", item.id);

  if (error) {
    await logStockSyncEvent(client, {
      restaurant_id: settings.restaurant_id,
      menu_item_id: item.id,
      direction: "inbound",
      sku,
      quantity,
      status: "error",
      error_message: error.message,
    });
    return { ok: false, status: 500, error: error.message };
  }

  await Promise.all([
    logStockSyncEvent(client, {
      restaurant_id: settings.restaurant_id,
      menu_item_id: item.id,
      direction: "inbound",
      sku,
      quantity,
      status: "success",
    }),
    client
      .from("restaurant_stock_sync")
      .update({ last_inbound_at: new Date().toISOString() })
      .eq("id", settings.id),
  ]);

  return {
    ok: true,
    itemId: item.id,
    itemName: item.name,
    restaurantId: settings.restaurant_id,
    quantity,
    isAvailable,
  };
}

/**
 * Called from Zboun's own code (dashboard stock edits, WhatsApp order
 * decrements) after a menu item's stock changes — pushes the new quantity
 * out to the store's website, if a webhook is configured. Fire-and-forget:
 * failures are logged, never thrown.
 */
export async function pushOutboundStockUpdate(restaurantId: string, menuItemId: string): Promise<void> {
  try {
    const client = getServiceClient();
    if (!client) return;

    const [{ data: settings }, { data: item }] = await Promise.all([
      client.from("restaurant_stock_sync").select("*").eq("restaurant_id", restaurantId).maybeSingle(),
      client
        .from("menu_items")
        .select("id, external_sku, stock_quantity, is_available, track_stock")
        .eq("id", menuItemId)
        .eq("restaurant_id", restaurantId)
        .maybeSingle(),
    ]);

    if (!settings || !settings.is_enabled || !settings.outbound_webhook_url) return;
    if (!item || !item.external_sku || !item.track_stock) return;

    const payload = {
      restaurant_id: restaurantId,
      sku: item.external_sku as string,
      quantity: Math.max(0, Math.floor(Number(item.stock_quantity ?? 0))),
      is_available: Boolean(item.is_available),
      updated_at: new Date().toISOString(),
    };
    const rawBody = JSON.stringify(payload);
    const signature = signStockPayload(settings.outbound_secret, rawBody);

    let status: "success" | "error" = "success";
    let errorMessage: string | undefined;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    try {
      const response = await fetch(settings.outbound_webhook_url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Zboun-Signature": signature,
        },
        body: rawBody,
        signal: controller.signal,
      });
      if (!response.ok) {
        status = "error";
        errorMessage = `Webhook responded with HTTP ${response.status}`;
      }
    } catch (err) {
      status = "error";
      errorMessage = err instanceof Error ? err.message : "Request to webhook failed.";
    } finally {
      clearTimeout(timeoutId);
    }

    await Promise.all([
      logStockSyncEvent(client, {
        restaurant_id: restaurantId,
        menu_item_id: menuItemId,
        direction: "outbound",
        sku: payload.sku,
        quantity: payload.quantity,
        status,
        error_message: errorMessage,
      }),
      client
        .from("restaurant_stock_sync")
        .update({ last_outbound_at: new Date().toISOString() })
        .eq("id", settings.id),
    ]);
  } catch (err) {
    console.error("[pushOutboundStockUpdate] failed", restaurantId, menuItemId, err);
  }
}
