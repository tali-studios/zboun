import { sendMail, isSmtpConfigured } from "@/lib/mail";

export type OrderNotificationItem = {
  menuItemId?: string | null;
  name: string;
  qty: number;
  unit: "each" | "kg";
  unitPrice: number;
  removedIngredients?: string[];
  addedIngredients?: Array<{ name: string; qty: number; price: number }>;
  specialInstructions?: string;
  selectedOption?: string | null;
  optionLabel?: string | null;
};

export type OrderNotificationParams = {
  orderId: string;
  orderNumber?: number | null;
  restaurantName: string;
  restaurantEmail: string;
  restaurantPhone?: string;
  customerName: string;
  customerPhone?: string | null;
  deliveryAddress?: string | null;
  deliveryLat?: number | null;
  deliveryLng?: number | null;
  items: OrderNotificationItem[];
  notes?: string | null;
  totalUsd: number;
  deliverySpeed?: "standard" | "fast";
  paymentNote?: string | null;
};

function formatQty(unit: "each" | "kg", qty: number): string {
  if (unit === "kg") {
    if (qty < 1) return `${Math.round(qty * 1000)}g`;
    return `${qty.toFixed(2).replace(/0+$/, "").replace(/\.$/, "")} kg`;
  }
  return `${qty}×`;
}

function mapsLink(lat: number, lng: number) {
  return `https://www.google.com/maps?q=${lat},${lng}`;
}

/** Plain-text order body for WhatsApp / SMS style messages. */
export function buildOrderPlainText(p: OrderNotificationParams): string {
  const lines: string[] = [
    `🆕 New Order — ${p.restaurantName}`,
    `Order #${p.orderNumber ?? p.orderId.slice(0, 8).toUpperCase()}`,
    ``,
    `👤 Customer: ${p.customerName}`,
    ...(p.customerPhone ? [`📞 Phone: ${p.customerPhone}`] : []),
    ...(p.deliverySpeed === "fast" ? [`⚡ Delivery: Fast (dedicated driver)`] : []),
    ...(p.deliveryAddress ? [`📍 Address: ${p.deliveryAddress}`] : []),
    ...(p.deliveryLat != null && p.deliveryLng != null
      ? [`🗺 Map: ${mapsLink(p.deliveryLat, p.deliveryLng)}`]
      : []),
    ``,
    `🛒 Items:`,
    ...p.items.map((item) => {
      const modParts: string[] = [];
      if (item.removedIngredients?.length) modParts.push(`−${item.removedIngredients.join(", ")}`);
      if (item.addedIngredients?.length)
        modParts.push(`+${item.addedIngredients.map((a) => `${a.name}×${a.qty}`).join(", ")}`);
      if (item.selectedOption) {
        const label = item.optionLabel?.trim() || "Option";
        modParts.push(`${label}: ${item.selectedOption}`);
      }
      if (item.specialInstructions) modParts.push(item.specialInstructions);
      const mod = modParts.length ? ` [${modParts.join(" | ")}]` : "";
      return `  • ${formatQty(item.unit, item.qty)} ${item.name}${mod} — $${(item.qty * item.unitPrice).toFixed(2)}`;
    }),
    ``,
    `💰 Total: $${p.totalUsd.toFixed(2)}`,
    ...(p.paymentNote ? [`💵 Payment: ${p.paymentNote}`] : []),
    ...(p.notes ? [`📝 Notes: ${p.notes}`] : []),
    ``,
    `⏰ Placed at: ${new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}`,
  ];
  return lines.join("\n");
}

