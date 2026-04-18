/** Public subscription pricing (display only — billing not wired in MVP). */
export const ZBOUN_PRICING = {
  currency: "USD",
  symbol: "$",
  monthly: 25,
  /** Yearly: 2 months free vs paying monthly × 12 */
  yearly: 200,
} as const;

export function yearlySavings(): number {
  return ZBOUN_PRICING.monthly * 12 - ZBOUN_PRICING.yearly;
}
