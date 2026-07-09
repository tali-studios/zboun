export function normalizePhoneDigits(value: string): string {
  return value.replace(/\D/g, "");
}

export function parseCustomerPhoneInput(
  countryCode: string,
  national: string,
): { ok: true; phone: string; country_code: string; e164: string } | { ok: false } {
  const cc = normalizePhoneDigits(countryCode) || "961";
  let digits = normalizePhoneDigits(national);
  if (!digits || digits.length < 7) return { ok: false };
  if (digits.startsWith("0")) digits = digits.slice(1);
  return {
    ok: true,
    phone: digits,
    country_code: `+${cc}`,
    e164: `+${cc}${digits}`,
  };
}

/** Full international number for orders / WhatsApp (e.g. +96171234567). */
export function profilePhoneToE164(
  phone: string | null | undefined,
  countryCode?: string | null,
): string | null {
  if (!phone?.trim()) return null;
  const parsed = parseCustomerPhoneInput(countryCode ?? "+961", phone);
  return parsed.ok ? parsed.e164 : null;
}
