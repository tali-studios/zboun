type CustomerWhatsAppOpts = {
  customerName?: string;
  orderShortId?: string;
  restaurantName?: string;
};

/** Open WhatsApp chat with a phone number (client-safe — no Node deps). */
export function buildWhatsAppChatUrl(phone: string, text?: string): string | null {
  const clean = phone.replace(/\D/g, "");
  if (!clean) return null;
  return text
    ? `https://wa.me/${clean}?text=${encodeURIComponent(text)}`
    : `https://wa.me/${clean}`;
}

/** Open WhatsApp chat with the customer (store admin follow-up). */
export function buildCustomerWhatsAppUrl(
  customerPhone: string,
  opts?: CustomerWhatsAppOpts,
): string | null {
  const name = opts?.customerName?.trim();
  const orderRef = opts?.orderShortId?.trim();
  const storeName = opts?.restaurantName?.trim();
  const lines: string[] = [];

  if (name) {
    lines.push(`Hi ${name},`);
    lines.push("");
    if (storeName && orderRef) {
      lines.push(`This is ${storeName} regarding your order #${orderRef}.`);
    } else if (orderRef) {
      lines.push(`This is regarding your order #${orderRef}.`);
    } else if (storeName) {
      lines.push(`This is ${storeName} regarding your recent order.`);
    } else {
      lines.push("This is regarding your recent order with us.");
    }
  }

  return buildWhatsAppChatUrl(customerPhone, lines.length ? lines.join("\n") : undefined);
}
