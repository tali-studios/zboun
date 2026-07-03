export type MenuItemStockFields = {
  is_available: boolean;
  track_stock?: boolean | null;
  stock_quantity?: number | null;
  stock_alert_warning_qty?: number | null;
  stock_alert_urgent_qty?: number | null;
  stock_alert_critical_qty?: number | null;
};

export const DEFAULT_STOCK_ALERT_WARNING = 10;
export const DEFAULT_STOCK_ALERT_URGENT = 5;
export const DEFAULT_STOCK_ALERT_CRITICAL = 3;

export type StockAlertThresholds = {
  warning_qty: number;
  urgent_qty: number;
  critical_qty: number;
};

export type StockAlertLevel = "ok" | "warning" | "urgent" | "critical" | "out";

export function parseTrackStockFromForm(formData: FormData): boolean {
  return String(formData.get("track_stock") ?? "").trim() === "true";
}

export function parseStockQuantityFromForm(formData: FormData): number {
  const raw = String(formData.get("stock_quantity") ?? "").trim();
  if (!raw) return 0;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed < 0) return 0;
  return Math.floor(parsed);
}

function parseThresholdField(formData: FormData, name: string, fallback: number): number {
  const raw = String(formData.get(name) ?? "").trim();
  if (!raw) return fallback;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed < 1) return fallback;
  return Math.floor(parsed);
}

export function parseStockAlertThresholdsFromForm(formData: FormData): StockAlertThresholds {
  return {
    warning_qty: parseThresholdField(formData, "stock_alert_warning_qty", DEFAULT_STOCK_ALERT_WARNING),
    urgent_qty: parseThresholdField(formData, "stock_alert_urgent_qty", DEFAULT_STOCK_ALERT_URGENT),
    critical_qty: parseThresholdField(formData, "stock_alert_critical_qty", DEFAULT_STOCK_ALERT_CRITICAL),
  };
}

export function validateStockAlertThresholds(thresholds: StockAlertThresholds): string | null {
  if (thresholds.warning_qty <= thresholds.urgent_qty) {
    return "Warning threshold must be greater than urgent.";
  }
  if (thresholds.urgent_qty <= thresholds.critical_qty) {
    return "Urgent threshold must be greater than very urgent.";
  }
  return null;
}

export function resolveStockAlertThresholds(item: MenuItemStockFields): StockAlertThresholds {
  return {
    warning_qty: Math.max(1, Math.floor(Number(item.stock_alert_warning_qty ?? DEFAULT_STOCK_ALERT_WARNING))),
    urgent_qty: Math.max(1, Math.floor(Number(item.stock_alert_urgent_qty ?? DEFAULT_STOCK_ALERT_URGENT))),
    critical_qty: Math.max(1, Math.floor(Number(item.stock_alert_critical_qty ?? DEFAULT_STOCK_ALERT_CRITICAL))),
  };
}

export function getMenuItemStockAlertLevel(item: MenuItemStockFields): StockAlertLevel | null {
  if (!item.track_stock) return null;
  const qty = Math.max(0, Math.floor(Number(item.stock_quantity ?? 0)));
  if (qty <= 0) return "out";
  const thresholds = resolveStockAlertThresholds(item);
  if (qty <= thresholds.critical_qty) return "critical";
  if (qty <= thresholds.urgent_qty) return "urgent";
  if (qty <= thresholds.warning_qty) return "warning";
  return "ok";
}

export const STOCK_ALERT_LEVEL_LABELS: Record<StockAlertLevel, string> = {
  ok: "Healthy",
  warning: "Low stock",
  urgent: "Urgent",
  critical: "Very urgent",
  out: "Out of stock",
};

export function buildMenuItemStockPayload(formData: FormData) {
  const trackStock = parseTrackStockFromForm(formData);
  if (!trackStock) {
    return {
      track_stock: false,
      stock_quantity: null as number | null,
      stock_alert_warning_qty: null,
      stock_alert_urgent_qty: null,
      stock_alert_critical_qty: null,
    };
  }

  const stockQuantity = parseStockQuantityFromForm(formData);
  const thresholds = parseStockAlertThresholdsFromForm(formData);
  const thresholdError = validateStockAlertThresholds(thresholds);
  if (thresholdError) {
    return { error: thresholdError as string };
  }

  return {
    track_stock: true,
    stock_quantity: stockQuantity,
    is_available: stockQuantity > 0,
    stock_alert_warning_qty: thresholds.warning_qty,
    stock_alert_urgent_qty: thresholds.urgent_qty,
    stock_alert_critical_qty: thresholds.critical_qty,
  };
}

export function isStockColumnMigrationError(
  message: string | null | undefined,
  code?: string | null,
): boolean {
  const msg = message ?? "";
  return (
    /track_stock|stock_quantity|stock_alert_/i.test(msg) &&
    (code === "PGRST204" || code === "42703" || /column|schema cache/i.test(msg))
  );
}

export function isStockAlertColumnMigrationError(
  message: string | null | undefined,
  code?: string | null,
): boolean {
  const msg = message ?? "";
  return (
    /stock_alert_/i.test(msg) &&
    (code === "PGRST204" || code === "42703" || /column|schema cache/i.test(msg))
  );
}

export function getMenuItemStockState(item: MenuItemStockFields) {
  if (!item.is_available) {
    return { available: false, label: "Out of stock" as string | null, maxQty: 0 };
  }

  if (!item.track_stock) {
    return { available: true, label: null as string | null, maxQty: null as number | null };
  }

  const qty = Math.max(0, Math.floor(Number(item.stock_quantity ?? 0)));
  if (qty <= 0) {
    return { available: false, label: "Out of stock", maxQty: 0 };
  }

  const alertLevel = getMenuItemStockAlertLevel(item);
  let label: string;
  if (qty === 1) {
    label = "Only 1 left";
  } else if (alertLevel === "critical" || alertLevel === "urgent") {
    label = `Only ${qty} left`;
  } else if (alertLevel === "warning") {
    label = `${qty} left (low)`;
  } else {
    label = `${qty} in stock`;
  }

  return { available: true, label, maxQty: qty };
}

export function isMenuItemLowStock(item: MenuItemStockFields): boolean {
  const level = getMenuItemStockAlertLevel(item);
  return level === "warning" || level === "urgent" || level === "critical" || level === "out";
}
