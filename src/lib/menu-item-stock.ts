export type MenuItemStockFields = {
  is_available: boolean;
  track_stock?: boolean | null;
  stock_quantity?: number | null;
};

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

export function buildMenuItemStockPayload(formData: FormData) {
  const trackStock = parseTrackStockFromForm(formData);
  if (!trackStock) {
    return {
      track_stock: false,
      stock_quantity: null as number | null,
    };
  }

  const stockQuantity = parseStockQuantityFromForm(formData);
  return {
    track_stock: true,
    stock_quantity: stockQuantity,
    is_available: stockQuantity > 0,
  };
}

export function isStockColumnMigrationError(
  message: string | null | undefined,
  code?: string | null,
): boolean {
  const msg = message ?? "";
  return (
    /track_stock|stock_quantity/i.test(msg) &&
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

  const label =
    qty === 1 ? "Only 1 left" : qty <= 5 ? `Only ${qty} left` : `${qty} in stock`;

  return { available: true, label, maxQty: qty };
}
