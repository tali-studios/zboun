/** Public subscription pricing (USD). Billing is managed via super admin + invoices. */
export const ZBOUN_PRICING = {
  currency: "USD",
  symbol: "$",
  monthly: 10,
  /** Optional one-time onboarding service: we enter your menu data for you. */
  oneTimeDataEntry: 100,
  /** Yearly: 2 months free vs paying monthly × 12 */
  yearly: 100,
} as const;

export type SubscriptionInterval = "monthly" | "yearly";

export function yearlySavings(): number {
  return ZBOUN_PRICING.monthly * 12 - ZBOUN_PRICING.yearly;
}

export function parseSubscriptionInterval(
  value: FormDataEntryValue | null | undefined,
): SubscriptionInterval {
  return String(value ?? "").trim() === "yearly" ? "yearly" : "monthly";
}

export function subscriptionPrice(interval: SubscriptionInterval): number {
  return interval === "yearly" ? ZBOUN_PRICING.yearly : ZBOUN_PRICING.monthly;
}

export function subscriptionPeriodMonths(interval: SubscriptionInterval): number {
  return interval === "yearly" ? 12 : 1;
}

export function formatSubscriptionPriceLabel(interval: SubscriptionInterval): string {
  return interval === "yearly"
    ? `${ZBOUN_PRICING.symbol}${ZBOUN_PRICING.yearly}/year`
    : `${ZBOUN_PRICING.symbol}${ZBOUN_PRICING.monthly}/month`;
}

export function formatPricingSummary(): string {
  return `${ZBOUN_PRICING.symbol}${ZBOUN_PRICING.monthly}/month or ${ZBOUN_PRICING.symbol}${ZBOUN_PRICING.yearly}/year`;
}

export function subscriptionPlanLabel(interval: SubscriptionInterval): string {
  return interval === "yearly" ? "Yearly plan" : "Monthly plan";
}

export function inferSubscriptionInterval(
  billingCyclePrice: number | null | undefined,
): SubscriptionInterval {
  const price = Number(billingCyclePrice ?? 0);
  if (price === ZBOUN_PRICING.yearly) return "yearly";
  return "monthly";
}

export function billingCycleLabel(
  price: number,
  interval?: SubscriptionInterval,
): string {
  const resolved = interval ?? inferSubscriptionInterval(price);
  return resolved === "yearly"
    ? `USD ${price.toFixed(2)}/year`
    : `USD ${price.toFixed(2)}/month`;
}