/** HTML email body for restaurant notification. */
function buildOrderEmailHtml(p: OrderNotificationParams): string {
  const itemRows = p.items
    .map((item) => {
      const mods: string[] = [];
      if (item.removedIngredients?.length) mods.push(`Remove: ${item.removedIngredients.join(", ")}`);
      if (item.addedIngredients?.length)
        mods.push(`Add: ${item.addedIngredients.map((a) => `${a.name} ×${a.qty}`).join(", ")}`);
      if (item.selectedOption) {
        const label = item.optionLabel?.trim() || "Option";
        mods.push(`${label}: ${item.selectedOption}`);
      }
      if (item.specialInstructions) mods.push(`Note: ${item.specialInstructions}`);
      const modsHtml = mods.length
        ? `<br/><span style="font-size:12px;color:#6b7280">${mods.join(" &bull; ")}</span>`
        : "";
      return `<tr>
        <td style="padding:8px 12px;border-bottom:1px solid #f3f4f6">${formatQty(item.unit, item.qty)} ${item.name}${modsHtml}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #f3f4f6;text-align:right;font-weight:600">$${(item.qty * item.unitPrice).toFixed(2)}</td>
      </tr>`;
    })
    .join("");

  const mapSection =
    p.deliveryLat != null && p.deliveryLng != null
      ? `<p><strong>📍 Location:</strong> <a href="${mapsLink(p.deliveryLat, p.deliveryLng)}" style="color:#4c1d95">Open in Google Maps</a></p>`
      : "";

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"/><title>New Order</title></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:Segoe UI,Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:32px 16px;">
<tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e4e4e7;">
  <tr><td style="background:#4c1d95;padding:24px 28px;">
    <p style="margin:0;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:#ddd6fe;">New Order · ${p.restaurantName}</p>
    <h1 style="margin:8px 0 0;font-size:22px;font-weight:600;color:#fff;">Order #${p.orderNumber ?? p.orderId.slice(0, 8).toUpperCase()}</h1>
  </td></tr>
  <tr><td style="padding:24px 28px;color:#27272a;font-size:15px;line-height:1.6;">
    <p style="margin:0 0 16px"><strong>👤 Customer:</strong> ${p.customerName}${p.customerPhone ? `<br/><strong>📞 Phone:</strong> ${p.customerPhone}` : ""}</p>
    ${p.deliveryAddress ? `<p style="margin:0 0 8px"><strong>📍 Address:</strong> ${p.deliveryAddress}</p>` : ""}
    ${mapSection}
    <h2 style="margin:20px 0 8px;font-size:16px;font-weight:600;color:#111827;">Order Items</h2>
    <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #f3f4f6;border-radius:8px;overflow:hidden;">
      <thead><tr style="background:#f9fafb">
        <th style="padding:8px 12px;text-align:left;font-size:12px;font-weight:600;text-transform:uppercase;color:#6b7280">Item</th>
        <th style="padding:8px 12px;text-align:right;font-size:12px;font-weight:600;text-transform:uppercase;color:#6b7280">Price</th>
      </tr></thead>
      <tbody>${itemRows}</tbody>
      <tfoot><tr style="background:#faf9ff">
        <td style="padding:12px;font-weight:700;font-size:16px">Total</td>
        <td style="padding:12px;font-weight:700;font-size:16px;text-align:right;color:#4c1d95">$${p.totalUsd.toFixed(2)}</td>
      </tr></tfoot>
    </table>
    ${p.paymentNote ? `<p style="margin:16px 0 0"><strong>💵 Payment:</strong> ${p.paymentNote}</p>` : ""}
    ${p.notes ? `<p style="margin:16px 0 0"><strong>📝 Notes:</strong> ${p.notes}</p>` : ""}
  </td></tr>
  <tr><td style="padding:0 28px 24px;color:#71717a;font-size:13px">
    Order placed at ${new Date().toLocaleString("en-US")} &bull; Zboun
  </td></tr>
</table>
</td></tr>
</table>
</body></html>`;
}

/** Build a WhatsApp notification URL for the restaurant (restaurant clicks to confirm they received it). */
export function buildRestaurantWhatsAppNotifyUrl(
  restaurantPhone: string,
  p: OrderNotificationParams,
): string {
  const text = buildOrderPlainText(p);
  const clean = restaurantPhone.replace(/\D/g, "");
  return `https://wa.me/${clean}?text=${encodeURIComponent(text)}`;
}

/**
 * Send email notification to the restaurant admin when a new order is placed.
 * Silently no-ops when SMTP is not configured.
 */
export async function sendNewOrderEmailNotification(
  p: OrderNotificationParams,
): Promise<void> {
  if (!isSmtpConfigured()) return;
  try {
    await sendMail({
      to: p.restaurantEmail,
      subject: `🆕 New order from ${p.customerName} — ${p.restaurantName}`,
      text: buildOrderPlainText(p),
      html: buildOrderEmailHtml(p),
    });
  } catch (err) {
    console.error("[order-notification] Failed to send email", {
      restaurantEmail: p.restaurantEmail,
      error: err instanceof Error ? err.message : String(err),
    });
  }
}
