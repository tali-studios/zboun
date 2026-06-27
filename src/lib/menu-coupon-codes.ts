export type MenuCouponCode = {
  id: string;
  restaurant_id: string;
  code: string;
  percent_off: number;
  max_uses: number | null;
  times_used: number;
  starts_at: string | null;
  ends_at: string | null;
  is_active: boolean;
};

export function isMenuCouponCodesMigrationError(message?: string | null, code?: string | null): boolean {
  const msg = `${message ?? ""} ${code ?? ""}`.toLowerCase();
  return msg.includes("menu_coupon_codes") && (msg.includes("does not exist") || msg.includes("could not find"));
}

export function normalizeCouponCode(raw: string): string {
  return raw.trim().toUpperCase().replace(/\s+/g, "");
}

export function isCouponCodeValidFormat(code: string): boolean {
  if (code.length < 3 || code.length > 32) return false;
  return /^[A-Z0-9_-]+$/.test(code);
}

export function isCouponCodeActive(
  coupon: Pick<MenuCouponCode, "is_active" | "starts_at" | "ends_at" | "max_uses" | "times_used">,
  now: Date = new Date(),
): boolean {
  if (!coupon.is_active) return false;
  if (coupon.starts_at && new Date(coupon.starts_at) > now) return false;
  if (coupon.ends_at && new Date(coupon.ends_at) < now) return false;
  if (coupon.max_uses != null && coupon.times_used >= coupon.max_uses) return false;
  return true;
}

export function computeOrderCouponDiscount(params: {
  percentOff: number;
  itemsSubtotalUsd: number;
  deliveryFeeUsd: number;
}): {
  invoiceBeforeDiscount: number;
  discountUsd: number;
  totalAfterDiscount: number;
} {
  const invoiceBeforeDiscount =
    Math.round((params.itemsSubtotalUsd + params.deliveryFeeUsd) * 100) / 100;
  const discountUsd =
    Math.round(((invoiceBeforeDiscount * params.percentOff) / 100) * 100) / 100;
  const totalAfterDiscount = Math.max(
    0,
    Math.round((invoiceBeforeDiscount - discountUsd) * 100) / 100,
  );
  return { invoiceBeforeDiscount, discountUsd, totalAfterDiscount };
}

export function couponInactiveReason(
  coupon: Pick<MenuCouponCode, "is_active" | "starts_at" | "ends_at" | "max_uses" | "times_used">,
  now: Date = new Date(),
): string | null {
  if (!coupon.is_active) return "This promo code is no longer active.";
  if (coupon.starts_at && new Date(coupon.starts_at) > now) {
    return "This promo code is not valid yet.";
  }
  if (coupon.ends_at && new Date(coupon.ends_at) < now) {
    return "This promo code has expired.";
  }
  if (coupon.max_uses != null && coupon.times_used >= coupon.max_uses) {
    return "This promo code has reached its usage limit.";
  }
  return null;
}

export function formatCouponUsage(coupon: Pick<MenuCouponCode, "times_used" | "max_uses">): string {
  if (coupon.max_uses == null) return `${coupon.times_used} used (unlimited)`;
  return `${coupon.times_used} / ${coupon.max_uses} used`;
}
