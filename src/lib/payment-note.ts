export type PaymentCurrency = "usd" | "lbp";

export type PaymentDraft = {
  exactAmount: boolean;
  currency: PaymentCurrency;
  payingWith: number | null;
};

export function formatPaymentNote(
  draft: PaymentDraft,
  totals: { usd: number; lbp: number },
): string | null {
  if (draft.exactAmount) {
    const label =
      draft.currency === "usd"
        ? `$${totals.usd.toFixed(2)} USD`
        : `L.L ${Math.round(totals.lbp).toLocaleString()}`;
    return `Paying exact amount (${label}) — no change needed`;
  }
  if (draft.payingWith == null || !Number.isFinite(draft.payingWith) || draft.payingWith <= 0) {
    return null;
  }

  if (draft.currency === "usd") {
    const total = Math.round(totals.usd * 100) / 100;
    const paying = Math.round(draft.payingWith * 100) / 100;
    const change = Math.round((paying - total) * 100) / 100;
    if (change <= 0) {
      return `Paying with $${paying.toFixed(2)} USD (exact or less)`;
    }
    return `Paying with $${paying.toFixed(2)} USD — need $${change.toFixed(2)} change`;
  }

  const total = Math.round(totals.lbp);
  const paying = Math.round(draft.payingWith);
  const change = paying - total;
  if (change <= 0) {
    return `Paying with L.L ${paying.toLocaleString()} (exact or less)`;
  }
  return `Paying with L.L ${paying.toLocaleString()} — need L.L ${change.toLocaleString()} change`;
}

export function parsePaymentNoteDraft(paymentNote: string | null | undefined): PaymentDraft {
  const trimmed = paymentNote?.trim() ?? "";
  if (!trimmed) {
    return { exactAmount: false, currency: "usd", payingWith: null };
  }
  if (trimmed.toLowerCase().includes("exact amount")) {
    const currency: PaymentCurrency = trimmed.includes("USD") ? "usd" : trimmed.includes("L.L") ? "lbp" : "usd";
    return { exactAmount: true, currency, payingWith: null };
  }

  const usdMatch = trimmed.match(/Paying with \$([\d,.]+)\s*USD/i);
  if (usdMatch) {
    const amount = Number(usdMatch[1].replace(/,/g, ""));
    return {
      exactAmount: false,
      currency: "usd",
      payingWith: Number.isFinite(amount) && amount > 0 ? amount : null,
    };
  }

  const lbpMatch = trimmed.match(/Paying with L\.L\s*([\d,]+)/i);
  if (lbpMatch) {
    const amount = Number(lbpMatch[1].replace(/,/g, ""));
    return {
      exactAmount: false,
      currency: "lbp",
      payingWith: Number.isFinite(amount) && amount > 0 ? amount : null,
    };
  }

  return { exactAmount: false, currency: "usd", payingWith: null };
}

export function formatOrderDue(currency: PaymentCurrency, totals: { usd: number; lbp: number }): string {
  if (currency === "usd") return `$${totals.usd.toFixed(2)}`;
  return `L.L ${Math.round(totals.lbp).toLocaleString()}`;
}

export function computeChangeDue(
  draft: PaymentDraft,
  totals: { usd: number; lbp: number },
): number | null {
  if (draft.exactAmount || draft.payingWith == null || draft.payingWith <= 0) return null;
  if (draft.currency === "usd") {
    const change = Math.round((draft.payingWith - totals.usd) * 100) / 100;
    return change > 0 ? change : null;
  }
  const change = Math.round(draft.payingWith) - Math.round(totals.lbp);
  return change > 0 ? change : null;
}

export function formatChangeDue(currency: PaymentCurrency, amount: number): string {
  if (currency === "usd") return `$${amount.toFixed(2)}`;
  return `L.L ${Math.round(amount).toLocaleString()}`;
}
