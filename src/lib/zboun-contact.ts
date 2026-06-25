/** Zboun support inbox (also used via ZBOUN_OPS_EMAIL env). */
export const ZBOUN_OPS_EMAIL = "admin@zboun.net";

/** Business WhatsApp — digits only, no + prefix. */
export const ZBOUN_WHATSAPP_DIGITS = "96171212734";

export const ZBOUN_WHATSAPP_URL = `https://wa.me/${ZBOUN_WHATSAPP_DIGITS}`;

export function buildMailtoUrl(params: {
  subject?: string;
  body?: string;
  email?: string;
}) {
  const to = (params.email ?? ZBOUN_OPS_EMAIL).trim();
  const q = new URLSearchParams();
  if (params.subject?.trim()) q.set("subject", params.subject.trim());
  if (params.body?.trim()) q.set("body", params.body.trim());
  const query = q.toString();
  return query ? `mailto:${to}?${query}` : `mailto:${to}`;
}

export function buildWhatsAppUrl(text: string) {
  return `${ZBOUN_WHATSAPP_URL}?text=${encodeURIComponent(text)}`;
}
